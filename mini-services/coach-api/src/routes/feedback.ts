import { z } from 'zod'
import { db } from '../db'
import { sanitizeInput, auditLog } from '../middleware/auth'
import type { RequestContext } from '../middleware/auth'

// ============ Zod Schemas ============

const createFeedbackSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  rating: z.number().int().min(1).max(5).default(5),
  comment: z.string().min(5, 'Comment must be at least 5 characters').max(1000),
})

const updateFeedbackSchema = z.object({
  approved: z.boolean().optional(),
  name: z.string().min(2).max(100).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().min(5).max(1000).optional(),
})

// ============ Route Handlers ============

export async function handleFeedbackRoutes(
  method: string,
  pathParts: string[],
  body: unknown,
  ctx: RequestContext
): Promise<Response> {
  const ip = ctx.ip

  // GET /api/feedback - Get approved feedback (public)
  if (method === 'GET' && pathParts.length === 0) {
    try {
      const feedback = await db.feedback.findMany({
        where: { approved: true },
        orderBy: { createdAt: 'desc' },
      })
      return Response.json({ feedback })
    } catch (error) {
      console.error('Get feedback error:', error)
      return Response.json({ error: 'Failed to fetch feedback.' }, { status: 500 })
    }
  }

  // GET /api/feedback/all - Get all feedback (admin only)
  if (method === 'GET' && pathParts[0] === 'all' && pathParts.length === 1) {
    if (!ctx.coachId) {
      return Response.json({ error: 'Access denied.' }, { status: 401 })
    }

    try {
      const feedback = await db.feedback.findMany({
        orderBy: { createdAt: 'desc' },
      })
      return Response.json({ feedback })
    } catch (error) {
      console.error('Get all feedback error:', error)
      return Response.json({ error: 'Failed to fetch feedback.' }, { status: 500 })
    }
  }

  // POST /api/feedback - Create feedback (public)
  if (method === 'POST' && pathParts.length === 0) {
    try {
      const sanitized = sanitizeInput(body) as Record<string, unknown>
      const validationResult = createFeedbackSchema.safeParse(sanitized)
      if (!validationResult.success) {
        return Response.json({
          error: 'Validation failed',
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        }, { status: 400 })
      }

      const { name, rating, comment } = validationResult.data

      const feedback = await db.feedback.create({
        data: {
          name,
          rating,
          comment,
          approved: false, // Requires coach approval
        },
      })

      // Audit log if coach exists
      if (ctx.coachId) {
        await auditLog(ctx.coachId, 'CREATE', 'Feedback', feedback.id, `New feedback from ${name}`, ip)
      }

      return Response.json({
        message: 'Feedback submitted successfully. It will appear after approval.',
        feedback,
      }, { status: 201 })
    } catch (error) {
      console.error('Create feedback error:', error)
      return Response.json({ error: 'Failed to submit feedback.' }, { status: 500 })
    }
  }

  // PUT /api/feedback/:id - Update feedback (admin only - approve/reject)
  if (method === 'PUT' && pathParts.length === 1) {
    if (!ctx.coachId) {
      return Response.json({ error: 'Access denied.' }, { status: 401 })
    }

    try {
      const id = pathParts[0]
      const sanitized = sanitizeInput(body) as Record<string, unknown>
      const validationResult = updateFeedbackSchema.safeParse(sanitized)
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
      const updateData: Record<string, unknown> = {}
      if (data.approved !== undefined) updateData.approved = data.approved
      if (data.name !== undefined) updateData.name = data.name
      if (data.rating !== undefined) updateData.rating = data.rating
      if (data.comment !== undefined) updateData.comment = data.comment

      const feedback = await db.feedback.update({
        where: { id },
        data: updateData,
      })

      await auditLog(ctx.coachId, 'UPDATE', 'Feedback', id, `Feedback ${data.approved ? 'approved' : 'updated'}`, ip)

      return Response.json({
        message: 'Feedback updated successfully',
        feedback,
      })
    } catch (error) {
      console.error('Update feedback error:', error)
      return Response.json({ error: 'Failed to update feedback.' }, { status: 500 })
    }
  }

  // DELETE /api/feedback/:id - Delete feedback (admin only)
  if (method === 'DELETE' && pathParts.length === 1) {
    if (!ctx.coachId) {
      return Response.json({ error: 'Access denied.' }, { status: 401 })
    }

    try {
      const id = pathParts[0]

      await db.feedback.delete({ where: { id } })

      await auditLog(ctx.coachId, 'DELETE', 'Feedback', id, 'Feedback deleted', ip)

      return Response.json({ message: 'Feedback deleted successfully.' })
    } catch (error) {
      console.error('Delete feedback error:', error)
      return Response.json({ error: 'Failed to delete feedback.' }, { status: 500 })
    }
  }

  return Response.json({ error: 'Route not found.' }, { status: 404 })
}
