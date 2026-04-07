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
  leftPanel?: ComparisonPanelData;
  rightPanel?: ComparisonPanelData;
}

const fallbackPanel: ComparisonPanelData = {
  title: 'Latest (Today)',
  date: '2025-01-05T00:00:00.000Z',
  predictedScore: 76.8,
  passProbability: 92,
  confidence: 92,
  riskLevel: 'LOW',
  subject: 'Mathematics',
  subjectPerformance: 'HIGH'
};

function getRiskClasses(riskLevel: string) {
  const normalized = riskLevel.toUpperCase();

  if (normalized === 'HIGH') {
    return {
      wrapper: 'bg-red-500/15 border-red-500 text-red-700'
    };
  }

  if (normalized === 'MEDIUM') {
    return {
      wrapper: 'bg-amber-400/20 border-amber-400 text-amber-700'
    };
  }

  return {
    wrapper: 'bg-lime-400/20 border-lime-400 text-emerald-600'
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
    <div className='rounded-[10px] border  bg-white p-7 shadow-[1px_1px_3px_rgba(0,0,0,0.25),-1px_-1px_3px_rgba(0,0,0,0.1)]'>
      <div className='mb-6 flex items-center justify-between'>
        <h3 className='text-[20px] font-bold text-black'>{panel.title}</h3>
        <span className='text-[11px] text-black/60'>
          {new Date(panel.date).toLocaleDateString('en-GB')}
        </span>
      </div>

      <div className='mb-4 flex items-center justify-between rounded-[10px] border border-black/35 p-4'>
        <span className='text-[16px] text-black/60'>Predicted Score</span>
        <span className='text-[28px] font-bold text-black'>{panel.predictedScore.toFixed(1)}</span>
      </div>

      <div className='mb-4 grid grid-cols-2 gap-4'>
        <div className='rounded-[10px] border border-black/35 p-4'>
          <p className='mb-2 text-[16px] text-black/60'>Pass Probability</p>
          <p className='text-[28px] font-bold text-green-600'>{panel.passProbability.toFixed(1)}%</p>
        </div>
        <div className='rounded-[10px] border border-black/35 p-4'>
          <p className='mb-2 text-[16px] text-black/60'>Confidence</p>
          <p className='text-[28px] font-bold text-green-600'>{panel.confidence.toFixed(1)}%</p>
        </div>
      </div>

      <div className='mb-6 rounded-[10px] border border-black/35 p-4'>
        <p className='mb-2 text-[16px] text-black/60'>Risk Level</p>
        <div className={`mt-2 inline-block rounded-[8px] border px-[13px] py-1 ${riskClasses.wrapper}`}>
          <span className='text-[16px] font-medium'>{panel.riskLevel}</span>
        </div>
      </div>

      <h4 className='mb-4 text-[16px] font-semibold text-black'>Subject Performance</h4>

      <div>
        <div className='mb-2 flex items-center justify-between'>
          <span className='text-[14px] text-black'>{panel.subject ?? 'null'}</span>
          <span className='text-[16px] font-bold text-black'>{panel.subjectPerformance}</span>
        </div>
        <div className='h-[9px] w-full overflow-hidden rounded-[5px] bg-[#C6C6C6]'>
          <div className={`h-full rounded-l-[5px] bg-gradient-to-r from-[#1072EB] to-[#17CBEB] ${performanceWidthClass}`} />
        </div>
      </div>
    </div>
  );
}

export function ComparisonPanels({ leftPanel, rightPanel }: ComparisonPanelsProps) {
  const left = leftPanel ?? fallbackPanel;
  const right = rightPanel ?? fallbackPanel;

  return (
    <div className='mb-10 grid grid-cols-2 gap-10'>
      <ComparisonPanel panel={left} />
      <ComparisonPanel panel={right} />
    </div>
  );
}
