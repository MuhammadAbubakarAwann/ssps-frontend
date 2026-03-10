'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';

interface EarningsByCategoryData {
  totalDeliveryFees: number;
  totalServiceFees: number;
  totalCommissions: number;
  totalEarnings: number;
  categories: string[];
}

export function EarningsByCategorySection() {
  const [data, setData] = useState<EarningsByCategoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEarningsByCategory = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/admin/finance/earnings-by-category');
        const result = await response.json();

        if (!response.ok) 
          setError(`Failed to load earnings data: ${result.message || 'Unknown error'}`);
         else if (result.success) 
          setData(result.data);
        
      } catch (error) {
        console.error('Error fetching earnings data:', error);
        setError('Network error occurred while loading earnings data');
      } finally {
        setLoading(false);
      }
    };

    void fetchEarningsByCategory();
  }, []);

  if (loading) 
    return (
      <div className='flex flex-col gap-4 p-6 bg-white border border-[#EDEDEB] rounded-[10px]'>
        <div className='flex items-center justify-center h-[310px]'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#FABB17] mx-auto mb-2'></div>
            <p className='text-[#6B7280]'>Loading earnings data...</p>
          </div>
        </div>
      </div>
    );
  

  if (error || !data) 
    return (
      <div className='flex flex-col gap-4 p-6 bg-white border border-[#EDEDEB] rounded-[10px]'>
        <div className='flex items-center justify-center h-[310px]'>
          <div className='text-center'>
            <p className='text-red-600 mb-2'>Error loading data</p>
            <p className='text-[#6B7280] text-sm'>{error}</p>
          </div>
        </div>
      </div>
    );
  

  const earningsByCategoryData = [
    { category: 'Delivery Fees', value: data.totalDeliveryFees, color: '#4A3B2E' },
    { category: 'Service Fees', value: data.totalServiceFees, color: '#FABB17' },
    { category: 'Commissions', value: data.totalCommissions, color: '#E8D5C4' }
  ];
  return (
    <div className='flex flex-col gap-4 p-6 bg-white border border-[#EDEDEB] rounded-[10px]'>
      <div className='flex items-center justify-between'>
        <h2 className='text-[15px] font-bold text-[#3F4956] capitalize'>Earnings By Category</h2>
      </div>

      {/* Legend */}
      <div className='flex gap-6'>
        {earningsByCategoryData.map((item, idx) => (
          <div key={idx} className='flex items-center gap-2'>
            <div
              className='w-4 h-4 rounded'
              style={{ backgroundColor: item.color }}
            />
            <span className='text-[13px] text-[#6B7280]'>{item.category}</span>
          </div>
        ))}
      </div>

      {/* Horizontal Bar Chart */}
      <ResponsiveContainer width='100%' height={310}>
        <BarChart
          data={earningsByCategoryData}
          layout='vertical'
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          barCategoryGap={20}
          barSize={40}

        >
          <CartesianGrid strokeDasharray='3 3' stroke='#e6e6e6' vertical={true} />
          <XAxis type='number' stroke='#6B7280' style={{ fontSize: '12px' }} tickLine={false} axisLine = {false} />
          <YAxis dataKey='category' type='category' stroke='#6B7280' style={{ fontSize: '12px' }} width={0} tick={false} />
          <Tooltip contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #EDEDEB', borderRadius: '6px' }} />
          <Bar dataKey='value' radius={[0, 4, 4, 0]}>  
            {earningsByCategoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
            {/* always show label at end of bar; format thousands with 'k' */}
            <LabelList
              dataKey='value'
              position='top'
              formatter={(label: any) => {
                // convert to number and round for display
                const num = typeof label === 'number' ? label : parseFloat(label);
                if (isNaN(num)) return '';
                // if value in thousands, show as e.g. 1.2k
                if (num >= 1000) {
                  const thousands = (num / 1000).toFixed(1).replace(/\.0$/, '');
                  return `$${thousands}k`;
                }
                // otherwise just round to integer and add commas
                return `$${Math.round(num).toLocaleString()}`;
              }}
              style={{ fontSize: '12px', fill: '#3F4956' , fontWeight: 'bold'}}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
