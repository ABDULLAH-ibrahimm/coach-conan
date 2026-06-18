import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { createHmac, timingSafeEqual } from 'crypto'

const AUTH_COOKIE_NAME = 'coach-conan-admin-auth'
const TOKEN_SECRET = process.env.JWT_SECRET || 'coach-conan-secret-2024'

function createToken(email: string): string {
  const emailPart = Buffer.from(email).toString('base64url')
  const sig = createHmac('sha256', TOKEN_SECRET).update(emailPart).digest('base64url')
  return `${emailPart}.${sig}`
}

function verifyToken(token: string): string | null {
  try {
    const dotIndex = token.lastIndexOf('.')
    if (dotIndex === -1) return null
    const emailPart = token.slice(0, dotIndex)
    const providedSig = token.slice(dotIndex + 1)
    const expectedSig = createHmac('sha256', TOKEN_SECRET).update(emailPart).digest('base64url')
    if (!timingSafeEqual(Buffer.from(providedSig), Buffer.from(expectedSig))) return null
    return Buffer.from(emailPart, 'base64url').toString()
  } catch {
    return null
  }
}

export async function getAuthAdmin(): Promise<{
  id: string
  email: string
  name: string
} | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
    if (!token) return null
    const email = verifyToken(token)
    if (!email) return null
    const admin = await db.admin.findUnique({
      where: { email },
      select: { id: true, email: true, name: true },
    })
    return admin
  } catch {
    return null
  }
}

export function createAuthToken(email: string): string {
  return createToken(email)
}

export { AUTH_COOKIE_NAME }
