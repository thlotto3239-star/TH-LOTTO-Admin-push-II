// THLOTTO-II uses Supabase (@/lib/supabase) for all live database operations.
let PrismaClientClass: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  PrismaClientClass = require('@prisma/client').PrismaClient;
} catch {
  PrismaClientClass = class {};
}

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

export const db =
  globalForPrisma.prisma ??
  (PrismaClientClass ? new PrismaClientClass() : null);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;