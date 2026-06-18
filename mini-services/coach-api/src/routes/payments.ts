import { z } from 'zod'
import { db } from '../db'
import { sanitizeInput, auditLog } from '../middleware/auth'
import type { RequestContext } from '../middleware/auth'

// ============ Zod Schemas ============

const createPaymentSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  amount: z.number().min(0, 'Amount must be non-negative'),
  currency: z.string().max(10).optional().default('USD'),
  status: z.enum(['pending', 'paid', 'overdue', 'cancelled']).optional().default('pending'),
  method: z.string().max(50).optional().default(''),
  description: z.string().max(500).optional().default(''),
  dueDate: z.string().optional(),
  paidDate: z.string().optional(),
  invoiceNumber: z.string().max(50).optional().default(''),
  notes: z.string().max(2000).optional().default(''),
})

const updatePaymentSchema = z.object({
  amount: z.number().min(0).optional(),
  currency: z.string().max(10).optional(),
  status: z.enum(['pending', 'paid', 'overdue', 'cancelled']).optional(),
  method: z.string().max(50).optional(),
  description: z.string().max(500).optional(),
  dueDate: z.string().nullable().optional(),
  paidDate: z.string().nullable().optional(),
  invoiceNumber: z.string().max(50).optional(),
  notes: z.string().max(2000).optional(),
})

// ============ Route Handlers ============

