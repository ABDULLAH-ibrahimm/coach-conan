import { z } from 'zod'
import { db } from '../db'
import { signToken } from '../utils/jwt'
import { hashPassword, comparePassword } from '../utils/password'
import { sanitizeInput, extractClientId, auditLog } from '../middleware/auth'
import type { RequestContext } from '../middleware/auth'

// ============ Failed Login Tracking ============

interface ClientLoginAttempt {
  count: number
  lockedUntil: number
}

const clientLoginAttempts = new Map<string, ClientLoginAttempt>()
const MAX_CLIENT_LOGIN_ATTEMPTS = 5
const CLIENT_LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of clientLoginAttempts.entries()) {
    if (now > entry.lockedUntil) clientLoginAttempts.delete(key)
  }
}, 5 * 60 * 1000)

// ============ Zod Schemas ============

const clientRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  phone: z.string().max(30).optional().or(z.literal('')),
  age: z.number().int().min(1).max(150).optional(),
  gender: z.string().max(20).optional().or(z.literal('')),
  weight: z.number().min(0).max(1000).optional(),
  height: z.number().min(0).max(500).optional(),
  goal: z.string().max(500).optional().or(z.literal('')),
})

const clientLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

const clientPhoneLoginSchema = z.object({
  phone: z.string().min(1, 'Phone number is required').max(30),
})

const clientProgressSchema = z.object({
  weight: z.number().min(0).max(1000).optional(),
  bodyFat: z.number().min(0).max(100).optional(),
  muscleMass: z.number().min(0).max(1000).optional(),
  waist: z.number().min(0).max(500).optional(),
  chest: z.number().min(0).max(500).optional(),
  arms: z.number().min(0).max(500).optional(),
  thighs: z.number().min(0).max(500).optional(),
  hips: z.number().min(0).max(500).optional(),
  notes: z.string().max(2000).optional().or(z.literal('')),
  recordedAt: z.string().optional(),
})

const clientProfileUpdateSchema = z.object({
  phone: z.string().max(30).optional().or(z.literal('')),
  profileImage: z.string().max(500000).optional().or(z.literal('')),
  age: z.number().int().min(1).max(150).optional(),
  gender: z.string().max(20).optional().or(z.literal('')),
  weight: z.number().min(0).max(1000).optional(),
  height: z.number().min(0).max(500).optional(),
  goal: z.string().max(500).optional().or(z.literal('')),
})

// ============ Helper ============

function getClientAuthFromCtx(ctx: RequestContext): { clientId: string; coachId: string } | null {
  if (ctx.clientId && ctx.coachId) {
    return { clientId: ctx.clientId, coachId: ctx.coachId }
  }
  return null
}

// ============ Route Handlers ============

