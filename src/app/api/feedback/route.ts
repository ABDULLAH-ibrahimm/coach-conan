import { NextRequest, NextResponse } from 'next/server'

const getApiBase = () =>
  process.env.COACH_API_HOST
    ? `https://${process.env.COACH_API_HOST}/api`
    : 'http://127.0.0.1:3003/api'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const queryString = url.searchParams.toString()
    const fullPath = `feedback${queryString ? `?${queryString}` : ''}`
    const res = await fetch(`${getApiBase()}/${fullPath}`, {
      headers: { 'Content-Type': 'application/json' },
    })
    const data = await res.text()
    return new NextResponse(data, { status: res.status, headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('[Feedback API Proxy] Error:', error)
    return NextResponse.json({ error: 'Unable to connect to server.' }, { status: 503 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const res = await fetch(`${getApiBase()}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })
    const data = await res.text()
    return new NextResponse(data, { status: res.status, headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('[Feedback API Proxy] Error:', error)
    return NextResponse.json({ error: 'Unable to connect to server.' }, { status: 503 })
  }
}
