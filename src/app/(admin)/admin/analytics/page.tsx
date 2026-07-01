import { adminDb } from '@/lib/admin/adminDb';

async function getAnalyticsData(range: string) {
  const daysMap: Record<string, number> = { '30d': 30, '90d': 90, '1y': 365 };
  const days = daysMap[range] ?? 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [newTenants, appointments, payments] = await Promise.all([
    adminDb.tenant.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    adminDb.appointment.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    adminDb.payment.findMany({
      where: { createdAt: { gte: since }, status: 'PAID' },
      select: { createdAt: true, amount: true },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  // Build weekly buckets
  const weeks = Math.ceil(days / 7);
  const buckets: Array<{ label: string; tenants: number; bookings: number; revenue: number }> = [];
  for (let i = 0; i < weeks; i++) {
    const weekStart = new Date(since.getTime() + i * 7 * 24 * 60 * 60 * 1000);
    const weekEnd   = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    buckets.push({
      label: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      tenants:  newTenants.filter((t) => t.createdAt >= weekStart && t.createdAt < weekEnd).length,
      bookings: appointments.filter((a) => a.createdAt >= weekStart && a.createdAt < weekEnd).length,
      revenue:  payments.filter((p) => p.createdAt >= weekStart && p.createdAt < weekEnd).reduce((s, p) => s + p.amount, 0),
    });
  }

  return { buckets, totals: {
    tenants: newTenants.length,
    bookings: appointments.length,
    revenue: payments.reduce((s, p) => s + p.amount, 0),
  }};
}

export default async function AnalyticsPage({
  searchParams,
}: { searchParams?: { range?: string } }) {
  const range = searchParams?.range ?? '30d';
  const { buckets, totals } = await getAnalyticsData(range);

  const maxBookings = Math.max(...buckets.map((b) => b.bookings), 1);
  const maxRevenue  = Math.max(...buckets.map((b) => b.revenue), 1);
  const maxTenants  = Math.max(...buckets.map((b) => b.tenants), 1);

  const RANGES = [
    { label: '30 Days', value: '30d' },
    { label: '90 Days', value: '90d' },
    { label: '1 Year',  value: '1y'  },
  ];

  const formatCents = (c: number) => `$${(c / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

  const CHARTS = [
    { title: 'New Tenants', key: 'tenants' as const, color: '#6C63FF', total: totals.tenants, format: (v: number) => v.toString() },
    { title: 'Bookings',    key: 'bookings' as const, color: '#38BDF8', total: totals.bookings, format: (v: number) => v.toLocaleString() },
    { title: 'Revenue',     key: 'revenue' as const,  color: '#10B981', total: totals.revenue, format: formatCents },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#E8E8F4', letterSpacing: '-0.02em' }}>
            Analytics
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#8080A8' }}>
            Platform growth and usage trends
          </p>
        </div>
        <div style={{ display: 'flex', gap: '6px', backgroundColor: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.07)' }}>
          {RANGES.map((r) => (
            <a
              key={r.value}
              href={`?range=${r.value}`}
              style={{
                padding: '7px 16px', borderRadius: '7px', fontSize: '12.5px', fontWeight: 500,
                textDecoration: 'none',
                backgroundColor: range === r.value ? '#6C63FF' : 'transparent',
                color: range === r.value ? 'white' : '#8080A8',
                transition: 'all 0.15s',
              }}
            >
              {r.label}
            </a>
          ))}
        </div>
      </div>

      {/* Chart Cards */}
      {CHARTS.map((chart) => {
        const maxVal = chart.key === 'bookings' ? maxBookings : chart.key === 'revenue' ? maxRevenue : maxTenants;
        return (
          <div
            key={chart.key}
            style={{ backgroundColor: '#0e0e1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '22px 24px', overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#E8E8F4' }}>{chart.title}</h2>
                <p style={{ margin: '3px 0 0', fontSize: '13px', color: chart.color, fontWeight: 600 }}>
                  {chart.format(chart.total)} this period
                </p>
              </div>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: chart.color, boxShadow: `0 0 10px ${chart.color}` }} />
            </div>

            {/* Bar chart */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '100px' }}>
              {buckets.map((bucket, idx) => {
                const val = bucket[chart.key];
                const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
                return (
                  <div
                    key={idx}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}
                    title={`${bucket.label}: ${chart.format(val)}`}
                  >
                    <div
                      style={{
                        width: '100%', borderRadius: '4px 4px 0 0',
                        height: `${Math.max(pct, 3)}%`,
                        background: `linear-gradient(180deg, ${chart.color} 0%, ${chart.color}55 100%)`,
                        boxShadow: pct > 5 ? `0 0 8px ${chart.color}40` : 'none',
                        transition: 'height 0.3s ease',
                        minHeight: '4px',
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* X-axis labels */}
            <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
              {buckets.filter((_, i) => i % Math.ceil(buckets.length / 6) === 0 || i === buckets.length - 1).map((bucket, idx) => (
                <span key={idx} style={{ flex: 1, fontSize: '10px', color: '#50506A', textAlign: 'center' }}>
                  {bucket.label}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
