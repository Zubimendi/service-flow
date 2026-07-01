'use client';

import { useRouter } from 'next/navigation';
import { Eye, LogOut } from 'lucide-react';

interface ImpersonationBannerProps {
  tenantName: string;
  tenantId: string;
}

export function ImpersonationBanner({ tenantName, tenantId }: ImpersonationBannerProps) {
  const router = useRouter();

  const handleExit = async () => {
    await fetch(`/api/admin/tenants/${tenantId}/impersonate`, { method: 'DELETE' });
    router.push('/admin/tenants');
  };

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999,
        height: '44px',
        background: 'linear-gradient(90deg, #6C63FF 0%, #8B5CF6 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
        boxShadow: '0 4px 20px rgba(108,99,255,0.4)',
        animation: 'slideDown 0.3s ease',
      }}
    >
      <Eye size={14} color="rgba(255,255,255,0.8)" />
      <span style={{ fontSize: '13px', color: 'white', fontWeight: 500 }}>
        You are impersonating <strong>{tenantName}</strong>
      </span>
      <button
        onClick={handleExit}
        style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
          backgroundColor: 'rgba(255,255,255,0.2)',
          border: '1px solid rgba(255,255,255,0.3)',
          color: 'white', cursor: 'pointer', transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)')}
      >
        <LogOut size={11} />
        Exit
      </button>
      <style>{`
        @keyframes slideDown { from { transform: translateY(-100%) } to { transform: translateY(0) } }
      `}</style>
    </div>
  );
}
