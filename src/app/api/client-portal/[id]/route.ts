import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const sessions = await db.session.findMany({
      where: { clientId: id },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error('Fetch client sessions error:', error)
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }
}
