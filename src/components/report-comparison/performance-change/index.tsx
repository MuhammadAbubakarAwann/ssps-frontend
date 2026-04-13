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
  const riskTransition = `${formatRiskLabel(older.riskLevel)} → ${formatRiskLabel(latest.riskLevel)}`;
  const bestImprovement = latest.subject ?? latest.subjectPerformance ?? 'N/A';
  const riskDiff = getRiskValue(latest.riskLevel) - getRiskValue(older.riskLevel);

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border: '1px solid rgba(0, 0, 0, 0.34)',
      borderRadius: '10px',
      padding: '28px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#000000' }}>Performance Change</h3>
        <span style={{ fontSize: '11px', color: 'rgba(0, 0, 0, 0.61)' }}>
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
        <div style={{
          border: '1px solid rgba(0, 0, 0, 0.34)',
          borderRadius: '10px',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.6)' }}>Score Difference</span>
            <TrendingUp size={20} style={{ color: '#40BA3E' }} />
          </div>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#40BA3E' }}>{formatDiff(scoreDiff)}</p>
        </div>

        {/* Pass Probability Change */}
        <div style={{
          border: '1px solid rgba(0, 0, 0, 0.34)',
          borderRadius: '10px',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.6)' }}>Pass Probability Change</span>
            <TrendingUp size={20} style={{ color: '#40BA3E' }} />
          </div>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#40BA3E' }}>{formatDiff(probabilityDiff)}%</p>
        </div>

        {/* Risk Level Change */}
        <div style={{
          border: '1px solid rgba(0, 0, 0, 0.34)',
          borderRadius: '10px',
          padding: '16px'
        }}>
          <p style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.6)', marginBottom: '8px' }}>Risk Level Change</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              display: 'inline-block',
              backgroundColor: riskDiff < 0 ? 'rgba(37, 255, 17, 0.15)' : 'rgba(255, 205, 0, 0.14)',
              border: `1px solid ${riskDiff < 0 ? '#3CFF00' : '#F59E0B'}`,
              borderRadius: '8px',
              padding: '4px 13px'
            }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: riskDiff < 0 ? '#00C351' : '#B45309' }}>{formatRiskLabel(older.riskLevel)}</span>
            </div>
            <span style={{ fontSize: '16px', color: '#000000' }}>→</span>
            <div style={{
              display: 'inline-block',
              backgroundColor: riskDiff <= 0 ? 'rgba(37, 255, 17, 0.15)' : 'rgba(255, 205, 0, 0.14)',
              border: `1px solid ${riskDiff <= 0 ? '#3CFF00' : '#F59E0B'}`,
              borderRadius: '8px',
              padding: '4px 13px'
            }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: riskDiff <= 0 ? '#00C351' : '#B45309' }}>{formatRiskLabel(latest.riskLevel)}</span>
            </div>
          </div>
        </div>

        {/* Best Improvement */}
        <div style={{
          border: '1px solid rgba(0, 0, 0, 0.34)',
          borderRadius: '10px',
          padding: '16px'
        }}>
          <p style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.6)', marginBottom: '8px' }}>Best Improvement</p>
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#000000' }}>{bestImprovement}</p>
        </div>
      </div>

      {/* Overall Trend */}
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: '10px',
        padding: '16px'
      }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#000000', marginBottom: '8px' }}>Overall Trend</h4>
        <p style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.7)', lineHeight: '1.6' }}>
          {scoreDiff >= 0
            ? `Great progress! The student&apos;s predicted score has improved by ${scoreDiff.toFixed(1)} points since the last prediction. Continue maintaining this positive momentum.`
            : `The student&apos;s predicted score has dropped by ${Math.abs(scoreDiff).toFixed(1)} points since the last prediction. Review the key areas and intervene early.`}
        </p>
      </div>
    </div>
  );
}
