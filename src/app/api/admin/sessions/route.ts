import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthAdmin } from '@/lib/auth'

export async function GET() {
  try {
    const admin = await getAuthAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sessions = await db.session.findMany({
      include: {
        client: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Get sessions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAuthAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { clientId, date, type, duration, notes, status } = body

    if (!clientId || !date) {
      return NextResponse.json(
        { error: 'Client ID and date are required' },
        { status: 400 }
      )
    }

    // Verify client exists
    const client = await db.client.findUnique({ where: { id: clientId } })
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    const session = await db.session.create({
      data: {
        clientId,
        date: new Date(date),
        type: type || 'personal',
        duration: duration || 60,
        notes: notes || '',
        status: status || 'scheduled',
      },
      include: {
        client: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    })

    return NextResponse.json(session, { status: 201 })
  } catch (error) {
    console.error('Create session error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
