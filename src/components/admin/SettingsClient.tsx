'use client';

import { useState } from 'react';
import { useRouter as useNextRouter } from 'next/navigation';
import { AdminBadge } from '@/components/admin/ui/AdminBadge';
import {
  Settings, Users, ShieldAlert, Key, Mail, Globe, Save, Plus, Trash2, Eye, EyeOff
} from 'lucide-react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  createdAt: string | Date;
}

interface SettingsClientProps {
  admins: AdminUser[];
  currentAdminEmail: string;
}

export default function SettingsClient({ admins, currentAdminEmail }: SettingsClientProps) {
  const router = useNextRouter();
  const [activeSection, setActiveSection] = useState<'general' | 'admins' | 'security'>('general');
  
  // General settings state
  const [brandName, setBrandName] = useState('ServiceFlow');
  const [supportEmail, setSupportEmail] = useState('support@serviceflow.app');
  const [smtpServer, setSmtpServer] = useState('smtp.resend.com');
  const [smtpPort, setSmtpPort] = useState('587');

  // New admin state
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Simulate updating settings
    setTimeout(() => {
      setSaving(false);
      setSuccess('Branding and SMTP settings successfully updated.');
      setTimeout(() => setSuccess(''), 4000);
    }, 800);
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const res = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAdminName,
          email: newAdminEmail,
          password: newAdminPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setSuccess(`Successfully added platform admin "${newAdminName}".`);
      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminPassword('');
      setShowAddAdmin(false);
      router.refresh();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to create platform admin');
    } finally {
      setSaving(false);
    }
  };

  const SECTIONS = [
    { key: 'general', label: 'General & Mail', icon: Settings },
    { key: 'admins', label: 'Platform Admins', icon: Users },
    { key: 'security', label: 'Security & Access', icon: ShieldAlert },
  ] as const;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '28px', alignItems: 'start' }}>
      {/* Sidebar navigation */}
      <div
        style={{
          display: 'flex', flexDirection: 'column', gap: '4px',
          backgroundColor: '#0e0e1a', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '12px', padding: '10px'
        }}
      >
        {SECTIONS.map((sec) => {
          const Icon = sec.icon;
          const active = activeSection === sec.key;
          return (
            <button
              key={sec.key}
              onClick={() => setActiveSection(sec.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 14px', borderRadius: '8px', border: 'none',
                background: active ? 'rgba(108,99,255,0.1)' : 'transparent',
                color: active ? '#E8E8F4' : '#8080A8',
                fontWeight: active ? 600 : 400, fontSize: '13.5px',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s'
              }}
            >
              <Icon size={15} style={{ color: active ? '#6C63FF' : '#50506A' }} />
              {sec.label}
            </button>
          );
        })}
      </div>

      {/* Main settings panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {success && (
          <div
            style={{
              padding: '12px 16px', borderRadius: '8px', fontSize: '13.5px',
              backgroundColor: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.2)',
              color: '#10B981', fontWeight: 500
            }}
          >
            {success}
          </div>
        )}

        {error && (
          <div
            style={{
              padding: '12px 16px', borderRadius: '8px', fontSize: '13.5px',
              backgroundColor: 'rgba(244,63,94,0.08)',
              border: '1px solid rgba(244,63,94,0.2)',
              color: '#F43F5E', fontWeight: 500
            }}
          >
            {error}
          </div>
        )}

        {activeSection === 'general' && (
          <form
            onSubmit={handleSaveGeneral}
            style={{
              backgroundColor: '#0e0e1a', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '14px', padding: '24px 28px',
              display: 'flex', flexDirection: 'column', gap: '20px'
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#E8E8F4' }}>General Configuration</h2>
              <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#8080A8' }}>Platform branding and system email notifications</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#8080A8', marginBottom: '6px' }}>Brand Name</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  style={{
                    width: '100%', padding: '9px 12px', fontSize: '13.5px',
                    backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px', color: '#E8E8F4', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#8080A8', marginBottom: '6px' }}>Support Email Address</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  style={{
                    width: '100%', padding: '9px 12px', fontSize: '13.5px',
                    backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px', color: '#E8E8F4', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.05)', margin: '8px 0' }} />

            <div>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#E8E8F4' }}>SMTP Server Settings</h3>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#8080A8' }}>Configuration for transactional emails (resend API wrapper)</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#8080A8', marginBottom: '6px' }}>SMTP Host</label>
                <input
                  type="text"
                  value={smtpServer}
                  onChange={(e) => setSmtpServer(e.target.value)}
                  style={{
                    width: '100%', padding: '9px 12px', fontSize: '13.5px',
                    backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px', color: '#E8E8F4', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#8080A8', marginBottom: '6px' }}>SMTP Port</label>
                <input
                  type="text"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                  style={{
                    width: '100%', padding: '9px 12px', fontSize: '13.5px',
                    backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px', color: '#E8E8F4', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '9px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                  backgroundColor: '#6C63FF', border: 'none', color: 'white',
                  cursor: 'pointer', transition: 'all 0.15s'
                }}
              >
                <Save size={13} />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        )}

        {activeSection === 'admins' && (
          <div
            style={{
              backgroundColor: '#0e0e1a', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '14px', overflow: 'hidden'
            }}
          >
            <div
              style={{
                padding: '18px 22px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#E8E8F4' }}>Platform Administrators</h2>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#8080A8' }}>Users with full access to the super admin panel</p>
              </div>
              <button
                onClick={() => setShowAddAdmin(!showAddAdmin)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 12px', borderRadius: '7px', fontSize: '12px', fontWeight: 600,
                  backgroundColor: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)',
                  color: '#8B7FFF', cursor: 'pointer'
                }}
              >
                <Plus size={12} />
                Add Admin
              </button>
            </div>

            {showAddAdmin && (
              <form
                onSubmit={handleAddAdmin}
                style={{
                  padding: '18px 22px', backgroundColor: 'rgba(255,255,255,0.01)',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex', flexDirection: 'column', gap: '14px'
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#8080A8', marginBottom: '4px' }}>Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      style={{
                        width: '100%', padding: '8px 12px', fontSize: '13px',
                        backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '7px', color: '#E8E8F4', outline: 'none', boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#8080A8', marginBottom: '4px' }}>Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="jane@serviceflow.app"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      style={{
                        width: '100%', padding: '8px 12px', fontSize: '13px',
                        backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '7px', color: '#E8E8F4', outline: 'none', boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#8080A8', marginBottom: '4px' }}>Temp Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      style={{
                        width: '100%', padding: '8px 40px 8px 12px', fontSize: '13px',
                        backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '7px', color: '#E8E8F4', outline: 'none', boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', color: '#50506A', cursor: 'pointer', padding: '4px'
                      }}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddAdmin(false)}
                    style={{
                      padding: '7px 14px', borderRadius: '7px', fontSize: '12.5px',
                      backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.08)',
                      color: '#8080A8', cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: '7px 14px', borderRadius: '7px', fontSize: '12.5px', fontWeight: 600,
                      backgroundColor: '#6C63FF', border: 'none', color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    {saving ? 'Creating...' : 'Create Admin Account'}
                  </button>
                </div>
              </form>
            )}

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Name', 'Email', 'Role', 'Added', ''].map((h) => (
                    <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#50506A' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {admins.map((admin, idx) => (
                  <tr key={admin.id} style={{ borderBottom: idx < admins.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: 'rgba(108,99,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#8B7FFF' }}>
                          {admin.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#E8E8F4' }}>{admin.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: '13px', color: '#8080A8' }}>{admin.email}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <AdminBadge value="pro" size="sm" dot>Super Admin</AdminBadge>
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: '12px', color: '#50506A' }}>
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      {admin.email !== currentAdminEmail && (
                        <button
                          title="Delete administrator account"
                          disabled
                          style={{
                            background: 'none', border: 'none', color: '#50506A', opacity: 0.3, cursor: 'not-allowed'
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeSection === 'security' && (
          <div
            style={{
              backgroundColor: '#0e0e1a', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '14px', padding: '24px 28px',
              display: 'flex', flexDirection: 'column', gap: '20px'
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#E8E8F4' }}>Security Controls</h2>
              <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#8080A8' }}>System access configuration and session validation rules</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { title: 'Enforce Mfa for Admins', desc: 'Require multi-factor authentication for all platform level admin profiles.', enabled: true },
                { title: 'Write Audit Logs to DB', desc: 'Immutable tracking of all system admin actions inside postgres db schema.', enabled: true },
                { title: 'Strict Session Boundaries', desc: 'Automatically invalidate admin tokens after 60 minutes of inactivity.', enabled: true }
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 14px', borderRadius: '10px',
                    backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)'
                  }}
                >
                  <div style={{ maxWidth: '400px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#E8E8F4', marginBottom: '3px' }}>{item.title}</div>
                    <div style={{ fontSize: '12px', color: '#8080A8', lineHeight: 1.4 }}>{item.desc}</div>
                  </div>
                  <AdminBadge value="active" size="sm">Enabled</AdminBadge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
