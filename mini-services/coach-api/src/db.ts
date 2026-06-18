import { PrismaClient } from '../generated/client'
import path from 'path'

const defaultDbUrl = `file:${path.join(__dirname, '..', 'prisma', 'coach.db')}`
const dbUrl = process.env.DATABASE_URL || defaultDbUrl

const globalForPrisma = globalThis as unknown as {
  coachDb: PrismaClient | undefined
}

export const db =
  globalForPrisma.coachDb ??
  new PrismaClient({
    datasources: {
      db: { url: dbUrl },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.coachDb = db
