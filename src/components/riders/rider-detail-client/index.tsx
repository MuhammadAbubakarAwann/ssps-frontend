'use client';

import { useState, useEffect } from 'react';
import { Star, Mail, Phone, Car } from 'lucide-react';
import Image from 'next/image';
import {
  fetchRiderDetails,
  fetchRiderRevenueOverview,
  type RiderRevenueData
} from '@/lib/server-actions/rider-actions';
import { toast } from 'sonner';
import OverviewTab from '../tabs/overview';

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
  bankInfo?: {
    accountNumber: string;
    accountName: string;
    bankName: string;
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

interface RiderMetrics {
  averageDeliveryTime: string;
  totalDeliveries: number;
  distanceCovered: number;
  totalRevenue: number;
  tipsEarned: number;
  customerRating: number;
}

interface RiderDetailClientProps {
  riderId: string;
}

type TabType = 'overview' | 'deliveries' | 'reviews' | 'documents';

export default function RiderDetailClient({ riderId }: RiderDetailClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [rider, setRider] = useState<Rider | null>(null);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<RiderMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<RiderRevenueData[]>([]);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [revenueSummary, setRevenueSummary] = useState<{
    totalRevenue: number;
    growthRate: number;
  }>({ totalRevenue: 0, growthRate: 0 });

  const tabs: { label: string; key: TabType }[] = [
    { label: 'Overview', key: 'overview' },
    { label: 'Deliveries', key: 'deliveries' },
    { label: 'Reviews', key: 'reviews' },
    { label: 'Documents', key: 'documents' }
  ];

  // Fetch rider details
  const fetchRider = async () => {
    try {
      setLoading(true);
      const data = await fetchRiderDetails(riderId);

      const nameParts = data.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const transformedRider: Rider = {
        id: data.id,
        name: data.name,
        firstName: firstName,
        lastName: lastName,
        email: data.email,
        phone: data.phoneNumber,
        status: data.status,
        avatar: null, // No avatar in API response
        registrationDate: data.joinedDate,
        lastLoginAt: data.lastActive,
        vehicleInfo: {
          type: data.vehicleDetails.vehicleType,
          brand: data.vehicleDetails.brand,
          plateNumber: data.vehicleDetails.licensePlateNumber
        },
        bankInfo: {
          accountNumber: data.bankInformation.accountNumber,
          accountName: data.bankInformation.accountName,
          bankName: data.bankInformation.bank
        },
        verification: {
          status: data.verificationStatus,
          rejectionReason: null,
          verifiedAt: data.isVerified ? data.joinedDate : null,
          isDocumentsVerified: data.isVerified
        },
        workInfo: {
          scheduleType: null,
          isAvailable: data.isAvailable
        },
        completedDeliveries: data.totalDeliveriesCompleted,
        rating: data.rating,
        joinedDate: data.joinedDate
      };

      setRider(transformedRider);

      // Set metrics from the same API response
      const metricsData: RiderMetrics = {
        averageDeliveryTime: data.averageDeliveryTime,
        totalDeliveries: data.totalDeliveries,
        distanceCovered: parseFloat(data.distanceCovered.replace(' km', '')) || 0,
        totalRevenue: data.totalRevenue,
        tipsEarned: data.tipsEarned,
        customerRating: data.rating
      };
      setMetrics(metricsData);
      setMetricsLoading(false);

    } catch (error) {
      console.error('Error fetching rider details:', error);
      toast.error('Failed to load rider details');
    } finally {
      setLoading(false);
    }
  };


  // Fetch revenue overview data
  const fetchRevenueData = async () => {
    try {
      setRevenueLoading(true);
      const data = await fetchRiderRevenueOverview(riderId);

      if (data?.timeSeries) {
        setRevenueData(data.timeSeries);
        setRevenueSummary({
          totalRevenue: data.summary.totalRevenue,
          growthRate: data.summary.growthRate
        });
      } else {
        setRevenueData([]);
        setRevenueSummary({ totalRevenue: 0, growthRate: 0 });
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      toast.error('Failed to load revenue data');
      setRevenueData([]);
    } finally {
      setRevenueLoading(false);
    }
  };

  useEffect(() => {
    void fetchRider();
    void fetchRevenueData();
  }, [riderId]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            rider={rider!}
            metrics={metrics}
            metricsLoading={metricsLoading}
            revenueData={revenueData}
            revenueLoading={revenueLoading}
            revenueSummary={revenueSummary}
          />
        );
      case 'deliveries':
        return (
          <div className='flex items-center justify-center h-96 text-[#6B7280]'>
            Deliveries content will be implemented here
          </div>
        );
      case 'reviews':
        return (
          <div className='flex items-center justify-center h-96 text-[#6B7280]'>
            Reviews content will be implemented here
          </div>
        );
      case 'documents':
        return (
          <div className='flex items-center justify-center h-96 text-[#6B7280]'>
            Documents content will be implemented here
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className='flex gap-6 w-full pt-4'>
      <div className='flex gap-4 w-full bg-white'>
        {/* Left Sidebar */}
        <div className='flex flex-col items-center p-4 m-4  w-[20%] min-w-[320px] max-w-[400px] h-auto bg-[#F6F2E8] rounded-[10px] sticky top-0'>
          {/* Profile Picture */}
          <div className='flex justify-center mb-3'>
            <div className='relative w-[189px] h-[189px] rounded-[34px] overflow-hidden border-4 border-white shadow-[0px_1.71818px_3.43636px_rgba(169,194,209,0.05),0px_10.3091px_13.7455px_rgba(169,194,209,0.1)] flex items-center justify-center bg-white'>
              {loading ? (
                <div className='text-4xl text-gray-400'>⏳</div>
              ) : rider?.avatar ? (
                <Image
                  fill
                  src={rider.avatar}
                  alt={rider.name}
                  className='object-cover'
                />
              ) : (
                <div className='text-4xl text-gray-400'>👤</div>
              )}
            </div>
          </div>

          {/* Name */}
          <div>
            <h2 className='text-2xl font-bold text-[#2E2B24] text-center mb-3'>
              {loading ? 'Loading...' : rider?.name || 'Unknown Rider'}
            </h2>

            {/* Rating and Deliveries */}
            <div className='flex items-center justify-center gap-3 mb-6'>
              <div className='bg-[#FABB17] text-[#2E2B24] px-1 py-[1px] rounded-[4px] font-semibold text-sm flex items-center gap-1'>
                <span>
                  {loading ? '...' : rider?.rating?.toFixed(1) || '0.0'}
                </span>
                <Star className='w-4 h-4 fill-current' />
              </div>
              <span className='text-[#4A463B] text-sm font-medium'>
                {loading ? '...' : rider?.completedDeliveries || 0} Deliveries
              </span>
            </div>
          </div>

          {/* Contact Information */}
          <div className='space-y-3   border-b border-[#E8E4DA] bg-white w-full px-4 py-3 rounded-[10px] flex flex-col items-center'>
            <div className='flex items-center gap-2'>
              <Mail className='w-4 h-4 text-[#1F2937] flex-shrink-0' />
              <span className='text-sm text-[#1F2937] break-all'>
                {loading ? 'Loading...' : rider?.email || 'Not provided'}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <Phone className='w-4 h-4 text-[#1F2937] flex-shrink-0' />
              <span className='text-sm text-[#1F2937]'>
                {loading ? 'Loading...' : rider?.phone || 'Not provided'}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <Car className='w-4 h-4 text-[#1F2937] flex-shrink-0' />
              <span className='text-sm text-[#1F2937]'>
                {loading
                  ? 'Loading...'
                  : rider?.vehicleInfo?.type || 'Not specified'}
              </span>
            </div>
          </div>

          {/* Vehicle Details */}
          <div className='bg-white w-full px-4 py-3 rounded-[10px] mt-3'>
            <div className='border-b border-[#E8E4DA] my-1'>
              <h3 className='font-semibold text-[#2E2B24] text-sm mb-3'>
              Vehicle Details
            </h3>
            </div>
            <div className='space-y-3 text-sm'>
              <div className='flex justify-between'>
                <span className='text-[#626974]'>License Plate</span>
                <span className='font-medium text-[#1F2937]'>
                  {loading
                    ? '...'
                    : rider?.vehicleInfo?.plateNumber || 'Not provided'}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-[#626974]'>Brand</span>
                <span className='font-medium text-[#1F2937]'>
                  {loading
                    ? '...'
                    : rider?.vehicleInfo?.brand || 'Not specified'}
                </span>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className='bg-white w-full px-4 py-3 rounded-[10px] mt-3'>
            <div className='border-b border-[#E8E4DA] my-1'>
              <h3 className='font-semibold text-[#2E2B24] text-sm mb-3'>
              Bank Details
            </h3>
            </div>
            <div className='space-y-3 text-sm'>
              <div className='flex justify-between'>
                <span className='text-[#626974]'>Account Number</span>
                <span className='font-medium text-[#1F2937]'>
                  {loading
                    ? '...'
                    : rider?.bankInfo?.accountNumber || 'Not provided'}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-[#626974]'>Account Name</span>
                <span className='font-medium text-[#1F2937]'>
                  {loading
                    ? '...'
                    : rider?.bankInfo?.accountName || 'Not provided'}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-[#626974]'>Bank</span>
                <span className='font-medium text-[#1F2937]'>
                  {loading
                    ? '...'
                    : rider?.bankInfo?.bankName || 'Not provided'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className='flex-1'>
          {/* Tabs Navigation */}
          <div className='flex items-center p-[8px_0_0] gap-[8px] w-full h-[47px] border-b border-[#E0DDD5]'>
            <div className='flex gap-4'>
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex justify-center items-center p-[0_4px_16px] gap-[8px] h-[40px] border-b-2 rounded-none ${
                    activeTab === tab.key
                      ? 'border-[#FABB17] text-[#FABB17]'
                      : 'border-transparent text-[#6B7280] hover:text-[#4B5563]'
                  }`}
                >
                  <span
                    className={`text-[14px] leading-[20px] tracking-[-0.02em] capitalize ${
                      activeTab === tab.key ? 'font-semibold' : 'font-normal'
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
