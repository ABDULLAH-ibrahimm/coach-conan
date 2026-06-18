import { z } from 'zod'
import { db } from '../db'
import { sanitizeInput, auditLog } from '../middleware/auth'
import type { RequestContext } from '../middleware/auth'

// ============ Zod Schemas ============

const createProgressSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
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

const updateProgressSchema = z.object({
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

// ============ Route Handlers ============

export async function handleProgressRoutes(method: string, pathParts: string[], body: unknown, ctx: RequestContext): Promise<Response> {
  if (!ctx.coachId) {
    return Response.json({ error: 'Access denied. No token provided.' }, { status: 401 })
  }

  const coachId = ctx.coachId
  const ip = ctx.ip

  // GET /api/progress/client/:clientId - Get progress records
  if (method === 'GET' && pathParts.length === 2 && pathParts[0] === 'client') {
    try {
      const clientId = pathParts[1]

      // Verify client belongs to this coach
      const client = await db.client.findFirst({
        where: { id: clientId, coachId },
      })
      if (!client) {
        return Response.json({ error: 'Client not found or does not belong to you.' }, { status: 404 })
      }

      const progress = await db.progress.findMany({
        where: { clientId },
        orderBy: { recordedAt: 'desc' },
      })

      return Response.json({ progress })
    } catch (error) {
      console.error('Get progress error:', error)
      return Response.json({ error: 'Failed to fetch progress records.' }, { status: 500 })
    }
  }

  // GET /api/progress/client/:clientId/chart - Chart-ready data
  if (method === 'GET' && pathParts.length === 3 && pathParts[0] === 'client' && pathParts[2] === 'chart') {
    try {
      const clientId = pathParts[1]

      // Verify client belongs to this coach
      const client = await db.client.findFirst({
        where: { id: clientId, coachId },
      })
      if (!client) {
        return Response.json({ error: 'Client not found or does not belong to you.' }, { status: 404 })
      }

      const records = await db.progress.findMany({
        where: { clientId },
        orderBy: { recordedAt: 'asc' },
        select: {
          id: true,
          weight: true,
          bodyFat: true,
          muscleMass: true,
          waist: true,
          chest: true,
          arms: true,
          thighs: true,
          hips: true,
          recordedAt: true,
        },
      })

      // Format for chart consumption
      const chartData = {
        labels: records.map(r => r.recordedAt.toISOString().split('T')[0]),
        weight: records.map(r => ({ x: r.recordedAt.toISOString().split('T')[0], y: r.weight })),
        bodyFat: records.map(r => ({ x: r.recordedAt.toISOString().split('T')[0], y: r.bodyFat })),
        muscleMass: records.map(r => ({ x: r.recordedAt.toISOString().split('T')[0], y: r.muscleMass })),
        waist: records.map(r => ({ x: r.recordedAt.toISOString().split('T')[0], y: r.waist })),
        chest: records.map(r => ({ x: r.recordedAt.toISOString().split('T')[0], y: r.chest })),
        arms: records.map(r => ({ x: r.recordedAt.toISOString().split('T')[0], y: r.arms })),
        thighs: records.map(r => ({ x: r.recordedAt.toISOString().split('T')[0], y: r.thighs })),
        hips: records.map(r => ({ x: r.recordedAt.toISOString().split('T')[0], y: r.hips })),
      }

      return Response.json({ chartData, totalRecords: records.length })
    } catch (error) {
      console.error('Get chart data error:', error)
      return Response.json({ error: 'Failed to fetch chart data.' }, { status: 500 })
    }
  }

  // POST /api/progress - Add progress record
  if (method === 'POST' && pathParts.length === 0) {
    try {
      const sanitized = sanitizeInput(body) as Record<string, unknown>
      const validationResult = createProgressSchema.safeParse(sanitized)
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

      const progress = await db.progress.create({
        data: {
          clientId: data.clientId,
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

      await auditLog(coachId, 'CREATE', 'Progress', progress.id, `Created progress record for client ${data.clientId}`, ip)

      return Response.json({
        message: 'Progress record created successfully',
        progress,
      }, { status: 201 })
    } catch (error) {
      console.error('Create progress error:', error)
      return Response.json({ error: 'Failed to create progress record.' }, { status: 500 })
    }
  }

  // PUT /api/progress/:id - Update progress record
  if (method === 'PUT' && pathParts.length === 1) {
    try {
      const id = pathParts[0]
      const sanitized = sanitizeInput(body) as Record<string, unknown>
      const validationResult = updateProgressSchema.safeParse(sanitized)
      if (!validationResult.success) {
        return Response.json({
          error: 'Validation failed',
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        }, { status: 400 })
      }

      // Verify progress record belongs to a client of this coach
      const existing = await db.progress.findFirst({
        where: { id },
        include: { client: true },
      })
      if (!existing || existing.client.coachId !== coachId) {
        return Response.json({ error: 'Progress record not found.' }, { status: 404 })
      }

      const data = validationResult.data
      const updateData: Record<string, unknown> = {}
      if (data.weight !== undefined) updateData.weight = data.weight
      if (data.bodyFat !== undefined) updateData.bodyFat = data.bodyFat
      if (data.muscleMass !== undefined) updateData.muscleMass = data.muscleMass
      if (data.waist !== undefined) updateData.waist = data.waist
      if (data.chest !== undefined) updateData.chest = data.chest
      if (data.arms !== undefined) updateData.arms = data.arms
      if (data.thighs !== undefined) updateData.thighs = data.thighs
      if (data.hips !== undefined) updateData.hips = data.hips
      if (data.notes !== undefined) updateData.notes = data.notes
      if (data.recordedAt !== undefined) updateData.recordedAt = new Date(data.recordedAt)

      const progress = await db.progress.update({
        where: { id },
        data: updateData,
      })

      await auditLog(coachId, 'UPDATE', 'Progress', id, `Updated progress record`, ip)

      return Response.json({
        message: 'Progress record updated successfully',
        progress,
      })
    } catch (error) {
      console.error('Update progress error:', error)
      return Response.json({ error: 'Failed to update progress record.' }, { status: 500 })
    }
  }

  // DELETE /api/progress/:id - Delete progress record
  if (method === 'DELETE' && pathParts.length === 1) {
    try {
      const id = pathParts[0]

      // Verify progress record belongs to a client of this coach
      const existing = await db.progress.findFirst({
        where: { id },
        include: { client: true },
      })
      if (!existing || existing.client.coachId !== coachId) {
        return Response.json({ error: 'Progress record not found.' }, { status: 404 })
      }

      await db.progress.delete({ where: { id } })

      await auditLog(coachId, 'DELETE', 'Progress', id, `Deleted progress record`, ip)

      return Response.json({ message: 'Progress record deleted successfully.' })
    } catch (error) {
      console.error('Delete progress error:', error)
      return Response.json({ error: 'Failed to delete progress record.' }, { status: 500 })
    }
  }

  return Response.json({ error: 'Route not found.' }, { status: 404 })
}
