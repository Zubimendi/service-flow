import { adminDb } from './adminDb';

type AuditEventType =
  | 'TENANT_CREATED'
  | 'TENANT_SUSPENDED'
  | 'TENANT_ACTIVATED'
  | 'TENANT_DELETED'
  | 'ADMIN_IMPERSONATED_TENANT'
  | 'IMPERSONATION_ENDED'
  | 'PLAN_CHANGED'
  | 'FEATURE_FLAG_TOGGLED'
  | 'APPOINTMENT_STATUS_CHANGED'
  | 'PAYMENT_PROCESSED';

interface WriteAuditLogParams {
  actorId: string;
  actorEmail: string;
  eventType: AuditEventType;
  description: string;
  tenantId?: string | null;
  metadata?: any;
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
    // Never throw! Logging failure should not break the actual action.
  }
}
