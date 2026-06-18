import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  // Require a setup secret to prevent unauthorized account creation
  const setupSecret = process.env.SETUP_SECRET
  if (!setupSecret) {
    return NextResponse.json({ error: 'Setup is disabled' }, { status: 403 })
  }

  const authHeader = request.headers.get('x-setup-secret')
  if (authHeader !== setupSecret) {
    return NextResponse.json({ error: 'Invalid setup secret' }, { status: 403 })
  }

  try {
    const existingAdmin = await db.admin.findFirst()
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin account already exists' },
        { status: 400 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const { email, password, name } = body as Record<string, string>

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'email, password, and name are required' },
        { status: 400 }
      )
    }

    if (password.length < 12) {
      return NextResponse.json(
        { error: 'Password must be at least 12 characters' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const admin = await db.admin.create({
      data: { email, password: hashedPassword, name },
    })

    return NextResponse.json({
      success: true,
      admin: { id: admin.id, email: admin.email, name: admin.name },
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
