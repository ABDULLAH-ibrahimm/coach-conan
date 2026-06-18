import { db } from '../db'
import type { RequestContext } from '../middleware/auth'

// ============ Route Handlers ============

export async function handleDashboardRoutes(method: string, pathParts: string[], _body: unknown, ctx: RequestContext): Promise<Response> {
  if (!ctx.coachId) {
    return Response.json({ error: 'Access denied. No token provided.' }, { status: 401 })
  }

  const coachId = ctx.coachId

  // GET /api/dashboard/stats - Overview statistics
  if (method === 'GET' && pathParts.length === 1 && pathParts[0] === 'stats') {
    try {
      const now = new Date()
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      startOfWeek.setHours(0, 0, 0, 0)

      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 7)

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      const [
        totalClients,
        activeClients,
        sessionsThisWeek,
        upcomingSessions,
        recentActivity,
        revenueSummary,
      ] = await Promise.all([
        // Total clients
        db.client.count({ where: { coachId } }),

        // Active clients
        db.client.count({ where: { coachId, status: 'active' } }),

        // Sessions this week
        db.session.count({
          where: {
            coachId,
            date: { gte: startOfWeek, lt: endOfWeek },
          },
        }),

        // Upcoming sessions (next 7 days)
        db.session.findMany({
          where: {
            coachId,
            date: { gte: now },
            status: 'scheduled',
          },
          orderBy: { date: 'asc' },
          take: 5,
          include: {
            client: { select: { id: true, name: true } },
          },
        }),

        // Recent activity (last 10 audit logs)
        db.auditLog.findMany({
          where: { coachId },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),

        // Revenue summary
        db.payment.aggregate({
          _sum: { amount: true },
          where: {
            coachId,
            status: 'paid',
            paidDate: { gte: startOfMonth },
          },
        }),
      ])

      const totalRevenue = await db.payment.aggregate({
        _sum: { amount: true },
        where: { coachId, status: 'paid' },
      })

      const pendingRevenue = await db.payment.aggregate({
        _sum: { amount: true },
        where: { coachId, status: 'pending' },
      })

      return Response.json({
        stats: {
          totalClients,
          activeClients,
          inactiveClients: totalClients - activeClients,
          sessionsThisWeek,
          upcomingSessions,
          recentActivity,
          revenue: {
            totalPaid: totalRevenue._sum.amount || 0,
            thisMonthPaid: revenueSummary._sum.amount || 0,
            pendingAmount: pendingRevenue._sum.amount || 0,
          },
        },
      })
    } catch (error) {
      console.error('Dashboard stats error:', error)
      return Response.json({ error: 'Failed to fetch dashboard stats.' }, { status: 500 })
    }
  }

  return Response.json({ error: 'Route not found.' }, { status: 404 })
}
