'use client';

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type MonthlyGainLevel = 'LOW' | 'AVERAGE' | 'HIGH';

type PerformanceTrendResponse = {
  success?: boolean;
  message?: string;
  data?: {
    summary?: {
      peakModelAccuracy?: {
        value?: number;
        month?: string;
      };
      avgAccuracyYTD?: number;
      monthlyGain?: {
        percent?: number;
        level?: MonthlyGainLevel;
      };
    };
    graph?: Array<{
      month?: string;
      accuracyScore?: number;
      predictionScore?: number;
      monthlyImprovement?: number;
    }>;
  };
};

type ChartPoint = {
  month: string;
  prediction: number;
  accuracy: number;
  improvement: number;
};

const DEFAULT_SUMMARY = {
  peakModelAccuracy: { value: 0, month: '' },
  avgAccuracyYTD: 0,
  monthlyGain: { percent: 0, level: 'LOW' as MonthlyGainLevel }
};

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toMonthLabel(value: string): string {
  const date = new Date(`${value}-01T00:00:00`);
  if (Number.isNaN(date.getTime()))
    return value;

  return date.toLocaleDateString('en-US', { month: 'short' });
}

function toMonthWithYear(value: string): string {
  const date = new Date(`${value}-01T00:00:00`);
  if (Number.isNaN(date.getTime()))
    return value;

  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function resolveMonthlyGainLevel(percent: number, backendLevel?: string): MonthlyGainLevel {
  if (backendLevel === 'LOW' || backendLevel === 'AVERAGE' || backendLevel === 'HIGH')
    return backendLevel;

  if (percent < 1)
    return 'LOW';

  if (percent <= 3)
    return 'AVERAGE';

  return 'HIGH';
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className='rounded-xl border border-white/10 bg-[#0A0C16]/95 p-4 shadow-xl backdrop-blur-xl'>
        <p className='font-semibold text-fg-default'>{payload[0].payload.month}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className='text-sm font-medium'>
            {entry.name}: {Number(entry.value).toFixed(1)}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function PerformanceTrendChart() {
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [summary, setSummary] = useState(DEFAULT_SUMMARY);

  useEffect(() => {
    const loadTrend = async () => {
      try {
        setIsLoading(true);
        const year = new Date().getFullYear();
        const response = await fetch(`/api/teacher/performance-trend?year=${year}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        const payload = await response.json() as PerformanceTrendResponse;

        if (!response.ok || !payload.success)
          throw new Error(payload.message || 'Failed to fetch performance trend');

        const summaryData = payload.data?.summary;
        const monthlyGainPercent = toNumber(summaryData?.monthlyGain?.percent);

        setSummary({
          peakModelAccuracy: {
            value: toNumber(summaryData?.peakModelAccuracy?.value),
            month: summaryData?.peakModelAccuracy?.month || ''
          },
          avgAccuracyYTD: toNumber(summaryData?.avgAccuracyYTD),
          monthlyGain: {
            percent: monthlyGainPercent,
            level: resolveMonthlyGainLevel(monthlyGainPercent, summaryData?.monthlyGain?.level)
          }
        });

        const graph = (payload.data?.graph || []).map((item) => ({
          month: toMonthLabel(String(item.month || '')),
          prediction: toNumber(item.predictionScore),
          accuracy: toNumber(item.accuracyScore),
          improvement: toNumber(item.monthlyImprovement)
        }));

        setChartData(graph);
      } catch {
        setSummary(DEFAULT_SUMMARY);
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadTrend();
  }, []);

  const gainColors = useMemo(() => {
    if (summary.monthlyGain.level === 'HIGH')
      return {
        bg: 'bg-[#12B76A]/10',
        border: 'border-[#12B76A]/20 hover:border-[#12B76A]/40',
        title: 'text-[#3DD68C]',
        value: 'text-fg-default',
        subtitle: 'text-[#3DD68C]/80'
      };

    if (summary.monthlyGain.level === 'AVERAGE')
      return {
        bg: 'bg-[#FFD166]/10',
        border: 'border-[#FFD166]/20 hover:border-[#FFD166]/40',
        title: 'text-[#FFD166]',
        value: 'text-fg-default',
        subtitle: 'text-[#FFD166]/80'
      };

    return {
      bg: 'bg-[#FF6369]/10',
      border: 'border-[#FF6369]/20 hover:border-[#FF6369]/40',
      title: 'text-[#FF8A8F]',
      value: 'text-fg-default',
      subtitle: 'text-[#FF8A8F]/80'
    };
  }, [summary.monthlyGain.level]);

  return (
    <div className='group glass-card glass-card-hover relative overflow-hidden transition-all duration-300'>
      {/* Decorative glow background */}
      <div className='absolute -right-32 -top-32 h-64 w-64 rounded-full bg-glow-blue/10 blur-3xl'></div>

      {/* Header Section */}
      <div className='relative z-10 border-b border-white/10 p-6'>
        <div className='flex items-start justify-between'>
          <div>
            <div className='flex items-center gap-4'>
              <div className='rounded-xl bg-gradient-to-br from-glow-blue to-glow-cyan p-3 shadow-[0_0_30px_rgba(79,166,248,0.35)]'>
                <TrendingUp className='h-7 w-7 text-[#04050A]' />
              </div>
              <div>
                <h2 className='text-3xl font-bold text-fg-default'>Performance Trend</h2>
                <p className='text-sm text-fg-text mt-1'>Monthly prediction accuracy and improvement analysis</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Stats Grid */}
      <div className='relative z-10 grid grid-cols-3 gap-4 border-b border-white/10 p-6'>
        <div className='rounded-xl bg-[#4FA6F8]/10 p-5 border border-[#4FA6F8]/20 hover:border-[#4FA6F8]/40 transition-colors'>
          <p className='text-xs font-bold uppercase tracking-widest text-[#7FD0FF]'>Peak Accuracy</p>
          <p className='mt-3 text-4xl font-bold text-fg-default'>
            {isLoading ? '--' : `${summary.peakModelAccuracy.value.toFixed(1)}%`}
          </p>
          <p className='mt-2 text-xs text-[#7FD0FF]/80'>
            {isLoading
              ? 'Loading...'
              : (summary.peakModelAccuracy.month ? toMonthWithYear(summary.peakModelAccuracy.month) : 'N/A')}
          </p>
        </div>
        <div className='rounded-xl bg-[#8F008D]/12 p-5 border border-[#C75CFF]/20 hover:border-[#C75CFF]/40 transition-colors'>
          <p className='text-xs font-bold uppercase tracking-widest text-[#E69BFF]'>Avg Accuracy</p>
          <p className='mt-3 text-4xl font-bold text-fg-default'>
            {isLoading ? '--' : `${summary.avgAccuracyYTD.toFixed(1)}%`}
          </p>
          <p className='mt-2 text-xs text-[#E69BFF]/80'>Year to date</p>
        </div>
        <div className={`rounded-xl ${gainColors.bg} p-5 border ${gainColors.border} transition-colors`}>
          <p className={`text-xs font-bold uppercase tracking-widest ${gainColors.title}`}>Monthly Gain</p>
          <p className={`mt-3 text-4xl font-bold ${gainColors.value}`}>
            {isLoading
              ? '--'
              : `${summary.monthlyGain.percent > 0 ? '+' : ''}${summary.monthlyGain.percent.toFixed(1)}%`}
          </p>
          <p className={`mt-2 text-xs ${gainColors.subtitle}`}>{summary.monthlyGain.level}</p>
        </div>
      </div>

      {/* Chart */}
      <div className='relative z-10 p-0'>
        <div className='h-80 w-full'>
          {isLoading ? (
            <div className='flex h-full items-center justify-center text-sm font-medium text-fg-text'>
              Loading performance trend...
            </div>
          ) : chartData.length === 0 ? (
            <div className='flex h-full items-center justify-center text-sm font-medium text-fg-text'>
              No trend data available
            </div>
          ) : (
            <ResponsiveContainer width='100%' height='100%'>
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            >
              <defs>
                <linearGradient id='predictionGradient' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#4FA6F8' stopOpacity={0.35} />
                  <stop offset='95%' stopColor='#4FA6F8' stopOpacity={0} />
                </linearGradient>
                <linearGradient id='accuracyGradient' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#3DD68C' stopOpacity={0.35} />
                  <stop offset='95%' stopColor='#3DD68C' stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray='4 4' stroke='rgba(255,255,255,0.08)' vertical={true} />
              <XAxis
                dataKey='month'
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 500 }}
              />
              <YAxis
                yAxisId='scores'
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 13 }}
                domain={[0, 100]}
              />
              <YAxis
                yAxisId='improvement'
                orientation='right'
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 13 }}
                domain={['dataMin - 2', 'dataMax + 2']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '20px', color: 'rgba(255,255,255,0.7)' }}
                iconType='line'
              />
              <Area
                type='monotone'
                dataKey='prediction'
                name='Prediction Score'
                yAxisId='scores'
                stroke='#4FA6F8'
                strokeWidth={3}
                fill='url(#predictionGradient)'
                dot={{ fill: '#4FA6F8', r: 5, strokeWidth: 0 }}
                activeDot={{ r: 7 }}
                isAnimationActive={true}
              />
              <Line
                type='monotone'
                dataKey='accuracy'
                name='Accuracy Score'
                yAxisId='scores'
                stroke='#3DD68C'
                strokeWidth={3}
                dot={{ fill: '#3DD68C', r: 5, strokeWidth: 0 }}
                activeDot={{ r: 7 }}
                isAnimationActive={true}
              />
              <Bar
                dataKey='improvement'
                name='Monthly Improvement'
                yAxisId='improvement'
                fill='#FFD166'
                radius={[8, 8, 0, 0]}
                opacity={0.6}
              />
            </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

     
    </div>
  );
}
