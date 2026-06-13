'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface GPAData {
  semester: string;
  gpa: number;
}

interface GPATrendChartProps {
  data: GPAData[];
}

function formatTooltipValue(
  value: number | string | ReadonlyArray<number | string> | undefined
): string {
  if (Array.isArray(value))
    return value.join(', ');

  const numericValue = Number(value);
  if (Number.isFinite(numericValue))
    return numericValue.toFixed(2);

  return value == null ? '' : String(value);
}

export function GPATrendChart({ data }: GPATrendChartProps) {
  return (
    <div className='rounded-[20px] glass-card p-6'>
      {/* Header */}
      <div className='mb-6 flex items-center gap-2.5'>
        <TrendingUp size={24} className='text-[#7FD0FF]' />
        <h3 className='text-[20px] font-semibold text-fg-default'>
          GPA Trend Over Semesters
        </h3>
      </div>

      {/* Chart */}
      <div className='h-[300px] w-full'>
        <ResponsiveContainer width='100%' height='100%'>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray='3 3' stroke='rgba(255,255,255,0.08)' />
            <XAxis
              dataKey='semester'
              stroke='rgba(255,255,255,0.5)'
              tick={{ fontSize: 14, fill: 'rgba(255,255,255,0.5)' }}
            />
            <YAxis
              domain={[3.0, 3.5]}
              stroke='rgba(255,255,255,0.5)'
              tick={{ fontSize: 14, fill: 'rgba(255,255,255,0.5)' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(10,12,22,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'var(--fg-default)',
                backdropFilter: 'blur(20px)'
              }}
              formatter={(value) => formatTooltipValue(value)}
            />
            <Line
              type='monotone'
              dataKey='gpa'
              stroke='#4FA6F8'
              strokeWidth={2}
              dot={{ fill: '#4FA6F8', r: 5 }}
              activeDot={{ r: 7, fill: '#7FD0FF' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
