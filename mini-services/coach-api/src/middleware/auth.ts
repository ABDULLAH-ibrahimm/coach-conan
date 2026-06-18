import { verifyToken, isTokenExpired, isTokenInvalid } from '../utils/jwt'
import { db } from '../db'

// ============ Request Context ============

export interface RequestContext {
  coachId?: string
  clientId?: string
  authHeader?: string
  ip: string
}

// ============ Input Sanitization ============

export function sanitizeInput(input: unknown): unknown {
  if (typeof input === 'string') {
    return input.replace(/<[^>]*>/g, '').trim()
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeInput)
  }
  if (input !== null && typeof input === 'object') {
    const sanitized: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value)
    }
    return sanitized
  }
  return input
}

// ============ Rate Limiting ============

interface RateLimitEntry {
  count: number
  resetTime: number
}

const generalLimitMap = new Map<string, RateLimitEntry>()
const authLimitMap = new Map<string, RateLimitEntry>()

const GENERAL_WINDOW = 15 * 60 * 1000 // 15 minutes
const GENERAL_MAX = 200
const AUTH_WINDOW = 60 * 1000 // 1 minute
const AUTH_MAX = 10

// Cleanup stale entries every minute
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of generalLimitMap.entries()) {
    if (now > entry.resetTime) generalLimitMap.delete(key)
  }
  for (const [key, entry] of authLimitMap.entries()) {
    if (now > entry.resetTime) authLimitMap.delete(key)
  }
}, 60 * 1000)

export function checkRateLimit(ip: string, isAuthEndpoint: boolean): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()

  // Check auth rate limit (30 req/min)
  // Note: When behind a proxy, all requests may share the same IP,
  // so we use more lenient limits. Per-account lockout is handled in auth.ts.
  if (isAuthEndpoint) {
    const authEntry = authLimitMap.get(ip)
    if (!authEntry || now > authEntry.resetTime) {
      authLimitMap.set(ip, { count: 1, resetTime: now + AUTH_WINDOW })
    } else if (authEntry.count >= AUTH_MAX) {
      console.warn(`[RateLimit] Auth rate limit hit for IP: ${ip}, count: ${authEntry.count}`)
      return { allowed: false, retryAfter: Math.ceil((authEntry.resetTime - now) / 1000) }
    } else {
      authEntry.count++
    }
  }

  // Check general rate limit (500 req/15min)
  const generalEntry = generalLimitMap.get(ip)
  if (!generalEntry || now > generalEntry.resetTime) {
    generalLimitMap.set(ip, { count: 1, resetTime: now + GENERAL_WINDOW })
  } else if (generalEntry.count >= GENERAL_MAX) {
    console.warn(`[RateLimit] General rate limit hit for IP: ${ip}, count: ${generalEntry.count}`)
    return { allowed: false, retryAfter: Math.ceil((generalEntry.resetTime - now) / 1000) }
  } else {
    generalEntry.count++
  }

  return { allowed: true }
}

// ============ JWT Authentication ============

export function extractCoachId(authHeader: string | null): { coachId: string } | { error: string; status: number } {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Access denied. No token provided.', status: 401 }
  }

  const token = authHeader.split(' ')[1]
  if (!token) {
    return { error: 'Access denied. Invalid token format.', status: 401 }
  }

  try {
    const decoded = verifyToken(token)
    if (!decoded) {
      return { error: 'Invalid token.', status: 401 }
    }
    return { coachId: decoded.coachId }
  } catch (error) {
    if (isTokenExpired(error)) {
      return { error: 'Token expired. Please log in again.', status: 401 }
    }
    if (isTokenInvalid(error)) {
      return { error: 'Invalid token.', status: 401 }
    }
    return { error: 'Authentication failed.', status: 500 }
  }
}

// ============ Client JWT Authentication ============

export function extractClientId(authHeader: string | null): { clientId: string; coachId: string } | { error: string; status: number } {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Access denied. No token provided.', status: 401 }
  }

  const token = authHeader.split(' ')[1]
  if (!token) {
    return { error: 'Access denied. Invalid token format.', status: 401 }
  }

  try {
    const decoded = verifyToken(token)
    if (!decoded) {
      return { error: 'Invalid token.', status: 401 }
    }
    // Verify this is a client token
    if (decoded.role !== 'client' || !('clientId' in decoded)) {
      return { error: 'Invalid client token.', status: 401 }
    }
    return { clientId: (decoded as { clientId: string; coachId: string; role: string }).clientId, coachId: (decoded as { clientId: string; coachId: string; role: string }).coachId }
  } catch (error) {
    if (isTokenExpired(error)) {
      return { error: 'Token expired. Please log in again.', status: 401 }
    }
    if (isTokenInvalid(error)) {
      return { error: 'Invalid token.', status: 401 }
    }
    return { error: 'Authentication failed.', status: 500 }
  }
}

// ============ Audit Logging ============

export async function auditLog(coachId: string, action: string, entity: string, entityId: string, details: string, ipAddress: string): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        coachId,
        action,
        entity,
        entityId,
        details,
        ip: ipAddress,
      },
    })
  } catch (error) {
    console.error('Audit log write failed:', error)
  }
}
