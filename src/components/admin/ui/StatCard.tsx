'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  delta?: number;       // percentage change, positive = up
  deltaLabel?: string;
  iconNode: React.ReactNode;
  iconColor?: string;
  iconBg?: string;
  accent?: string;
}

export function StatCard({
  title, value, subtitle, delta, deltaLabel = 'vs last month',
  iconNode, iconBg = 'rgba(108,99,255,0.12)',
  accent = '#6C63FF',
}: StatCardProps) {
  const isPositive = delta !== undefined && delta > 0;
  const isNegative = delta !== undefined && delta < 0;

  return (
    <div
      style={{
        backgroundColor: '#0e0e1a',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '14px',
        padding: '20px 22px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = `${accent}30`;
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${accent}0A`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      {/* Background gradient bleed */}
      <div
        style={{
          position: 'absolute', top: '-20px', right: '-20px',
          width: '80px', height: '80px', borderRadius: '50%',
          backgroundColor: iconBg, filter: 'blur(24px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <p style={{ fontSize: '12px', fontWeight: 500, color: '#8080A8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {title}
        </p>
        <div
          style={{
            width: '36px', height: '36px', borderRadius: '10px',
            backgroundColor: iconBg, display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          {iconNode}
        </div>
      </div>

      <p style={{ fontSize: '28px', fontWeight: 700, color: '#E8E8F4', margin: '0 0 6px 0', lineHeight: 1 }}>
        {value}
      </p>

      {subtitle && (
        <p style={{ fontSize: '12px', color: '#8080A8', margin: 0 }}>{subtitle}</p>
      )}

      {delta !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '10px' }}>
          {isPositive && <TrendingUp size={13} color="#10B981" />}
          {isNegative && <TrendingDown size={13} color="#F43F5E" />}
          {!isPositive && !isNegative && <Minus size={13} color="#8080A8" />}
          <span
            style={{
              fontSize: '12px', fontWeight: 600,
              color: isPositive ? '#10B981' : isNegative ? '#F43F5E' : '#8080A8',
            }}
          >
            {isPositive ? '+' : ''}{delta.toFixed(1)}%
          </span>
          <span style={{ fontSize: '12px', color: '#50506A' }}>{deltaLabel}</span>
        </div>
      )}
    </div>
  );
}
