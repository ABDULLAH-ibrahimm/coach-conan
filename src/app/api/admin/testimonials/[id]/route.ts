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
    const { name, role, rating, text, avatar, comment, approved } = body

    const existingTestimonial = await db.testimonial.findUnique({ where: { id } })
    if (!existingTestimonial) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 })
    }

    const testimonial = await db.testimonial.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: String(name).trim() }),
        ...(role !== undefined && { role: String(role || '').trim() }),
        ...(rating !== undefined && { rating: Number(rating) }),
        ...(text !== undefined && { text: String(text).trim() }),
        ...(avatar !== undefined && { avatar: String(avatar || '').trim() }),
        ...(comment !== undefined && { comment: String(comment || '').trim() }),
        ...(approved !== undefined && { approved: Boolean(approved) }),
      },
    })

    return NextResponse.json(testimonial)
  } catch (error) {
    console.error('Update testimonial error:', error)
    return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 })
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

    const existingTestimonial = await db.testimonial.findUnique({ where: { id } })
    if (!existingTestimonial) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 })
    }

    await db.testimonial.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete testimonial error:', error)
    return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 })
  }
}
