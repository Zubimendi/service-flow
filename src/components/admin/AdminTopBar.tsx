'use client';

import { usePathname } from 'next/navigation';
import { Bell, ChevronRight } from 'lucide-react';

const ROUTE_LABELS: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/tenants': 'Tenants',
  '/admin/subscriptions': 'Subscriptions',
  '/admin/feature-flags': 'Feature Flags',
  '/admin/analytics': 'Analytics',
  '/admin/audit-log': 'Audit Log',
  '/admin/settings': 'Settings',
};

interface AdminTopBarProps {
  adminName?: string;
  adminEmail?: string;
}

export default function AdminTopBar({ adminName, adminEmail }: AdminTopBarProps) {
  const pathname = usePathname();

  // Determine breadcrumbs
  const segments = pathname.split('/').filter(Boolean);
  const currentSection = ROUTE_LABELS[pathname] ??
    (segments.length > 2 ? `${ROUTE_LABELS[`/${segments.slice(0, 2).join('/')}`] ?? 'Admin'} › Detail` : 'Admin');

  // For tenant detail pages
  const isTenantDetail = pathname.match(/^\/admin\/tenants\/.+$/);

  return (
    <header
      style={{
        height: '64px', flexShrink: 0,
        backgroundColor: '#0a0a14',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center',
        padding: '0 24px', gap: '16px',
        backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 30,
      }}
    >
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
        <span style={{ fontSize: '13px', color: '#50506A' }}>Admin</span>
        <ChevronRight size={12} style={{ color: '#50506A' }} />
        {isTenantDetail ? (
          <>
            <span style={{ fontSize: '13px', color: '#50506A' }}>Tenants</span>
            <ChevronRight size={12} style={{ color: '#50506A' }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#E8E8F4' }}>Detail</span>
          </>
        ) : (
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#E8E8F4' }}>
            {ROUTE_LABELS[pathname] ?? 'Overview'}
          </span>
        )}
      </div>

      {/* Right side actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Notification bell */}
        <button
          style={{
            position: 'relative', background: 'none', border: 'none',
            cursor: 'pointer', padding: '8px',
            color: '#8080A8', borderRadius: '8px',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#E8E8F4';
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#8080A8';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Bell size={16} />
          <span
            style={{
              position: 'absolute', top: '6px', right: '6px',
              width: '7px', height: '7px', borderRadius: '50%',
              backgroundColor: '#F43F5E',
              boxShadow: '0 0 6px rgba(244,63,94,0.8)',
              border: '1.5px solid #0a0a14',
            }}
          />
        </button>

        {/* Divider */}
        <div style={{ width: '1px', height: '28px', backgroundColor: 'rgba(255,255,255,0.07)' }} />

        {/* Admin Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#E8E8F4', lineHeight: 1.2 }}>
              {adminName ?? 'Admin'}
            </div>
            <div style={{ fontSize: '11px', color: '#50506A', lineHeight: 1.2 }}>
              Super Admin
            </div>
          </div>
          <div
            style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #6C63FF, #8B5CF6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 700, color: 'white',
              boxShadow: '0 0 0 2px rgba(108,99,255,0.3)',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            {adminName ? adminName.charAt(0).toUpperCase() : 'A'}
          </div>
        </div>
      </div>
    </header>
  );
}
