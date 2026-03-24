import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: number;
  style?: React.CSSProperties;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) {
  return (
    <div style={{
      width, height, borderRadius,
      background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      ...style,
    }} />
  );
}

export function CardSkeleton() {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
      padding: 20,
    }}>
      <Skeleton height={14} width="60%" />
      <Skeleton height={36} style={{ marginTop: 12 }} />
      <Skeleton height={12} width="80%" style={{ marginTop: 8 }} />
      <Skeleton height={12} width="50%" style={{ marginTop: 6 }} />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{
          display: 'flex', gap: 16, padding: '12px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          alignItems: 'center'
        }}>
          <Skeleton width={40} height={40} borderRadius={50} />
          <div style={{ flex: 1 }}>
            <Skeleton height={12} width="40%" />
            <Skeleton height={10} width="60%" style={{ marginTop: 6 }} />
          </div>
          <Skeleton height={12} width={80} />
          <Skeleton height={30} width={90} borderRadius={8} />
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          padding: 20,
        }}>
          <Skeleton height={12} width="60%" />
          <Skeleton height={36} width="50%" style={{ marginTop: 12 }} />
          <Skeleton height={10} width="40%" style={{ marginTop: 8 }} />
        </div>
      ))}
    </div>
  );
}
