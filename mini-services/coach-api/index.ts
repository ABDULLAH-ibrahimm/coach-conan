import { db } from './src/db'
import bcrypt from 'bcryptjs'
import { checkRateLimit, extractCoachId, extractClientId } from './src/middleware/auth'
import type { RequestContext } from './src/middleware/auth'
import { handleAuthRoutes } from './src/routes/auth'
import { handleClientRoutes } from './src/routes/clients'
import { handleWorkoutRoutes } from './src/routes/workouts'
import { handleNutritionRoutes } from './src/routes/nutrition'
import { handleProgressRoutes } from './src/routes/progress'
import { handleSessionRoutes } from './src/routes/sessions'
import { handlePaymentRoutes } from './src/routes/payments'
import { handleDashboardRoutes } from './src/routes/dashboard'
import { handleClientAuthRoutes } from './src/routes/client-auth'
import { handleClientPortalRoutes } from './src/routes/client'
import { handleFeedbackRoutes } from './src/routes/feedback'

// ============ Configuration ============

const PORT = 3003
const MAX_BODY_SIZE = 5 * 1024 * 1024 // 5MB (increased for base64 images)
const normalizeOrigin = (o: string) => (o.includes('://') ? o : `https://${o}`)
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(o => normalizeOrigin(o.trim())) : []),
]

function isAllowedOrigin(origin: string): boolean {
  if (!origin) return false
  return ALLOWED_ORIGINS.includes(origin)
}

// ============ Security Headers ============

function addSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers)
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('X-Frame-Options', 'DENY')
  headers.set('X-XSS-Protection', '1; mode=block')
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  headers.set('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'")
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

// ============ CORS Headers ============

function addCorsHeaders(request: Request, response: Response): Response {
  const origin = request.headers.get('Origin') || ''
  const headers = new Headers(response.headers)

  if (isAllowedOrigin(origin)) {
    headers.set('Access-Control-Allow-Origin', origin)
    headers.set('Access-Control-Allow-Credentials', 'true')
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    headers.set('Access-Control-Max-Age', '86400')
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

// ============ Request Helpers ============

function getClientIP(request: Request): string {
  const forwarded = request.headers.get('X-Forwarded-For')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIP = request.headers.get('X-Real-IP')
  if (realIP) {
    return realIP.trim()
  }
  return 'unknown'
}

function isAuthEndpoint(path: string): boolean {
  return path.startsWith('/api/auth/') || path.startsWith('/api/client-auth/')
}

// ============ JSON Response Helper ============

function jsonResponse(data: unknown, status = 200, extraHeaders?: Record<string, string>): Response {
  const body = JSON.stringify(data)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Content-Length': String(Buffer.byteLength(body)),
    'Connection': 'close',
    ...extraHeaders,
  }
  return new Response(body, { status, headers })
}

// ============ Parse JSON Body ============

async function parseBody(request: Request): Promise<unknown> {
  const contentLength = request.headers.get('Content-Length')
  if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
    return { __bodyError: 'Request body too large. Maximum size is 5MB.' }
  }

  try {
    const text = await request.text()
    if (!text) return {}
    if (Buffer.byteLength(text) > MAX_BODY_SIZE) {
      return { __bodyError: 'Request body too large. Maximum size is 5MB.' }
    }
    return JSON.parse(text)
  } catch {
    return { __bodyError: 'Invalid JSON in request body.' }
  }
}

// ============ Authenticate Request ============

function authenticateRequest(request: Request): { coachId: string } | null {
  const authHeader = request.headers.get('Authorization')
  const result = extractCoachId(authHeader)
  if ('coachId' in result) {
    return { coachId: result.coachId }
  }
  return null
}

// ============ Route Dispatcher ============

async function dispatchRequest(method: string, pathname: string, query: URLSearchParams, body: unknown, ctx: RequestContext): Promise<Response> {
  // Remove /api prefix and split path
  const apiPath = pathname.startsWith('/api') ? pathname.slice(4) : pathname
  const parts = apiPath.split('/').filter(Boolean)

  if (parts.length === 0) {
    return jsonResponse({ error: 'Route not found.' }, 404)
  }

  const routeGroup = parts[0]
  const subParts = parts.slice(1)

  switch (routeGroup) {
    case 'auth':
      return handleAuthRoutes(method, subParts, body, ctx)

    case 'clients':
      return handleClientRoutes(method, subParts, body, ctx, query)

    case 'workouts':
      return handleWorkoutRoutes(method, subParts, body, ctx, query)

    case 'nutrition':
      return handleNutritionRoutes(method, subParts, body, ctx, query)

    case 'progress':
      return handleProgressRoutes(method, subParts, body, ctx)

    case 'sessions':
      return handleSessionRoutes(method, subParts, body, ctx, query)

    case 'payments':
      return handlePaymentRoutes(method, subParts, body, ctx, query)

    case 'dashboard':
      return handleDashboardRoutes(method, subParts, body, ctx)

    case 'client-auth':
      return handleClientAuthRoutes(method, subParts, body, ctx, ctx.authHeader || null)

    case 'client':
      return handleClientPortalRoutes(method, subParts, body, ctx, ctx.authHeader || null)

    case 'feedback':
      return handleFeedbackRoutes(method, subParts, body, ctx)

    default:
      return jsonResponse({ error: 'Route not found.' }, 404)
  }
}

// ============ Main Request Handler ============

async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const method = request.method
  // Strip /coach prefix if present (for Caddy direct routing: /api/coach/auth/login -> /api/auth/login)
  let pathname = url.pathname
  if (pathname.startsWith('/api/coach/')) {
    pathname = pathname.replace('/api/coach/', '/api/')
  }
  const query = url.searchParams
  const ip = getClientIP(request)

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    const origin = request.headers.get('Origin') || ''
    if (isAllowedOrigin(origin)) {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      })
    }
    return new Response(null, { status: 204 })
  }

  // Rate limiting
  const rateLimitResult = checkRateLimit(ip, isAuthEndpoint(pathname))
  if (!rateLimitResult.allowed) {
    const response = jsonResponse(
      { error: 'Too many requests. Please try again later.', retryAfter: rateLimitResult.retryAfter },
      429,
      { 'Retry-After': String(rateLimitResult.retryAfter || 60) }
    )
    return addCorsHeaders(request, addSecurityHeaders(response))
  }

  // Health check
  if (pathname === '/health') {
    const response = jsonResponse({ status: 'ok', timestamp: new Date().toISOString() })
    return addCorsHeaders(request, addSecurityHeaders(response))
  }

  // Only handle /api routes
  if (!pathname.startsWith('/api/')) {
    const response = jsonResponse({ error: 'Route not found.' }, 404)
    return addCorsHeaders(request, addSecurityHeaders(response))
  }

  // Parse body for write operations
  let body: unknown = {}
  if (method === 'POST' || method === 'PUT') {
    body = await parseBody(request)

    // Check for body parse errors
    if (body && typeof body === 'object' && '__bodyError' in body) {
      const response = jsonResponse(
        { error: (body as { __bodyError: string }).__bodyError },
        400
      )
      return addCorsHeaders(request, addSecurityHeaders(response))
    }
  }

  // Authenticate (except for public endpoints)
  const authHeader = request.headers.get('Authorization')
  const ctx: RequestContext = { ip, authHeader: authHeader || undefined }
  const isPublicAuthEndpoint =
    pathname === '/api/auth/register' ||
    pathname === '/api/auth/login' ||
    pathname === '/api/client-auth/register' ||
    pathname === '/api/client-auth/login' ||
    pathname === '/api/client-auth/phone-login' ||
    pathname === '/api/feedback' && method === 'POST' ||
    pathname === '/api/feedback' && method === 'GET'

  // Always try to extract auth tokens for route handlers to check
  const authResult = authenticateRequest(request)
  if (authResult) {
    ctx.coachId = authResult.coachId
  }
  // Also try client auth for client-auth and client portal routes
  if (pathname.startsWith('/api/client-auth/') || pathname.startsWith('/api/client/')) {
    const clientAuthResult = extractClientId(authHeader)
    if (!('error' in clientAuthResult)) {
      ctx.clientId = clientAuthResult.clientId
      ctx.coachId = clientAuthResult.coachId
    }
  }
  // Individual route handlers will check for coachId/clientId and return 401 if missing

  // Dispatch to route handler
  try {
    const response = await dispatchRequest(method, pathname, query, body, ctx)
    return addCorsHeaders(request, addSecurityHeaders(response))
  } catch (error) {
    console.error('Unhandled error:', error)
    const response = jsonResponse({ error: 'Internal server error.' }, 500)
    return addCorsHeaders(request, addSecurityHeaders(response))
  }
}

