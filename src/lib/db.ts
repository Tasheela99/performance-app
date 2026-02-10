import { PrismaClient } from '@prisma/client';

// Global declaration for PrismaClient instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prisma client singleton pattern for Next.js
// Prevents multiple instances during hot reload in development
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Export db as default for compatibility
export const db = prisma;

export default prisma;
