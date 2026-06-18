import { db } from '../db'
import { sanitizeInput, extractClientId, auditLog } from '../middleware/auth'
import type { RequestContext } from '../middleware/auth'
import { z } from 'zod'

// ============ Zod Schemas ============

const clientProgressSchema = z.object({
  weight: z.number().min(0).max(1000).optional(),
  bodyFat: z.number().min(0).max(100).optional(),
  muscleMass: z.number().min(0).max(1000).optional(),
  waist: z.number().min(0).max(500).optional(),
  chest: z.number().min(0).max(500).optional(),
  arms: z.number().min(0).max(500).optional(),
  thighs: z.number().min(0).max(500).optional(),
  hips: z.number().min(0).max(500).optional(),
  notes: z.string().max(2000).optional().or(z.literal('')),
  recordedAt: z.string().optional(),
})

const clientProfileUpdateSchema = z.object({
  phone: z.string().max(30).optional().or(z.literal('')),
  profileImage: z.string().max(500000).optional().or(z.literal('')),
  age: z.number().int().min(1).max(150).optional(),
  gender: z.string().max(20).optional().or(z.literal('')),
  weight: z.number().min(0).max(1000).optional(),
  height: z.number().min(0).max(500).optional(),
  goal: z.string().max(500).optional().or(z.literal('')),
})

// ============ Helper ============

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

// ============ Route Handler ============

