import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

if (process.env.NODE_ENV === 'production') {
  prisma.$connect()
    .then(() => console.log('✅ Database connected successfully'))
    .catch((error) => {
      console.error('❌ Database connection failed:', error);
      console.error('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    });
}

export const db = prisma;

export default prisma;
