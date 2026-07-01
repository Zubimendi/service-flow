import Link from 'next/link';
import { adminDb } from '@/lib/admin/adminDb';
import { AdminBadge } from '@/components/admin/ui/AdminBadge';
import { Users, Search, Building2, ExternalLink } from 'lucide-react';

export default async function AdminTenantsPage({
  searchParams,
}: {
  searchParams?: { q?: string; plan?: string; status?: string; page?: string };
}) {
  const page = Math.max(1, Number(searchParams?.page ?? 1));
  const limit = 20;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (searchParams?.q) {
    where.OR = [
      { name: { contains: searchParams.q, mode: 'insensitive' } },
      { slug: { contains: searchParams.q, mode: 'insensitive' } },
    ];
  }
  if (searchParams?.plan && searchParams.plan !== 'ALL') {
    where.subscriptionPlan = searchParams.plan;
  }
  if (searchParams?.status && searchParams.status !== 'ALL') {
    where.status = searchParams.status;
  }

  const [tenants, total] = await Promise.all([
    adminDb.tenant.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        _count: { select: { appointments: true, users: true, clients: true } },
      },
    }),
    adminDb.tenant.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#E8E8F4', letterSpacing: '-0.02em' }}>
            Tenants
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#8080A8' }}>
            {total.toLocaleString()} {total === 1 ? 'tenant' : 'tenants'} total
          </p>
        </div>
      </div>

      {/* Filters */}
      <form method="GET" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#50506A' }} />
          <input
            name="q"
            defaultValue={searchParams?.q}
            placeholder="Search by name or slug..."
            style={{
              width: '100%', paddingLeft: '36px', paddingRight: '14px',
              paddingTop: '9px', paddingBottom: '9px',
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '9px', color: '#E8E8F4', fontSize: '13px', outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {[
          { name: 'plan', options: ['ALL', 'STARTER', 'PRO', 'ENTERPRISE'], label: 'Plan' },
          { name: 'status', options: ['ALL', 'ACTIVE', 'SUSPENDED'], label: 'Status' },
        ].map((filter) => (
          <select
            key={filter.name}
            name={filter.name}
            defaultValue={searchParams?.[filter.name as 'plan' | 'status'] ?? 'ALL'}
            style={{
              padding: '9px 32px 9px 12px', borderRadius: '9px', fontSize: '13px',
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#E8E8F4', cursor: 'pointer', outline: 'none',
              appearance: 'none',
            }}
          >
            {filter.options.map((o) => <option key={o} value={o} style={{ backgroundColor: '#0e0e1a' }}>{o === 'ALL' ? `All ${filter.label}s` : o}</option>)}
          </select>
        ))}

        <button
          type="submit"
          style={{
            padding: '9px 18px', borderRadius: '9px', fontSize: '13px', fontWeight: 500,
            backgroundColor: '#6C63FF', border: 'none', color: 'white', cursor: 'pointer',
          }}
        >
          Filter
        </button>
      </form>

      {/* Table */}
      <div
        style={{
          backgroundColor: '#0e0e1a', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '14px', overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Tenant', 'Plan', 'Status', 'Users', 'Appointments', 'Created', ''].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '12px 18px', textAlign: 'left',
                    fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em',
                    textTransform: 'uppercase', color: '#50506A',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tenants.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#50506A' }}>
                  <Building2 size={24} style={{ margin: '0 auto 8px' }} />
                  <p style={{ margin: 0, fontSize: '13px' }}>No tenants found</p>
                </td>
              </tr>
            ) : tenants.map((t, idx) => (
              <tr
                key={t.id}
                className="hover:bg-white/5"
                style={{
                  borderBottom: idx < tenants.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  transition: 'background 0.12s',
                }}
              >
                <td style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                        backgroundColor: t.primaryColor || '#6C63FF',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '13px', fontWeight: 700, color: 'white',
                        opacity: 0.9,
                      }}
                    >
                      {t.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#E8E8F4' }}>{t.name}</div>
                      <div style={{ fontSize: '11px', color: '#50506A', fontFamily: 'monospace' }}>{t.slug}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 18px' }}>
                  <AdminBadge value={t.subscriptionPlan.toLowerCase()} size="sm" />
                </td>
                <td style={{ padding: '14px 18px' }}>
                  <AdminBadge value={t.status.toLowerCase()} size="sm" />
                </td>
                <td style={{ padding: '14px 18px', fontSize: '13px', color: '#8080A8' }}>
                  {t._count.users}
                </td>
                <td style={{ padding: '14px 18px', fontSize: '13px', color: '#8080A8' }}>
                  {t._count.appointments.toLocaleString()}
                </td>
                <td style={{ padding: '14px 18px', fontSize: '12px', color: '#50506A', whiteSpace: 'nowrap' }}>
                  {new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                  <Link
                    href={`/admin/tenants/${t.id}`}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '6px 12px', borderRadius: '7px', textDecoration: 'none',
                      fontSize: '12px', fontWeight: 500,
                      backgroundColor: 'rgba(108,99,255,0.10)',
                      border: '1px solid rgba(108,99,255,0.2)',
                      color: '#8B7FFF',
                    }}
                  >
                    <ExternalLink size={11} />
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '12px', color: '#50506A' }}>
              Showing {skip + 1}–{Math.min(skip + limit, total)} of {total}
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {page > 1 && (
                <Link href={`?page=${page - 1}${searchParams?.q ? `&q=${searchParams.q}` : ''}`}
                  style={{ padding: '6px 12px', borderRadius: '7px', fontSize: '12px', color: '#8080A8', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.08)' }}>
                  ← Prev
                </Link>
              )}
              {page < totalPages && (
                <Link href={`?page=${page + 1}${searchParams?.q ? `&q=${searchParams.q}` : ''}`}
                  style={{ padding: '6px 12px', borderRadius: '7px', fontSize: '12px', color: '#8080A8', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.08)' }}>
                  Next →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
