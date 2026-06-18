import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthAdmin } from '@/lib/auth'

export async function GET() {
  try {
    const admin = await getAuthAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [totalClients, activeClients, upcomingSessions, newMessages] =
      await Promise.all([
        db.client.count(),
        db.client.count({ where: { status: 'active' } }),
        db.session.count({
          where: {
            date: { gte: new Date() },
            status: 'scheduled',
          },
        }),
        db.contactSubmission.count({ where: { status: 'new' } }),
      ])

    return NextResponse.json({
      totalClients,
      activeClients,
      upcomingSessions,
      newMessages,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
