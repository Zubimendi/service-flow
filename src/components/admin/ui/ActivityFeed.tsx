import { formatDistanceToNow } from 'date-fns';
import {
  UserX, UserCheck, Trash2, Zap, ZapOff, CreditCard, LogIn, LogOut,
  Plus, AlertCircle, CheckCircle, Settings,
} from 'lucide-react';

interface AuditEntry {
  id: string;
  eventType: string;
  description: string;
  actorEmail: string;
  createdAt: Date | string;
  tenantId?: string | null;
}

const EVENT_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  TENANT_CREATED:            { icon: Plus,         color: '#10B981' },
  TENANT_SUSPENDED:          { icon: UserX,        color: '#F43F5E' },
  TENANT_ACTIVATED:          { icon: UserCheck,    color: '#10B981' },
  TENANT_DELETED:            { icon: Trash2,       color: '#F43F5E' },
  ADMIN_IMPERSONATED_TENANT: { icon: LogIn,        color: '#6C63FF' },
  IMPERSONATION_ENDED:       { icon: LogOut,       color: '#8080A8' },
  PLAN_CHANGED:              { icon: CreditCard,   color: '#F59E0B' },
  TENANT_PLAN_CHANGED:       { icon: CreditCard,   color: '#F59E0B' },
  FEATURE_FLAG_TOGGLED:      { icon: Zap,          color: '#38BDF8' },
  FEATURE_FLAG_GLOBAL_TOGGLED: { icon: Zap,        color: '#38BDF8' },
  APPOINTMENT_STATUS_CHANGED:  { icon: CheckCircle, color: '#10B981' },
  PAYMENT_PROCESSED:           { icon: CreditCard,  color: '#10B981' },
  ADMIN_CREATED:               { icon: Settings,    color: '#8B7FFF' },
};

interface ActivityFeedProps {
  entries: AuditEntry[];
  limit?: number;
}

export function ActivityFeed({ entries, limit = 10 }: ActivityFeedProps) {
  const shown = entries.slice(0, limit);

  if (shown.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px', color: '#50506A' }}>
        <AlertCircle size={24} style={{ margin: '0 auto 8px' }} />
        <p style={{ margin: 0, fontSize: '13px' }}>No activity yet</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {shown.map((entry, idx) => {
        const iconDef = EVENT_ICONS[entry.eventType] ?? { icon: AlertCircle, color: '#8080A8' };
        const Icon = iconDef.icon;

        return (
          <div
            key={entry.id}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: '12px',
              padding: '12px 0',
              borderBottom: idx < shown.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            }}
          >
            <div
              style={{
                width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                backgroundColor: `${iconDef.color}15`,
                border: `1px solid ${iconDef.color}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Icon size={14} color={iconDef.color} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#E8E8F4', lineHeight: 1.4 }}>
                {entry.description}
              </p>
              <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#50506A' }}>
                {entry.actorEmail} ·{' '}
                {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
