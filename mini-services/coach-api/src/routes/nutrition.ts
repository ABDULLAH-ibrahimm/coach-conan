import { z } from 'zod'
import { db } from '../db'
import { sanitizeInput, auditLog } from '../middleware/auth'
import type { RequestContext } from '../middleware/auth'

// ============ Zod Schemas ============

const foodItemSchema = z.object({
  name: z.string().min(1, 'Food item name is required').max(200),
  quantity: z.number().min(0).default(0),
  unit: z.string().max(20).default('g'),
  calories: z.number().int().min(0).default(0),
  protein: z.number().min(0).default(0),
  carbs: z.number().min(0).default(0),
  fats: z.number().min(0).default(0),
  notes: z.string().max(500).optional().default(''),
  order: z.number().int().min(0).default(0),
})

const mealSchema = z.object({
  mealType: z.string().max(50),
  name: z.string().min(1, 'Meal name is required').max(200),
  time: z.string().max(20).optional().default(''),
  notes: z.string().max(500).optional().default(''),
  order: z.number().int().min(0).default(0),
  foodItems: z.array(foodItemSchema).optional().default([]),
})

const createNutritionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  clientId: z.string().min(1, 'Client ID is required'),
  description: z.string().max(1000).optional().default(''),
  calories: z.number().int().min(0).optional().default(0),
  protein: z.number().int().min(0).optional().default(0),
  carbs: z.number().int().min(0).optional().default(0),
  fats: z.number().int().min(0).optional().default(0),
  fiber: z.number().int().min(0).optional().default(0),
  waterMl: z.number().int().min(0).optional().default(2500),
  status: z.enum(['active', 'completed', 'paused']).optional().default('active'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  meals: z.array(mealSchema).optional().default([]),
})

const updateNutritionSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  description: z.string().max(1000).optional().default(''),
  calories: z.number().int().min(0).optional(),
  protein: z.number().int().min(0).optional(),
  carbs: z.number().int().min(0).optional(),
  fats: z.number().int().min(0).optional(),
  fiber: z.number().int().min(0).optional(),
  waterMl: z.number().int().min(0).optional(),
  status: z.enum(['active', 'completed', 'paused']).optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  meals: z.array(mealSchema).optional(),
})

// ============ Helper: Build nested create data ============

function buildMealsCreateData(meals: z.infer<typeof mealSchema>[]) {
  return {
    create: meals.map(meal => ({
      mealType: meal.mealType,
      name: meal.name,
      time: meal.time || '',
      notes: meal.notes || '',
      order: meal.order || 0,
      foodItems: {
        create: (meal.foodItems || []).map(fi => ({
          name: fi.name,
          quantity: fi.quantity || 0,
          unit: fi.unit || 'g',
          calories: fi.calories || 0,
          protein: fi.protein || 0,
          carbs: fi.carbs || 0,
          fats: fi.fats || 0,
          notes: fi.notes || '',
          order: fi.order || 0,
        })),
      },
    })),
  }
}

// ============ Route Handlers ============

