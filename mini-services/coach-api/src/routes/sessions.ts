import { z } from 'zod'
import { db } from '../db'
import { sanitizeInput, auditLog } from '../middleware/auth'
import type { RequestContext } from '../middleware/auth'

// ============ Zod Schemas ============

const createSessionSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  title: z.string().max(200).optional().default(''),
  date: z.string().min(1, 'Date is required'),
  duration: z.number().int().min(1).max(600).optional().default(60),
  type: z.string().max(50).optional().default('personal'),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no-show']).optional().default('scheduled'),
  location: z.string().max(200).optional().default(''),
  notes: z.string().max(2000).optional().default(''),
})

const updateSessionSchema = z.object({
  title: z.string().max(200).optional(),
  date: z.string().optional(),
  duration: z.number().int().min(1).max(600).optional(),
  type: z.string().max(50).optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no-show']).optional(),
  location: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
})

// ============ Route Handlers ============

export async function handleSessionRoutes(method: string, pathParts: string[], body: unknown, ctx: RequestContext, query: URLSearchParams): Promise<Response> {
  if (!ctx.coachId) {
    return Response.json({ error: 'Access denied. No token provided.' }, { status: 401 })
  }

  const coachId = ctx.coachId
  const ip = ctx.ip

  // GET /api/sessions - List sessions
  if (method === 'GET' && pathParts.length === 0) {
    try {
      const clientId = query.get('clientId') || undefined
      const status = query.get('status') || undefined
      const startDate = query.get('startDate') || undefined
      const endDate = query.get('endDate') || undefined

      const where: Record<string, unknown> = { coachId }
      if (clientId) where.clientId = clientId
      if (status) where.status = status
      if (startDate || endDate) {
        const dateFilter: Record<string, Date> = {}
        if (startDate) dateFilter.gte = new Date(startDate)
        if (endDate) dateFilter.lte = new Date(endDate)
        where.date = dateFilter
      }

      const sessions = await db.session.findMany({
        where,
        orderBy: { date: 'desc' },
        include: {
          client: { select: { id: true, name: true } },
        },
      })

      return Response.json({ sessions })
    } catch (error) {
      console.error('List sessions error:', error)
      return Response.json({ error: 'Failed to fetch sessions.' }, { status: 500 })
    }
  }

  // POST /api/sessions - Create session
  if (method === 'POST' && pathParts.length === 0) {
    try {
      const sanitized = sanitizeInput(body) as Record<string, unknown>
      const validationResult = createSessionSchema.safeParse(sanitized)
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

      const session = await db.session.create({
        data: {
          clientId: data.clientId,
          coachId,
          title: data.title || '',
          date: new Date(data.date),
          duration: data.duration || 60,
          type: data.type || 'personal',
          status: data.status || 'scheduled',
          location: data.location || '',
          notes: data.notes || '',
        },
        include: {
          client: { select: { id: true, name: true } },
        },
      })

      await auditLog(coachId, 'CREATE', 'Session', session.id, `Created session: ${session.title || 'Untitled'}`, ip)

      return Response.json({
        message: 'Session created successfully',
        session,
      }, { status: 201 })
    } catch (error) {
      console.error('Create session error:', error)
      return Response.json({ error: 'Failed to create session.' }, { status: 500 })
    }
  }

  // PUT /api/sessions/:id - Update session
  if (method === 'PUT' && pathParts.length === 1) {
    try {
      const id = pathParts[0]
      const sanitized = sanitizeInput(body) as Record<string, unknown>
      const validationResult = updateSessionSchema.safeParse(sanitized)
      if (!validationResult.success) {
        return Response.json({
          error: 'Validation failed',
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        }, { status: 400 })
      }

      // Verify session belongs to this coach
      const existing = await db.session.findFirst({
        where: { id, coachId },
      })
      if (!existing) {
        return Response.json({ error: 'Session not found.' }, { status: 404 })
      }

      const data = validationResult.data
      const updateData: Record<string, unknown> = {}
      if (data.title !== undefined) updateData.title = data.title
      if (data.date !== undefined) updateData.date = new Date(data.date)
      if (data.duration !== undefined) updateData.duration = data.duration
      if (data.type !== undefined) updateData.type = data.type
      if (data.status !== undefined) updateData.status = data.status
      if (data.location !== undefined) updateData.location = data.location
      if (data.notes !== undefined) updateData.notes = data.notes

      const session = await db.session.update({
        where: { id },
        data: updateData,
        include: {
          client: { select: { id: true, name: true } },
        },
      })

      await auditLog(coachId, 'UPDATE', 'Session', id, `Updated session: ${session.title || 'Untitled'}`, ip)

      return Response.json({
        message: 'Session updated successfully',
        session,
      })
    } catch (error) {
      console.error('Update session error:', error)
      return Response.json({ error: 'Failed to update session.' }, { status: 500 })
    }
  }

  // DELETE /api/sessions/:id - Delete session
  if (method === 'DELETE' && pathParts.length === 1) {
    try {
      const id = pathParts[0]

      const existing = await db.session.findFirst({
        where: { id, coachId },
      })
      if (!existing) {
        return Response.json({ error: 'Session not found.' }, { status: 404 })
      }

      await db.session.delete({ where: { id } })

      await auditLog(coachId, 'DELETE', 'Session', id, `Deleted session: ${existing.title || 'Untitled'}`, ip)

      return Response.json({ message: 'Session deleted successfully.' })
    } catch (error) {
      console.error('Delete session error:', error)
      return Response.json({ error: 'Failed to delete session.' }, { status: 500 })
    }
  }

  return Response.json({ error: 'Route not found.' }, { status: 404 })
}
