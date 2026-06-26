import { PrismaClient } from '@prisma/client';

// This PrismaClient instance is intended ONLY for use within the (admin) route group.
// It effectively bypasses any RLS policies (if implemented via standard Supabase Prisma patterns)
// by operating under a service role or a local admin context. Use with extreme caution.
const globalForPrisma = global as unknown as { adminPrisma: PrismaClient };

export const adminDb =
  globalForPrisma.adminPrisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.adminPrisma = adminDb;
