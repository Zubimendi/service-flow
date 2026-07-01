import { adminDb } from '@/lib/admin/adminDb';
import { AdminBadge } from '@/components/admin/ui/AdminBadge';
import { StatCard } from '@/components/admin/ui/StatCard';
import { CreditCard, TrendingUp, Users, AlertCircle } from 'lucide-react';

const PLAN_PRICES: Record<string, number> = { STARTER: 29, PRO: 79, ENTERPRISE: 199 };

export default async function SubscriptionsPage() {
  const [tenants, totalBookings] = await Promise.all([
    adminDb.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, slug: true, primaryColor: true,
        subscriptionPlan: true, subscriptionStatus: true, status: true, createdAt: true,
        _count: { select: { users: true } },
      },
    }),
    adminDb.appointment.count(),
  ]);

  const activeSubs    = tenants.filter((t) => t.subscriptionStatus === 'ACTIVE');
  const trialingSubs  = tenants.filter((t) => t.subscriptionStatus === 'TRIALING');
  const pastDueSubs   = tenants.filter((t) => t.subscriptionStatus === 'PAST_DUE');
  const cancelledSubs = tenants.filter((t) => t.subscriptionStatus === 'CANCELLED');

  const mrr = activeSubs.reduce((s, t) => s + (PLAN_PRICES[t.subscriptionPlan] ?? 0), 0);
  const arr = mrr * 12;

  const planBreakdown = (['STARTER', 'PRO', 'ENTERPRISE'] as const).map((p) => ({
    plan: p,
    count: activeSubs.filter((t) => t.subscriptionPlan === p).length,
    revenue: activeSubs.filter((t) => t.subscriptionPlan === p).length * (PLAN_PRICES[p] ?? 0),
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#E8E8F4', letterSpacing: '-0.02em' }}>
          Subscriptions
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#8080A8' }}>
          Revenue overview across all tenant plans
        </p>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <StatCard title="Monthly Recurring Revenue" value={`$${mrr.toLocaleString()}`} subtitle="From active subscriptions" icon={CreditCard} iconColor="#10B981" iconBg="rgba(16,185,129,0.12)" accent="#10B981" />
        <StatCard title="Annual Recurring Revenue"  value={`$${arr.toLocaleString()}`} subtitle="Projected annual run-rate"  icon={TrendingUp} iconColor="#6C63FF"  iconBg="rgba(108,99,255,0.12)" accent="#6C63FF" />
        <StatCard title="Active Subscriptions"       value={activeSubs.length}          subtitle={`${trialingSubs.length} trialing`} icon={Users} iconColor="#38BDF8" iconBg="rgba(56,189,248,0.12)" accent="#38BDF8" />
        <StatCard title="Past Due / At Risk"          value={pastDueSubs.length}         subtitle={`${cancelledSubs.length} cancelled`} icon={AlertCircle} iconColor="#F43F5E" iconBg="rgba(244,63,94,0.12)" accent="#F43F5E" />
      </div>

      {/* Plan revenue breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {planBreakdown.map((p) => {
          const planColor = p.plan === 'ENTERPRISE' ? '#F59E0B' : p.plan === 'PRO' ? '#8B7FFF' : '#38BDF8';
          return (
            <div
              key={p.plan}
              style={{
                backgroundColor: '#0e0e1a', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '14px', padding: '20px 22px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                <AdminBadge value={p.plan.toLowerCase()} />
                <span style={{ fontSize: '12px', color: '#50506A' }}>${PLAN_PRICES[p.plan]}/mo per tenant</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: planColor, marginBottom: '4px' }}>
                ${p.revenue.toLocaleString()}
              </div>
              <div style={{ fontSize: '12.5px', color: '#8080A8' }}>{p.count} active tenants</div>
            </div>
          );
        })}
      </div>

      {/* Subscriptions Table */}
      <div style={{ backgroundColor: '#0e0e1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#E8E8F4' }}>All Subscriptions</h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Tenant', 'Plan', 'Sub Status', 'Acc Status', 'Monthly Value', 'Since', ''].map((h) => (
                <th key={h} style={{ padding: '11px 18px', textAlign: 'left', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#50506A' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tenants.map((t, idx) => (
              <tr key={t.id} style={{ borderBottom: idx < tenants.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <td style={{ padding: '13px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '7px', backgroundColor: t.primaryColor || '#6C63FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                      {t.name.charAt(0)}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#E8E8F4' }}>{t.name}</div>
                  </div>
                </td>
                <td style={{ padding: '13px 18px' }}><AdminBadge value={t.subscriptionPlan.toLowerCase()} size="sm" /></td>
                <td style={{ padding: '13px 18px' }}><AdminBadge value={t.subscriptionStatus.toLowerCase()} size="sm" /></td>
                <td style={{ padding: '13px 18px' }}><AdminBadge value={t.status.toLowerCase()} size="sm" /></td>
                <td style={{ padding: '13px 18px', fontSize: '13px', fontWeight: 600, color: t.subscriptionStatus === 'ACTIVE' ? '#10B981' : '#50506A' }}>
                  {t.subscriptionStatus === 'ACTIVE' ? `$${PLAN_PRICES[t.subscriptionPlan]}/mo` : '—'}
                </td>
                <td style={{ padding: '13px 18px', fontSize: '12px', color: '#50506A' }}>
                  {new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td style={{ padding: '13px 18px', textAlign: 'right' }}>
                  <a href={`/admin/tenants/${t.id}`} style={{ fontSize: '12px', color: '#6C63FF', textDecoration: 'none', fontWeight: 500 }}>
                    Manage →
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
