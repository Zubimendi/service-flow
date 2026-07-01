import { adminDb } from './adminDb';

import { AuditEventType } from '@prisma/client';

interface WriteAuditLogParams {
  actorId: string;
  actorEmail: string;
  eventType: AuditEventType;
  description: string;
  tenantId?: string | null;
  metadata?: Record<string, unknown>;
}

export async function writeAuditLog(params: WriteAuditLogParams) {
  try {
    await adminDb.auditLog.create({
      data: {
        actorId: params.actorId,
        actorEmail: params.actorEmail,
        eventType: params.eventType,
        description: params.description,
        tenantId: params.tenantId,
        metadata: params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : undefined,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
    // Never throw — logging failure must not break the actual action.
  }
}
