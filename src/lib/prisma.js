import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

/**
 * Handle Railway's postgres:// vs postgresql:// protocol requirement
 */
const getDatabaseUrl = () => {
  let url = process.env.DATABASE_URL;
  if (!url || url.trim() === '') {
    throw new Error('DATABASE_URL environment variable is empty or missing.');
  }
  
  url = url.trim();
  
  // Handle SQLite
  if (url.startsWith('file:')) {
    return url;
  }
  
  // Handle Railway's postgres:// vs postgresql://
  if (url.startsWith('postgres://')) {
    url = url.replace('postgres://', 'postgresql://');
  }
  
  if (!url.startsWith('postgresql://')) {
    throw new Error(`Invalid DATABASE_URL protocol. Expected postgresql:// or file: but got: ${url.substring(0, 10)}...`);
  }
  
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
