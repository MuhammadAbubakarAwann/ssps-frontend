'use client';

import React from 'react';

export interface ComparisonPanelData {
  title: string;
  date: string;
  predictedScore: number;
  passProbability: number;
  confidence: number;
  riskLevel: string;
  subject?: string | null;
  subjectPerformance: string;
  subjectScores?: Array<{
    name: string;
    score: number;
  }>;
}

interface ComparisonPanelsProps {
  leftPanel: ComparisonPanelData;
  rightPanel: ComparisonPanelData;
}

function getRiskClasses(riskLevel: string) {
  const normalized = riskLevel.toUpperCase();

  if (normalized === 'HIGH') {
    return {
      wrapper: 'bg-[#FF6369]/15 border-[#FF6369]/30 text-[#FF8A8F]'
    };
  }

  if (normalized === 'MEDIUM') {
    return {
      wrapper: 'bg-[#FFD166]/15 border-[#FFD166]/30 text-[#FFA30C]'
    };
  }

  return {
    wrapper: 'bg-[#12B76A]/15 border-[#12B76A]/30 text-[#3DD68C]'
  };
}

function getPerformanceWidthClass(level: string) {
  const normalized = level.toUpperCase();

  if (normalized === 'HIGH') return 'w-[85%]';
  if (normalized === 'MEDIUM') return 'w-[60%]';
  if (normalized === 'LOW') return 'w-[35%]';

  return 'w-1/2';
}

function ComparisonPanel({ panel }: { panel: ComparisonPanelData }) {
  const riskClasses = getRiskClasses(panel.riskLevel);
  const performanceWidthClass = getPerformanceWidthClass(panel.subjectPerformance);

  return (
    <div className='glass-card p-7'>
      <div className='mb-6 flex items-center justify-between'>
        <h3 className='text-[20px] font-bold text-fg-default'>{panel.title}</h3>
        <span className='text-[11px] text-fg-text'>
          {new Date(panel.date).toLocaleDateString('en-GB')}
        </span>
      </div>

      <div className='mb-4 flex items-center justify-between rounded-[10px] border border-white/10 p-4'>
        <span className='text-[16px] text-fg-text'>Predicted Score</span>
        <span className='text-[28px] font-bold text-fg-default'>{panel.predictedScore.toFixed(1)}</span>
      </div>

      <div className='mb-4 grid grid-cols-2 gap-4'>
        <div className='rounded-[10px] border border-white/10 p-4'>
          <p className='mb-2 text-[16px] text-fg-text'>Pass Probability</p>
          <p className='text-[28px] font-bold text-[#3DD68C]'>{panel.passProbability.toFixed(1)}%</p>
        </div>
        <div className='rounded-[10px] border border-white/10 p-4'>
          <p className='mb-2 text-[16px] text-fg-text'>Confidence</p>
          <p className='text-[28px] font-bold text-[#3DD68C]'>{panel.confidence.toFixed(1)}%</p>
        </div>
      </div>

      <div className='mb-6 rounded-[10px] border border-white/10 p-4'>
        <p className='mb-2 text-[16px] text-fg-text'>Risk Level</p>
        <div className={`mt-2 inline-block rounded-[8px] border px-[13px] py-1 ${riskClasses.wrapper}`}>
          <span className='text-[16px] font-medium'>{panel.riskLevel}</span>
        </div>
      </div>

      <h4 className='mb-4 text-[16px] font-semibold text-fg-default'>Subject Performance</h4>

      <div>
        <div className='mb-2 flex items-center justify-between'>
          <span className='text-[14px] text-fg-default'>{panel.subject ?? 'null'}</span>
          <span className='text-[16px] font-bold text-fg-default'>{panel.subjectPerformance}</span>
        </div>
        <div className='h-[9px] w-full overflow-hidden rounded-[5px] bg-white/10'>
          <div className={`h-full rounded-l-[5px] bg-gradient-to-r from-[#4FA6F8] to-[#7FD0FF] ${performanceWidthClass}`} />
        </div>
      </div>
    </div>
  );
}

export function ComparisonPanels({ leftPanel, rightPanel }: ComparisonPanelsProps) {
  return (
    <div className='mb-10 grid grid-cols-2 gap-10'>
      <ComparisonPanel panel={leftPanel} />
      <ComparisonPanel panel={rightPanel} />
    </div>
  );
}
