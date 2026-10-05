import { PrismaClient } from '@prisma/client';
import { hasDatabase } from './env';

const globalForPrisma = globalThis;

function createClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

// `null` in modalità demo (nessun DATABASE_URL): i chiamanti usano i dati mock.
export const prisma = hasDatabase ? globalForPrisma.prisma ?? createClient() : null;

if (hasDatabase && process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
