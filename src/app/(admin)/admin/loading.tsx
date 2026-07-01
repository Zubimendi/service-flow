import React from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminLoading() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      width: '100%',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
      }}>
        <Loader2 
          size={32} 
          color="#6C63FF" 
          style={{ animation: 'spin 1s linear infinite' }} 
        />
        <div style={{
          fontSize: '14px',
          fontWeight: 500,
          color: '#8080A8',
          letterSpacing: '0.02em'
        }}>
          Loading dashboard data...
        </div>
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
