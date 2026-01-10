import { PrismaClient, Prisma } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Export common Prisma types for convenience
export { Prisma };

// Test database connection
export const testConnection = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Prisma connected to PostgreSQL database');
    return true;
  } catch (error) {
    console.error('❌ Prisma connection error:', error.message);
    return false;
  }
};

// Graceful shutdown
export const disconnectPrisma = async () => {
  await prisma.$disconnect();
  console.log('🔌 Prisma disconnected from database');
};

export default prisma;
