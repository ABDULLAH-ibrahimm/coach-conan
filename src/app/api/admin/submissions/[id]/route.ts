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
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    const existingSubmission = await db.contactSubmission.findUnique({ where: { id } })
    if (!existingSubmission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    const submission = await db.contactSubmission.update({
      where: { id },
      data: { status: String(status).trim() },
    })

    return NextResponse.json(submission)
  } catch (error) {
    console.error('Update submission error:', error)
    return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 })
  }
}
