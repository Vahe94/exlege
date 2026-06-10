import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client';

// Re-export generated client: models, enums, Prisma namespace
export * from './generated/prisma/client';

/** Prisma 7 requires a driver adapter; pg is our Postgres driver. */
export function createAdapter(connectionString: string): PrismaPg {
  return new PrismaPg({ connectionString });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/** Singleton PrismaClient (avoids exhausting connections in dev hot-reload) */
export function getPrisma(connectionString = process.env.DATABASE_URL): PrismaClient {
  if (!globalForPrisma.prisma) {
    if (!connectionString) throw new Error('DATABASE_URL is not set');
    globalForPrisma.prisma = new PrismaClient({ adapter: createAdapter(connectionString) });
  }
  return globalForPrisma.prisma;
}
