import { z } from 'zod'
import { db } from '../db'
import { sanitizeInput, auditLog } from '../middleware/auth'
import type { RequestContext } from '../middleware/auth'

// ============ Zod Schemas ============

const exerciseSchema = z.object({
  order: z.number().int().min(0).default(0),
  name: z.string().min(1, 'Exercise name is required').max(200),
  muscleGroup: z.string().max(50).optional().default(''),
  sets: z.number().int().min(0).default(3),
  reps: z.number().int().min(0).default(10),
  weightKg: z.number().min(0).default(0),
  restSeconds: z.number().int().min(0).default(60),
  tempo: z.string().max(30).optional().default(''),
  notes: z.string().max(500).optional().default(''),
  isSuperset: z.boolean().default(false),
  supersetGroup: z.number().int().default(0),
})

const daySchema = z.object({
  dayNumber: z.number().int().min(1),
  dayName: z.string().max(100).optional().default(''),
  isRestDay: z.boolean().default(false),
  notes: z.string().max(500).optional().default(''),
  exercises: z.array(exerciseSchema).optional().default([]),
})

const weekSchema = z.object({
  weekNumber: z.number().int().min(1),
  name: z.string().max(100).optional().default(''),
  notes: z.string().max(500).optional().default(''),
  days: z.array(daySchema).optional().default([]),
})

const createWorkoutSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  clientId: z.string().min(1, 'Client ID is required'),
  description: z.string().max(1000).optional().default(''),
  frequency: z.string().max(100).optional().default(''),
  durationWeeks: z.number().int().min(1).max(52).optional().default(4),
  status: z.enum(['active', 'completed', 'paused']).optional().default('active'),
  weeks: z.array(weekSchema).optional().default([]),
})

const updateWorkoutSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  description: z.string().max(1000).optional().default(''),
  frequency: z.string().max(100).optional().default(''),
  durationWeeks: z.number().int().min(1).max(52).optional(),
  status: z.enum(['active', 'completed', 'paused']).optional(),
  weeks: z.array(weekSchema).optional(),
})

// ============ Helper: Build nested create data ============

function buildWeeksCreateData(weeks: z.infer<typeof weekSchema>[]) {
  return {
    create: weeks.map(week => ({
      weekNumber: week.weekNumber,
      name: week.name || '',
      notes: week.notes || '',
      days: {
        create: (week.days || []).map(day => ({
          dayNumber: day.dayNumber,
          dayName: day.dayName || '',
          isRestDay: day.isRestDay || false,
          notes: day.notes || '',
          exercises: {
            create: (day.exercises || []).map(ex => ({
              order: ex.order || 0,
              name: ex.name,
              muscleGroup: ex.muscleGroup || '',
              sets: ex.sets || 3,
              reps: ex.reps || 10,
              weightKg: ex.weightKg || 0,
              restSeconds: ex.restSeconds || 60,
              tempo: ex.tempo || '',
              notes: ex.notes || '',
              isSuperset: ex.isSuperset || false,
              supersetGroup: ex.supersetGroup || 0,
            })),
          },
        })),
      },
    })),
  }
}

// ============ Route Handlers ============

