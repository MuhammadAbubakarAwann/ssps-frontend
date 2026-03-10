'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface EarningsByUserTypeData {
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
  userTypes: string[];
  data: Array<{
    month: string;
    riderEarnings: number;
    restaurantEarnings: number;
    totalEarnings: number;
  }>;
}

export function EarningsByUserTypeSection() {
  const [data, setData] = useState<EarningsByUserTypeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEarningsByUserType = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/admin/finance/earnings-by-user-type');
        const result = await response.json();

        if (!response.ok) 
          setError(`Failed to load earnings by user type: ${result.message || 'Unknown error'}`);
         else if (result.success) 
          setData(result.data);
        
      } catch (error) {
        console.error('Error fetching earnings by user type:', error);
        setError('Network error occurred while loading earnings data');
      } finally {
        setLoading(false);
      }
    };

    void fetchEarningsByUserType();
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
  

  const earningsByUserTypeData = data.data.map(item => ({
    month: item.month,
    Restaurants: item.restaurantEarnings,
    Riders: item.riderEarnings
  }));
  return (
    <div className='flex flex-col gap-4 p-6 bg-white border border-[#EDEDEB] rounded-[10px]'>
      <div className='flex items-center justify-between'>
        <h2 className='text-[15px] font-medium text-[#3F4956] capitalize'>Earnings By User Type</h2>
      </div>

      {/* Legend */}
      <div className='flex gap-6'>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 rounded bg-[#C4E6A8]' />
          <span className='text-[13px] text-[#6B7280]'>Restaurants</span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 rounded bg-[#FABB17]' />
          <span className='text-[13px] text-[#6B7280]'>Riders</span>
        </div>
      </div>

      {/* Grouped Bar Chart */}
      <ResponsiveContainer width='100%' height={310}>
        <BarChart data={earningsByUserTypeData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray='3 3' stroke='#e6e6e6' vertical={true} />
          <XAxis dataKey='month' stroke='#6B7280' style={{ fontSize: '12px' }} tickLine={false} axisLine = {false}/>
          <YAxis stroke='#6B7280' style={{ fontSize: '12px' }} tickLine={false} axisLine = {false}/>
          <Tooltip contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #EDEDEB', borderRadius: '6px' }} />
          <Bar dataKey='Restaurants' fill='#C4E6A8' radius={[4, 4, 0, 0]} />
          <Bar dataKey='Riders' fill='#FABB17' radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
