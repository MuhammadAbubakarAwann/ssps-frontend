'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ShoppingCart, DollarSign, Award, Calendar, Clock } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  totalOrders: number;
  subscriptionType: string | null;
  addressCity: string | null;
  totalSpendings: number;
  avgOrderValue: number;
  joinDate: string;
  lastOrder: {
    id: string;
    orderDate: string;
    totalAmount: number;
    status: string;
  };
  status: string;
  customerSince: string;
  favoriteRestaurants: {
    name: string;
    orderCount: number;
    rating: number;
  }[];
}


interface OverviewTabProps {
  customer: Customer;
  onSwitchToOrders?: () => void;
}

interface SpendingOverviewData {
  customer: {
    id: string;
    name: string;
  };
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
  summary: {
    totalSpent: number;
    orderCount: number;
    averageOrderValue: number;
    spendingChangePercent: number;
  };
  spendingData: {
    date: string;
    amount: number;
    orderCount: number;
  }[];
}

export default function OverviewTab({
  customer,
  onSwitchToOrders
}: OverviewTabProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [spendingData, setSpendingData] = useState<SpendingOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch spending overview data
  const fetchSpendingOverview = async (period: string) => {
    try {
      setLoading(true);
      setError(null);



      const response = await fetch(`/api/admin/customers/${customer.id}/spending-overview?period=${period}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });


      if (!response.ok) {
        console.error('❌ API call failed with status:', response.status);
        console.error('❌ Response status text:', response.statusText);

        try {
          const errorText = await response.text();
          console.error('❌ Error response body:', errorText);
        } catch (textError) {
          console.error('❌ Could not read error response body:', textError);
        }

        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setSpendingData(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch spending overview');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch spending overview');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts or period changes
  useEffect(() => {
    if (customer?.id) {
      void fetchSpendingOverview(selectedPeriod);
    }
  }, [customer?.id, selectedPeriod]);

  // Metrics cards data
  const metricsCards = [
    {
      title: 'Total Orders',
      value: customer?.totalOrders?.toString() || '0',
      icon: ShoppingCart,
      type: 'normal'
    },
    {
      title: 'Total Spending',
      value: `$${customer?.totalSpendings?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      type: 'normal'
    },
    {
      title: 'Average Order Value',
      value: `$${customer?.avgOrderValue?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      type: 'normal'
    },
    {
      title: 'Last Order Amount',
      value: `$${customer?.lastOrder?.totalAmount?.toFixed(2) || '0.00'}`,
      icon: Award,
      type: 'normal'
    },
    {
      title: 'Last Order',
      value: customer?.lastOrder?.orderDate ? new Date(customer.lastOrder.orderDate).toLocaleDateString() : 'Never',
      icon: Calendar,
      type: 'normal'
    },
    {
      title: 'Customer Since',
      value: customer?.customerSince ? new Date(customer.customerSince).toLocaleDateString() : 'Unknown',
      icon: Clock,
      type: 'normal'
    }
  ];

  // Transform data for chart
  const transformedSpendingData = spendingData?.spendingData?.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    spending: item.amount
  })) || [];

  // Calculate spending growth from API data
  const spendingGrowth = spendingData?.summary?.spendingChangePercent || 0;

  return (
    <div className='flex flex-col gap-4 w-full pt-5'>
      {/* Metrics Cards Grid */}
      <div className='grid grid-cols-2 gap-3 w-full'>
        {metricsCards.map((card, index) => (
          <div
            key={index}
            className='flex flex-col justify-center items-start p-6 gap-4 w-full h-[99px] bg-white border border-[#EDEDEB] rounded-[10px] shadow-sm'
          >
            <div className='flex items-center gap-3 w-full'>
              <card.icon className='text-[20px] text-[#FABB17] flex-shrink-0' />
              <span className='text-[13px] leading-[24px] tracking-[-0.02em] capitalize text-[#4C515C] flex-1'>
                {card.title}
              </span>
            </div>
            <div className='flex items-center w-full'>
              <span className='font-public-sans font-bold text-[20px] leading-[24px] tracking-[-0.05em] capitalize text-[#2F2F2F]'>
                {card.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Spending Chart Section */}
      <div className='bg-white border border-[#EDEDEB] rounded-[10px] p-6'>
        <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6'>
          <div>
            <h3 className='text-[15px] font-medium text-[#3F4956] capitalize'>Spending Overview</h3>
            <p className='text-[13px] text-[#6B7280] mt-1'>Track customer spending patterns over time</p>
          </div>
          
          <div className='flex items-center gap-4 mt-4 lg:mt-0'>
            <div className='flex items-center gap-2'>
              <span className='text-[13px] font-medium text-[#2F2F2F]'>
                Total: ${spendingData?.summary?.totalSpent?.toFixed(2) || '0.00'}
              </span>
              <span className={`text-[11px] px-2 py-1 rounded-full ${
                spendingGrowth >= 0
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {spendingGrowth >= 0 ? '+' : ''}{spendingGrowth.toFixed(1)}%
              </span>
            </div>

            <div className='relative'>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                disabled={loading}
                className='text-[13px] text-[#6B7280] border border-[#EDEDEB] rounded-[6px] px-2 py-1 bg-white appearance-none pr-8 disabled:opacity-50'
              >
                <option value='7'>Last 7 days</option>
                <option value='30'>Last 30 days</option>
                <option value='90'>Last 90 days</option>
              </select>
              <ChevronDown className='absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-[#6B7280] pointer-events-none' />
            </div>
          </div>
        </div>

        {error ? (
          <div className='flex items-center justify-center h-[300px]'>
            <div className='text-center'>
              <p className='text-red-600 mb-2'>Error loading spending data</p>
              <p className='text-[#6B7280] text-sm'>{error}</p>
            </div>
          </div>
        ) : (
          <div className={`transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
            <div className='h-[300px]'>
              {loading ? (
                <div className='flex items-center justify-center h-full'>
                  <div className='text-center'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#FABB17] mx-auto mb-2'></div>
                    <p className='text-[#6B7280]'>Loading spending overview...</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width='100%' height='100%'>
                  <AreaChart data={transformedSpendingData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id='colorSpending' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='44.33%' stopColor='rgba(255, 235, 184, 0.48)' />
                        <stop offset='87.84%' stopColor='rgba(255, 235, 184, 0.0912)' />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray='3 3' stroke='#EDEDEB' />
                    <XAxis
                      dataKey='date'
                      stroke='#6B7280'
                      axisLine={false}
                      tickLine={false}
                      tickMargin={10}
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis
                      stroke='#6B7280'
                      axisLine={false}
                      tickLine={false}
                      tickMargin={10}
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#F9FAFB',
                        border: '1px solid #EDEDEB',
                        borderRadius: '6px'
                      }}
                      formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Spending']}
                    />
                    <Area
                      type='monotone'
                      dataKey='spending'
                      stroke='#FABB17'
                      strokeWidth={2}
                      fill='url(#colorSpending)'
                      dot={false}
                      activeDot={{ fill: '#FABB17', r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Favorite Restaurants */}
      <div className='bg-white border border-[#EDEDEB] rounded-[10px] p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-[15px] font-medium text-[#3F4956] capitalize'>Favorite Restaurants</h3>
          {onSwitchToOrders && (
            <button
              onClick={onSwitchToOrders}
              className='text-[#FABB17] hover:underline text-[13px] font-medium'
            >
              View All Orders →
            </button>
          )}
        </div>
        
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {customer?.favoriteRestaurants?.slice(0, 3).map((restaurant, index) => (
            <div key={index} className='border border-[#E5E7EB] rounded-lg p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <h4 className='font-medium text-[#2F2F2F]'>{restaurant.name}</h4>
                  <p className='text-[13px] text-[#6B7280]'>
                    {restaurant.orderCount} orders
                  </p>
                </div>
                <div className='text-yellow-500'>
                  ★ {restaurant.rating > 0 ? restaurant.rating.toFixed(1) : 'N/A'}
                </div>
              </div>
            </div>
          )) || (
            <div className='col-span-3 text-center text-[#6B7280] py-8'>
              No favorite restaurants yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}