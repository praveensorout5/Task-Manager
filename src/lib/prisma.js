import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

/**
 * Handle Railway's postgres:// vs postgresql:// protocol requirement
 */
const getDatabaseUrl = () => {
  let url = process.env.DATABASE_URL;
  if (!url) {
    console.error('❌ DATABASE_URL is NOT set in environment!');
    return '';
  }
  
  if (url.startsWith('postgres://')) {
    url = url.replace('postgres://', 'postgresql://');
  }
  
  // Log a masked version for debugging
  console.log(`📡 Prisma connecting to: ${url.split('@')[1] || 'URL format unexpected'}`);
  return url;
};

export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
