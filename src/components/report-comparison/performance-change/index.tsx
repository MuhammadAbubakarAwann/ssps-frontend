'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';
import type { ComparisonPanelData } from '../comparison-panels';

interface PerformanceChangeProps {
  latestPanel?: ComparisonPanelData;
  olderPanel?: ComparisonPanelData;
  leftPanel?: ComparisonPanelData;
  rightPanel?: ComparisonPanelData;
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

function formatRiskLabel(risk: string) {
  const normalized = risk.trim().toLowerCase();
  if (!normalized)
    return 'N/A';

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function PerformanceChange({ latestPanel, olderPanel, leftPanel, rightPanel }: PerformanceChangeProps) {
  const resolvedLeft = leftPanel ?? latestPanel;
  const resolvedRight = rightPanel ?? olderPanel;

  if (!resolvedLeft || !resolvedRight)
    return null;

  const latest = new Date(resolvedLeft.date) >= new Date(resolvedRight.date) ? resolvedLeft : resolvedRight;
  const older = latest === resolvedLeft ? resolvedRight : resolvedLeft;

  const scoreDiff = latest.predictedScore - older.predictedScore;
  const probabilityDiff = latest.passProbability - older.passProbability;
  const bestImprovement = latest.subject ?? latest.subjectPerformance ?? 'N/A';
  const riskDiff = getRiskValue(latest.riskLevel) - getRiskValue(older.riskLevel);

  return (
    <div className='glass-card' style={{ padding: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 className='text-fg-default' style={{ fontSize: '18px', fontWeight: '600' }}>Performance Change</h3>
        <span className='text-fg-text' style={{ fontSize: '11px' }}>
          {new Date(latest.date).toLocaleDateString('en-GB')}
        </span>
      </div>

      {/* Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* Score Difference */}
        <div className='border border-white/10' style={{
          borderRadius: '10px',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className='text-fg-text' style={{ fontSize: '14px' }}>Score Difference</span>
            <TrendingUp size={20} style={{ color: '#3DD68C' }} />
          </div>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#3DD68C' }}>{formatDiff(scoreDiff)}</p>
        </div>

        {/* Pass Probability Change */}
        <div className='border border-white/10' style={{
          borderRadius: '10px',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className='text-fg-text' style={{ fontSize: '14px' }}>Pass Probability Change</span>
            <TrendingUp size={20} style={{ color: '#3DD68C' }} />
          </div>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#3DD68C' }}>{formatDiff(probabilityDiff)}%</p>
        </div>

        {/* Risk Level Change */}
        <div className='border border-white/10' style={{
          borderRadius: '10px',
          padding: '16px'
        }}>
          <p className='text-fg-text' style={{ fontSize: '14px', marginBottom: '8px' }}>Risk Level Change</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              display: 'inline-block',
              backgroundColor: riskDiff < 0 ? 'rgba(18, 183, 106, 0.15)' : 'rgba(255, 209, 102, 0.15)',
              border: `1px solid ${riskDiff < 0 ? 'rgba(61, 214, 140, 0.3)' : 'rgba(255, 163, 12, 0.3)'}`,
              borderRadius: '8px',
              padding: '4px 13px'
            }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: riskDiff < 0 ? '#3DD68C' : '#FFA30C' }}>{formatRiskLabel(older.riskLevel)}</span>
            </div>
            <span className='text-fg-default' style={{ fontSize: '16px' }}>→</span>
            <div style={{
              display: 'inline-block',
              backgroundColor: riskDiff <= 0 ? 'rgba(18, 183, 106, 0.15)' : 'rgba(255, 209, 102, 0.15)',
              border: `1px solid ${riskDiff <= 0 ? 'rgba(61, 214, 140, 0.3)' : 'rgba(255, 163, 12, 0.3)'}`,
              borderRadius: '8px',
              padding: '4px 13px'
            }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: riskDiff <= 0 ? '#3DD68C' : '#FFA30C' }}>{formatRiskLabel(latest.riskLevel)}</span>
            </div>
          </div>
        </div>

        {/* Best Improvement */}
        <div className='border border-white/10' style={{
          borderRadius: '10px',
          padding: '16px'
        }}>
          <p className='text-fg-text' style={{ fontSize: '14px', marginBottom: '8px' }}>Best Improvement</p>
          <p className='text-fg-default' style={{ fontSize: '14px', fontWeight: '600' }}>{bestImprovement}</p>
        </div>
      </div>

      {/* Overall Trend */}
      <div className='bg-white/[0.03]' style={{
        borderRadius: '10px',
        padding: '16px'
      }}>
        <h4 className='text-fg-default' style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Overall Trend</h4>
        <p className='text-fg-text' style={{ fontSize: '14px', lineHeight: '1.6' }}>
          {scoreDiff >= 0
            ? `Great progress! The student&apos;s predicted score has improved by ${scoreDiff.toFixed(1)} points since the last prediction. Continue maintaining this positive momentum.`
            : `The student&apos;s predicted score has dropped by ${Math.abs(scoreDiff).toFixed(1)} points since the last prediction. Review the key areas and intervene early.`}
        </p>
      </div>
    </div>
  );
}
