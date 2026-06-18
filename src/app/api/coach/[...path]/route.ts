import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.COACH_API_HOST
  ? `https://${process.env.COACH_API_HOST}/api`
  : 'http://127.0.0.1:3003/api'
const MAX_RETRIES = 8
const RETRY_DELAY = 600

async function fetchWithRetry(url: string, options: RequestInit): Promise<Response> {
  let lastError: Error | null = null
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      const res = await fetch(url, { ...options, signal: controller.signal })
      clearTimeout(timeout)
      // If we get a response, return it even if it's an error
      return res
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e))
      if (i < MAX_RETRIES - 1) {
        await new Promise(r => setTimeout(r, RETRY_DELAY))
      }
    }
  }
  throw lastError || new Error('Max retries exceeded')
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, await params)
}
export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, await params)
}
export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, await params)
}
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, await params)
}

async function proxyRequest(request: NextRequest, pathParts: { path: string[] }) {
  const { path } = pathParts
  const pathStr = path.join('/')
  const url = new URL(request.url)
  const queryString = url.searchParams.toString()
  const fullPath = `${pathStr}${queryString ? `?${queryString}` : ''}`
  const targetUrl = `${API_BASE}/${fullPath}`

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    const authHeader = request.headers.get('Authorization')
    if (authHeader) headers['Authorization'] = authHeader
    const connectionIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip') || '127.0.0.1'
    headers['X-Forwarded-For'] = connectionIP
    headers['X-Real-IP'] = connectionIP

    let body: string | undefined
    if (request.method === 'POST' || request.method === 'PUT') {
      body = await request.text()
    }

    const res = await fetchWithRetry(targetUrl, {
      method: request.method || 'GET',
      headers,
      body: body || undefined,
    })

    const responseData = await res.text()
    return new NextResponse(responseData, {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('[API Proxy] Error:', error)
    return NextResponse.json(
      { error: 'Unable to connect to server. Please try again later.' },
      { status: 503 }
    )
  }
}
