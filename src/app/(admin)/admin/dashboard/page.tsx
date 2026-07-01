import { adminDb } from '@/lib/admin/adminDb';
import { StatCard } from '@/components/admin/ui/StatCard';
import { AdminBadge } from '@/components/admin/ui/AdminBadge';
import { ActivityFeed } from '@/components/admin/ui/ActivityFeed';
import { QuickActionLink } from '@/components/admin/ui/QuickActionLink';
import {
  Users, CreditCard, TrendingUp, CalendarCheck,
  Building2, Activity, AlertCircle, Zap,
} from 'lucide-react';

const PLAN_PRICES: Record<string, number> = {
  STARTER: 29, PRO: 79, ENTERPRISE: 199,
};

async function getDashboardData() {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalTenants, lastMonthTenants, activeSubs, suspendedTenants,
    trialingTenants, bookingsThisMonth, bookingsLastMonth,
    planCounts, recentAuditLogs,
  ] = await Promise.all([
    adminDb.tenant.count(),
    adminDb.tenant.count({ where: { createdAt: { lt: firstOfMonth } } }),
    adminDb.tenant.count({ where: { subscriptionStatus: 'ACTIVE' } }),
    adminDb.tenant.count({ where: { status: 'SUSPENDED' } }),
    adminDb.tenant.count({ where: { subscriptionStatus: 'TRIALING' } }),
    adminDb.appointment.count({ where: { createdAt: { gte: firstOfMonth } } }),
    adminDb.appointment.count({ where: { createdAt: { gte: firstOfLastMonth, lt: firstOfMonth } } }),
    adminDb.tenant.groupBy({
      by: ['subscriptionPlan'],
      where: { subscriptionStatus: 'ACTIVE' },
      _count: { id: true },
    }),
    adminDb.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
  ]);

  const mrrCents = planCounts.reduce((sum, g) =>
    sum + (PLAN_PRICES[g.subscriptionPlan] ?? 0) * g._count.id * 100, 0);

  const bookingDelta = bookingsLastMonth > 0
    ? ((bookingsThisMonth - bookingsLastMonth) / bookingsLastMonth) * 100
    : 0;

  return {
    totalTenants, activeSubs, suspendedTenants, trialingTenants,
    mrrCents, bookingsThisMonth, bookingDelta,
    planBreakdown: planCounts,
    recentAuditLogs,
    newTenantsThisMonth: totalTenants - lastMonthTenants,
  };
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  const formatMRR = (cents: number) => {
    const dollars = cents / 100;
    return dollars >= 1000 ? `$${(dollars / 1000).toFixed(1)}k` : `$${dollars.toFixed(0)}`;
  };

  const totalActiveCount = data.planBreakdown.reduce((s, g) => s + g._count.id, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#E8E8F4', letterSpacing: '-0.02em' }}>
            Platform Dashboard
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#8080A8' }}>
            Real-time overview of your multi-tenant SaaS
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {data.suspendedTenants > 0 && (
            <span
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '6px 12px', borderRadius: '8px',
                backgroundColor: 'rgba(244,63,94,0.1)',
                border: '1px solid rgba(244,63,94,0.2)',
                fontSize: '12px', color: '#F43F5E', fontWeight: 500,
              }}
            >
              <AlertCircle size={12} />
              {data.suspendedTenants} suspended
            </span>
          )}
          <span
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '6px 12px', borderRadius: '8px',
              backgroundColor: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.15)',
              fontSize: '12px', color: '#10B981', fontWeight: 500,
            }}
          >
            <Activity size={12} />
            All Systems Operational
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <StatCard
          title="Total Tenants"
          value={data.totalTenants.toLocaleString()}
          subtitle={`+${data.newTenantsThisMonth} this month`}
          iconNode={<Building2 size={16} color="#6C63FF" />}
          iconBg="rgba(108,99,255,0.12)"
          accent="#6C63FF"
        />
        <StatCard
          title="Active Subscriptions"
          value={data.activeSubs.toLocaleString()}
          subtitle={`${data.trialingTenants} trialing`}
          iconNode={<Users size={16} color="#10B981" />}
          iconBg="rgba(16,185,129,0.12)"
          accent="#10B981"
        />
        <StatCard
          title="Platform MRR"
          value={formatMRR(data.mrrCents)}
          subtitle="From active subscriptions"
          iconNode={<CreditCard size={16} color="#F59E0B" />}
          iconBg="rgba(245,158,11,0.12)"
          accent="#F59E0B"
        />
        <StatCard
          title="Bookings This Month"
          value={data.bookingsThisMonth.toLocaleString()}
          delta={data.bookingDelta}
          iconNode={<CalendarCheck size={16} color="#38BDF8" />}
          iconBg="rgba(56,189,248,0.12)"
          accent="#38BDF8"
        />
      </div>

      {/* Middle row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>

        {/* Recent Activity */}
        <div
          style={{
            backgroundColor: '#0e0e1a', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '14px', overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '18px 22px 14px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#E8E8F4' }}>
                Recent Activity
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#8080A8' }}>
                Latest platform events
              </p>
            </div>
            <a
              href="/admin/audit-log"
              style={{
                fontSize: '12px', color: '#6C63FF', textDecoration: 'none', fontWeight: 500,
              }}
            >
              View all →
            </a>
          </div>
          <div style={{ padding: '4px 22px 8px' }}>
            <ActivityFeed entries={data.recentAuditLogs as Parameters<typeof ActivityFeed>[0]['entries']} />
          </div>
        </div>

        {/* Plan Distribution */}
        <div
          style={{
            backgroundColor: '#0e0e1a', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '14px', padding: '20px 22px',
          }}
        >
          <h2 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 700, color: '#E8E8F4' }}>
            Plan Distribution
          </h2>
          <p style={{ margin: '0 0 18px', fontSize: '12px', color: '#8080A8' }}>
            Active subscriptions by tier
          </p>

          {data.planBreakdown.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#50506A', textAlign: 'center', padding: '20px 0' }}>
              No active subscriptions yet
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {data.planBreakdown.map((p) => {
                const pct = totalActiveCount > 0 ? (p._count.id / totalActiveCount) * 100 : 0;
                const planColor = p.subscriptionPlan === 'ENTERPRISE' ? '#F59E0B'
                  : p.subscriptionPlan === 'PRO' ? '#8B7FFF' : '#38BDF8';

                return (
                  <div key={p.subscriptionPlan}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AdminBadge value={p.subscriptionPlan.toLowerCase()} size="sm" />
                      </div>
                      <span style={{ fontSize: '12px', color: '#8080A8' }}>
                        {p._count.id} · {pct.toFixed(0)}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: '6px', borderRadius: '3px',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%', width: `${pct}%`,
                          backgroundColor: planColor,
                          boxShadow: `0 0 8px ${planColor}60`,
                          borderRadius: '3px',
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick stats */}
          <div
            style={{
              marginTop: '24px', paddingTop: '18px',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              display: 'flex', flexDirection: 'column', gap: '10px',
            }}
          >
            {[
              { label: 'Trialing', value: data.trialingTenants, color: '#F59E0B' },
              { label: 'Suspended', value: data.suspendedTenants, color: '#F43F5E' },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12.5px', color: '#8080A8' }}>{item.label}</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div
        style={{
          backgroundColor: '#0e0e1a', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '14px', padding: '20px 22px',
        }}
      >
        <h2 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 700, color: '#E8E8F4' }}>
          Quick Actions
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {[
            { label: 'View All Tenants',   href: '/admin/tenants',       icon: Users,      color: '#6C63FF' },
            { label: 'Subscriptions',      href: '/admin/subscriptions', icon: CreditCard, color: '#10B981' },
            { label: 'Feature Flags',      href: '/admin/feature-flags', icon: Zap,        color: '#F59E0B' },
            { label: 'Full Audit Log',     href: '/admin/audit-log',     icon: Activity,   color: '#38BDF8' },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <QuickActionLink
                key={action.href}
                href={action.href}
                label={action.label}
                iconNode={<Icon size={15} color={action.color} />}
                color={action.color}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
