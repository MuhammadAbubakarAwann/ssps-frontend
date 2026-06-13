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
    <div className='glass-card glass-card-hover flex items-start justify-between p-6 transition-all duration-300'>
      <div>
        <p className='mb-3 text-sm text-fg-text'>
          {title}
        </p>
        <p className='mb-2 text-[32px] font-bold text-fg-default'>
          {value}
        </p>
        <p style={{ color: changeColor, fontSize: '13px', fontWeight: '500' }}>
          {change} {changeText}
        </p>
      </div>
      <div className='flex h-[60px] w-[60px] flex-shrink-0 items-center justify-center rounded-full bg-white/[0.06]'>
        {icon}
      </div>
    </div>
  );
}
