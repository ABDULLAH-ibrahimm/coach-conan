import { NextResponse } from 'next/server'

const getApiBase = () =>
  process.env.COACH_API_HOST
    ? `https://${process.env.COACH_API_HOST}`
    : 'http://127.0.0.1:3003'

export async function GET() {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`${getApiBase()}/health`, { signal: controller.signal })
    clearTimeout(timeout)
    const data = await res.text()
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      coachApi: {
        reachable: res.ok,
        status: res.status,
        response: res.ok ? 'healthy' : data,
      },
    })
  } catch {
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      coachApi: { reachable: false, status: 0, response: 'Connection failed' },
    })
  }
}
