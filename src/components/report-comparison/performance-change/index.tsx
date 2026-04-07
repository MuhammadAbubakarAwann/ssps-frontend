'use client';

import React from 'react';
import type { ComparisonPanelData } from '../comparison-panels';

interface PerformanceChangeProps {
  latestPanel?: ComparisonPanelData;
  olderPanel?: ComparisonPanelData;
  leftPanel?: ComparisonPanelData;
  rightPanel?: ComparisonPanelData;
}

interface MetricCardProps {
  title: string;
  value: string;
  positive?: boolean;
}

function MetricCard({ title, value, positive }: MetricCardProps) {
  return (
    <div className='flex-1 rounded-[10px] border border-black/35 bg-white px-6 py-4 text-center shadow-[1px_1px_3px_rgba(0,0,0,0.25),-1px_-1px_3px_rgba(0,0,0,0.1)]'>
      <h3 className='mb-2 text-[18px] font-semibold text-black'>{title}</h3>
      <p className={`text-[30px] font-bold ${positive ? 'text-green-500' : 'text-red-500'}`}>{value}</p>
    </div>
  );
}

function getRiskValue(risk: string): number {
  const normalized = risk.toUpperCase();

  if (normalized === 'LOW') return 1;
  if (normalized === 'MEDIUM') return 2;
  if (normalized === 'HIGH') return 3;

  return 2;
}

function formatDiff(value: number, fixedDigits = 1) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(fixedDigits)}`;
}

export function PerformanceChange({ latestPanel, olderPanel, leftPanel, rightPanel }: PerformanceChangeProps) {
  const resolvedLeft = leftPanel ?? latestPanel;
  const resolvedRight = rightPanel ?? olderPanel;

  if (!resolvedLeft || !resolvedRight) {
    return null;
  }

  const latest = new Date(resolvedLeft.date) >= new Date(resolvedRight.date) ? resolvedLeft : resolvedRight;
  const older = latest === resolvedLeft ? resolvedRight : resolvedLeft;

  const scoreDiff = latest.predictedScore - older.predictedScore;
  const probabilityDiff = latest.passProbability - older.passProbability;

  const riskDiff = getRiskValue(latest.riskLevel) - getRiskValue(older.riskLevel);
  const riskTransition = `${older.riskLevel} to ${latest.riskLevel}`;

  return (
    <div className='mb-10 rounded-[10px] border border-black/35 bg-white p-6 shadow-[1px_1px_3px_rgba(0,0,0,0.25),-1px_-1px_3px_rgba(0,0,0,0.1)]'>
      <h2 className='mb-4 text-[24px] font-bold text-black'>Performance Changes</h2>
      <div className='mb-4 flex gap-4'>
        <MetricCard title='Score Difference' value={formatDiff(scoreDiff)} positive={scoreDiff > 0} />
        <MetricCard
          title='Pass Probability Change'
          value={`${formatDiff(probabilityDiff)}%`}
          positive={probabilityDiff > 0}
        />
      </div>
      <div className='flex gap-4'>
        <MetricCard title='Risk Level Transition' value={riskTransition} positive={riskDiff < 0} />
        <MetricCard
          title='Best Improvement Area'
          value={latest.subject || ''}
          positive={Boolean(latest.subject)}
        />
      </div>
    </div>
  );
}