// ============ Seed Function ============

async function seed() {
  try {
    const defaultEmail = 'coach@connan.com'
    const defaultPassword = 'Coach2024!'
    const defaultName = 'Coach Conan'

    const existing = await db.coach.findUnique({
      where: { email: defaultEmail },
    })

    if (existing) {
      console.log('Default coach already exists, skipping seed.')
      return
    }

    const hashedPassword = await bcrypt.hash(defaultPassword, 12)

    await db.coach.create({
      data: {
        email: defaultEmail,
        password: hashedPassword,
        name: defaultName,
      },
    })

    console.log('Default coach seeded successfully.')
    console.log(`   Email: ${defaultEmail}`)
    console.log(`   Password: ${defaultPassword}`)
  } catch (error) {
    console.error('Seed failed:', error)
  }
}

// ============ Start Server ============

async function start() {
  try {
    await seed()

    // Add global error handlers to prevent crashes
    process.on('uncaughtException', (error) => {
      console.error('[FATAL] Uncaught exception:', error)
      // Don't exit - try to keep the server alive
    })

    process.on('unhandledRejection', (reason) => {
      console.error('[FATAL] Unhandled rejection:', reason)
      // Don't exit - try to keep the server alive
    })

    const server = Bun.serve({
      hostname: '0.0.0.0',
      port: PORT,
      idleTimeout: 255,
      async fetch(request) {
        try {
          return await handleRequest(request)
        } catch (error) {
          console.error('[FATAL] Request handler error:', error)
          return jsonResponse({ error: 'Internal server error.' }, 500)
        }
      },
    })

    console.log(`Coach API server running on port ${PORT}`)
    console.log(`   Health check: http://localhost:${PORT}/health`)

    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down...')
      server.stop()
      process.exit(0)
    })

    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down...')
      server.stop()
      process.exit(0)
    })

  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

start()
