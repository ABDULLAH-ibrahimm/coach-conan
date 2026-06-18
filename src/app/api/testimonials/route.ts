import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET approved comments
export async function GET() {
  try {
    const comments = await db.testimonialComment.findMany({
      where: { approved: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return NextResponse.json({ comments })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

// POST new comment
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, comment, rating, lang } = body

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Name is required (min 2 chars)' }, { status: 400 })
    }
    if (!comment || typeof comment !== 'string' || comment.trim().length < 5) {
      return NextResponse.json({ error: 'Comment is required (min 5 chars)' }, { status: 400 })
    }

    const clampedRating = Math.min(5, Math.max(1, Number(rating) || 5))

    const newComment = await db.testimonialComment.create({
      data: {
        name: name.trim().slice(0, 100),
        comment: comment.trim().slice(0, 1000),
        rating: clampedRating,
        approved: false,
        lang: lang === 'ar' ? 'ar' : 'en',
      },
    })

    return NextResponse.json({ success: true, comment: newComment }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to submit comment' }, { status: 500 })
  }
}
