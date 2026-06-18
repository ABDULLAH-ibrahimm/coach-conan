import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthAdmin } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { clientId, date, type, duration, notes, status } = body

    const existingSession = await db.session.findUnique({ where: { id } })
    if (!existingSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    const session = await db.session.update({
      where: { id },
      data: {
        ...(clientId !== undefined && { clientId: String(clientId) }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(type !== undefined && { type: String(type).trim() }),
        ...(duration !== undefined && { duration: Number(duration) }),
        ...(notes !== undefined && { notes: String(notes || '').trim() }),
        ...(status !== undefined && { status: String(status).trim() }),
      },
      include: { client: { select: { id: true, name: true, email: true, phone: true } } },
    })

    return NextResponse.json(session)
  } catch (error) {
    console.error('Update session error:', error)
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const existingSession = await db.session.findUnique({ where: { id } })
    if (!existingSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    await db.session.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete session error:', error)
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 })
  }
}