export async function handlePaymentRoutes(method: string, pathParts: string[], body: unknown, ctx: RequestContext, query: URLSearchParams): Promise<Response> {
  if (!ctx.coachId) {
    return Response.json({ error: 'Access denied. No token provided.' }, { status: 401 })
  }

  const coachId = ctx.coachId
  const ip = ctx.ip

  // GET /api/payments/summary - Revenue summary
  if (method === 'GET' && pathParts.length === 1 && pathParts[0] === 'summary') {
    try {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

      const [totalPaid, pendingAmount, thisMonthPaid, lastMonthPaid, overdueCount] = await Promise.all([
        // Total paid
        db.payment.aggregate({
          _sum: { amount: true },
          where: { coachId, status: 'paid' },
        }),
        // Pending amount
        db.payment.aggregate({
          _sum: { amount: true },
          where: { coachId, status: 'pending' },
        }),
        // This month paid
        db.payment.aggregate({
          _sum: { amount: true },
          where: {
            coachId,
            status: 'paid',
            paidDate: { gte: startOfMonth },
          },
        }),
        // Last month paid
        db.payment.aggregate({
          _sum: { amount: true },
          where: {
            coachId,
            status: 'paid',
            paidDate: { gte: startOfLastMonth, lte: endOfLastMonth },
          },
        }),
        // Overdue count
        db.payment.count({
          where: {
            coachId,
            status: 'overdue',
          },
        }),
      ])

      const thisMonthTotal = thisMonthPaid._sum.amount || 0
      const lastMonthTotal = lastMonthPaid._sum.amount || 0
      const percentChange = lastMonthTotal > 0
        ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
        : thisMonthTotal > 0 ? 100 : 0

      return Response.json({
        summary: {
          totalPaid: totalPaid._sum.amount || 0,
          pendingAmount: pendingAmount._sum.amount || 0,
          thisMonthPaid: thisMonthTotal,
          lastMonthPaid: lastMonthTotal,
          monthOverMonthChange: Math.round(percentChange * 100) / 100,
          overdueCount,
        },
      })
    } catch (error) {
      console.error('Payment summary error:', error)
      return Response.json({ error: 'Failed to fetch payment summary.' }, { status: 500 })
    }
  }

  // GET /api/payments - List payments
  if (method === 'GET' && pathParts.length === 0) {
    try {
      const clientId = query.get('clientId') || undefined
      const status = query.get('status') || undefined

      const where: Record<string, unknown> = { coachId }
      if (clientId) where.clientId = clientId
      if (status) where.status = status

      const payments = await db.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          client: { select: { id: true, name: true } },
        },
      })

      return Response.json({ payments })
    } catch (error) {
      console.error('List payments error:', error)
      return Response.json({ error: 'Failed to fetch payments.' }, { status: 500 })
    }
  }

  // POST /api/payments - Create payment
  if (method === 'POST' && pathParts.length === 0) {
    try {
      const sanitized = sanitizeInput(body) as Record<string, unknown>
      const validationResult = createPaymentSchema.safeParse(sanitized)
      if (!validationResult.success) {
        return Response.json({
          error: 'Validation failed',
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        }, { status: 400 })
      }

      const data = validationResult.data

      // Verify client belongs to this coach
      const client = await db.client.findFirst({
        where: { id: data.clientId, coachId },
      })
      if (!client) {
        return Response.json({ error: 'Client not found or does not belong to you.' }, { status: 404 })
      }

      const payment = await db.payment.create({
        data: {
          clientId: data.clientId,
          coachId,
          amount: data.amount,
          currency: data.currency || 'USD',
          status: data.status || 'pending',
          method: data.method || '',
          description: data.description || '',
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          paidDate: data.paidDate ? new Date(data.paidDate) : null,
          invoiceNumber: data.invoiceNumber || '',
          notes: data.notes || '',
        },
        include: {
          client: { select: { id: true, name: true } },
        },
      })

      await auditLog(coachId, 'CREATE', 'Payment', payment.id, `Created payment: ${payment.amount} ${payment.currency}`, ip)

      return Response.json({
        message: 'Payment created successfully',
        payment,
      }, { status: 201 })
    } catch (error) {
      console.error('Create payment error:', error)
      return Response.json({ error: 'Failed to create payment.' }, { status: 500 })
    }
  }

  // PUT /api/payments/:id/mark-paid - Quick mark as paid
  if (method === 'PUT' && pathParts.length === 2 && pathParts[1] === 'mark-paid') {
    try {
      const id = pathParts[0]

      const existing = await db.payment.findFirst({
        where: { id, coachId },
      })
      if (!existing) {
        return Response.json({ error: 'Payment not found.' }, { status: 404 })
      }

      const payment = await db.payment.update({
        where: { id },
        data: {
          status: 'paid',
          paidDate: new Date(),
        },
        include: {
          client: { select: { id: true, name: true } },
        },
      })

      await auditLog(coachId, 'UPDATE', 'Payment', id, `Marked payment as paid: ${payment.amount} ${payment.currency}`, ip)

      return Response.json({
        message: 'Payment marked as paid',
        payment,
      })
    } catch (error) {
      console.error('Mark paid error:', error)
      return Response.json({ error: 'Failed to mark payment as paid.' }, { status: 500 })
    }
  }

  // PUT /api/payments/:id - Update payment
  if (method === 'PUT' && pathParts.length === 1) {
    try {
      const id = pathParts[0]
      const sanitized = sanitizeInput(body) as Record<string, unknown>
      const validationResult = updatePaymentSchema.safeParse(sanitized)
      if (!validationResult.success) {
        return Response.json({
          error: 'Validation failed',
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        }, { status: 400 })
      }

      const existing = await db.payment.findFirst({
        where: { id, coachId },
      })
      if (!existing) {
        return Response.json({ error: 'Payment not found.' }, { status: 404 })
      }

      const data = validationResult.data
      const updateData: Record<string, unknown> = {}
      if (data.amount !== undefined) updateData.amount = data.amount
      if (data.currency !== undefined) updateData.currency = data.currency
      if (data.status !== undefined) updateData.status = data.status
      if (data.method !== undefined) updateData.method = data.method
      if (data.description !== undefined) updateData.description = data.description
      if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null
      if (data.paidDate !== undefined) updateData.paidDate = data.paidDate ? new Date(data.paidDate) : null
      if (data.invoiceNumber !== undefined) updateData.invoiceNumber = data.invoiceNumber
      if (data.notes !== undefined) updateData.notes = data.notes

      const payment = await db.payment.update({
        where: { id },
        data: updateData,
        include: {
          client: { select: { id: true, name: true } },
        },
      })

      await auditLog(coachId, 'UPDATE', 'Payment', id, `Updated payment: ${payment.amount} ${payment.currency}`, ip)

      return Response.json({
        message: 'Payment updated successfully',
        payment,
      })
    } catch (error) {
      console.error('Update payment error:', error)
      return Response.json({ error: 'Failed to update payment.' }, { status: 500 })
    }
  }

  // DELETE /api/payments/:id - Delete payment
  if (method === 'DELETE' && pathParts.length === 1) {
    try {
      const id = pathParts[0]

      const existing = await db.payment.findFirst({
        where: { id, coachId },
      })
      if (!existing) {
        return Response.json({ error: 'Payment not found.' }, { status: 404 })
      }

      await db.payment.delete({ where: { id } })

      await auditLog(coachId, 'DELETE', 'Payment', id, `Deleted payment: ${existing.amount} ${existing.currency}`, ip)

      return Response.json({ message: 'Payment deleted successfully.' })
    } catch (error) {
      console.error('Delete payment error:', error)
      return Response.json({ error: 'Failed to delete payment.' }, { status: 500 })
    }
  }

  return Response.json({ error: 'Route not found.' }, { status: 404 })
}
