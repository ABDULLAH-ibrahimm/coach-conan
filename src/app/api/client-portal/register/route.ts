import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, email, goal } = body

    // Validate required fields
    if (!name || !phone || !goal) {
      return NextResponse.json(
        { error: 'Name, phone, and goal are required' },
        { status: 400 }
      )
    }

    // Check if phone already exists
    const existingClient = await db.client.findFirst({
      where: { phone: String(phone).trim() },
    })

    if (existingClient) {
      return NextResponse.json(
        { error: 'A client with this phone number already exists' },
        { status: 409 }
      )
    }

    // Create client with status "pending" (awaiting coach approval)
    const client = await db.client.create({
      data: {
        name: String(name).trim(),
        phone: String(phone).trim(),
        email: email ? String(email).trim() : null,
        goal: String(goal).trim(),
        plan: '',
        status: 'pending',
        notes: '',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Registration submitted. Waiting for coach approval.',
      client: {
        id: client.id,
        name: client.name,
        phone: client.phone,
        email: client.email,
        goal: client.goal,
        status: client.status,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Client registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  }
}
