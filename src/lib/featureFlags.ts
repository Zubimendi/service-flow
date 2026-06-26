import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getFlag(key: string, tenantId?: string) {
  // Check tenant override first
  if (tenantId) {
    const override = await prisma.featureFlag.findUnique({
      where: {
        key_tenantId: {
          key,
          tenantId,
        },
      },
    });
    if (override) return override.enabled;
  }

  // Fallback to global flag
  const globalFlag = await prisma.featureFlag.findFirst({
    where: {
      key,
      tenantId: null,
    },
  });

  return globalFlag ? globalFlag.enabled : false;
}
