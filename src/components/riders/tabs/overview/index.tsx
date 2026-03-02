'use client';

import { useState } from 'react';
import { ChevronDown, Clock, CheckCircle, DollarSign, Gift, Star } from 'lucide-react';
import { GiPathDistance } from 'react-icons/gi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  type ScriptableContext
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { type RiderRevenueData } from '@/lib/server-actions/rider-actions';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

interface RiderMetrics {
  averageDeliveryTime: string;
  totalDeliveries: number;
  distanceCovered: number;
  totalRevenue: number;
  tipsEarned: number;
  customerRating: number;
}

interface Rider {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  avatar: string | null;
  registrationDate: string;
  lastLoginAt: string | null;
  vehicleInfo: {
    type: string;
    brand: string | null;
    plateNumber: string | null;
  };
  verification: {
    status: string;
    rejectionReason: string | null;
    verifiedAt: string | null;
    isDocumentsVerified: boolean;
  };
  workInfo: {
    scheduleType: string | null;
    isAvailable: boolean;
  };
  completedDeliveries: number;
  rating: number;
  joinedDate: string;
}

interface OverviewTabProps {
  rider: Rider;
  metrics: RiderMetrics | null;
  metricsLoading: boolean;
  revenueData: RiderRevenueData[];
  revenueLoading: boolean;
  revenueSummary: {
    totalRevenue: number;
    growthRate: number;
  };
}

