'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { MdDeliveryDining, MdCheckCircle, MdShoppingCart, MdAttachMoney } from 'react-icons/md';
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
import { type RevenueTimeSeriesData } from '@/lib/server-actions/restaurant-actions';

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

interface BestSellingItem {
  id: string;
  name: string;
  description: string;
  category: string;
  currentPrice: number;
  imageUrls: string[];
  restaurant: {
    id: string;
    name: string;
    ownerName: string;
  };
  orderCount: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

interface Restaurant {
  id: string;
  restaurantName: string;
  phoneNumber: string;
  email: string;
  address: string;
  status: string;
  verificationStatus: string;
  verificationRejectionReason?: string | null;
  verifiedAt?: string | null;
  registrationDate: string;
  cuisineType: string;
  cuisineArray?: string[];
  description?: string | null;
  operatingHours?: {
    [key: string]: {
      isOpen: boolean;
      openTime: string;
      closeTime: string;
    } | any[];
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  profilePhotoUrl?: string | null;
  coverPhotoUrl?: string | null;
  taxRegistrationNumber?: string | null;
  documents?: {
    foodServiceLicense?: string;
    governmentRegistrationCertificate?: string;
    healthInspectionReport?: string;
  };
  user?: {
    id: string;
    email: string;
    phone: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  stats?: {
    totalMeals: number;
    totalOrders: number;
    totalPromotions: number;
    totalEarnings: number;
  };
  analytics?: {
    totalOrdersCompleted: number;
    orderCompletionRate: number;
    averageDeliveryTime: number;
    totalRevenueTransferred: number;
  };
  recentMeals?: Array<{
    id: string;
    name: string;
    price: number;
    inStock: boolean;
    category: string;
    createdAt: string;
  }>;
  recentOrders?: any[];
  recentPromotions?: any[];
  updatedAt: string;
}

interface OverviewTabProps {
  restaurant: Restaurant;
  bestSellingItems: BestSellingItem[];
  bestSellingLoading: boolean;
  revenueData: RevenueTimeSeriesData[];
  revenueLoading: boolean;
  revenueSummary: {
    totalRevenue: number;
    growthRate: number;
  };
}

export default function OverviewTab({
  restaurant,
  bestSellingItems,
  bestSellingLoading,
  revenueData,
  revenueLoading,
  revenueSummary
}: OverviewTabProps) {
  const [bestSellingCollapsed, setBestSellingCollapsed] = useState(false);

  const statsCards = restaurant
    ? [
        {
          title: 'Average Delivery Time',
          value: restaurant.analytics?.averageDeliveryTime !== undefined && restaurant.analytics?.averageDeliveryTime !== null
            ? `${restaurant.analytics.averageDeliveryTime} min`
            : 'N/A',
          icon: MdDeliveryDining
        },
        {
          title: 'Order Completion Rate',
          value: restaurant.analytics?.orderCompletionRate !== undefined && restaurant.analytics?.orderCompletionRate !== null
            ? `${restaurant.analytics.orderCompletionRate}%`
            : 'N/A',
          icon: MdCheckCircle
        },
        {
          title: 'Total Orders Completed',
          value: restaurant.stats?.totalOrders?.toLocaleString() || '0',
          icon: MdShoppingCart
        },
        {
          title: 'Total Revenue',
          value: `$${restaurant.stats?.totalEarnings?.toLocaleString() || '0'}`,
          icon: MdAttachMoney
        }
      ]
    : [];

  // Chart data for revenue overview - using real API data
  const chartData = {
    labels: revenueData.map(item => {
      const date = new Date(item.period + '-01');
      return date.toLocaleDateString('en-US', { month: 'short' });
    }),
    datasets: [
      {
        label: 'Revenue',
        data: revenueData.map(item => item.revenue),
        fill: true,
        backgroundColor: (context: ScriptableContext<'line'>) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(255, 235, 184, 0.48)');
          gradient.addColorStop(1, 'rgba(255, 235, 184, 0.09)');
          return gradient;
        },
        borderColor: '#FABB17',
        borderWidth: 2,
        pointBackgroundColor: '#FABB17',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0
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
    interaction: {
      intersect: false,
      mode: 'index' as const
    },
    elements: {
      point: {
        hoverBackgroundColor: '#FABB17',
        hoverBorderColor: '#FFFFFF',
        hoverBorderWidth: 3
      }
    }
  };

  return (
    <div className='flex flex-col gap-4 w-full'>
      {/* Stats Cards */}
      <div className='pt-4 grid grid-cols-2 gap-3 w-full'>
        {statsCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <div
              key={index}
              className='flex flex-col justify-center items-start p-6 gap-4 w-full h-[99px] bg-white border border-[#EDEDEB] rounded-[10px] shadow-sm'
            >
              <div className='flex items-center gap-3 w-full'>
                <IconComponent className='text-[20px] text-[#FABB17] flex-shrink-0' />
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
          );
        })}
      </div>

      {/* Best Selling Items Section */}
      <div className={`flex flex-col justify-center items-start p-[15px_14px] gap-[13px] w-full ${bestSellingCollapsed ? 'min-h-[60px]' : 'min-h-[296px]'} bg-white border border-[rgba(236,231,219,0.6)] rounded-[8px] transition-all duration-300`}>
        <div 
          className='flex justify-between items-center p-0 gap-[24px] w-full h-[23px] cursor-pointer'
          onClick={() => setBestSellingCollapsed(!bestSellingCollapsed)}
        >
          <span className='font-bold text-[14px] leading-[19px] tracking-[-0.04em] capitalize text-[#4A463B] whitespace-nowrap'>
            Best Selling Items
          </span>
          <div className='flex justify-center items-center p-0 gap-[6px] w-[23px] h-[23px] bg-[#FFF4D8] rounded-[18px] transition-transform duration-300'>
            <ChevronDown 
              className={`w-[14px] h-[14px] text-[#4A463B] transition-transform duration-300 ${bestSellingCollapsed ? 'rotate-0' : 'rotate-180'}`} 
            />
          </div>
        </div>

        {!bestSellingCollapsed && (
          <div className='flex flex-col justify-center items-start p-[8px_9px] gap-[13px] w-full min-h-[230px] bg-white border border-[rgba(236,231,219,0.6)] rounded-[8px] animate-in slide-in-from-top-2 duration-300'>
            {bestSellingLoading ? (
              <div className='flex items-center justify-center w-full h-[214px]'>
                <span className='text-[#6B7280]'>Loading best selling items...</span>
              </div>
            ) : bestSellingItems.length === 0 ? (
              <div className='flex items-center justify-center w-full h-[214px]'>
                <span className='text-[#6B7280]'>No best selling items found</span>
              </div>
            ) : (
            <div className='flex flex-col justify-center items-start p-0 gap-[24px] w-full min-h-[214px]'>
              <div className='flex flex-col items-start p-0 gap-[13px] w-full min-h-[214px]'>
                <div className='flex items-start p-0 w-full min-h-[214px]'>
                  {/* Item Name Column */}
                  <div className='flex flex-col items-start p-0 w-[50%] min-h-[214px]'>
                    {/* Header */}
                    <div className='flex items-center p-[12px_30px_12px_12px] gap-[18px] w-full h-[34px] bg-[#FBF9F4] border-b border-[#ECE7DB] rounded-tl-[6px]'>
                      <span className='font-medium text-[13px] leading-[19px] tracking-[-0.04em] capitalize text-[#7E7A71] whitespace-nowrap'>
                        Item
                      </span>
                    </div>
                    {/* Data Rows */}
                    {bestSellingItems.slice(0, 4).map((item, index) => (
                      <div key={item.id} className={`flex items-center p-[16px_30px_16px_12px] gap-[18px] w-full h-[45px] ${index < 3 ? 'border-b border-[#ECE7DB]' : ''}`}>
                        <div className='flex items-center p-0 gap-[12px] flex-1 h-[19px]'>
                          <div className='flex flex-col items-start p-0 gap-[2px] flex-1 h-[19px]'>
                            <span className='font-normal text-[13px] leading-[19px] tracking-[-0.04em] capitalize text-[#7E7A71] whitespace-nowrap overflow-hidden text-ellipsis'>
                              {item.name}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Orders Column */}
                  <div className='flex flex-col items-start p-0 w-[25%] min-h-[214px]'>
                    {/* Header */}
                    <div className='flex justify-center items-center p-[12px_30px_12px_12px] gap-[18px] w-full h-[34px] bg-[#FBF9F4] border-b border-[#ECE7DB]'>
                      <span className='font-medium text-[13px] leading-[19px] tracking-[-0.04em] capitalize text-[#7E7A71] whitespace-nowrap'>
                        Orders
                      </span>
                    </div>
                    {/* Data Rows */}
                    {bestSellingItems.slice(0, 4).map((item, index) => (
                      <div key={item.id} className={`flex justify-center items-center p-[16px_30px_16px_12px] gap-[18px] w-full h-[45px] ${index < 3 ? 'border-b border-[#ECE7DB]' : ''}`}>
                        <div className='flex items-center p-0 gap-[12px] flex-1 h-[19px] justify-center'>
                          <div className='flex flex-col items-start p-0 gap-[2px] h-[19px]'>
                            <span className='font-normal text-[13px] leading-[19px] tracking-[-0.04em] capitalize text-[#7E7A71] whitespace-nowrap'>
                              {item.totalOrders}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Revenue Column */}
                  <div className='flex flex-col items-start p-0 w-[25%] min-h-[214px]'>
                    {/* Header */}
                    <div className='flex justify-center items-center p-[12px_30px_12px_12px] gap-[18px] w-full h-[34px] bg-[#FBF9F4] border-b border-[#ECE7DB] rounded-tr-[6px]'>
                      <span className='font-medium text-[13px] leading-[19px] tracking-[-0.04em] capitalize text-[#7E7A71] whitespace-nowrap'>
                        Revenue
                      </span>
                    </div>
                    {/* Data Rows */}
                    {bestSellingItems.slice(0, 4).map((item, index) => (
                      <div key={item.id} className={`flex justify-center items-center p-[16px_30px_16px_12px] gap-[18px] w-full h-[45px] ${index < 3 ? 'border-b border-[#ECE7DB]' : ''}`}>
                        <div className='flex items-center p-0 gap-[12px] flex-1 h-[19px] justify-center'>
                          <div className='flex flex-col items-start p-0 gap-[2px] h-[19px]'>
                            <span className='font-normal text-[13px] leading-[19px] tracking-[-0.04em] capitalize text-[#7E7A71] whitespace-nowrap'>
                              ${item.totalRevenue}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        )}
      </div>

      {/* Revenue Overview Chart */}
      <div className='relative w-full h-[436px] bg-white border border-[#EFEFEF] rounded-[10px] p-4'>
        {/* Chart Header */}
        <div className='flex justify-between items-center mb-6'>
          {/* Left Content */}
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2'>
              <h3 className='font-bold text-[17px] leading-[19px] tracking-[-0.02em] capitalize text-[#1F2937]'>
                Revenue Overview
              </h3>
            </div>
          </div>

          {/* Right Content */}
          <div className='flex items-center gap-3'>
            <span className='font-semibold text-[26px] leading-[29px] tracking-[-0.05em] capitalize text-[#2F2F2F]'>
              {revenueLoading ? 'Loading...' : `$${revenueSummary.totalRevenue.toLocaleString()}`}
            </span>
            <div className='flex items-center gap-2'>
              <div className={`flex items-center border rounded-full px-2 py-1 ${
                revenueSummary.growthRate >= 0 
                  ? 'bg-[#C0FFE1] border-[#95C7AF]' 
                  : 'bg-[#FFE1E1] border-[#C7A095]'
              }`}>
                <div className='flex items-center gap-1'>
                  <div className='w-3 h-3 flex items-center justify-center'>
                    <svg width='8' height='6' viewBox='0 0 8 6' fill='none'>
                      <path 
                        d={revenueSummary.growthRate >= 0 ? 'M4 0L7.5 5.5H0.5L4 0Z' : 'M4 6L7.5 0.5H0.5L4 6Z'} 
                        fill={revenueSummary.growthRate >= 0 ? '#00715D' : '#D03B3B'}
                      />
                    </svg>
                  </div>
                  <span className={`font-medium text-[11.66px] leading-[12px] ${
                    revenueSummary.growthRate >= 0 ? 'text-[#00715D]' : 'text-[#D03B3B]'
                  }`}>
                    {Math.abs(revenueSummary.growthRate)}%
                  </span>
                </div>
              </div>
              <span className='font-normal text-[14px] leading-[24px] tracking-[-0.02em] text-[#686C75]'>
                vs last month
              </span>
            </div>
          </div>
        </div>

        {/* Chart Container */}
        <div className='relative h-[350px] w-full'>
          {revenueLoading ? (
            <div className='flex items-center justify-center w-full h-full'>
              <span className='text-[#6B7280]'>Loading revenue data...</span>
            </div>
          ) : revenueData.length === 0 ? (
            <div className='flex items-center justify-center w-full h-full'>
              <span className='text-[#6B7280]'>No revenue data available</span>
            </div>
          ) : (
            <Line data={chartData} options={chartOptions} />
          )}
        </div>
      </div>
    </div>
  );
}
