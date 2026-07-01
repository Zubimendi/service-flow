'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { AdminModal } from './AdminModal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmText?: string; // if set, user must type this to confirm
  danger?: boolean;
}

export function ConfirmModal({
  isOpen, onClose, onConfirm, title, description,
  confirmLabel = 'Confirm', confirmText, danger = false,
}: ConfirmModalProps) {
  const [typed, setTyped] = useState('');
  const [loading, setLoading] = useState(false);

  const canConfirm = !confirmText || typed === confirmText;

  const handleConfirm = async () => {
    if (!canConfirm) return;
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
      setTyped('');
    }
  };

  return (
    <AdminModal isOpen={isOpen} onClose={onClose} title={title} maxWidth="420px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {danger && (
          <div
            style={{
              display: 'flex', alignItems: 'flex-start', gap: '12px',
              padding: '12px 14px', borderRadius: '10px',
              backgroundColor: 'rgba(244,63,94,0.08)',
              border: '1px solid rgba(244,63,94,0.2)',
            }}
          >
            <AlertTriangle size={16} color="#F43F5E" style={{ flexShrink: 0, marginTop: '1px' }} />
            <p style={{ margin: 0, fontSize: '13px', color: '#F43F5E', lineHeight: 1.5 }}>
              {description}
            </p>
          </div>
        )}

        {!danger && (
          <p style={{ margin: 0, fontSize: '13.5px', color: '#8080A8', lineHeight: 1.6 }}>{description}</p>
        )}

        {confirmText && (
          <div>
            <label
              style={{ fontSize: '12px', color: '#8080A8', display: 'block', marginBottom: '6px' }}
            >
              Type <strong style={{ color: '#F43F5E' }}>{confirmText}</strong> to confirm
            </label>
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={confirmText}
              style={{
                width: '100%', padding: '9px 12px', fontSize: '13px',
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: `1px solid ${typed === confirmText ? 'rgba(244,63,94,0.5)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '8px', color: '#E8E8F4', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '9px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#8080A8', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm || loading}
            style={{
              padding: '9px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
              backgroundColor: danger && canConfirm ? '#F43F5E' : canConfirm ? '#6C63FF' : 'rgba(255,255,255,0.05)',
              border: 'none', color: canConfirm ? '#fff' : '#50506A',
              cursor: canConfirm && !loading ? 'pointer' : 'not-allowed',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.15s',
            }}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </AdminModal>
  );
}