export async function handleWorkoutRoutes(method: string, pathParts: string[], body: unknown, ctx: RequestContext, query: URLSearchParams): Promise<Response> {
  if (!ctx.coachId) {
    return Response.json({ error: 'Access denied. No token provided.' }, { status: 401 })
  }

  const coachId = ctx.coachId
  const ip = ctx.ip

  // GET /api/workouts - List programs
  if (method === 'GET' && pathParts.length === 0) {
    try {
      const clientId = query.get('clientId') || undefined
      const status = query.get('status') || undefined

      const where: Record<string, unknown> = { coachId }
      if (clientId) where.clientId = clientId
      if (status) where.status = status

      const workouts = await db.workoutProgram.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          client: { select: { id: true, name: true } },
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

      return Response.json({ workouts })
    } catch (error) {
      console.error('List workouts error:', error)
      return Response.json({ error: 'Failed to fetch workout programs.' }, { status: 500 })
    }
  }

  // GET /api/workouts/:id - Get full program
  if (method === 'GET' && pathParts.length === 1 && pathParts[0] !== 'duplicate') {
    try {
      const id = pathParts[0]

      const workout = await db.workoutProgram.findFirst({
        where: { id, coachId },
        include: {
          client: { select: { id: true, name: true } },
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
        return Response.json({ error: 'Workout program not found.' }, { status: 404 })
      }

      return Response.json({ workout })
    } catch (error) {
      console.error('Get workout error:', error)
      return Response.json({ error: 'Failed to fetch workout program.' }, { status: 500 })
    }
  }

  // POST /api/workouts - Create program with nested data
  if (method === 'POST' && pathParts.length === 0) {
    try {
      const sanitized = sanitizeInput(body) as Record<string, unknown>
      const validationResult = createWorkoutSchema.safeParse(sanitized)
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

      const workout = await db.workoutProgram.create({
        data: {
          clientId: data.clientId,
          coachId,
          name: data.name,
          description: data.description || '',
          frequency: data.frequency || '',
          durationWeeks: data.durationWeeks || 4,
          status: data.status || 'active',
          weeks: buildWeeksCreateData(data.weeks || []),
        },
        include: {
          client: { select: { id: true, name: true } },
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

      await auditLog(coachId, 'CREATE', 'WorkoutProgram', workout.id, `Created workout: ${workout.name}`, ip)

      return Response.json({
        message: 'Workout program created successfully',
        workout,
      }, { status: 201 })
    } catch (error) {
      console.error('Create workout error:', error)
      return Response.json({ error: 'Failed to create workout program.' }, { status: 500 })
    }
  }

  // PUT /api/workouts/:id - Update program
  if (method === 'PUT' && pathParts.length === 1) {
    try {
      const id = pathParts[0]
      const sanitized = sanitizeInput(body) as Record<string, unknown>
      const validationResult = updateWorkoutSchema.safeParse(sanitized)
      if (!validationResult.success) {
        return Response.json({
          error: 'Validation failed',
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        }, { status: 400 })
      }

      const existing = await db.workoutProgram.findFirst({
        where: { id, coachId },
      })
      if (!existing) {
        return Response.json({ error: 'Workout program not found.' }, { status: 404 })
      }

      const data = validationResult.data

      // If weeks provided, delete old nested data and recreate
      if (data.weeks && data.weeks.length > 0) {
        // Delete existing weeks (cascades to days and exercises)
        await db.programWeek.deleteMany({ where: { programId: id } })

        // Update program and recreate weeks
        const workout = await db.workoutProgram.update({
          where: { id },
          data: {
            name: data.name,
            description: data.description,
            frequency: data.frequency,
            durationWeeks: data.durationWeeks,
            status: data.status,
            weeks: buildWeeksCreateData(data.weeks),
          },
          include: {
            client: { select: { id: true, name: true } },
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

        await auditLog(coachId, 'UPDATE', 'WorkoutProgram', id, `Updated workout: ${workout.name}`, ip)

        return Response.json({
          message: 'Workout program updated successfully',
          workout,
        })
      }

      // Update without changing weeks
      const updateData: Record<string, unknown> = {}
      if (data.name !== undefined) updateData.name = data.name
      if (data.description !== undefined) updateData.description = data.description
      if (data.frequency !== undefined) updateData.frequency = data.frequency
      if (data.durationWeeks !== undefined) updateData.durationWeeks = data.durationWeeks
      if (data.status !== undefined) updateData.status = data.status

      const workout = await db.workoutProgram.update({
        where: { id },
        data: updateData,
        include: {
          client: { select: { id: true, name: true } },
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

      await auditLog(coachId, 'UPDATE', 'WorkoutProgram', id, `Updated workout: ${workout.name}`, ip)

      return Response.json({
        message: 'Workout program updated successfully',
        workout,
      })
    } catch (error) {
      console.error('Update workout error:', error)
      return Response.json({ error: 'Failed to update workout program.' }, { status: 500 })
    }
  }

  // DELETE /api/workouts/:id - Delete program
  if (method === 'DELETE' && pathParts.length === 1) {
    try {
      const id = pathParts[0]

      const existing = await db.workoutProgram.findFirst({
        where: { id, coachId },
      })
      if (!existing) {
        return Response.json({ error: 'Workout program not found.' }, { status: 404 })
      }

      await db.workoutProgram.delete({ where: { id } })

      await auditLog(coachId, 'DELETE', 'WorkoutProgram', id, `Deleted workout: ${existing.name}`, ip)

      return Response.json({ message: 'Workout program deleted successfully.' })
    } catch (error) {
      console.error('Delete workout error:', error)
      return Response.json({ error: 'Failed to delete workout program.' }, { status: 500 })
    }
  }

  // POST /api/workouts/:id/duplicate - Clone program
  if (method === 'POST' && pathParts.length === 2 && pathParts[1] === 'duplicate') {
    try {
      const id = pathParts[0]

      const existing = await db.workoutProgram.findFirst({
        where: { id, coachId },
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
      if (!existing) {
        return Response.json({ error: 'Workout program not found.' }, { status: 404 })
      }

      const duplicated = await db.workoutProgram.create({
        data: {
          clientId: existing.clientId,
          coachId: existing.coachId,
          name: `${existing.name} (Copy)`,
          description: existing.description,
          frequency: existing.frequency,
          durationWeeks: existing.durationWeeks,
          status: 'active',
          weeks: {
            create: existing.weeks.map(week => ({
              weekNumber: week.weekNumber,
              name: week.name,
              notes: week.notes,
              days: {
                create: week.days.map(day => ({
                  dayNumber: day.dayNumber,
                  dayName: day.dayName,
                  isRestDay: day.isRestDay,
                  notes: day.notes,
                  exercises: {
                    create: day.exercises.map(ex => ({
                      order: ex.order,
                      name: ex.name,
                      muscleGroup: ex.muscleGroup,
                      sets: ex.sets,
                      reps: ex.reps,
                      weightKg: ex.weightKg,
                      restSeconds: ex.restSeconds,
                      tempo: ex.tempo,
                      notes: ex.notes,
                      isSuperset: ex.isSuperset,
                      supersetGroup: ex.supersetGroup,
                    })),
                  },
                })),
              },
            })),
          },
        },
        include: {
          client: { select: { id: true, name: true } },
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

      await auditLog(coachId, 'DUPLICATE', 'WorkoutProgram', duplicated.id, `Duplicated workout from ${id}: ${duplicated.name}`, ip)

      return Response.json({
        message: 'Workout program duplicated successfully',
        workout: duplicated,
      }, { status: 201 })
    } catch (error) {
      console.error('Duplicate workout error:', error)
      return Response.json({ error: 'Failed to duplicate workout program.' }, { status: 500 })
    }
  }

  return Response.json({ error: 'Route not found.' }, { status: 404 })
}
