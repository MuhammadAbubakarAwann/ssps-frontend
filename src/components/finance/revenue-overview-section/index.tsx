'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueData {
  period: string;
  totalRevenue: number;
  orderCount: number;
  averageOrderValue: number;
  periodLabel: string;
  cumulativeRevenue: number;
}

export function RevenueOverviewSection() {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('monthly');

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/admin/analytics/revenue-overview?period=${period}`);
        const data = await response.json();

        if (!response.ok) 
          setError(`Failed to load revenue data: ${data.message || 'Unknown error'}`);
         else if (data.success) 
          setRevenueData(data.data.revenue);
        
      } catch (error) {
        console.error('Error fetching revenue data:', error);
        setError('Network error occurred while loading revenue data');
      } finally {
        setLoading(false);
      }
    };

    void fetchRevenueData();
  }, [period]);

  if (loading) 
    return (
      <div className='flex flex-col gap-6 p-6 bg-white border border-[#EDEDEB] rounded-[10px]'>
        <div className='flex items-center justify-center h-[300px]'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#FABB17] mx-auto mb-2'></div>
            <p className='text-[#6B7280]'>Loading revenue data...</p>
          </div>
        </div>
      </div>
    );
  

  if (error) 
    return (
      <div className='flex flex-col gap-6 p-6 bg-white border border-[#EDEDEB] rounded-[10px]'>
        <div className='flex items-center justify-center h-[300px]'>
          <div className='text-center'>
            <p className='text-red-600 mb-2'>Error loading data</p>
            <p className='text-[#6B7280] text-sm'>{error}</p>
          </div>
        </div>
      </div>
    );
  

  // Calculate total revenue and percentage change
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.totalRevenue, 0);
  const sortedData = [...revenueData].sort((a, b) => new Date(a.period).getTime() - new Date(b.period).getTime());
  const latestRevenue = sortedData[sortedData.length - 1]?.totalRevenue || 0;
  const previousRevenue = sortedData[sortedData.length - 2]?.totalRevenue || 0;
  const percentageChange = previousRevenue ? (((latestRevenue - previousRevenue) / previousRevenue) * 100).toFixed(0) : 0;
  return (
    <div className='flex flex-col gap-6 p-6 bg-white border border-[#EDEDEB] rounded-[10px]'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex flex-col gap-2'>
          <h2 className='text-[15px] font-bold text-[#3F4956] capitalize'>Revenue Overview</h2>
          <div className='flex items-center gap-4'>
            <span className='text-[24px] font-bold text-[#2F2F2F]'>${totalRevenue.toLocaleString()}</span>
            <span className='text-[12px] font-normal text-[#6B7280]'>+{percentageChange}% vs last period</span>
          </div>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className='text-[13px] text-[#6B7280] border border-[#EDEDEB] rounded-[6px] px-3 py-1 bg-white'
        >
          <option value='monthly'>Monthly</option>
          <option value='weekly'>Weekly</option>
          <option value='daily'>Daily</option>
        </select>
      </div>

      {/* Chart */}
      <ResponsiveContainer width='100%' height={300}>
        <LineChart data={revenueData}>
          <CartesianGrid strokeDasharray='3 3' stroke='#EDEDEB' vertical={false} />
          <XAxis dataKey='periodLabel' stroke='#6B7280' style={{ fontSize: '12px' }} />
          <YAxis stroke='#6B7280' style={{ fontSize: '12px' }} />
          <Tooltip contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #EDEDEB', borderRadius: '6px' }} />
          <Line
            type='monotone'
            dataKey='totalRevenue'
            stroke='#FABB17'
            strokeWidth={2}
            dot={{ fill: '#FABB17', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
