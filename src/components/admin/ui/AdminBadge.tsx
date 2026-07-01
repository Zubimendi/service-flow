import React from 'react';

type Variant = 'active' | 'suspended' | 'trialing' | 'starter' | 'pro' | 'enterprise' | 'pending' | 'paid' | 'cancelled' | 'past_due' | 'info' | 'default';

const VARIANT_STYLES: Record<Variant, { color: string; bg: string; shadow: string; label?: string }> = {
  active:     { color: '#10B981', bg: 'rgba(16,185,129,0.10)',  shadow: '0 0 8px rgba(16,185,129,0.18)', label: 'Active' },
  suspended:  { color: '#F43F5E', bg: 'rgba(244,63,94,0.10)',   shadow: '0 0 8px rgba(244,63,94,0.18)',  label: 'Suspended' },
  trialing:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.10)',  shadow: '0 0 8px rgba(245,158,11,0.18)', label: 'Trialing' },
  starter:    { color: '#38BDF8', bg: 'rgba(56,189,248,0.10)',  shadow: '0 0 8px rgba(56,189,248,0.18)', label: 'Starter' },
  pro:        { color: '#8B7FFF', bg: 'rgba(108,99,255,0.12)',  shadow: '0 0 8px rgba(108,99,255,0.22)', label: 'Pro' },
  enterprise: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  shadow: '0 0 8px rgba(245,158,11,0.22)', label: 'Enterprise' },
  pending:    { color: '#F59E0B', bg: 'rgba(245,158,11,0.10)',  shadow: 'none', label: 'Pending' },
  paid:       { color: '#10B981', bg: 'rgba(16,185,129,0.10)',  shadow: 'none', label: 'Paid' },
  cancelled:  { color: '#F43F5E', bg: 'rgba(244,63,94,0.10)',   shadow: 'none', label: 'Cancelled' },
  past_due:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.10)',  shadow: 'none', label: 'Past Due' },
  info:       { color: '#38BDF8', bg: 'rgba(56,189,248,0.10)',  shadow: 'none' },
  default:    { color: '#8080A8', bg: 'rgba(128,128,168,0.10)', shadow: 'none' },
};

interface AdminBadgeProps {
  variant?: Variant;
  /** Auto-map a raw string value to the correct variant */
  value?: string;
  children?: React.ReactNode;
  size?: 'sm' | 'md';
  dot?: boolean;
}

function mapValueToVariant(value: string): Variant {
  const v = value.toLowerCase().replace(/[ -]/g, '_');
  if (v in VARIANT_STYLES) return v as Variant;
  return 'default';
}

export function AdminBadge({ variant, value, children, size = 'md', dot = true }: AdminBadgeProps) {
  const resolvedVariant = variant ?? (value ? mapValueToVariant(value) : 'default');
  const style = VARIANT_STYLES[resolvedVariant];
  const label = children ?? style.label ?? value;

  const padX = size === 'sm' ? '6px' : '10px';
  const padY = size === 'sm' ? '2px' : '4px';
  const fs   = size === 'sm' ? '10px' : '11.5px';

  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        paddingLeft: padX, paddingRight: padX, paddingTop: padY, paddingBottom: padY,
        borderRadius: '100px', fontSize: fs, fontWeight: 600, letterSpacing: '0.01em',
        color: style.color, backgroundColor: style.bg,
        boxShadow: style.shadow, border: `1px solid ${style.color}22`,
        whiteSpace: 'nowrap',
      }}
    >
      {dot && (
        <span
          style={{
            width: size === 'sm' ? '5px' : '6px',
            height: size === 'sm' ? '5px' : '6px',
            borderRadius: '50%', backgroundColor: style.color, flexShrink: 0,
          }}
        />
      )}
      {label}
    </span>
  );
}
