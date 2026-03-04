'use client';

import { useState, useEffect } from 'react';
import { KPISection } from './kpi-section';
import { ApprovalLists } from './approval-list';
import { ChartsSection } from './charts-section';
import { RemindersSection } from './reminders-section';
import { UserInfo } from '@/@types';

interface KPIMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalRestaurants: number;
  totalRiders: number;
  monthlyChanges: {
    revenue: { percentageChange: number };
    orders: { percentageChange: number };
    customers: { percentageChange: number };
    restaurants: { percentageChange: number };
    riders: { percentageChange: number };
  };
}

interface PendingRider {
  id: string;
  name: string;
  email: string;
  underReviewSince: string;
}

interface PendingRestaurant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
}


export function DashboardLanding({ userInfo }: { userInfo: UserInfo }) {
  const [metrics, setMetrics] = useState<KPIMetrics | null>(null);
  const [pendingRiders, setPendingRiders] = useState<PendingRider[]>([]);
  const [pendingRestaurants, setPendingRestaurants] = useState<PendingRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, approvalRes] = await Promise.all([
          fetch('/api/admin/analytics'),
          fetch('/api/admin/analytics/awaiting-approval')
        ]);

        const analyticsData = await analyticsRes.json();
        const approvalData = await approvalRes.json();

        if (!analyticsRes.ok) {
          setError(`Failed to load analytics: ${analyticsData.message || 'Unknown error'}`);
        } else if (analyticsData.success) {
          setMetrics(analyticsData.data);
        }

        if (!approvalRes.ok) {
          setError(`Failed to load approval data: ${approvalData.message || 'Unknown error'}`);
        } else if (approvalData.success) {
          setPendingRiders(approvalData.data.pendingRiders);
          setPendingRestaurants(approvalData.data.pendingRestaurants);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Network error occurred while loading data');
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[200px]'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#FABB17] mx-auto mb-2'></div>
          <p className='text-[#6B7280]'>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-[200px]'>
        <div className='text-center'>
          <p className='text-red-600 mb-2'>Error loading data</p>
          <p className='text-[#6B7280] text-sm'>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-4 w-full pt-2'>
      {/* Welcome Section */}
      <div className='flex items-center justify-between'>
        <h1 className='text-[21px] font-bold text-[#1F2937] capitalize'>
          Welcome Back, {userInfo?.name}.
        </h1>
      </div>

      {/* KPI Cards */}
      {metrics && <KPISection metrics={metrics} />}

      {/* restaurants and riders Section */}
      <ApprovalLists pendingRiders={pendingRiders} pendingRestaurants={pendingRestaurants} />

      {/* Charts Section */}
      <ChartsSection />

      {/* Reminders Section */}
      <RemindersSection />
    </div>
  );
}
