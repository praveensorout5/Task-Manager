import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

/**
 * Handle Railway's postgres:// vs postgresql:// protocol requirement
 */
const getDatabaseUrl = () => {
  let url = process.env.DATABASE_URL;
  if (url && url.startsWith('postgres://')) {
    url = url.replace('postgres://', 'postgresql://');
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