export async function handleNutritionRoutes(method: string, pathParts: string[], body: unknown, ctx: RequestContext, query: URLSearchParams): Promise<Response> {
  if (!ctx.coachId) {
    return Response.json({ error: 'Access denied. No token provided.' }, { status: 401 })
  }

  const coachId = ctx.coachId
  const ip = ctx.ip

  // GET /api/nutrition - List plans
  if (method === 'GET' && pathParts.length === 0) {
    try {
      const clientId = query.get('clientId') || undefined
      const status = query.get('status') || undefined

      const where: Record<string, unknown> = { coachId }
      if (clientId) where.clientId = clientId
      if (status) where.status = status

      const nutritionPlans = await db.nutritionPlan.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          client: { select: { id: true, name: true } },
          meals: {
            orderBy: { order: 'asc' },
            include: {
              foodItems: { orderBy: { order: 'asc' } },
            },
          },
        },
      })

      return Response.json({ nutritionPlans })
    } catch (error) {
      console.error('List nutrition plans error:', error)
      return Response.json({ error: 'Failed to fetch nutrition plans.' }, { status: 500 })
    }
  }

  // GET /api/nutrition/:id - Get plan with meals→foodItems
  if (method === 'GET' && pathParts.length === 1) {
    try {
      const id = pathParts[0]

      const nutritionPlan = await db.nutritionPlan.findFirst({
        where: { id, coachId },
        include: {
          client: { select: { id: true, name: true } },
          meals: {
            orderBy: { order: 'asc' },
            include: {
              foodItems: { orderBy: { order: 'asc' } },
            },
          },
        },
      })

      if (!nutritionPlan) {
        return Response.json({ error: 'Nutrition plan not found.' }, { status: 404 })
      }

      return Response.json({ nutritionPlan })
    } catch (error) {
      console.error('Get nutrition plan error:', error)
      return Response.json({ error: 'Failed to fetch nutrition plan.' }, { status: 500 })
    }
  }

  // POST /api/nutrition - Create plan with nested data
  if (method === 'POST' && pathParts.length === 0) {
    try {
      const sanitized = sanitizeInput(body) as Record<string, unknown>
      const validationResult = createNutritionSchema.safeParse(sanitized)
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

      const plan = await db.nutritionPlan.create({
        data: {
          clientId: data.clientId,
          coachId,
          name: data.name,
          description: data.description || '',
          calories: data.calories || 0,
          protein: data.protein || 0,
          carbs: data.carbs || 0,
          fats: data.fats || 0,
          fiber: data.fiber || 0,
          waterMl: data.waterMl || 2500,
          status: data.status || 'active',
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null,
          meals: buildMealsCreateData(data.meals || []),
        },
        include: {
          client: { select: { id: true, name: true } },
          meals: {
            orderBy: { order: 'asc' },
            include: {
              foodItems: { orderBy: { order: 'asc' } },
            },
          },
        },
      })

      await auditLog(coachId, 'CREATE', 'NutritionPlan', plan.id, `Created nutrition plan: ${plan.name}`, ip)

      return Response.json({
        message: 'Nutrition plan created successfully',
        nutritionPlan: plan,
      }, { status: 201 })
    } catch (error) {
      console.error('Create nutrition plan error:', error)
      return Response.json({ error: 'Failed to create nutrition plan.' }, { status: 500 })
    }
  }

  // PUT /api/nutrition/:id - Update plan
  if (method === 'PUT' && pathParts.length === 1) {
    try {
      const id = pathParts[0]
      const sanitized = sanitizeInput(body) as Record<string, unknown>
      const validationResult = updateNutritionSchema.safeParse(sanitized)
      if (!validationResult.success) {
        return Response.json({
          error: 'Validation failed',
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        }, { status: 400 })
      }

      const existing = await db.nutritionPlan.findFirst({
        where: { id, coachId },
      })
      if (!existing) {
        return Response.json({ error: 'Nutrition plan not found.' }, { status: 404 })
      }

      const data = validationResult.data

      // If meals provided, delete old and recreate
      if (data.meals && data.meals.length > 0) {
        await db.meal.deleteMany({ where: { planId: id } })

        const plan = await db.nutritionPlan.update({
          where: { id },
          data: {
            name: data.name,
            description: data.description,
            calories: data.calories,
            protein: data.protein,
            carbs: data.carbs,
            fats: data.fats,
            fiber: data.fiber,
            waterMl: data.waterMl,
            status: data.status,
            startDate: data.startDate ? new Date(data.startDate) : null,
            endDate: data.endDate ? new Date(data.endDate) : null,
            meals: buildMealsCreateData(data.meals),
          },
          include: {
            client: { select: { id: true, name: true } },
            meals: {
              orderBy: { order: 'asc' },
              include: {
                foodItems: { orderBy: { order: 'asc' } },
              },
            },
          },
        })

        await auditLog(coachId, 'UPDATE', 'NutritionPlan', id, `Updated nutrition plan: ${plan.name}`, ip)

        return Response.json({
          message: 'Nutrition plan updated successfully',
          nutritionPlan: plan,
        })
      }

      // Update without changing meals
      const updateData: Record<string, unknown> = {}
      if (data.name !== undefined) updateData.name = data.name
      if (data.description !== undefined) updateData.description = data.description
      if (data.calories !== undefined) updateData.calories = data.calories
      if (data.protein !== undefined) updateData.protein = data.protein
      if (data.carbs !== undefined) updateData.carbs = data.carbs
      if (data.fats !== undefined) updateData.fats = data.fats
      if (data.fiber !== undefined) updateData.fiber = data.fiber
      if (data.waterMl !== undefined) updateData.waterMl = data.waterMl
      if (data.status !== undefined) updateData.status = data.status
      if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null
      if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null

      const plan = await db.nutritionPlan.update({
        where: { id },
        data: updateData,
        include: {
          client: { select: { id: true, name: true } },
          meals: {
            orderBy: { order: 'asc' },
            include: {
              foodItems: { orderBy: { order: 'asc' } },
            },
          },
        },
      })

      await auditLog(coachId, 'UPDATE', 'NutritionPlan', id, `Updated nutrition plan: ${plan.name}`, ip)

      return Response.json({
        message: 'Nutrition plan updated successfully',
        nutritionPlan: plan,
      })
    } catch (error) {
      console.error('Update nutrition plan error:', error)
      return Response.json({ error: 'Failed to update nutrition plan.' }, { status: 500 })
    }
  }

  // DELETE /api/nutrition/:id - Delete plan
  if (method === 'DELETE' && pathParts.length === 1) {
    try {
      const id = pathParts[0]

      const existing = await db.nutritionPlan.findFirst({
        where: { id, coachId },
      })
      if (!existing) {
        return Response.json({ error: 'Nutrition plan not found.' }, { status: 404 })
      }

      await db.nutritionPlan.delete({ where: { id } })

      await auditLog(coachId, 'DELETE', 'NutritionPlan', id, `Deleted nutrition plan: ${existing.name}`, ip)

      return Response.json({ message: 'Nutrition plan deleted successfully.' })
    } catch (error) {
      console.error('Delete nutrition plan error:', error)
      return Response.json({ error: 'Failed to delete nutrition plan.' }, { status: 500 })
    }
  }

  return Response.json({ error: 'Route not found.' }, { status: 404 })
}
