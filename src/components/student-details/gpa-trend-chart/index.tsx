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
    <div className='rounded-[20px] border border-black/30 bg-white p-6 shadow-[1px_1px_3px_rgba(0,0,0,0.25),-1px_-1px_3px_rgba(0,0,0,0.25)]'>
      {/* Header */}
      <div className='mb-6 flex items-center gap-2.5'>
        <TrendingUp size={24} className='text-[#0084FF]' />
        <h3 className='text-[20px] font-semibold text-black'>
          GPA Trend Over Semesters
        </h3>
      </div>

      {/* Chart */}
      <div className='h-[300px] w-full'>
        <ResponsiveContainer width='100%' height='100%'>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray='3 3' stroke='rgba(0, 0, 0, 0.1)' />
            <XAxis
              dataKey='semester'
              stroke='rgba(0, 0, 0, 0.5)'
              tick={{ fontSize: 14 }}
            />
            <YAxis
              domain={[3.0, 3.5]}
              stroke='rgba(0, 0, 0, 0.5)'
              tick={{ fontSize: 14 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                color: '#000000'
              }}
              formatter={(value) => formatTooltipValue(value)}
            />
            <Line
              type='monotone'
              dataKey='gpa'
              stroke='#0084FF'
              strokeWidth={2}
              dot={{ fill: '#0084FF', r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
