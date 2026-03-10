'use client';

import { useState, useEffect } from 'react';
import { FinanceCard } from '../finance-card';

interface FinanceOverview {
  totalRevenue: number;
  totalPayouts: number;
  netProfit: number;
  platformCommission: number;
  pendingPayouts: number;
  revenueGrowth: number;
  trends: {
    totalRevenue: { trend: string; changeAmount: number; changePercent: number };
    totalPayouts: { trend: string; changeAmount: number; changePercent: number };
    netProfit: { trend: string; changeAmount: number; changePercent: number };
    platformCommission: { trend: string; changeAmount: number; changePercent: number };
    pendingPayouts: { trend: string; changeAmount: number; changePercent: number };
  };
  period: string;
  dateRange: object;
}

export function KPICardsSection() {
  const [data, setData] = useState<FinanceOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFinanceOverview = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/admin/finance/overview');
        const result = await response.json();

        if (!response.ok) 
          setError(`Failed to load finance data: ${result.message || 'Unknown error'}`);
         else if (result.success) 
          setData(result.data);
        
      } catch (error) {
        console.error('Error fetching finance data:', error);
        setError('Network error occurred while loading finance data');
      } finally {
        setLoading(false);
      }
    };

    void fetchFinanceOverview();
  }, []);

  if (loading) 
    return (
      <div className='grid grid-cols-3 gap-4'>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className='flex flex-col gap-3 p-5 bg-white border border-[#EDEDEB] rounded-[10px] animate-pulse'>
            <div className='h-4 bg-gray-200 rounded'></div>
            <div className='h-6 bg-gray-200 rounded'></div>
          </div>
        ))}
      </div>
    );
  

  if (error || !data) 
    return (
      <div className='grid grid-cols-3 gap-4'>
        <div className='col-span-3 flex items-center justify-center p-8 bg-white border border-[#EDEDEB] rounded-[10px]'>
          <div className='text-center'>
            <p className='text-red-600 mb-2'>Error loading finance data</p>
            <p className='text-[#6B7280] text-sm'>{error}</p>
          </div>
        </div>
      </div>
    );
  

  const cards = [
    { 
      title: 'Total Revenue', 
      value: `$${data.totalRevenue.toFixed(2)}`, 
      change: data.trends.totalRevenue.changePercent !== 0 ? parseFloat(data.trends.totalRevenue.changePercent.toFixed(1)) : undefined,
      isPositive: data.trends.totalRevenue.trend === 'increasing'
    },
    { 
      title: 'Total Payouts', 
      value: `$${data.totalPayouts.toFixed(2)}`, 
      change: data.trends.totalPayouts.changePercent !== 0 ? parseFloat(data.trends.totalPayouts.changePercent.toFixed(1)) : undefined,
      isPositive: data.trends.totalPayouts.trend === 'increasing'
    },
    { 
      title: 'Net Profit', 
      value: `$${data.netProfit.toFixed(2)}`, 
      change: data.trends.netProfit.changePercent !== 0 ? parseFloat(data.trends.netProfit.changePercent.toFixed(1)) : undefined,
      isPositive: data.trends.netProfit.trend === 'increasing'
    },
    { 
      title: 'Platform Commission', 
      value: `$${data.platformCommission.toFixed(2)}`, 
      change: data.trends.platformCommission.changePercent !== 0 ? parseFloat(data.trends.platformCommission.changePercent.toFixed(1)) : undefined,
      isPositive: data.trends.platformCommission.trend === 'increasing'
    },
    { 
      title: 'Pending Payouts', 
      value: `$${data.pendingPayouts.toFixed(2)}`, 
      change: data.trends.pendingPayouts.changePercent !== 0 ? parseFloat(data.trends.pendingPayouts.changePercent.toFixed(1)) : undefined,
      isPositive: data.trends.pendingPayouts.trend === 'increasing'
    },
    { 
      title: 'Revenue Growth', 
      value: `${data.revenueGrowth.toFixed(2)}%`, 
      change: data.trends.totalRevenue.changePercent !== 0 ? parseFloat(data.trends.totalRevenue.changePercent.toFixed(1)) : undefined,
      isPositive: data.trends.totalRevenue.trend === 'increasing'
    }
  ];

  return (
    <div className='grid grid-cols-3 gap-4'>
      {cards.map((card, index) => (
        <FinanceCard
          key={index}
          title={card.title}
          value={card.value}
          change={card.change}
          isPositive={card.isPositive}
        />
      ))}
    </div>
  );
}
