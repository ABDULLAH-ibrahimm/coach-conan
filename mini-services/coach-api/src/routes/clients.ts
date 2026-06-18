import { z } from 'zod'
import crypto from 'crypto'
import { db } from '../db'
import { sanitizeInput, auditLog } from '../middleware/auth'
import { hashPassword } from '../utils/password'
import type { RequestContext } from '../middleware/auth'

// ============ Zod Schemas ============

const createClientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  phone: z.string().max(30).optional().or(z.literal('')),
  profileImage: z.string().max(500000).optional().or(z.literal('')),
  age: z.number().int().min(1).max(150).optional(),
  gender: z.string().max(20).optional().or(z.literal('')),
  weight: z.number().min(0).max(1000).optional(),
  height: z.number().min(0).max(500).optional(),
  goal: z.string().max(500).optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
  startDate: z.string().optional(),
  createPortalAccess: z.boolean().optional(),
  sendCredentials: z.boolean().optional(),
})

const updateClientSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  phone: z.string().max(30).optional().or(z.literal('')),
  profileImage: z.string().max(500000).optional().or(z.literal('')),
  age: z.number().int().min(1).max(150).optional(),
  gender: z.string().max(20).optional().or(z.literal('')),
  weight: z.number().min(0).max(1000).optional(),
  height: z.number().min(0).max(500).optional(),
  goal: z.string().max(500).optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']).optional(),
  startDate: z.string().optional(),
})

const setCredentialsSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
})

// ============ Helper ============

