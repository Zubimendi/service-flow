'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Shield, LayoutDashboard, Users, CreditCard, Flag,
  FileText, BarChart2, Settings, LogOut, ChevronRight, Zap,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV: NavSection[] = [
  {
    title: 'OVERVIEW',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      { label: 'Tenants', href: '/admin/tenants', icon: Users },
      { label: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
    ],
  },
  {
    title: 'PLATFORM',
    items: [
      { label: 'Feature Flags', href: '/admin/feature-flags', icon: Flag },
      { label: 'Analytics', href: '/admin/analytics', icon: BarChart2 },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { label: 'Audit Log', href: '/admin/audit-log', icon: FileText },
      { label: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

interface AdminSidebarProps {
  adminName?: string;
  adminEmail?: string;
}

export default function AdminSidebar({ adminName, adminEmail }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href));

  return (
    <aside
      style={{
        width: '280px',
        minWidth: '280px',
        backgroundColor: '#080811',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '24px 20px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div
            style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(108,99,255,0.45)',
              flexShrink: 0,
            }}
          >
            <Shield size={18} color="white" />
          </div>
          <div>
            <div style={{ color: '#E8E8F4', fontWeight: 700, fontSize: '15px', lineHeight: 1.2 }}>
              ServiceFlow
            </div>
            <div
              style={{
                fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em',
                textTransform: 'uppercase',
                background: 'linear-gradient(90deg, #6C63FF, #A78BFA)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}
            >
              Super Admin
            </div>
          </div>
        </div>

        {/* Health indicator */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 10px', borderRadius: '6px',
            backgroundColor: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.15)',
            width: 'fit-content',
          }}
        >
          <div
            style={{
              width: '6px', height: '6px', borderRadius: '50%',
              backgroundColor: '#10B981',
              boxShadow: '0 0 6px rgba(16,185,129,0.8)',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
          <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 500 }}>
            Platform Healthy
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
        {NAV.map((section) => (
          <div key={section.title} style={{ marginBottom: '24px' }}>
            <div
              style={{
                fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em',
                color: '#50506A', textTransform: 'uppercase',
                padding: '0 8px', marginBottom: '6px',
              }}
            >
              {section.title}
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {section.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '9px 12px', borderRadius: '8px', textDecoration: 'none',
                        fontSize: '13.5px', fontWeight: active ? 600 : 400,
                        color: active ? '#E8E8F4' : '#8080A8',
                        backgroundColor: active ? 'rgba(108,99,255,0.12)' : 'transparent',
                        border: active ? '1px solid rgba(108,99,255,0.2)' : '1px solid transparent',
                        transition: 'all 0.15s ease',
                        position: 'relative',
                        boxShadow: active ? '0 0 12px rgba(108,99,255,0.08)' : 'none',
                      }}
                    >
                      {active && (
                        <div
                          style={{
                            position: 'absolute', left: 0, top: '20%', bottom: '20%',
                            width: '3px', borderRadius: '0 3px 3px 0',
                            backgroundColor: '#6C63FF',
                            boxShadow: '0 0 8px rgba(108,99,255,0.8)',
                          }}
                        />
                      )}
                      <Icon
                        size={15}
                        style={{ color: active ? '#6C63FF' : '#50506A', flexShrink: 0 }}
                      />
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {active && (
                        <ChevronRight size={12} style={{ color: '#6C63FF', opacity: 0.6 }} />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Admin Profile Footer */}
      <div
        style={{
          padding: '12px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px', borderRadius: '10px',
            backgroundColor: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div
            style={{
              width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #6C63FF, #8B5CF6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 700, color: 'white',
            }}
          >
            {adminName ? adminName.charAt(0).toUpperCase() : 'A'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#E8E8F4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {adminName ?? 'Platform Admin'}
            </div>
            <div
              style={{
                fontSize: '11px', color: '#8080A8',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}
            >
              {adminEmail ?? ''}
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            title="Sign out"
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
              borderRadius: '6px', color: '#50506A', flexShrink: 0,
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#F43F5E')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#50506A')}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 6px rgba(16,185,129,0.8); }
          50% { opacity: 0.6; box-shadow: 0 0 12px rgba(16,185,129,0.4); }
        }
      `}</style>
    </aside>
  );
}