export async function handleClientAuthRoutes(
  method: string,
  pathParts: string[],
  body: unknown,
  ctx: RequestContext,
  authHeader: string | null
): Promise<Response> {
  const ip = ctx.ip

  // POST /api/client-auth/register (Public)
  if (method === 'POST' && pathParts[0] === 'register' && pathParts.length === 1) {
    try {
      const sanitized = sanitizeInput(body) as Record<string, unknown>
      const validationResult = clientRegisterSchema.safeParse(sanitized)
      if (!validationResult.success) {
        return Response.json({
          error: 'Validation failed',
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        }, { status: 400 })
      }

      const { name, email, password, phone, age, gender, weight, height, goal } = validationResult.data

      // Find the first coach
      const coach = await db.coach.findFirst()
      if (!coach) {
        return Response.json({ error: 'No coach available for registration.' }, { status: 500 })
      }

      // Check if email already exists for this coach
      const existingClient = await db.client.findFirst({
        where: { coachId: coach.id, email: email.toLowerCase() },
      })

      if (existingClient) {
        return Response.json({ error: 'A client with this email already exists.' }, { status: 409 })
      }

      const hashedPassword = await hashPassword(password)

      const client = await db.client.create({
        data: {
          coachId: coach.id,
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          phone: phone || '',
          age: age || 0,
          gender: gender || '',
          weight: weight || 0,
          height: height || 0,
          goal: goal || '',
          approvalStatus: 'approved',
        },
        select: {
          id: true,
          name: true,
          email: true,
          approvalStatus: true,
          createdAt: true,
        },
      })

      await auditLog(coach.id, 'CLIENT_REGISTER', 'Client', client.id, `Client self-registered: ${client.name} (${client.email})`, ip)

      return Response.json({
        message: 'Registration successful.',
        client,
      }, { status: 201 })
    } catch (error) {
      console.error('Client registration error:', error)
      return Response.json({ error: 'Registration failed. Please try again.' }, { status: 500 })
    }
  }

  // POST /api/client-auth/login (Public) - Email + Password
  if (method === 'POST' && pathParts[0] === 'login' && pathParts.length === 1) {
    try {
      const sanitized = sanitizeInput(body) as Record<string, unknown>
      const validationResult = clientLoginSchema.safeParse(sanitized)
      if (!validationResult.success) {
        return Response.json({
          error: 'Validation failed',
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        }, { status: 400 })
      }

      const { email, password } = validationResult.data

      // Check account lockout (keyed by email, not IP)
      const lockoutKey = email.toLowerCase()
      const attempt = clientLoginAttempts.get(lockoutKey)
      if (attempt && attempt.lockedUntil > Date.now()) {
        const remainingMinutes = Math.ceil((attempt.lockedUntil - Date.now()) / 60000)
        return Response.json({
          error: `Account temporarily locked. Try again in ${remainingMinutes} minute(s).`,
        }, { status: 423 })
      }

      // Find client by email - prefer active+approved
      let client = await db.client.findFirst({
        where: { email: email.toLowerCase(), status: 'active', approvalStatus: 'approved' },
      })
      // Fallback: any status
      if (!client) {
        client = await db.client.findFirst({
          where: { email: email.toLowerCase() },
        })
      }

      if (!client) {
        const current = clientLoginAttempts.get(lockoutKey) || { count: 0, lockedUntil: 0 }
        current.count++
        if (current.count >= MAX_CLIENT_LOGIN_ATTEMPTS) {
          current.lockedUntil = Date.now() + CLIENT_LOCKOUT_DURATION
        }
        clientLoginAttempts.set(lockoutKey, current)
        return Response.json({ error: 'Invalid email or password.' }, { status: 401 })
      }

      // Check if client has a password set
      if (!client.password) {
        return Response.json({ error: 'Invalid email or password.' }, { status: 401 })
      }

      const isPasswordValid = await comparePassword(password, client.password)
      if (!isPasswordValid) {
        const current = clientLoginAttempts.get(lockoutKey) || { count: 0, lockedUntil: 0 }
        current.count++
        if (current.count >= MAX_CLIENT_LOGIN_ATTEMPTS) {
          current.lockedUntil = Date.now() + CLIENT_LOCKOUT_DURATION
        }
        clientLoginAttempts.set(lockoutKey, current)
        return Response.json({ error: 'Invalid email or password.' }, { status: 401 })
      }

      // If client is inactive or not approved, deny login
      if (client.status !== 'active' || client.approvalStatus !== 'approved') {
        return Response.json({ error: 'This account is inactive or not yet approved. Please contact your coach.' }, { status: 403 })
      }

      // Clear failed attempts on successful login
      clientLoginAttempts.delete(lockoutKey)

      // Update lastLoginAt
      await db.client.update({
        where: { id: client.id },
        data: { lastLoginAt: new Date() },
      })

      // Generate JWT
      const token = signToken({ clientId: client.id, coachId: client.coachId, role: 'client' })

      await auditLog(client.coachId, 'CLIENT_LOGIN', 'Client', client.id, `Client logged in: ${client.name}`, ip)

      return Response.json({
        message: 'Login successful',
        client: {
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          age: client.age,
          gender: client.gender,
          weight: client.weight,
          height: client.height,
          goal: client.goal,
          status: client.status,
          approvalStatus: client.approvalStatus,
          lastLoginAt: new Date().toISOString(),
        },
        token,
      })
    } catch (error) {
      console.error('Client login error:', error)
      return Response.json({ error: 'Login failed. Please try again.' }, { status: 500 })
    }
  }

  // POST /api/client-auth/phone-login (Public) - Phone number only
  if (method === 'POST' && pathParts[0] === 'phone-login' && pathParts.length === 1) {
    try {
      const sanitized = sanitizeInput(body) as Record<string, unknown>
      const validationResult = clientPhoneLoginSchema.safeParse(sanitized)
      if (!validationResult.success) {
        return Response.json({
          error: 'Validation failed',
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        }, { status: 400 })
      }

      const { phone } = validationResult.data

      // Check account lockout
      const lockoutKey = `phone:${phone}`
      const attempt = clientLoginAttempts.get(lockoutKey)
      if (attempt && attempt.lockedUntil > Date.now()) {
        const remainingMinutes = Math.ceil((attempt.lockedUntil - Date.now()) / 60000)
        return Response.json({
          error: `Account temporarily locked. Try again in ${remainingMinutes} minute(s).`,
        }, { status: 423 })
      }

      // Strip non-digit characters for flexible matching
      const digitsOnly = phone.replace(/\D/g, '')

      // Helper: check if a client is login-eligible (active & approved)
      const isActiveApproved = (c: { status: string; approvalStatus: string }) =>
        c.status === 'active' && c.approvalStatus === 'approved'

      // Find client by phone number with flexible matching
      // ALWAYS prefer active+approved clients over inactive ones

      // Try: 1) exact match, active+approved only
      let client = await db.client.findFirst({
        where: { phone, status: 'active', approvalStatus: 'approved' },
      })

      // 2) Exact match, any status (fallback)
      if (!client) {
        client = await db.client.findFirst({
          where: { phone },
        })
      }

      // If no exact match, try searching with contains - active+approved first
      if (!client && digitsOnly.length >= 8) {
        client = await db.client.findFirst({
          where: {
            status: 'active',
            approvalStatus: 'approved',
            OR: [
              { phone: { contains: digitsOnly } },
              { phone: { contains: phone } },
            ],
          },
        })
        // Fallback: any status
        if (!client) {
          client = await db.client.findFirst({
            where: {
              OR: [
                { phone: { contains: digitsOnly } },
                { phone: { contains: phone } },
              ],
            },
          })
        }
      }

      // If still not found, try in-memory matching by comparing digit-only versions
      // This handles cases like "+20 111 222 3344" stored vs "01112223344" searched
      if (!client && digitsOnly.length >= 8) {
        const allClients = await db.client.findMany({
          where: { phone: { not: '' } },
          select: { id: true, phone: true, status: true, approvalStatus: true },
        })
        // First try to find active+approved match
        const activeMatch = allClients.find(c => {
          if (!isActiveApproved(c)) return false
          const storedDigits = c.phone.replace(/\D/g, '')
          return storedDigits === digitsOnly ||
            storedDigits.endsWith(digitsOnly) ||
            digitsOnly.endsWith(storedDigits)
        })
        if (activeMatch) {
          client = await db.client.findFirst({ where: { id: activeMatch.id } })
        } else {
          // Fallback: any match
          const match = allClients.find(c => {
            const storedDigits = c.phone.replace(/\D/g, '')
            return storedDigits === digitsOnly ||
              storedDigits.endsWith(digitsOnly) ||
              digitsOnly.endsWith(storedDigits)
          })
          if (match) {
            client = await db.client.findFirst({ where: { id: match.id } })
          }
        }
      }

      // If we found a client but they are inactive or not approved, deny login
      if (client && (client.status !== 'active' || client.approvalStatus !== 'approved')) {
        return Response.json({ error: 'This account is inactive or not yet approved. Please contact your coach.' }, { status: 403 })
      }

      if (!client) {
        const current = clientLoginAttempts.get(lockoutKey) || { count: 0, lockedUntil: 0 }
        current.count++
        if (current.count >= MAX_CLIENT_LOGIN_ATTEMPTS) {
          current.lockedUntil = Date.now() + CLIENT_LOCKOUT_DURATION
        }
        clientLoginAttempts.set(lockoutKey, current)
        return Response.json({ error: 'No account found with this phone number.' }, { status: 404 })
      }

      // Clear failed attempts
      clientLoginAttempts.delete(lockoutKey)

      // Update lastLoginAt
      await db.client.update({
        where: { id: client.id },
        data: { lastLoginAt: new Date() },
      })

      // Generate JWT
      const token = signToken({ clientId: client.id, coachId: client.coachId, role: 'client' })

      await auditLog(client.coachId, 'CLIENT_PHONE_LOGIN', 'Client', client.id, `Client logged in via phone: ${client.name}`, ip)

      return Response.json({
        message: 'Login successful',
        client: {
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          profileImage: client.profileImage,
          age: client.age,
          gender: client.gender,
          weight: client.weight,
          height: client.height,
          goal: client.goal,
          status: client.status,
          approvalStatus: client.approvalStatus,
          lastLoginAt: new Date().toISOString(),
        },
        token,
      })
    } catch (error) {
      console.error('Client phone login error:', error)
      return Response.json({ error: 'Login failed. Please try again.' }, { status: 500 })
    }
  }

  // All remaining routes require client authentication
  const clientAuth = extractClientId(authHeader)
  if ('error' in clientAuth) {
    return Response.json({ error: clientAuth.error }, { status: clientAuth.status })
  }

  const { clientId, coachId } = clientAuth

  // GET /api/client-auth/me
  if (method === 'GET' && pathParts[0] === 'me' && pathParts.length === 1) {
    try {
      const client = await db.client.findFirst({
        where: { id: clientId, coachId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          profileImage: true,
          age: true,
          gender: true,
          weight: true,
          height: true,
          goal: true,
          status: true,
          approvalStatus: true,
          startDate: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      if (!client) {
        return Response.json({ error: 'Client not found.' }, { status: 404 })
      }

      return Response.json({ client })
    } catch (error) {
      console.error('Get client profile error:', error)
      return Response.json({ error: 'Failed to fetch profile.' }, { status: 500 })
    }
  }

  // POST /api/client-auth/progress
  if (method === 'POST' && pathParts[0] === 'progress' && pathParts.length === 1) {
    try {
      const sanitized = sanitizeInput(body) as Record<string, unknown>
      const validationResult = clientProgressSchema.safeParse(sanitized)
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

      const client = await db.client.findFirst({
        where: { id: clientId, coachId },
      })
      if (!client) {
        return Response.json({ error: 'Client not found.' }, { status: 404 })
      }

      const progress = await db.progress.create({
        data: {
          clientId,
          weight: data.weight || 0,
          bodyFat: data.bodyFat || 0,
          muscleMass: data.muscleMass || 0,
          waist: data.waist || 0,
          chest: data.chest || 0,
          arms: data.arms || 0,
          thighs: data.thighs || 0,
          hips: data.hips || 0,
          notes: data.notes || '',
          recordedAt: data.recordedAt ? new Date(data.recordedAt) : undefined,
        },
      })

      await auditLog(coachId, 'CLIENT_CREATE_PROGRESS', 'Progress', progress.id, `Client ${client.name} added progress entry`, ip)

      return Response.json({
        message: 'Progress entry created successfully',
        progress,
      }, { status: 201 })
    } catch (error) {
      console.error('Client create progress error:', error)
      return Response.json({ error: 'Failed to create progress entry.' }, { status: 500 })
    }
  }

  // PUT /api/client-auth/profile
  if (method === 'PUT' && pathParts[0] === 'profile' && pathParts.length === 1) {
    try {
      const sanitized = sanitizeInput(body) as Record<string, unknown>
      const validationResult = clientProfileUpdateSchema.safeParse(sanitized)
      if (!validationResult.success) {
        return Response.json({
          error: 'Validation failed',
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        }, { status: 400 })
      }

      const existing = await db.client.findFirst({ where: { id: clientId, coachId } })
      if (!existing) {
        return Response.json({ error: 'Client not found.' }, { status: 404 })
      }

      const data = validationResult.data
      const updateData: Record<string, unknown> = {}
      if (data.phone !== undefined) updateData.phone = data.phone
      if (data.profileImage !== undefined) updateData.profileImage = data.profileImage
      if (data.age !== undefined) updateData.age = data.age
      if (data.gender !== undefined) updateData.gender = data.gender
      if (data.weight !== undefined) updateData.weight = data.weight
      if (data.height !== undefined) updateData.height = data.height
      if (data.goal !== undefined) updateData.goal = data.goal

      const client = await db.client.update({
        where: { id: clientId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          profileImage: true,
          age: true,
          gender: true,
          weight: true,
          height: true,
          goal: true,
          status: true,
          approvalStatus: true,
          startDate: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      await auditLog(coachId, 'CLIENT_UPDATE_PROFILE', 'Client', clientId, `Client ${existing.name} updated their profile`, ip)

      return Response.json({
        message: 'Profile updated successfully',
        client,
      })
    } catch (error) {
      console.error('Client update profile error:', error)
      return Response.json({ error: 'Failed to update profile.' }, { status: 500 })
    }
  }

  return Response.json({ error: 'Route not found.' }, { status: 404 })
}