function generateTempPassword(): string {
  // Generate a secure random temporary password that meets requirements
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*'
  let password = ''
  // Ensure at least one of each required type
  password += 'ABCDEFGHJKMNPQRSTUVWXYZ'[Math.floor(Math.random() * 26)] // uppercase
  password += 'abcdefghjkmnpqrstuvwxyz'[Math.floor(Math.random() * 25)] // lowercase
  password += '23456789'[Math.floor(Math.random() * 8)] // number
  password += '!@#$%&*'[Math.floor(Math.random() * 7)] // special
  // Fill the rest randomly
  for (let i = 4; i < 12; i++) {
    password += chars[Math.floor(Math.random() * chars.length)]
  }
  // Shuffle
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

// ============ Route Handlers ============

export async function handleClientRoutes(method: string, pathParts: string[], body: unknown, ctx: RequestContext, query: URLSearchParams): Promise<Response> {
  if (!ctx.coachId) {
    return Response.json({ error: 'Access denied. No token provided.' }, { status: 401 })
  }

  const coachId = ctx.coachId
  const ip = ctx.ip

  // GET /api/clients/pending - List pending approval clients
  if (method === 'GET' && pathParts.length === 1 && pathParts[0] === 'pending') {
    try {
      const clients = await db.client.findMany({
        where: { coachId, approvalStatus: 'pending' },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          profileImage: true,
          age: true,
          gender: true,
          weight: true,
          height: true,
          goal: true,
          approvalStatus: true,
          createdAt: true,
        },
      })

      return Response.json({ clients })
    } catch (error) {
      console.error('List pending clients error:', error)
      return Response.json({ error: 'Failed to fetch pending clients.' }, { status: 500 })
    }
  }

  // GET /api/clients/export - Export clients as CSV
  if (method === 'GET' && pathParts.length === 1 && pathParts[0] === 'export') {
    try {
      const clients = await db.client.findMany({
        where: { coachId },
        orderBy: { createdAt: 'desc' },
        select: {
          name: true,
          email: true,
          phone: true,
          age: true,
          gender: true,
          weight: true,
          height: true,
          goal: true,
          status: true,
          approvalStatus: true,
          startDate: true,
          createdAt: true,
        },
      })

      // Build CSV
      const headers = ['Full Name', 'Email', 'Phone', 'Age', 'Gender', 'Weight (kg)', 'Height (cm)', 'Goal', 'Status', 'Approval Status', 'Start Date', 'Registration Date']

      const escapeCSV = (value: string | number | null | undefined): string => {
        const str = String(value ?? '')
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      }

      const csvRows = [
        headers.map(escapeCSV).join(','),
        ...clients.map(c => [
          escapeCSV(c.name),
          escapeCSV(c.email),
          escapeCSV(c.phone),
          escapeCSV(c.age || ''),
          escapeCSV(c.gender),
          escapeCSV(c.weight || ''),
          escapeCSV(c.height || ''),
          escapeCSV(c.goal),
          escapeCSV(c.status),
          escapeCSV(c.approvalStatus),
          escapeCSV(c.startDate ? new Date(c.startDate).toLocaleDateString() : ''),
          escapeCSV(new Date(c.createdAt).toLocaleDateString()),
        ].join(',')),
      ]

      const csvContent = csvRows.join('\n')
      const filename = `coach-conan-clients-${new Date().toISOString().split('T')[0]}.csv`

      await auditLog(coachId, 'EXPORT', 'Client', '', `Exported ${clients.length} clients to CSV`, ip)

      return new Response(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    } catch (error) {
      console.error('Export clients error:', error)
      return Response.json({ error: 'Failed to export clients.' }, { status: 500 })
    }
  }

  // PUT /api/clients/:id/approve - Approve client
  if (method === 'PUT' && pathParts.length === 2 && pathParts[1] === 'approve') {
    try {
      const id = pathParts[0]

      const existing = await db.client.findFirst({ where: { id, coachId } })
      if (!existing) {
        return Response.json({ error: 'Client not found.' }, { status: 404 })
      }

      const updateData: Record<string, unknown> = { approvalStatus: 'approved', status: 'active' }

      // If client doesn't have a password yet (coach-created), generate one
      let tempPassword: string | null = null
      if (!existing.password) {
        tempPassword = generateTempPassword()
        updateData.password = await hashPassword(tempPassword)
      }

      const client = await db.client.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          approvalStatus: true,
          status: true,
        },
      })

      await auditLog(coachId, 'APPROVE_CLIENT', 'Client', id, `Approved client: ${existing.name}`, ip)

      return Response.json({
        message: 'Client approved successfully.',
        client,
        ...(tempPassword && { tempPassword }),
      })
    } catch (error) {
      console.error('Approve client error:', error)
      return Response.json({ error: 'Failed to approve client.' }, { status: 500 })
    }
  }

  // PUT /api/clients/:id/reject - Reject client
  if (method === 'PUT' && pathParts.length === 2 && pathParts[1] === 'reject') {
    try {
      const id = pathParts[0]

      const existing = await db.client.findFirst({ where: { id, coachId } })
      if (!existing) {
        return Response.json({ error: 'Client not found.' }, { status: 404 })
      }

      const client = await db.client.update({
        where: { id },
        data: { approvalStatus: 'rejected', status: 'inactive' },
        select: {
          id: true,
          name: true,
          email: true,
          approvalStatus: true,
          status: true,
        },
      })

      await auditLog(coachId, 'REJECT_CLIENT', 'Client', id, `Rejected client: ${existing.name}`, ip)

      return Response.json({
        message: 'Client rejected.',
        client,
      })
    } catch (error) {
      console.error('Reject client error:', error)
      return Response.json({ error: 'Failed to reject client.' }, { status: 500 })
    }
  }

  // PUT /api/clients/:id/set-credentials - Set/reset client portal password
  if (method === 'PUT' && pathParts.length === 2 && pathParts[1] === 'set-credentials') {
    try {
      const id = pathParts[0]

      const existing = await db.client.findFirst({ where: { id, coachId } })
      if (!existing) {
        return Response.json({ error: 'Client not found.' }, { status: 404 })
      }

      const sanitized = sanitizeInput(body) as Record<string, unknown>
      const validationResult = setCredentialsSchema.safeParse(sanitized)
      if (!validationResult.success) {
        return Response.json({
          error: 'Validation failed',
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        }, { status: 400 })
      }

      const { password } = validationResult.data
      const hashedPassword = await hashPassword(password)

      await db.client.update({
        where: { id },
        data: {
          password: hashedPassword,
          approvalStatus: 'approved',
        },
      })

      await auditLog(coachId, 'SET_CLIENT_CREDENTIALS', 'Client', id, `Set portal credentials for client: ${existing.name}`, ip)

      return Response.json({ message: 'Client credentials set successfully. Client is now approved.' })
    } catch (error) {
      console.error('Set client credentials error:', error)
      return Response.json({ error: 'Failed to set client credentials.' }, { status: 500 })
    }
  }

  // GET /api/clients - List clients
  if (method === 'GET' && pathParts.length === 0) {
    try {
      const page = Math.max(1, parseInt(query.get('page') || '1'))
      const limit = Math.min(100, Math.max(1, parseInt(query.get('limit') || '20')))
      const search = query.get('search') || ''
      const status = query.get('status') || ''

      const skip = (page - 1) * limit

      const where: Record<string, unknown> = { coachId }
      if (status) where.status = status
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } },
        ]
      }

      const [clients, total] = await Promise.all([
        db.client.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profileImage: true,
            age: true,
            gender: true,
            weight: true,
            height: true,
            goal: true,
            status: true,
            approvalStatus: true,
            startDate: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                workoutPrograms: true,
                nutritionPlans: true,
                progress: true,
                sessions: true,
              },
            },
          },
        }),
        db.client.count({ where }),
      ])

      return Response.json({
        clients,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      })
    } catch (error) {
      console.error('[Clients] List clients error for coach:', coachId, error)
      return Response.json({ error: 'Failed to fetch clients.' }, { status: 500 })
    }
  }

  // GET /api/clients/:id - Get client with related data
  if (method === 'GET' && pathParts.length === 1) {
    try {
      const id = pathParts[0]

      const client = await db.client.findFirst({
        where: { id, coachId },
        include: {
          workoutPrograms: {
            orderBy: { createdAt: 'desc' },
            include: {
              weeks: {
                orderBy: { weekNumber: 'asc' },
                include: {
                  days: {
                    orderBy: { dayNumber: 'asc' },
                    include: {
                      exercises: { orderBy: { order: 'asc' } },
                    },
                  },
                },
              },
            },
          },
          nutritionPlans: {
            orderBy: { createdAt: 'desc' },
            include: {
              meals: {
                orderBy: { order: 'asc' },
                include: {
                  foodItems: { orderBy: { order: 'asc' } },
                },
              },
            },
          },
          progress: {
            orderBy: { recordedAt: 'desc' },
          },
          sessions: {
            orderBy: { date: 'desc' },
          },
          payments: {
            orderBy: { createdAt: 'desc' },
          },
        },
      })

      if (!client) {
        return Response.json({ error: 'Client not found.' }, { status: 404 })
      }

      return Response.json({ client })
    } catch (error) {
      console.error('Get client error:', error)
      return Response.json({ error: 'Failed to fetch client.' }, { status: 500 })
    }
  }

  // POST /api/clients - Create client
  if (method === 'POST' && pathParts.length === 0) {
    try {
      const sanitized = sanitizeInput(body) as Record<string, unknown>
      const validationResult = createClientSchema.safeParse(sanitized)
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

      // If createPortalAccess or sendCredentials is true, generate a temporary password
      let tempPassword: string | null = null
      let hashedPassword: string | null = null
      const needsPassword = data.createPortalAccess || data.sendCredentials
      if (needsPassword) {
        tempPassword = generateTempPassword()
        hashedPassword = await hashPassword(tempPassword)
      }

      const client = await db.client.create({
        data: {
          coachId,
          name: data.name,
          email: data.email || '',
          phone: data.phone || '',
          profileImage: data.profileImage || '',
          age: data.age || 0,
          gender: data.gender || '',
          weight: data.weight || 0,
          height: data.height || 0,
          goal: data.goal || '',
          notes: data.notes || '',
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          approvalStatus: 'approved', // Coach-created clients are auto-approved
          ...(hashedPassword && { password: hashedPassword }),
        },
      })

      const portalNote = needsPassword ? ' with portal access' : ''
      await auditLog(coachId, 'CREATE', 'Client', client.id, `Created client: ${client.name}${portalNote}`, ip)

      // Send to Google Sheets (fire and forget)
      try {
        const sheetsUrl = process.env.GOOGLE_SHEETS_WEBAPP_URL
        if (sheetsUrl) {
          fetch(sheetsUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sheet: 'Client Registrations',
              data: {
                name: client.name,
                email: client.email,
                phone: client.phone || '',
                age: client.age?.toString() || '',
                gender: client.gender || '',
                weight: client.weight?.toString() || '',
                height: client.height?.toString() || '',
                goal: client.goal || '',
                approvalStatus: 'approved',
                registeredAt: new Date().toISOString(),
                createdBy: 'coach',
              },
            }),
          }).catch(() => {})
        }
      } catch {}

      return Response.json({
        message: 'Client created successfully',
        client,
        email: client.email,
        ...(tempPassword && { generatedPassword: tempPassword }),
      }, { status: 201 })
    } catch (error) {
      console.error('Create client error:', error)
      return Response.json({ error: 'Failed to create client.' }, { status: 500 })
    }
  }

  // PUT /api/clients/:id - Update client
  if (method === 'PUT' && pathParts.length === 1) {
    try {
      const id = pathParts[0]
      const sanitized = sanitizeInput(body) as Record<string, unknown>
      const validationResult = updateClientSchema.safeParse(sanitized)
      if (!validationResult.success) {
        return Response.json({
          error: 'Validation failed',
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        }, { status: 400 })
      }

      const existing = await db.client.findFirst({ where: { id, coachId } })
      if (!existing) {
        return Response.json({ error: 'Client not found.' }, { status: 404 })
      }

      const data = validationResult.data
      const updateData: Record<string, unknown> = {}
      if (data.name !== undefined) updateData.name = data.name
      if (data.email !== undefined) updateData.email = data.email
      if (data.phone !== undefined) updateData.phone = data.phone
      if (data.profileImage !== undefined) updateData.profileImage = data.profileImage
      if (data.age !== undefined) updateData.age = data.age
      if (data.gender !== undefined) updateData.gender = data.gender
      if (data.weight !== undefined) updateData.weight = data.weight
      if (data.height !== undefined) updateData.height = data.height
      if (data.goal !== undefined) updateData.goal = data.goal
      if (data.notes !== undefined) updateData.notes = data.notes
      if (data.status !== undefined) updateData.status = data.status
      if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate)

      const client = await db.client.update({
        where: { id },
        data: updateData,
      })

      await auditLog(coachId, 'UPDATE', 'Client', id, `Updated client: ${client.name}`, ip)

      return Response.json({
        message: 'Client updated successfully',
        client,
      })
    } catch (error) {
      console.error('Update client error:', error)
      return Response.json({ error: 'Failed to update client.' }, { status: 500 })
    }
  }

  // DELETE /api/clients/:id - Hard delete (remove from system completely)
  if (method === 'DELETE' && pathParts.length === 1) {
    try {
      const id = pathParts[0]

      const existing = await db.client.findFirst({ where: { id, coachId } })
      if (!existing) {
        return Response.json({ error: 'Client not found.' }, { status: 404 })
      }

      // Delete all related records first, then the client
      // Progress records
      await db.progress.deleteMany({ where: { clientId: id } })
      // Payment records
      await db.payment.deleteMany({ where: { clientId: id } })
      // Session records
      await db.session.deleteMany({ where: { clientId: id } })
      // Workout programs (cascade will handle weeks/days/exercises)
      const workoutIds = await db.workoutProgram.findMany({
        where: { clientId: id },
        select: { id: true },
      })
      for (const wid of workoutIds) {
        // Delete exercises, days, weeks, then program
        const weeks = await db.programWeek.findMany({ where: { programId: wid.id }, select: { id: true } })
        for (const week of weeks) {
          const days = await db.programDay.findMany({ where: { weekId: week.id }, select: { id: true } })
          for (const day of days) {
            await db.exercise.deleteMany({ where: { dayId: day.id } })
          }
          await db.programDay.deleteMany({ where: { weekId: week.id } })
        }
        await db.programWeek.deleteMany({ where: { programId: wid.id } })
        await db.workoutProgram.delete({ where: { id: wid.id } })
      }
      // Nutrition plans (cascade will handle meals/food items)
      const nutritionIds = await db.nutritionPlan.findMany({
        where: { clientId: id },
        select: { id: true },
      })
      for (const nid of nutritionIds) {
        const meals = await db.meal.findMany({ where: { planId: nid.id }, select: { id: true } })
        for (const meal of meals) {
          await db.foodItem.deleteMany({ where: { mealId: meal.id } })
        }
        await db.meal.deleteMany({ where: { planId: nid.id } })
        await db.nutritionPlan.delete({ where: { id: nid.id } })
      }
      // Finally delete the client
      await db.client.delete({ where: { id } })

      await auditLog(coachId, 'DELETE', 'Client', id, `Permanently deleted client: ${existing.name}`, ip)

      return Response.json({ message: 'Client deleted permanently from the system.' })
    } catch (error) {
      console.error('Delete client error:', error)
      return Response.json({ error: 'Failed to delete client.' }, { status: 500 })
    }
  }

  return Response.json({ error: 'Route not found.' }, { status: 404 })
}
