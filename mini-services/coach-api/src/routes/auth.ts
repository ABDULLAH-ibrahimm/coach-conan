import { z } from 'zod'
import { db } from '../db'
import { signToken } from '../utils/jwt'
import { hashPassword, comparePassword } from '../utils/password'
import { sanitizeInput, extractCoachId, auditLog } from '../middleware/auth'
import type { RequestContext } from '../middleware/auth'

// ============ Failed Login Tracking ============

interface LoginAttempt {
  count: number
  lockedUntil: number
}

const loginAttempts = new Map<string, LoginAttempt>()
const MAX_LOGIN_ATTEMPTS = 10
const LOCKOUT_DURATION = 5 * 60 * 1000 // 5 minutes

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of loginAttempts.entries()) {
    if (now > entry.lockedUntil) loginAttempts.delete(key)
  }
}, 5 * 60 * 1000)

// ============ Zod Schemas ============

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
})

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
})

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  profileImage: z.string().max(10000).optional(),
})

// ============ Route Handlers ============

export async function handleAuthRoutes(method: string, pathParts: string[], body: unknown, ctx: RequestContext): Promise<Response> {
  const ip = ctx.ip

  // POST /api/auth/register
  if (method === 'POST' && pathParts[0] === 'register') {
    try {
      const sanitized = sanitizeInput(body) as Record<string, unknown>
      const validationResult = registerSchema.safeParse(sanitized)
      if (!validationResult.success) {
        return Response.json({
          error: 'Validation failed',
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        }, { status: 400 })
      }

      const { name, email, password } = validationResult.data

      const existingCoach = await db.coach.findUnique({
        where: { email: email.toLowerCase() },
      })

      if (existingCoach) {
        return Response.json({ error: 'A coach with this email already exists.' }, { status: 409 })
      }

      const hashedPassword = await hashPassword(password)

      const coach = await db.coach.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      })

      const token = signToken({ coachId: coach.id })

      await auditLog(coach.id, 'REGISTER', 'Coach', coach.id, 'Coach registered', ip)

      return Response.json({
        message: 'Coach registered successfully',
        coach,
        token,
      }, { status: 201 })
    } catch (error) {
      console.error('Registration error:', error)
      return Response.json({ error: 'Registration failed. Please try again.' }, { status: 500 })
    }
  }

  // POST /api/auth/login
  if (method === 'POST' && pathParts[0] === 'login') {
    try {
      const sanitized = sanitizeInput(body) as Record<string, unknown>
      const validationResult = loginSchema.safeParse(sanitized)
      if (!validationResult.success) {
        console.warn('[Auth] Login validation failed:', validationResult.error.issues)
        return Response.json({
          error: 'Validation failed',
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        }, { status: 400 })
      }

      const { email, password } = validationResult.data

      // Use email as lockout key instead of IP (since proxy shares same IP)
      const lockoutKey = email.toLowerCase()

      // Check account lockout
      const attempt = loginAttempts.get(lockoutKey)
      if (attempt && attempt.lockedUntil > Date.now()) {
        const remainingMinutes = Math.ceil((attempt.lockedUntil - Date.now()) / 60000)
        console.warn(`[Auth] Account locked for ${lockoutKey}, ${remainingMinutes} min remaining`)
        return Response.json({
          error: `Account temporarily locked. Try again in ${remainingMinutes} minute(s).`,
        }, { status: 423 })
      }

      console.log(`[Auth] Login attempt for: ${lockoutKey} from IP: ${ip}`)

      const coach = await db.coach.findUnique({
        where: { email: email.toLowerCase() },
      })

      if (!coach) {
        console.warn(`[Auth] No coach found for email: ${lockoutKey}`)
        // Increment failed attempts
        const current = loginAttempts.get(lockoutKey) || { count: 0, lockedUntil: 0 }
        current.count++
        if (current.count >= MAX_LOGIN_ATTEMPTS) {
          current.lockedUntil = Date.now() + LOCKOUT_DURATION
        }
        loginAttempts.set(lockoutKey, current)
        return Response.json({ error: 'Invalid email or password.' }, { status: 401 })
      }

      const isPasswordValid = await comparePassword(password, coach.password)
      if (!isPasswordValid) {
        console.warn(`[Auth] Invalid password for: ${lockoutKey}, attempt count: ${(loginAttempts.get(lockoutKey)?.count || 0) + 1}`)
        // Increment failed attempts
        const current = loginAttempts.get(lockoutKey) || { count: 0, lockedUntil: 0 }
        current.count++
        if (current.count >= MAX_LOGIN_ATTEMPTS) {
          current.lockedUntil = Date.now() + LOCKOUT_DURATION
        }
        loginAttempts.set(lockoutKey, current)
        return Response.json({ error: 'Invalid email or password.' }, { status: 401 })
      }

      // Clear failed attempts on successful login
      loginAttempts.delete(lockoutKey)

      // Update last login
      await db.coach.update({
        where: { id: coach.id },
        data: { lastLoginAt: new Date() },
      })

      const token = signToken({ coachId: coach.id })

      await auditLog(coach.id, 'LOGIN', 'Coach', coach.id, 'Coach logged in', ip)

      console.log(`[Auth] Login successful for: ${lockoutKey}`)
      return Response.json({
        message: 'Login successful',
        coach: {
          id: coach.id,
          name: coach.name,
          email: coach.email,
          profileImage: coach.profileImage,
        },
        token,
      })
    } catch (error) {
      console.error('[Auth] Login error:', error)
      return Response.json({ error: 'Login failed. Please try again.' }, { status: 500 })
    }
  }

  // GET /api/auth/me (requires auth)
  if (method === 'GET' && pathParts[0] === 'me') {
    if (!ctx.coachId) {
      return Response.json({ error: 'Access denied. No token provided.' }, { status: 401 })
    }

    try {
      const coach = await db.coach.findUnique({
        where: { id: ctx.coachId },
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      if (!coach) {
        return Response.json({ error: 'Coach not found.' }, { status: 404 })
      }

      return Response.json({ coach })
    } catch (error) {
      console.error('Get profile error:', error)
      return Response.json({ error: 'Failed to fetch profile.' }, { status: 500 })
    }
  }

  // PUT /api/auth/change-password (requires auth)
  if (method === 'PUT' && pathParts[0] === 'change-password') {
    if (!ctx.coachId) {
      return Response.json({ error: 'Access denied. No token provided.' }, { status: 401 })
    }

    try {
      const sanitized = sanitizeInput(body) as Record<string, unknown>
      const validationResult = changePasswordSchema.safeParse(sanitized)
      if (!validationResult.success) {
        return Response.json({
          error: 'Validation failed',
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        }, { status: 400 })
      }

      const { currentPassword, newPassword } = validationResult.data

      const coach = await db.coach.findUnique({
        where: { id: ctx.coachId },
      })

      if (!coach) {
        return Response.json({ error: 'Coach not found.' }, { status: 404 })
      }

      const isPasswordValid = await comparePassword(currentPassword, coach.password)
      if (!isPasswordValid) {
        return Response.json({ error: 'Current password is incorrect.' }, { status: 400 })
      }

      const hashedPassword = await hashPassword(newPassword)
      await db.coach.update({
        where: { id: ctx.coachId },
        data: { password: hashedPassword },
      })

      await auditLog(ctx.coachId, 'CHANGE_PASSWORD', 'Coach', ctx.coachId, 'Password changed', ip)

      return Response.json({ message: 'Password changed successfully.' })
    } catch (error) {
      console.error('Change password error:', error)
      return Response.json({ error: 'Failed to change password.' }, { status: 500 })
    }
  }

  // PUT /api/auth/profile (requires auth)
  if (method === 'PUT' && pathParts[0] === 'profile') {
    if (!ctx.coachId) {
      return Response.json({ error: 'Access denied. No token provided.' }, { status: 401 })
    }

    try {
      const sanitized = sanitizeInput(body) as Record<string, unknown>
      const validationResult = updateProfileSchema.safeParse(sanitized)
      if (!validationResult.success) {
        return Response.json({
          error: 'Validation failed',
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        }, { status: 400 })
      }

      const data = validationResult.data
      const updateData: Record<string, unknown> = {}
      if (data.name !== undefined) updateData.name = data.name
      if (data.profileImage !== undefined) updateData.profileImage = data.profileImage

      const coach = await db.coach.update({
        where: { id: ctx.coachId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      await auditLog(ctx.coachId, 'UPDATE_PROFILE', 'Coach', ctx.coachId, 'Profile updated', ip)

      return Response.json({ message: 'Profile updated successfully.', coach })
    } catch (error) {
      console.error('Update profile error:', error)
      return Response.json({ error: 'Failed to update profile.' }, { status: 500 })
    }
  }

  return Response.json({ error: 'Route not found.' }, { status: 404 })
}
