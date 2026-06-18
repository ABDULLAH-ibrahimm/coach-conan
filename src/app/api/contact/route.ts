import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthAdmin } from '@/lib/auth'

const COACH_WHATSAPP = process.env.COACH_WHATSAPP_NUMBER || '201119344441'
const CALLMEBOT_API_KEY = process.env.CALLMEBOT_API_KEY || ''

async function sendWhatsApp(name: string, email: string, phone: string, service: string, message: string) {
  if (!CALLMEBOT_API_KEY) return
  const text = `🏋️ رسالة جديدة من الموقع!\n\nالاسم: ${name}\nالإيميل: ${email}\nالتليفون: ${phone || 'مش محدد'}\nالخدمة: ${service || 'مش محدد'}\n\nالرسالة:\n${message}`
  const encoded = encodeURIComponent(text)
  const url = `https://api.callmebot.com/whatsapp.php?phone=${COACH_WHATSAPP}&text=${encoded}&apikey=${CALLMEBOT_API_KEY}`
  await fetch(url).catch(() => {})
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, service, message } = body

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const cleanData = {
      name: String(name).trim(),
      email: String(email).trim(),
      phone: String(phone || '').trim(),
      service: String(service || '').trim(),
      message: String(message).trim(),
    }

    await db.contactSubmission.create({ data: cleanData })

    // Send WhatsApp notification to coach
    await sendWhatsApp(cleanData.name, cleanData.email, cleanData.phone, cleanData.service, cleanData.message)

    return NextResponse.json({ success: true, message: 'Message sent successfully!' })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'Failed to process your request' }, { status: 500 })
  }
}

export async function GET() {
  const admin = await getAuthAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const submissions = await db.contactSubmission.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ submissions })
  } catch (error) {
    console.error('Failed to fetch submissions:', error)
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
  }
}
