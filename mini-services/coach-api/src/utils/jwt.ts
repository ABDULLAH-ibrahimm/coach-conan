import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'coach-conan-secret-key-change-in-production'
const JWT_EXPIRY = '24h'

export interface CoachJwtPayload {
  coachId: string
  role?: string
}

export interface ClientJwtPayload {
  clientId: string
  coachId: string
  role: 'client'
}

export type JwtPayload = CoachJwtPayload | ClientJwtPayload

export function signToken(payload: CoachJwtPayload | ClientJwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY, algorithm: 'HS256' })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as JwtPayload
    return decoded
  } catch {
    return null
  }
}

export function isTokenExpired(error: unknown): boolean {
  return error instanceof jwt.TokenExpiredError
}

export function isTokenInvalid(error: unknown): boolean {
  return error instanceof jwt.JsonWebTokenError
}

export { JWT_SECRET }