export async function handleClientPortalRoutes(
  method: string,
  pathParts: string[],
  body: unknown,
  ctx: RequestContext,
  authHeader: string | null
): Promise<Response> {
  const ip = ctx.ip

  // All client portal routes require authentication
  const clientAuth = extractClientId(authHeader)
  if ('error' in clientAuth) {
    return jsonResponse({ error: clientAuth.error }, clientAuth.status)
  }

  const { clientId, coachId } = clientAuth

  // ============ GET /client/dashboard ============
  if (method === 'GET' && pathParts[0] === 'dashboard' && pathParts.length === 1) {
    try {
      const client = await db.client.findFirst({
        where: { id: clientId, coachId },
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
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      if (!client) {
        return jsonResponse({ error: 'Client not found.' }, 404)
      }

      const [
        workoutPrograms,
        nutritionPlans,
        progress,
        upcomingSessions,
        paymentSummary,
      ] = await Promise.all([
        db.workoutProgram.findMany({
          where: { clientId },
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
        }),
        db.nutritionPlan.findMany({
          where: { clientId },
          orderBy: { createdAt: 'desc' },
          include: {
            meals: {
              orderBy: { order: 'asc' },
              include: {
                foodItems: { orderBy: { order: 'asc' } },
              },
            },
          },
        }),
        db.progress.findMany({
          where: { clientId },
          orderBy: { recordedAt: 'desc' },
          take: 50,
        }),
        db.session.findMany({
          where: {
            clientId,
            date: { gte: new Date() },
            status: { in: ['scheduled'] },
          },
          orderBy: { date: 'asc' },
          take: 10,
        }),
        db.payment.aggregate({
          where: { clientId },
          _count: true,
          _sum: { amount: true },
        }),
      ])

      const pendingPayments = await db.payment.count({
        where: { clientId, status: 'pending' },
      })

      return jsonResponse({
        profile: client,
        workoutPrograms,
        nutritionPlans,
        progress,
        upcomingSessions,
        paymentSummary: {
          totalPayments: paymentSummary._count,
          totalAmount: paymentSummary._sum.amount || 0,
          pendingPayments,
        },
      })
    } catch (error) {
      console.error('Get client dashboard error:', error)
      return jsonResponse({ error: 'Failed to fetch dashboard data.' }, 500)
    }
  }

  // ============ PUT /client/profile ============
  if (method === 'PUT' && pathParts[0] === 'profile' && pathParts.length === 1) {
    try {
      const sanitized = sanitizeInput(body) as Record<string, unknown>
      const validationResult = clientProfileUpdateSchema.safeParse(sanitized)
      if (!validationResult.success) {
        return jsonResponse({
          error: 'Validation failed',
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        }, 400)
      }

      // Verify client exists and belongs to this coach
      const existing = await db.client.findFirst({ where: { id: clientId, coachId } })
      if (!existing) {
        return jsonResponse({ error: 'Client not found.' }, 404)
      }

      const data = validationResult.data
      const updateData: Record<string, unknown> = {}
      if (data.phone !== undefined) updateData.phone = data.phone
      if (data.profileImage !== undefined) updateData.profileImage = data.profileImage
      if (data.age !== undefined) updateData.age = data.age
      if (data.gender !== undefined) updateData.gender = data.gender
      if (data.weight !== undefined) updateData.weight = data.weight
      if (data.height !== undefined) updateData.height = data.height
      if (data.goal !== undefined) updateData.goal = data.goal

      const client = await db.client.update({
        where: { id: clientId },
        data: updateData,
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
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      await auditLog(coachId, 'CLIENT_UPDATE_PROFILE', 'Client', clientId, `Client ${existing.name} updated their profile`, ip)

      return jsonResponse({
        message: 'Profile updated successfully',
        client,
      })
    } catch (error) {
      console.error('Client update profile error:', error)
      return jsonResponse({ error: 'Failed to update profile.' }, 500)
    }
  }

  // ============ GET /client/workouts ============
  if (method === 'GET' && pathParts[0] === 'workouts' && pathParts.length === 1) {
    try {
      const workouts = await db.workoutProgram.findMany({
        where: { clientId },
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
      })

      return jsonResponse({ workouts })
    } catch (error) {
      console.error('Get client workouts error:', error)
      return jsonResponse({ error: 'Failed to fetch workouts.' }, 500)
    }
  }

  // ============ GET /client/workouts/:id ============
  if (method === 'GET' && pathParts[0] === 'workouts' && pathParts.length === 2) {
    try {
      const workoutId = pathParts[1]

      const workout = await db.workoutProgram.findFirst({
        where: { id: workoutId, clientId },
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
      })

      if (!workout) {
        return jsonResponse({ error: 'Workout program not found.' }, 404)
      }

      return jsonResponse({ workout })
    } catch (error) {
      console.error('Get client workout detail error:', error)
      return jsonResponse({ error: 'Failed to fetch workout program.' }, 500)
    }
  }

  // ============ GET /client/nutrition ============
  if (method === 'GET' && pathParts[0] === 'nutrition' && pathParts.length === 1) {
    try {
      const nutritionPlans = await db.nutritionPlan.findMany({
        where: { clientId },
        orderBy: { createdAt: 'desc' },
        include: {
          meals: {
            orderBy: { order: 'asc' },
            include: {
              foodItems: { orderBy: { order: 'asc' } },
            },
          },
        },
      })

      return jsonResponse({ nutritionPlans })
    } catch (error) {
      console.error('Get client nutrition plans error:', error)
      return jsonResponse({ error: 'Failed to fetch nutrition plans.' }, 500)
    }
  }

  // ============ GET /client/nutrition/:id ============
  if (method === 'GET' && pathParts[0] === 'nutrition' && pathParts.length === 2) {
    try {
      const planId = pathParts[1]

      const nutritionPlan = await db.nutritionPlan.findFirst({
        where: { id: planId, clientId },
        include: {
          meals: {
            orderBy: { order: 'asc' },
            include: {
              foodItems: { orderBy: { order: 'asc' } },
            },
          },
        },
      })

      if (!nutritionPlan) {
        return jsonResponse({ error: 'Nutrition plan not found.' }, 404)
      }

      return jsonResponse({ nutritionPlan })
    } catch (error) {
      console.error('Get client nutrition plan detail error:', error)
      return jsonResponse({ error: 'Failed to fetch nutrition plan.' }, 500)
    }
  }

  // ============ GET /client/progress ============
  if (method === 'GET' && pathParts[0] === 'progress' && pathParts.length === 1) {
    try {
      const progress = await db.progress.findMany({
        where: { clientId },
        orderBy: { recordedAt: 'desc' },
      })

      return jsonResponse({ progress })
    } catch (error) {
      console.error('Get client progress error:', error)
      return jsonResponse({ error: 'Failed to fetch progress entries.' }, 500)
    }
  }

  // ============ POST /client/progress ============
  if (method === 'POST' && pathParts[0] === 'progress' && pathParts.length === 1) {
    try {
      const sanitized = sanitizeInput(body) as Record<string, unknown>
      const validationResult = clientProgressSchema.safeParse(sanitized)
      if (!validationResult.success) {
        return jsonResponse({
          error: 'Validation failed',
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        }, 400)
      }

      const data = validationResult.data

      // Verify client exists and belongs to this coach
      const client = await db.client.findFirst({
        where: { id: clientId, coachId },
      })
      if (!client) {
        return jsonResponse({ error: 'Client not found.' }, 404)
      }

      const progress = await db.progress.create({
        data: {
          clientId,
          weight: data.weight || 0,
          bodyFat: data.bodyFat || 0,
          muscleMass: data.muscleMass || 0,
          waist: data.waist || 0,
          chest: data.chest || 0,
          arms: data.arms || 0,
          thighs: data.thighs || 0,
          hips: data.hips || 0,
          notes: data.notes || '',
          recordedAt: data.recordedAt ? new Date(data.recordedAt) : undefined,
        },
      })

      await auditLog(coachId, 'CLIENT_CREATE_PROGRESS', 'Progress', progress.id, `Client ${client.name} added progress entry`, ip)

      return jsonResponse({
        message: 'Progress entry created successfully',
        progress,
      }, 201)
    } catch (error) {
      console.error('Client create progress error:', error)
      return jsonResponse({ error: 'Failed to create progress entry.' }, 500)
    }
  }

  // ============ GET /client/sessions ============
  if (method === 'GET' && pathParts[0] === 'sessions' && pathParts.length === 1) {
    try {
      const sessions = await db.session.findMany({
        where: { clientId },
        orderBy: { date: 'desc' },
      })

      return jsonResponse({ sessions })
    } catch (error) {
      console.error('Get client sessions error:', error)
      return jsonResponse({ error: 'Failed to fetch sessions.' }, 500)
    }
  }

  // ============ GET /client/payments ============
  if (method === 'GET' && pathParts[0] === 'payments' && pathParts.length === 1) {
    try {
      const payments = await db.payment.findMany({
        where: { clientId },
        orderBy: { createdAt: 'desc' },
      })

      return jsonResponse({ payments })
    } catch (error) {
      console.error('Get client payments error:', error)
      return jsonResponse({ error: 'Failed to fetch payments.' }, 500)
    }
  }

  // Unknown route
  return jsonResponse({ error: 'Route not found.' }, 404)
}
