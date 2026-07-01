'use client';

import { useState, useEffect } from 'react';
import { AdminBadge } from '@/components/admin/ui/AdminBadge';
import { AdminModal } from '@/components/admin/ui/AdminModal';
import { Plus, Zap, ZapOff, Trash2, Globe } from 'lucide-react';

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  updatedAt: string;
  updatedBy: string;
}

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newFlag, setNewFlag] = useState({ key: '', name: '', description: '', enabled: false });
  const [saving, setSaving] = useState(false);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  const fetchFlags = async () => {
    const res = await fetch('/api/admin/feature-flags');
    const data = await res.json();
    setFlags(data.flags ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchFlags(); }, []);

  const handleToggle = async (flag: FeatureFlag) => {
    setTogglingKey(flag.key);
    await fetch(`/api/admin/feature-flags/${flag.key}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !flag.enabled }),
    });
    await fetchFlags();
    setTogglingKey(null);
  };

  const handleCreate = async () => {
    setSaving(true);
    await fetch('/api/admin/feature-flags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFlag),
    });
    setNewFlag({ key: '', name: '', description: '', enabled: false });
    setShowCreate(false);
    await fetchFlags();
    setSaving(false);
  };

  const handleDelete = async (key: string) => {
    await fetch(`/api/admin/feature-flags/${key}`, { method: 'DELETE' });
    await fetchFlags();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#E8E8F4', letterSpacing: '-0.02em' }}>
            Feature Flags
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#8080A8' }}>
            Control global feature rollout across all tenants
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
            background: 'linear-gradient(135deg, #6C63FF, #8B5CF6)',
            border: 'none', color: 'white', cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(108,99,255,0.35)',
          }}
        >
          <Plus size={14} /> New Flag
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#50506A' }}>
          <Zap size={24} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
          <p style={{ margin: 0 }}>Loading flags...</p>
        </div>
      ) : flags.length === 0 ? (
        <div
          style={{
            textAlign: 'center', padding: '60px',
            backgroundColor: '#0e0e1a', borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.06)', color: '#50506A',
          }}
        >
          <Zap size={28} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>No feature flags yet</p>
          <p style={{ margin: '6px 0 0', fontSize: '13px' }}>Create your first global feature flag to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '14px' }}>
          {flags.map((flag) => (
            <div
              key={flag.key}
              style={{
                backgroundColor: '#0e0e1a', borderRadius: '14px', padding: '20px 22px',
                border: `1px solid ${flag.enabled ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}`,
                boxShadow: flag.enabled ? '0 0 20px rgba(16,185,129,0.06)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '7px', backgroundColor: flag.enabled ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {flag.enabled
                        ? <Zap size={13} color="#10B981" />
                        : <ZapOff size={13} color="#50506A" />
                      }
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#E8E8F4' }}>
                      {flag.name || flag.key}
                    </span>
                  </div>
                  <code style={{ fontSize: '11px', color: '#50506A', backgroundColor: 'rgba(255,255,255,0.04)', padding: '2px 7px', borderRadius: '4px' }}>
                    {flag.key}
                  </code>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0, alignItems: 'center' }}>
                  <AdminBadge value={flag.enabled ? 'active' : 'default'} size="sm" dot>
                    {flag.enabled ? 'On' : 'Off'}
                  </AdminBadge>
                </div>
              </div>

              {flag.description && (
                <p style={{ margin: '0 0 14px', fontSize: '12.5px', color: '#8080A8', lineHeight: 1.5 }}>
                  {flag.description}
                </p>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', color: '#50506A' }}>
                  Updated {new Date(flag.updatedAt).toLocaleDateString()}
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => handleDelete(flag.key)}
                    style={{ background: 'none', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '7px', padding: '5px 8px', cursor: 'pointer', color: '#F43F5E', display: 'flex', alignItems: 'center' }}
                  >
                    <Trash2 size={12} />
                  </button>
                  <button
                    onClick={() => handleToggle(flag)}
                    disabled={togglingKey === flag.key}
                    style={{
                      padding: '6px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 600, border: 'none',
                      backgroundColor: flag.enabled ? 'rgba(244,63,94,0.12)' : 'rgba(16,185,129,0.12)',
                      color: flag.enabled ? '#F43F5E' : '#10B981',
                      cursor: togglingKey === flag.key ? 'wait' : 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {togglingKey === flag.key ? '...' : flag.enabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Flag Modal */}
      <AdminModal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Feature Flag" description="New flags are global by default. Per-tenant overrides can be set from the tenant detail page.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[
            { id: 'flag-key', label: 'Key (snake_case)', name: 'key', placeholder: 'enable_new_booking_flow', hint: 'Lowercase letters and underscores only' },
            { id: 'flag-name', label: 'Display Name', name: 'name', placeholder: 'New Booking Flow' },
            { id: 'flag-desc', label: 'Description (optional)', name: 'description', placeholder: 'What does this flag control?' },
          ].map((field) => (
            <div key={field.id}>
              <label style={{ fontSize: '12px', fontWeight: 500, color: '#8080A8', display: 'block', marginBottom: '5px' }}>
                {field.label}
              </label>
              <input
                id={field.id}
                type="text"
                placeholder={field.placeholder}
                value={(newFlag as any)[field.name]}
                onChange={(e) => setNewFlag((f) => ({ ...f, [field.name]: e.target.value }))}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', fontSize: '13px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#E8E8F4', outline: 'none', boxSizing: 'border-box' }}
              />
              {field.hint && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#50506A' }}>{field.hint}</p>}
            </div>
          ))}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={newFlag.enabled} onChange={(e) => setNewFlag((f) => ({ ...f, enabled: e.target.checked }))} style={{ accentColor: '#6C63FF' }} />
            <span style={{ fontSize: '13px', color: '#8080A8' }}>Enable immediately</span>
          </label>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '4px' }}>
            <button onClick={() => setShowCreate(false)} style={{ padding: '9px 18px', borderRadius: '8px', fontSize: '13px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#8080A8', cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleCreate} disabled={!newFlag.key || !newFlag.name || saving} style={{ padding: '9px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, backgroundColor: newFlag.key && newFlag.name ? '#6C63FF' : 'rgba(108,99,255,0.3)', border: 'none', color: 'white', cursor: newFlag.key && newFlag.name ? 'pointer' : 'not-allowed' }}>
              {saving ? 'Creating...' : 'Create Flag'}
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
