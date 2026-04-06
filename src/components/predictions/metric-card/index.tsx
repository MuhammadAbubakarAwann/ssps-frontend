import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeText: string;
  icon: React.ReactNode;
  changeColor?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeText,
  icon,
  changeColor = '#447C00'
}: MetricCardProps) {
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid rgba(0, 0, 0, 0.18)',
        borderRadius: '10px',
        padding: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div>
        <p style={{ color: 'rgba(0, 0, 0, 0.7)', fontSize: '14px', marginBottom: '12px' }}>
          {title}
        </p>
        <p style={{ color: '#000000', fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
          {value}
        </p>
        <p style={{ color: changeColor, fontSize: '13px', fontWeight: '500' }}>
          {change} {changeText}
        </p>
      </div>
      <div
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.08)',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        {icon}
      </div>
    </div>
  );
}
