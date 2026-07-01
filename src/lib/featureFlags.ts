import { adminDb } from './admin/adminDb';

export async function getFlag(key: string, tenantId?: string): Promise<boolean> {
  // Check tenant-specific override first
  if (tenantId) {
    const override = await adminDb.featureFlag.findUnique({
      where: { key_tenantId: { key, tenantId } },
    });
    if (override !== null) return override.enabled;
  }

  // Fallback to global flag (tenantId IS NULL)
  const globalFlag = await adminDb.featureFlag.findFirst({
    where: { key, tenantId: null },
  });

  return globalFlag ? globalFlag.enabled : false;
}

export async function setFlag(
  key: string,
  enabled: boolean,
  updatedBy: string,
  tenantId?: string
): Promise<void> {
  const existing = await adminDb.featureFlag.findFirst({
    where: { key, tenantId: tenantId ?? null },
  });
  if (existing) {
    await adminDb.featureFlag.update({
      where: { id: existing.id },
      data: { enabled, updatedBy },
    });
  } else {
    await adminDb.featureFlag.create({
      data: { key, enabled, updatedBy, tenantId: tenantId ?? null },
    });
  }
}
