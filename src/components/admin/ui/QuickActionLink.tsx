'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface QuickActionLinkProps {
  label: string;
  href: string;
  iconNode: React.ReactNode;
  color: string;
}

export function QuickActionLink({ label, href, iconNode, color }: QuickActionLinkProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={href}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '14px 16px', borderRadius: '10px', textDecoration: 'none',
        backgroundColor: isHovered ? `${color}08` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${isHovered ? `${color}35` : 'rgba(255,255,255,0.06)'}`,
        transition: 'all 0.15s',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        style={{
          width: '32px', height: '32px', borderRadius: '8px',
          backgroundColor: `${color}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}
      >
        {iconNode}
      </div>
      <span style={{ fontSize: '13px', fontWeight: 500, color: '#E8E8F4' }}>
        {label}
      </span>
    </Link>
  );
}