export default function OverviewTab({
  rider: _rider,
  metrics,
  metricsLoading,
  revenueData,
  revenueLoading,
  revenueSummary
}: OverviewTabProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('Last 30 days');

  // Metrics cards data
  const metricsCards = [
    {
      title: 'Average Delivery Time',
      value: metricsLoading ? '...' : metrics?.averageDeliveryTime || '0 min',
      icon: Clock,
      type: 'normal'
    },
    {
      title: 'Total Deliveries Completed',
      value: metricsLoading ? '...' : (metrics?.totalDeliveries?.toString() || '0'),
      icon: CheckCircle,
      type: 'normal'
    },
    {
      title: 'Distance Covered',
      value: metricsLoading ? '...' : `${metrics?.distanceCovered || 0} km`,
      icon: GiPathDistance,
      type: 'normal'
    },
    {
      title: 'Total Revenue',
      value: metricsLoading ? '...' : `$${metrics?.totalRevenue?.toLocaleString() || '0.00'}`,
      icon: DollarSign,
      type: 'normal'
    },
    {
      title: 'Tips Earned',
      value: metricsLoading ? '...' : `$${metrics?.tipsEarned?.toLocaleString() || '0.00'}`,
      icon: Gift,
      type: 'normal'
    },
    {
      title: 'Customer Rating',
      value: metricsLoading ? '...' : (metrics?.customerRating || 0),
      icon: Star,
      type: 'rating'
    }
  ];

  // Chart configuration
  const chartData = {
    labels: revenueData.map((item) => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Revenue',
        data: revenueData.map((item) => item.revenue),
        borderColor: '#FABB17',
        backgroundColor: (context: ScriptableContext<'line'>) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;

          if (!chartArea)
            return '#FABB17';

          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(250, 187, 23, 0.2)');
          gradient.addColorStop(1, 'rgba(250, 187, 23, 0.05)');
          return gradient;
        },
        fill: true,
        tension: 0,
        pointBackgroundColor: '#FABB17',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#FFFFFF',
        titleColor: '#1F2937',
        bodyColor: '#1F2937',
        borderColor: '#EDEFF2',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        titleFont: {
          weight: 'bold' as const,
          size: 14
        },
        bodyFont: {
          size: 13
        },
        padding: 12,
        callbacks: {
          title: () => '',
          label: (context: any) => `$${context.parsed.y.toLocaleString()}`
        },
        caretSize: 6,
        caretPadding: 8
      }
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: '#F5F5F5',
          drawOnChartArea: true,
          drawTicks: false
        },
        ticks: {
          color: '#667085',
          font: {
            size: 13,
            weight: 500
          },
          padding: 10
        },
        border: {
          display: false
        }
      },
      y: {
        display: false,
        grid: {
          display: true,
          color: '#D1D5DB',
          drawOnChartArea: true,
          lineWidth: 1,
          drawTicks: false,
          borderDash: [8, 4]
        },
        border: {
          display: false
        }
      }
    },
    elements: {
      point: {
        hoverBackgroundColor: '#FABB17'
      }
    }
  };

  return (
    <div className='flex flex-col gap-4 w-full pt-5'>
      {/* Metrics Cards Grid */}
      <div className='grid grid-cols-2 gap-3 w-full'>
        {metricsCards.map((metric, index) => (
          metric.type === 'rating' ? (
            <div
              key={index}
              className='flex flex-col justify-center items-start p-6 gap-4 w-full h-[99px] bg-white border border-[#EDEDEB] rounded-[10px] shadow-sm relative'
            >
              {/* Rating number in top right */}
              <div className='absolute top-4 right-4 rounded-[5px] flex items-center gap-1 bg-[#FABB17] text-black px-2 py-1 text-xs font-semibold'>
                <Star className='w-3 h-3 fill-current' />
                <span>{typeof metric.value === 'number' ? metric.value.toFixed(1) : '0.0'}</span>
              </div>

              {/* Title */}
              <div className='flex items-center w-full'>
                <span className='text-[13px] leading-[24px] tracking-[-0.02em] capitalize text-black font-semibold flex-1'>
                  {metric.title}
                </span>
              </div>

              {/* Stars and See Reviews */}
              <div className='flex items-center justify-between w-full'>
                <div className='flex items-center gap-1'>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-7 h-7 ${
                        star <= (typeof metric.value === 'number' ? metric.value : 0)
                          ? 'text-[#FABB17] fill-current'
                          : 'text-gray-300 fill-current'
                      }`}
                    />
                  ))}
                </div>
                <button className='text-[#FABB17] text-sm font-medium hover:underline'>
                  See Reviews
                </button>
              </div>
            </div>
          ) : (
            <div
              key={index}
              className='flex flex-col justify-center items-start p-6 gap-4 w-full h-[99px] bg-white border border-[#EDEDEB] rounded-[10px] shadow-sm'
            >
              <div className='flex items-center gap-3 w-full'>
                <metric.icon className='text-[20px] text-[#FABB17] flex-shrink-0' />
                <span className='text-[13px] leading-[24px] tracking-[-0.02em] capitalize text-[#4C515C] flex-1'>
                  {metric.title}
                </span>
              </div>
              <div className='flex items-center w-full'>
                <span className='font-public-sans font-bold text-[20px] leading-[24px] tracking-[-0.05em] capitalize text-[#2F2F2F]'>
                  {metric.value}
                </span>
              </div>
            </div>
          )
        ))}
      </div>

      {/* Revenue Overview Chart */}
      <div className='flex flex-col p-6 gap-6 bg-white border border-[#E5E7EB] rounded-[10px] shadow-sm'>
        {/* Header */}
        <div className='flex justify-between items-center'>
          <div className='flex flex-col gap-1'>
            <h3 className='text-lg font-semibold text-[#1F2937]'>Revenue Overview</h3>
            <div className='flex items-center gap-4'>
              <span className='text-3xl font-bold text-[#1F2937]'>
                ${revenueSummary.totalRevenue.toLocaleString()}
              </span>
              <span 
                className={`text-sm px-2 py-1 rounded-full ${
                  revenueSummary.growthRate >= 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {revenueSummary.growthRate >= 0 ? '+' : ''}{revenueSummary.growthRate.toFixed(1)}% vs last month
              </span>
            </div>
          </div>

          {/* Period Selector */}
          <div className='relative'>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className='appearance-none bg-white border border-[#E5E7EB] rounded-lg px-4 py-2 pr-8 text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#FABB17] focus:border-transparent cursor-pointer'
            >
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
            <ChevronDown className='absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none' />
          </div>
        </div>

        {/* Chart */}
        <div className='relative h-[300px]'>
          {revenueLoading ? (
            <div className='flex items-center justify-center h-full'>
              <div className='text-[#6B7280]'>Loading revenue data...</div>
            </div>
          ) : revenueData.length === 0 ? (
            <div className='flex items-center justify-center h-full'>
              <div className='text-center text-[#6B7280]'>
                <div className='text-lg mb-2'>No revenue data available</div>
                <div className='text-sm'>Revenue data will appear here once the rider starts completing deliveries</div>
              </div>
            </div>
          ) : (
            <Line data={chartData} options={chartOptions} />
          )}
        </div>
      </div>
    </div>
  );
}