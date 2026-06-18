import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    const client = await db.client.findFirst({
      where: { phone: String(phone).trim() },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const token = Buffer.from(`${client.id}:${Date.now()}`).toString('base64')

    return NextResponse.json({
      token,
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
        notes: client.notes,
        joinDate: client.joinDate,
      },
    })
  } catch (error) {
    console.error('Client login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
