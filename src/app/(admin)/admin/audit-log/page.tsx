import { adminDb } from '@/lib/admin/adminDb';
import { AdminBadge } from '@/components/admin/ui/AdminBadge';
import { formatDistanceToNow } from 'date-fns';
import {
  UserX, UserCheck, Trash2, Zap, CreditCard, LogIn, LogOut,
  Plus, AlertCircle, CheckCircle, Settings,
} from 'lucide-react';

const EVENT_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  TENANT_CREATED:              { icon: Plus,         color: '#10B981', label: 'Tenant Created' },
  TENANT_SUSPENDED:            { icon: UserX,        color: '#F43F5E', label: 'Tenant Suspended' },
  TENANT_ACTIVATED:            { icon: UserCheck,    color: '#10B981', label: 'Tenant Activated' },
  TENANT_DELETED:              { icon: Trash2,       color: '#F43F5E', label: 'Tenant Deleted' },
  ADMIN_IMPERSONATED_TENANT:   { icon: LogIn,        color: '#6C63FF', label: 'Impersonation Started' },
  IMPERSONATION_ENDED:         { icon: LogOut,       color: '#8080A8', label: 'Impersonation Ended' },
  PLAN_CHANGED:                { icon: CreditCard,   color: '#F59E0B', label: 'Plan Changed' },
  TENANT_PLAN_CHANGED:         { icon: CreditCard,   color: '#F59E0B', label: 'Plan Changed' },
  FEATURE_FLAG_TOGGLED:        { icon: Zap,          color: '#38BDF8', label: 'Flag Toggled' },
  FEATURE_FLAG_GLOBAL_TOGGLED: { icon: Zap,          color: '#38BDF8', label: 'Global Flag Toggled' },
  APPOINTMENT_STATUS_CHANGED:  { icon: CheckCircle,  color: '#10B981', label: 'Appt. Changed' },
  PAYMENT_PROCESSED:           { icon: CreditCard,   color: '#10B981', label: 'Payment Processed' },
  ADMIN_CREATED:               { icon: Settings,     color: '#8B7FFF', label: 'Admin Created' },
};

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams?: { page?: string; eventType?: string; actorEmail?: string };
}) {
  const page = Math.max(1, Number(searchParams?.page ?? 1));
  const limit = 30;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (searchParams?.eventType && searchParams.eventType !== 'ALL') where.eventType = searchParams.eventType;
  if (searchParams?.actorEmail) where.actorEmail = { contains: searchParams.actorEmail, mode: 'insensitive' };

  const [logs, total] = await Promise.all([
    adminDb.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    adminDb.auditLog.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#E8E8F4', letterSpacing: '-0.02em' }}>
            Audit Log
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#8080A8' }}>
            Immutable record of all platform-level actions
          </p>
        </div>
        <span
          style={{
            padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 500,
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#8080A8',
          }}
        >
          {total.toLocaleString()} total events
        </span>
      </div>

      {/* Filters */}
      <form method="GET" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          name="actorEmail"
          defaultValue={searchParams?.actorEmail}
          placeholder="Filter by actor email..."
          style={{ flex: '1 1 240px', padding: '9px 12px', borderRadius: '9px', fontSize: '13px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#E8E8F4', outline: 'none' }}
        />
        <select
          name="eventType"
          defaultValue={searchParams?.eventType ?? 'ALL'}
          style={{ padding: '9px 14px', borderRadius: '9px', fontSize: '13px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#E8E8F4', cursor: 'pointer', outline: 'none', appearance: 'none' }}
        >
          <option value="ALL" style={{ backgroundColor: '#0e0e1a' }}>All Event Types</option>
          {Object.keys(EVENT_CONFIG).map((k) => (
            <option key={k} value={k} style={{ backgroundColor: '#0e0e1a' }}>{EVENT_CONFIG[k].label}</option>
          ))}
        </select>
        <button type="submit" style={{ padding: '9px 18px', borderRadius: '9px', fontSize: '13px', fontWeight: 500, backgroundColor: '#6C63FF', border: 'none', color: 'white', cursor: 'pointer' }}>
          Filter
        </button>
      </form>

      {/* Log Table */}
      <div style={{ backgroundColor: '#0e0e1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', overflow: 'hidden' }}>
        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#50506A' }}>
            <AlertCircle size={24} style={{ margin: '0 auto 10px' }} />
            <p style={{ margin: 0, fontSize: '13px' }}>No audit log entries match your filters</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {logs.map((log, idx) => {
              const cfg = EVENT_CONFIG[log.eventType] ?? { icon: AlertCircle, color: '#8080A8', label: log.eventType };
              const Icon = cfg.icon;
              return (
                <div
                  key={log.id}
                  className="hover:bg-white/5"
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '14px',
                    padding: '14px 22px',
                    borderBottom: idx < logs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    transition: 'background 0.12s',
                  }}
                >
                  <div
                    style={{
                      width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0,
                      backgroundColor: `${cfg.color}15`,
                      border: `1px solid ${cfg.color}25`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginTop: '2px',
                    }}
                  >
                    <Icon size={14} color={cfg.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
                      <AdminBadge value={cfg.color === '#F43F5E' ? 'suspended' : cfg.color === '#10B981' ? 'active' : 'info'} size="sm" dot={false}>
                        {cfg.label}
                      </AdminBadge>
                      <span style={{ fontSize: '13.5px', color: '#E8E8F4' }}>{log.description}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11.5px', color: '#50506A' }}>
                        By <span style={{ color: '#8080A8' }}>{log.actorEmail}</span>
                      </span>
                      <span style={{ fontSize: '11.5px', color: '#50506A' }}>·</span>
                      <span style={{ fontSize: '11.5px', color: '#50506A' }}>
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </span>
                      {log.tenantId && (
                        <>
                          <span style={{ fontSize: '11.5px', color: '#50506A' }}>·</span>
                          <a
                            href={`/admin/tenants/${log.tenantId}`}
                            style={{ fontSize: '11.5px', color: '#6C63FF', textDecoration: 'none' }}
                          >
                            View Tenant
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                  <span style={{ fontSize: '11.5px', color: '#50506A', whiteSpace: 'nowrap', flexShrink: 0, marginTop: '4px' }}>
                    {new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: '14px 22px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#50506A' }}>
              Page {page} of {totalPages} · {total.toLocaleString()} total
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {page > 1 && (
                <a href={`?page=${page - 1}`} style={{ padding: '6px 12px', borderRadius: '7px', fontSize: '12px', color: '#8080A8', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.08)' }}>← Prev</a>
              )}
              {page < totalPages && (
                <a href={`?page=${page + 1}`} style={{ padding: '6px 12px', borderRadius: '7px', fontSize: '12px', color: '#8080A8', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.08)' }}>Next →</a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
