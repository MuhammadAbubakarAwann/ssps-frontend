'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ComposedChart,
  Line,
  Bar,
  Legend
} from 'recharts';
import { TrendingUp, ArrowUp } from 'lucide-react';

const trendData = [
  { month: 'Jan', prediction: 72, accuracy: 68, improvement: 4 },
  { month: 'Feb', prediction: 75, accuracy: 71, improvement: 6 },
  { month: 'Mar', prediction: 78, accuracy: 74, improvement: 8 },
  { month: 'Apr', prediction: 80, accuracy: 77, improvement: 10 },
  { month: 'May', prediction: 83, accuracy: 81, improvement: 12 },
  { month: 'Jun', prediction: 85, accuracy: 84, improvement: 14 },
  { month: 'Jul', prediction: 87, accuracy: 86, improvement: 15 },
  { month: 'Aug', prediction: 89, accuracy: 88, improvement: 16 },
  { month: 'Sep', prediction: 91, accuracy: 90, improvement: 18 }
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className='rounded-xl border border-gray-200 bg-white p-4 shadow-xl'>
        <p className='font-semibold text-gray-900'>{payload[0].payload.month}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className='text-sm font-medium'>
            {entry.name}: {entry.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function PerformanceTrendChart() {
  return (
    <div className='rounded-xl border border-gray-200 bg-white shadow-lg'>
      {/* Header Section */}
      <div className='border-b border-gray-200 p-6'>
        <div className='flex items-start justify-between'>
          <div>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-2'>
                <TrendingUp className='h-6 w-6 text-white' />
              </div>
              <div>
                <h2 className='text-2xl font-bold text-gray-900'>Performance Trend</h2>
                <p className='text-sm text-gray-600'>Monthly prediction accuracy and improvement analysis</p>
              </div>
            </div>
          </div>
          <div className='rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100 px-6 py-4'>
            <div className='flex items-center gap-2'>
              <ArrowUp className='h-5 w-5 text-green-600' />
              <div>
                <p className='text-xs font-medium uppercase tracking-widest text-green-700'>Overall Improvement</p>
                <p className='text-3xl font-bold text-green-700'>+19%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-3 gap-4 border-b border-gray-200 p-6'>
        <div className='rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-4'>
          <p className='text-xs font-semibold uppercase tracking-wide text-blue-700'>Peak Accuracy</p>
          <p className='mt-2 text-3xl font-bold text-blue-900'>91%</p>
          <p className='mt-1 text-xs text-blue-700'>September</p>
        </div>
        <div className='rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-4'>
          <p className='text-xs font-semibold uppercase tracking-wide text-purple-700'>Avg Accuracy</p>
          <p className='mt-2 text-3xl font-bold text-purple-900'>82%</p>
          <p className='mt-1 text-xs text-purple-700'>Year to date</p>
        </div>
        <div className='rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 p-4'>
          <p className='text-xs font-semibold uppercase tracking-wide text-emerald-700'>Monthly Gain</p>
          <p className='mt-2 text-3xl font-bold text-emerald-900'>+2.2%</p>
          <p className='mt-1 text-xs text-emerald-700'>Average</p>
        </div>
      </div>

      {/* Chart */}
      <div className='p-6'>
        <div className='h-80 w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <ComposedChart
              data={trendData}
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
              <CartesianGrid strokeDasharray='4 4' stroke='#E5E7EB' vertical={false} />
              <XAxis
                dataKey='month'
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 13, fontWeight: 500 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 13 }}
                domain={[60, 95]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType='line'
                wrapperStyle={{ paddingTop: '20px' }}
              />
              <Area
                type='monotone'
                dataKey='prediction'
                name='Prediction Score'
                stroke='#3B82F6'
                strokeWidth={3}
                fill='url(#predictionGradient)'
                dot={{ fill: '#3B82F6', r: 5, strokeWidth: 0 }}
                activeDot={{ r: 7, shadowBlur: 10 }}
                isAnimationActive={true}
              />
              <Line
                type='monotone'
                dataKey='accuracy'
                name='Accuracy Score'
                stroke='#10B981'
                strokeWidth={3}
                dot={{ fill: '#10B981', r: 5, strokeWidth: 0 }}
                activeDot={{ r: 7 }}
                isAnimationActive={true}
              />
              <Bar
                dataKey='improvement'
                name='Monthly Improvement'
                fill='#FBBF24'
                radius={[8, 8, 0, 0]}
                opacity={0.6}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer Insight */}
      <div className='border-t border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 p-6'>
        <p className='text-sm font-semibold text-gray-900'>Insight:</p>
        <p className='mt-2 text-sm text-gray-600'>
          The system shows consistent improvement with prediction accuracy rising from 68% to 91% over 9 months. The monthly improvement rate averages 2.2%, indicating steady optimization in the ML model performance.
        </p>
      </div>
    </div>
  );
}
