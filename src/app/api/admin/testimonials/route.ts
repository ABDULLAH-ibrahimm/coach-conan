import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthAdmin } from '@/lib/auth'

export async function GET() {
  try {
    const admin = await getAuthAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const testimonials = await db.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(testimonials)
  } catch (error) {
    console.error('Fetch testimonials error:', error)
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAuthAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, role, rating, text, avatar, comment, approved } = body

    if (!name || !text) {
      return NextResponse.json({ error: 'Name and text are required' }, { status: 400 })
    }

    const testimonial = await db.testimonial.create({
      data: {
        name: String(name).trim(),
        role: String(role || '').trim(),
        rating: Number(rating || 5),
        text: String(text).trim(),
        avatar: String(avatar || '').trim(),
        comment: String(comment || '').trim(),
        approved: Boolean(approved ?? false),
      },
    })

    return NextResponse.json(testimonial, { status: 201 })
  } catch (error) {
    console.error('Create testimonial error:', error)
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 })
  }
}
