'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminBadge } from '@/components/admin/ui/AdminBadge';
import { ConfirmModal } from '@/components/admin/ui/ConfirmModal';
import { AdminModal } from '@/components/admin/ui/AdminModal';
import {
  ArrowLeft, Globe, Clock, Eye, UserX, UserCheck,
  Trash2, CreditCard, Users, CalendarCheck, AlertTriangle,
} from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
  primaryColor: string;
  timezone: string;
  createdAt: Date | string;
  stripeCustomerId?: string | null;
  stripeConnectAccountId?: string | null;
  users: Array<{ id: string; name: string; email: string; role: string; createdAt: Date | string }>;
  _count: { appointments: number; clients: number };
}

interface TenantDetailClientProps {
  tenant: Tenant;
}

const PLAN_PRICES: Record<string, number> = { STARTER: 29, PRO: 79, ENTERPRISE: 199 };

export default function TenantDetailClient({ tenant }: TenantDetailClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'staff' | 'danger'>('overview');
  const [showImpersonateConfirm, setShowImpersonateConfirm] = useState(false);
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(tenant.subscriptionPlan);
  const [loading, setLoading] = useState<string | null>(null);

  const isSuspended = tenant.status === 'SUSPENDED';

  const handleImpersonate = async () => {
    setLoading('impersonate');
    const res = await fetch(`/api/admin/tenants/${tenant.id}/impersonate`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) router.push(data.redirectTo);
    setLoading(null);
  };

  const handleToggleSuspend = async () => {
    const res = await fetch(`/api/admin/tenants/${tenant.id}/suspend`, { method: 'POST' });
    if (res.ok) router.refresh();
  };

  const handleDelete = async () => {
    const res = await fetch(`/api/admin/tenants/${tenant.id}`, { method: 'DELETE' });
    if (res.ok) router.push('/admin/tenants');
  };

  const handleChangePlan = async () => {
    await fetch(`/api/admin/tenants/${tenant.id}/plan`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: selectedPlan }),
    });
    router.refresh();
    setShowPlanModal(false);
  };

  const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'staff',    label: `Staff (${tenant.users.length})` },
    { key: 'danger',   label: 'Danger Zone' },
  ] as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Back */}
      <a
        href="/admin/tenants"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontSize: '13px', color: '#8080A8', textDecoration: 'none',
          transition: 'color 0.15s',
        }}
      >
        <ArrowLeft size={14} /> Back to Tenants
      </a>

      {/* Hero Header */}
      <div
        style={{
          backgroundColor: '#0e0e1a', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px', padding: '24px 28px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '56px', height: '56px', borderRadius: '14px', flexShrink: 0,
                backgroundColor: tenant.primaryColor || '#6C63FF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px', fontWeight: 700, color: 'white',
              }}
            >
              {tenant.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#E8E8F4' }}>
                {tenant.name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                <code style={{ fontSize: '12px', color: '#8080A8', backgroundColor: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '5px' }}>
                  {tenant.slug}
                </code>
                <AdminBadge value={tenant.status.toLowerCase()} size="sm" />
                <AdminBadge value={tenant.subscriptionPlan.toLowerCase()} size="sm" />
                <AdminBadge value={tenant.subscriptionStatus.toLowerCase()} size="sm" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowPlanModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '9px 16px', borderRadius: '9px', fontSize: '13px', fontWeight: 500,
                backgroundColor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
                color: '#F59E0B', cursor: 'pointer',
              }}
            >
              <CreditCard size={13} /> Change Plan
            </button>

            <button
              onClick={() => setShowSuspendConfirm(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '9px 16px', borderRadius: '9px', fontSize: '13px', fontWeight: 500,
                backgroundColor: isSuspended ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
                border: `1px solid ${isSuspended ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)'}`,
                color: isSuspended ? '#10B981' : '#F43F5E', cursor: 'pointer',
              }}
            >
              {isSuspended ? <UserCheck size={13} /> : <UserX size={13} />}
              {isSuspended ? 'Activate' : 'Suspend'}
            </button>

            <button
              onClick={() => setShowImpersonateConfirm(true)}
              disabled={isSuspended || loading === 'impersonate'}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '9px 16px', borderRadius: '9px', fontSize: '13px', fontWeight: 600,
                background: isSuspended ? 'rgba(108,99,255,0.05)' : 'linear-gradient(135deg, #6C63FF, #8B5CF6)',
                border: 'none', color: isSuspended ? '#50506A' : 'white',
                cursor: isSuspended ? 'not-allowed' : 'pointer',
                boxShadow: isSuspended ? 'none' : '0 4px 14px rgba(108,99,255,0.35)',
              }}
            >
              <Eye size={13} />
              {loading === 'impersonate' ? 'Loading...' : 'Impersonate'}
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1px', marginTop: '22px',
            borderRadius: '10px', overflow: 'hidden',
            backgroundColor: 'rgba(255,255,255,0.05)',
          }}
        >
          {[
            { icon: Users, label: 'Staff Members', value: tenant.users.length },
            { icon: CalendarCheck, label: 'Total Appointments', value: tenant._count.appointments.toLocaleString() },
            { icon: Globe, label: 'Clients', value: tenant._count.clients.toLocaleString() },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                style={{
                  padding: '16px 20px', backgroundColor: '#14142a',
                  display: 'flex', alignItems: 'center', gap: '12px',
                }}
              >
                <Icon size={16} color="#6C63FF" />
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#E8E8F4' }}>{stat.value}</div>
                  <div style={{ fontSize: '11px', color: '#50506A' }}>{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0' }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '13.5px', fontWeight: activeTab === tab.key ? 600 : 400,
              color: activeTab === tab.key ? '#E8E8F4' : '#8080A8',
              borderBottom: activeTab === tab.key ? '2px solid #6C63FF' : '2px solid transparent',
              marginBottom: '-1px', transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[
            {
              title: 'Subscription Details',
              icon: CreditCard,
              rows: [
                { label: 'Plan', value: <AdminBadge value={tenant.subscriptionPlan.toLowerCase()} size="sm" /> },
                { label: 'Status', value: <AdminBadge value={tenant.subscriptionStatus.toLowerCase()} size="sm" /> },
                { label: 'Monthly Value', value: `$${PLAN_PRICES[tenant.subscriptionPlan] ?? 0}/mo` },
              ],
            },
            {
              title: 'Configuration',
              icon: Globe,
              rows: [
                { label: 'Timezone', value: tenant.timezone },
                { label: 'Stripe Customer', value: tenant.stripeCustomerId ? <code style={{ fontSize: '11px', color: '#8080A8' }}>{tenant.stripeCustomerId.slice(0, 16)}…</code> : <span style={{ color: '#50506A' }}>—</span> },
                { label: 'Connected Account', value: tenant.stripeConnectAccountId ? <code style={{ fontSize: '11px', color: '#8080A8' }}>{tenant.stripeConnectAccountId.slice(0, 16)}…</code> : <span style={{ color: '#50506A' }}>—</span> },
              ],
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                style={{
                  backgroundColor: '#0e0e1a', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '14px', padding: '20px 22px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Icon size={14} color="#6C63FF" />
                  <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#E8E8F4' }}>
                    {card.title}
                  </h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {card.rows.map((row) => (
                    <div
                      key={row.label}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.04)',
                      }}
                    >
                      <span style={{ fontSize: '13px', color: '#8080A8' }}>{row.label}</span>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#E8E8F4' }}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'staff' && (
        <div
          style={{
            backgroundColor: '#0e0e1a', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '14px', overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Member', 'Role', 'Joined'].map((h) => (
                  <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#50506A' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tenant.users.length === 0 ? (
                <tr><td colSpan={3} style={{ padding: '32px', textAlign: 'center', color: '#50506A', fontSize: '13px' }}>No staff members</td></tr>
              ) : tenant.users.map((u, idx) => (
                <tr key={u.id} style={{ borderBottom: idx < tenant.users.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: 'rgba(108,99,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#8B7FFF', flexShrink: 0 }}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: '#E8E8F4' }}>{u.name}</div>
                        <div style={{ fontSize: '11px', color: '#50506A' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <AdminBadge value={u.role.toLowerCase() === 'tenant_owner' ? 'info' : 'default'} size="sm">
                      {u.role.replace('_', ' ')}
                    </AdminBadge>
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: '12px', color: '#50506A' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'danger' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div
            style={{
              backgroundColor: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)',
              borderRadius: '14px', padding: '22px 24px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <AlertTriangle size={14} color="#F43F5E" />
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#F43F5E' }}>Delete Tenant</h3>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#8080A8', maxWidth: '500px', lineHeight: 1.5 }}>
                Permanently delete this tenant and all associated data including users, appointments, payments, and clients. <strong style={{ color: '#F43F5E' }}>This action cannot be undone.</strong>
              </p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '10px 18px', borderRadius: '9px', fontSize: '13px', fontWeight: 600,
                backgroundColor: '#F43F5E', border: 'none', color: 'white', cursor: 'pointer',
              }}
            >
              <Trash2 size={13} /> Delete Tenant
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ConfirmModal
        isOpen={showImpersonateConfirm}
        onClose={() => setShowImpersonateConfirm(false)}
        onConfirm={handleImpersonate}
        title="Impersonate Tenant"
        description={`You will browse the platform as "${tenant.name}". This action is logged. You can exit at any time using the banner shown at the top of the screen.`}
        confirmLabel="Start Impersonation"
      />

      <ConfirmModal
        isOpen={showSuspendConfirm}
        onClose={() => setShowSuspendConfirm(false)}
        onConfirm={handleToggleSuspend}
        title={isSuspended ? 'Activate Tenant' : 'Suspend Tenant'}
        description={isSuspended
          ? `Reactivate "${tenant.name}"? They will regain full access to the platform.`
          : `Suspend "${tenant.name}"? Their users will lose access until reactivated.`
        }
        confirmLabel={isSuspended ? 'Activate' : 'Suspend'}
        danger={!isSuspended}
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Tenant"
        description="All data including users, appointments, payments, and clients will be permanently erased. This cannot be undone."
        confirmLabel="Delete Permanently"
        confirmText={tenant.slug}
        danger
      />

      {/* Plan Change Modal */}
      <AdminModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        title="Change Subscription Plan"
        description={`Current plan: ${tenant.subscriptionPlan}`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {['STARTER', 'PRO', 'ENTERPRISE'].map((plan) => (
              <label
                key={plan}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', borderRadius: '10px', cursor: 'pointer',
                  backgroundColor: selectedPlan === plan ? 'rgba(108,99,255,0.1)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${selectedPlan === plan ? 'rgba(108,99,255,0.35)' : 'rgba(255,255,255,0.07)'}`,
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="radio"
                    name="plan"
                    value={plan}
                    checked={selectedPlan === plan}
                    onChange={() => setSelectedPlan(plan)}
                    style={{ accentColor: '#6C63FF' }}
                  />
                  <AdminBadge value={plan.toLowerCase()} size="sm" />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#E8E8F4' }}>
                  ${PLAN_PRICES[plan]}/mo
                </span>
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowPlanModal(false)} style={{ padding: '9px 18px', borderRadius: '8px', fontSize: '13px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#8080A8', cursor: 'pointer' }}>
              Cancel
            </button>
            <button onClick={handleChangePlan} style={{ padding: '9px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, backgroundColor: '#6C63FF', border: 'none', color: 'white', cursor: 'pointer' }}>
              Apply Change
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
