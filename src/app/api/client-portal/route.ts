import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createAuthToken, AUTH_COOKIE_NAME } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone } = body

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    const client = await db.client.findFirst({
      where: { phone },
      include: {
        sessions: {
          orderBy: { date: 'desc' },
        },
      },
    })

    if (!client) {
      return NextResponse.json(
        { error: 'No account found with this phone number' },
        { status: 404 }
      )
    }

    const token = createAuthToken(client.email || client.phone)

    const response = NextResponse.json({
      success: true,
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        age: client.age,
        weight: client.weight,
        height: client.height,
        goal: client.goal,
        plan: client.plan,
        status: client.status,
        joinDate: client.joinDate,
        sessions: client.sessions,
      },
    })

    response.cookies.set('coach-conan-client-auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Client portal login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('coach-conan-client-auth')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Decode the token to get email/phone
    const [emailPart] = token.split('.')
    const identifier = Buffer.from(emailPart, 'base64').toString()

    const client = await db.client.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
      include: {
        sessions: {
          orderBy: { date: 'desc' },
        },
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      age: client.age,
      weight: client.weight,
      height: client.height,
      goal: client.goal,
      plan: client.plan,
      status: client.status,
      joinDate: client.joinDate,
      sessions: client.sessions,
    })
  } catch (error) {
    console.error('Get client portal data error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
