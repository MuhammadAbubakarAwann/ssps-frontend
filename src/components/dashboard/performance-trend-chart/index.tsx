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
      <div className='rounded-xl border border-gray-200 bg-white p-4 shadow-xl'>
        <p className='font-semibold text-gray-900'>{payload[0].payload.month}</p>
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
        bg: 'from-emerald-50 to-emerald-100/50',
        border: 'border-emerald-200/30',
        title: 'text-emerald-700',
        value: 'text-emerald-900',
        subtitle: 'text-emerald-700'
      };

    if (summary.monthlyGain.level === 'AVERAGE')
      return {
        bg: 'from-amber-50 to-amber-100/50',
        border: 'border-amber-200/30',
        title: 'text-amber-700',
        value: 'text-amber-900',
        subtitle: 'text-amber-700'
      };

    return {
      bg: 'from-red-50 to-red-100/50',
      border: 'border-red-200/30',
      title: 'text-red-700',
      value: 'text-red-900',
      subtitle: 'text-red-700'
    };
  }, [summary.monthlyGain.level]);

  return (
    <div className='group relative overflow-hidden rounded-2xl border border-gray-200/50 bg-white shadow-sm hover:shadow-2xl hover:border-blue-200 transition-all duration-300'>
      {/* Decorative gradient background */}
      <div className='absolute -right-32 -top-32 h-64 w-64 rounded-full bg-gradient-to-br from-blue-100 to-transparent opacity-30 blur-3xl'></div>
      
      {/* Header Section */}
      <div className='relative z-10 border-b border-gray-200/50 p-6'>
        <div className='flex items-start justify-between'>
          <div>
            <div className='flex items-center gap-4'>
              <div className='rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 p-3 shadow-lg'>
                <TrendingUp className='h-7 w-7 text-white' />
              </div>
              <div>
                <h2 className='text-3xl font-bold text-gray-900'>Performance Trend</h2>
                <p className='text-sm text-gray-600 mt-1'>Monthly prediction accuracy and improvement analysis</p>
              </div>
            </div>
          </div>
        
        </div>
      </div>

      {/* Stats Grid */}
      <div className='relative z-10 grid grid-cols-3 gap-4 border-b border-gray-200/50 p-6'>
        <div className='rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 p-5 border border-blue-200/30 hover:border-blue-300 transition-colors'>
          <p className='text-xs font-bold uppercase tracking-widest text-blue-700'>Peak Accuracy</p>
          <p className='mt-3 text-4xl font-bold text-blue-900'>
            {isLoading ? '--' : `${summary.peakModelAccuracy.value.toFixed(1)}%`}
          </p>
          <p className='mt-2 text-xs text-blue-600'>
            {isLoading
              ? 'Loading...'
              : (summary.peakModelAccuracy.month ? toMonthWithYear(summary.peakModelAccuracy.month) : 'N/A')}
          </p>
        </div>
        <div className='rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 p-5 border border-purple-200/30 hover:border-purple-300 transition-colors'>
          <p className='text-xs font-bold uppercase tracking-widest text-purple-700'>Avg Accuracy</p>
          <p className='mt-3 text-4xl font-bold text-purple-900'>
            {isLoading ? '--' : `${summary.avgAccuracyYTD.toFixed(1)}%`}
          </p>
          <p className='mt-2 text-xs text-purple-600'>Year to date</p>
        </div>
        <div className={`rounded-xl bg-gradient-to-br ${gainColors.bg} p-5 border ${gainColors.border} transition-colors`}>
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
            <div className='flex h-full items-center justify-center text-sm font-medium text-slate-500'>
              Loading performance trend...
            </div>
          ) : chartData.length === 0 ? (
            <div className='flex h-full items-center justify-center text-sm font-medium text-slate-500'>
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
                  <stop offset='5%' stopColor='#3B82F6' stopOpacity={0.3} />
                  <stop offset='95%' stopColor='#3B82F6' stopOpacity={0} />
                </linearGradient>
                <linearGradient id='accuracyGradient' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#10B981' stopOpacity={0.3} />
                  <stop offset='95%' stopColor='#10B981' stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray='4 4' stroke='#E5E7EB' vertical={true} />
              <XAxis
                dataKey='month'
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 13, fontWeight: 500 }}
              />
              <YAxis
                yAxisId='scores'
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 13 }}
                domain={[0, 100]}
              />
              <YAxis
                yAxisId='improvement'
                orientation='right'
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 13 }}
                domain={['dataMin - 2', 'dataMax + 2']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType='line'
              />
              <Area
                type='monotone'
                dataKey='prediction'
                name='Prediction Score'
                yAxisId='scores'
                stroke='#3B82F6'
                strokeWidth={3}
                fill='url(#predictionGradient)'
                dot={{ fill: '#3B82F6', r: 5, strokeWidth: 0 }}
                activeDot={{ r: 7 }}
                isAnimationActive={true}
              />
              <Line
                type='monotone'
                dataKey='accuracy'
                name='Accuracy Score'
                yAxisId='scores'
                stroke='#10B981'
                strokeWidth={3}
                dot={{ fill: '#10B981', r: 5, strokeWidth: 0 }}
                activeDot={{ r: 7 }}
                isAnimationActive={true}
              />
              <Bar
                dataKey='improvement'
                name='Monthly Improvement'
                yAxisId='improvement'
                fill='#FBBF24'
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
