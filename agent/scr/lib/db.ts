import { PrismaClient } from '@prisma/client'

// @ts-ignore - refresh after schema change
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Создаем PrismaClient с поддержкой горячей перезагрузки
export const db =
  process.env.NODE_ENV === 'production'
    ? (globalForPrisma.prisma ?? new PrismaClient({ log: ['query'] }))
    : new PrismaClient({ log: ['query'] })

if (process.env.NODE_ENV === 'production') {
  globalForPrisma.prisma = db
}

