import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface CustomerGrowthData {
  period: string;
  customerCount: number;
  periodLabel: string;
  cumulativeCustomers: number;
}

interface RevenueData {
  period: string;
  totalRevenue: number;
  orderCount: number;
  averageOrderValue: number;
  periodLabel: string;
  cumulativeRevenue: number;
}

export function ChartsSection() {
  const [customerGrowthData, setCustomerGrowthData] = useState<CustomerGrowthData[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [customerLoading, setCustomerLoading] = useState(true);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [revenueError, setRevenueError] = useState<string | null>(null);
  const [customerPeriod, setCustomerPeriod] = useState('monthly');
  const [revenuePeriod, setRevenuePeriod] = useState('monthly');

  // Fetch customer growth data
  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setCustomerLoading(true);
        setCustomerError(null);

        const response = await fetch(`/api/admin/analytics/customer-growth?period=${customerPeriod}`);
        const data = await response.json();

        if (!response.ok) 
          setCustomerError(`Failed to load customer growth: ${data.message || 'Unknown error'}`);
         else if (data.success) 
          setCustomerGrowthData(data.data.growth);
        
      } catch (error) {
        console.error('Error fetching customer growth data:', error);
        setCustomerError('Network error occurred while loading customer data');
      } finally {
        setCustomerLoading(false);
      }
    };

    void fetchCustomerData();
  }, [customerPeriod]);

  // Fetch revenue data
  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setRevenueLoading(true);
        setRevenueError(null);

        const response = await fetch(`/api/admin/analytics/revenue-overview?period=${revenuePeriod}`);
        const data = await response.json();

        if (!response.ok) 
          setRevenueError(`Failed to load revenue data: ${data.message || 'Unknown error'}`);
         else if (data.success) 
          setRevenueData(data.data.revenue);
        
      } catch (error) {
        console.error('Error fetching revenue data:', error);
        setRevenueError('Network error occurred while loading revenue data');
      } finally {
        setRevenueLoading(false);
      }
    };

    void fetchRevenueData();
  }, [revenuePeriod]);

  if (customerLoading && revenueLoading) 
    return (
      <div className='grid grid-cols-2 gap-4'>
        <div className='flex flex-col gap-4 p-6 bg-white border border-[#EDEDEB] rounded-[10px]'>
          <div className='flex items-center justify-center h-[300px]'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#FABB17] mx-auto mb-2'></div>
              <p className='text-[#6B7280]'>Loading customer growth...</p>
            </div>
          </div>
        </div>
        <div className='flex flex-col gap-4 p-6 bg-white border border-[#EDEDEB] rounded-[10px]'>
          <div className='flex items-center justify-center h-[300px]'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#FABB17] mx-auto mb-2'></div>
              <p className='text-[#6B7280]'>Loading revenue overview...</p>
            </div>
          </div>
        </div>
      </div>
    );
  

  // Transform data for charts
  const transformedCustomerData = customerGrowthData.map(item => ({
    month: item.periodLabel,
    value: item.customerCount
  }));

  const transformedRevenueData = revenueData.map(item => ({
    date: item.periodLabel,
    revenue: item.totalRevenue
  }));

  // Calculate revenue summary
  const latestRevenue = revenueData.length > 0 ? revenueData[revenueData.length - 1] : null;
  const previousRevenue = revenueData.length > 1 ? revenueData[revenueData.length - 2] : null;
  const revenueChange = latestRevenue && previousRevenue
    ? ((latestRevenue.totalRevenue - previousRevenue.totalRevenue) / previousRevenue.totalRevenue * 100).toFixed(0)
    : '0';

  return (
    <div className='grid grid-cols-2 gap-4'>
      {/* Customer Growth Chart */}
      <div className='flex flex-col gap-4 p-6 bg-white border border-[#EDEDEB] rounded-[10px]'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-[15px] font-medium text-[#3F4956] capitalize'>
            Customer Growth
          </h2>
          <select
            value={customerPeriod}
            onChange={(e) => setCustomerPeriod(e.target.value)}
            disabled={customerLoading}
            className='text-[13px] text-[#6B7280] border border-[#EDEDEB] rounded-[6px] px-2 py-1 bg-white disabled:opacity-50'
          >
            <option value='weekly'>Weekly</option>
            <option value='monthly'>Monthly</option>
            <option value='yearly'>Yearly</option>
          </select>
        </div>
        {customerError ? (
          <div className='flex items-center justify-center h-[300px]'>
            <div className='text-center'>
              <p className='text-red-600 mb-2'>Error loading customer data</p>
              <p className='text-[#6B7280] text-sm'>{customerError}</p>
            </div>
          </div>
        ) : (
          <div className={`transition-opacity duration-300 ${customerLoading ? 'opacity-50' : 'opacity-100'}`}>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={transformedCustomerData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }} barSize={30}>
                <CartesianGrid strokeDasharray='3 3' stroke='#EDEDEB' />
                <XAxis
                  dataKey='month'
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
                />
                <Bar dataKey='value' fill='#FABB17' radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Revenue Overview Chart */}
      <div className='flex flex-col gap-4 p-6 bg-white border border-[#EDEDEB] rounded-[10px]'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex flex-col gap-2'>
            <h2 className='text-[15px] font-medium text-[#3F4956] capitalize'>
              Revenue Overview
            </h2>
            <div className='flex items-center gap-2'>
              <span className='text-[24px] font-bold text-[#2F2F2F]'>
                ${latestRevenue ? latestRevenue.totalRevenue.toLocaleString() : '0'}
              </span>
              <span className='text-[12px] font-normal text-[#6B7280]'>
                {revenueChange !== '0' ? `${revenueChange}% vs last period` : 'No previous data'}
              </span>
            </div>
          </div>
          <select
            value={revenuePeriod}
            onChange={(e) => setRevenuePeriod(e.target.value)}
            disabled={revenueLoading}
            className='text-[13px] text-[#6B7280] border border-[#EDEDEB] rounded-[6px] px-2 py-1 bg-white disabled:opacity-50'
          >
            <option value='weekly'>Weekly</option>
            <option value='monthly'>Monthly</option>
            <option value='yearly'>Yearly</option>
          </select>
        </div>
        {revenueError ? (
          <div className='flex items-center justify-center h-[250px]'>
            <div className='text-center'>
              <p className='text-red-600 mb-2'>Error loading revenue data</p>
              <p className='text-[#6B7280] text-sm'>{revenueError}</p>
            </div>
          </div>
        ) : (
          <div className={`transition-opacity duration-300 ${revenueLoading ? 'opacity-50' : 'opacity-100'}`}>
            <ResponsiveContainer width='100%' height={250}>
              <AreaChart data={transformedRevenueData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id='colorRevenue' x1='0' y1='0' x2='0' y2='1'>
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
                />
                <Area
                  type='monotone'
                  dataKey='revenue'
                  stroke='#FABB17'
                  strokeWidth={2}
                  fill='url(#colorRevenue)'
                  dot={false}
                  activeDot={{ fill: '#FABB17', r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
