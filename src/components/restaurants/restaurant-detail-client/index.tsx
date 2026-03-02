'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  fetchRestaurantDetails,
  fetchBestSellingItems,
  fetchRevenueOverview,
  type RevenueTimeSeriesData
} from '@/lib/server-actions/restaurant-actions';
import { toast } from 'sonner';
import Image from 'next/image';
import { Star, ChefHat } from 'lucide-react';
import OverviewTab from '@/components/restaurants/tabs/overview';
import MenuTab from '@/components/restaurants/tabs/menu';
import ReviewsTab from '@/components/restaurants/tabs/reviews';
import DocumentsTab from '@/components/restaurants/tabs/documents';

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
    };
    // Move specialDays outside the index signature
  } & {
    specialDays?: any[];
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

interface RestaurantDetailClientProps {
  restaurantId: string;
}

export default function RestaurantDetailClient({
  restaurantId
}: RestaurantDetailClientProps) {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [bestSellingItems, setBestSellingItems] = useState<BestSellingItem[]>(
    [],
  );
  const [bestSellingLoading, setBestSellingLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<RevenueTimeSeriesData[]>([]);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [revenueSummary, setRevenueSummary] = useState<{
    totalRevenue: number;
    growthRate: number;
  }>({ totalRevenue: 0, growthRate: 0 });

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'menu', label: 'Menu' },
    { key: 'reviews', label: 'Reviews' },
    { key: 'documents', label: 'Documents' }
  ];

  // Fetch best selling items via server action (handles auth via cookies)
  const fetchBestSellingItemsData = async () => {
    try {
      setBestSellingLoading(true);
      const data = await fetchBestSellingItems(restaurantId);

      if (data?.success && data?.data && Array.isArray(data.data)) {
        setBestSellingItems(data.data);
      } else {
        setBestSellingItems([]);
      }
    } catch (error) {
      console.error('Error fetching best selling items:', error);
      toast.error('Failed to load best selling items');
      setBestSellingItems([]);
    } finally {
      setBestSellingLoading(false);
    }
  };

  // Fetch revenue overview data via server action
  const fetchRevenueData = async () => {
    try {
      setRevenueLoading(true);
      const data = await fetchRevenueOverview(restaurantId);

      if (data?.success && data?.data?.timeSeries) {
        setRevenueData(data.data.timeSeries);
        setRevenueSummary({
          totalRevenue: data.data.summary.totalRevenue,
          growthRate: data.data.summary.growthRate
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
    // Fetch restaurant details
    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        const data = await fetchRestaurantDetails(restaurantId);

        const transformedRestaurant: Restaurant = {
          id: data.id,
          restaurantName: data.restaurantName,
          phoneNumber: data.phoneNumber,
          email: data.email,
          address: data.address,
          status: data.status,
          verificationStatus: data.verificationStatus,
          registrationDate: data.registrationDate,
          cuisineType: data.cuisineType,
          description: data.description,
          operatingHours: data.operatingHours
            ? Object.fromEntries(
                Object.entries(data.operatingHours)
                  .map(([day, hours]) => [
                    day,
                    hours
                      ? {
                          isOpen: hours.isOpen,
                          openTime: hours.open,
                          closeTime: hours.close
                        }
                      : undefined
                  ])
                  .filter(([_, hours]) => hours !== undefined),
              )
            : undefined,
          coordinates:
            data.latitude && data.longitude
              ? {
                  latitude: data.latitude,
                  longitude: data.longitude
                }
              : undefined,
          profilePhotoUrl: data.profilePhotoUrl,
          coverPhotoUrl: data.coverPhotoUrl,
          taxRegistrationNumber: data.taxRegistrationNumber,
          verifiedAt: data.verifiedAt,
          user: data.userId
            ? {
                id: data.userId,
                email: data.userEmail,
                phone: data.userPhone,
                status: data.userStatus,
                createdAt: '', // Not available in API response
                updatedAt: data.updatedAt
              }
            : undefined,
          stats: data.stats
            ? {
                totalMeals: data.stats.totalMeals,
                totalOrders: data.stats.totalOrders,
                totalPromotions: data.stats.totalPromotions,
                totalEarnings: 0 // Not available in API response
              }
            : undefined,
          updatedAt: data.updatedAt
        };

        setRestaurant(transformedRestaurant);
      } catch (error) {
        console.error('Error fetching restaurant details:', error);
        toast.error('Failed to load restaurant details');
        // Optionally redirect to restaurants list after a delay
        setTimeout(() => {
          router.push('/restaurants');
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    void fetchRestaurant();
    void fetchBestSellingItemsData();
    void fetchRevenueData();
  }, [restaurantId, router]);

  const handleBackClick = () => {
    router.push('/restaurants');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            restaurant={restaurant!}
            bestSellingItems={bestSellingItems}
            bestSellingLoading={bestSellingLoading}
            revenueData={revenueData}
            revenueLoading={revenueLoading}
            revenueSummary={revenueSummary}
          />
        );
      case 'menu':
        return <MenuTab restaurantId={restaurantId} />;
      case 'reviews':
        return <ReviewsTab restaurantId={restaurantId} />;
      case 'documents':
        return <DocumentsTab restaurantId={restaurantId} />;
      default:
        return (
          <OverviewTab
            restaurant={restaurant!}
            bestSellingItems={bestSellingItems}
            bestSellingLoading={bestSellingLoading}
            revenueData={revenueData}
            revenueLoading={revenueLoading}
            revenueSummary={revenueSummary}
          />
        );
    }
  };

  if (loading)
    return (
      <div className='min-h-screen bg-[#FFFDF8] flex items-center justify-center'>
        <div className='text-[#6B7280]'>Loading restaurant details...</div>
      </div>
    );

  if (!restaurant)
    return (
      <div className='min-h-screen bg-[#FFFDF8] flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-[#6B7280] mb-4'>Restaurant not found</div>
          <Button
            color='primary'
            size='medium'
            onClick={handleBackClick}
            variant='outline'
          >
            Back to Restaurants
          </Button>
        </div>
      </div>
    );

  return (
    <div className='flex flex-col gap-5 pt-4'>
      {/* Main Content */}
      <div className='flex gap-4 h-[840px] bg-white'>
        {/* Left Sidebar - Restaurant Profile */}
        <div className='flex flex-col items-center p-4 gap-[18px] w-[30%] min-w-[320px] max-w-[400px] h-auto bg-[#FFF5DA] rounded-[10px] sticky top-0'>
          {/* Cover & Profile Image Section */}
          <div className='flex flex-col items-center w-full max-w-[341px] h-[138px]'>
            {/* Cover Image */}
            <div className='relative w-full h-[104px] bg-white  rounded-[10px] overflow-hidden flex items-center justify-center'>
              {restaurant.coverPhotoUrl && (
                <Image
                  src={restaurant.coverPhotoUrl}
                  alt='Restaurant cover'
                  fill
                  className=' object-cover'
                />
              )}
            </div>

            {/* Profile Section */}
            <div className='flex items-center justify-between w-full max-w-[341px] h-[100px] px-[10px] -mt-[50px] relative z-10'>
              {/* Profile Image */}
              <div className='relative'>
                <div className='w-[100px] h-[100px] rounded-full border-[1.67px] border-white bg-white overflow-hidden shadow-[0px_2px_2px_rgba(0,0,0,0.25)] flex items-center justify-center'>
                  {restaurant.profilePhotoUrl ? (
                    <Image
                      src={restaurant.profilePhotoUrl}
                      alt='Restaurant profile'
                      width={100}
                      height={100}
                      className=' object-cover'
                    />
                  ) : (
                    <div className='w-full h-full bg-gray-200 flex items-center justify-center text-gray-400'>
                      <ChefHat className='w-8 h-8' />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Restaurant Name & Rating */}
          <div className='flex items-center justify-between w-full max-w-[341px] h-[24px] '>
            <h2 className=' font-extrabold text-[22px] leading-[24px] tracking-[-0.03em] capitalize text-[#2F2F2F]'>
              {restaurant.restaurantName}
            </h2>

            <div className='flex items-center gap-1 px-[5px] bg-[#FABB17] rounded text-black'>
              <span className='font-inter font-medium text-[14px] leading-[24px] tracking-[-0.03em]'>
                4.8
              </span>
              <Star className='h-3 w-3 fill-current' />
            </div>
          </div>

          {/* Restaurant Details Card */}
          <div className='flex flex-col items-center p-3 gap-[14px] w-full max-w-[341px] bg-white rounded-[6px] shadow-[0px_1px_2px_rgba(16,24,40,0.05)]'>
            {/* Header */}
            <div className='flex items-center justify-start w-full h-[26px]'>
              <h3 className=' font-bold text-[14px] leading-[15px] tracking-[-0.02em] capitalize text-[#2F2F2F]'>
                Business details
              </h3>
            </div>

            {/* Divider */}
            <div className='w-full h-0 border-b border-[#F2F0EA]' />

            {/* Details */}
            <div className='flex flex-col gap-[18px] w-full'>
              <div className='flex justify-between items-center'>
                <span className=' text-[13px] leading-[14px] tracking-[-0.25px] capitalize text-[#626974]'>
                  Contact Email
                </span>
                <span className=' text-[13px] leading-[19px] tracking-[-0.04em] lowercase text-[#1F2937]'>
                  {restaurant.email || 'Email not provided'}
                </span>
              </div>

              <div className='flex justify-between items-center'>
                <span className=' text-[13px] leading-[14px] tracking-[-0.25px] capitalize text-[#626974]'>
                  Phone Number
                </span>
                <span className=' text-[13px] leading-[19px] tracking-[-0.04em] capitalize text-[#1F2937]'>
                  {restaurant.phoneNumber || 'Phone not provided'}
                </span>
              </div>

              <div className='flex justify-between items-center'>
                <span className=' text-[13px] leading-[14px] tracking-[-0.25px] capitalize text-[#626974]'>
                  Cuisine Type (Region)
                </span>
                <span className=' text-[13px] leading-[20px] tracking-[-0.02em] capitalize text-[#1F2937]'>
                  {restaurant.cuisineType || 'Cuisine not specified'}
                </span>
              </div>

              <div className='flex justify-between items-center'>
                <span className=' text-[13px] leading-[14px] tracking-[-0.25px] text-[#626974]'>
                  Business Address
                </span>
                <span className=' text-[13px] leading-[20px] tracking-[-0.02em] lowercase text-[#1F2937]'>
                  {restaurant.address || 'Address not provided'}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Information Card */}
          <div className='flex flex-col items-center p-3 gap-[14px] w-full max-w-[341px] bg-white rounded-[6px] shadow-[0px_1px_2px_rgba(16,24,40,0.05)]'>
            {/* Header */}
            <div className='flex items-center justify-start w-full h-[26px]'>
              <h3 className=' font-bold text-[14px] leading-[15px] tracking-[-0.02em] capitalize text-[#2F2F2F]'>
                Owner/Manager Details
              </h3>
            </div>

            {/* Divider */}
            <div className='w-full h-0 border-b border-[#F2F0EA]' />

            {/* Contact Details */}
            <div className='flex flex-col gap-[18px] w-full'>
              <div className='flex justify-between items-center'>
                <span className=' text-[13px] leading-[14px] tracking-[-0.25px] capitalize text-[#626974]'>
                  Full Name
                </span>
                <span className=' text-[13px] leading-[19px] tracking-[-0.04em] capitalize text-[#1F2937]'>
                  {restaurant.user?.email?.split('@')[0] || 'Not provided'}
                </span>
              </div>

              <div className='flex justify-between items-center'>
                <span className=' text-[13px] leading-[14px] tracking-[-0.25px] capitalize text-[#626974]'>
                  Email
                </span>
                <span className=' text-[13px] leading-[19px] tracking-[-0.04em] lowercase text-[#1F2937]'>
                  {restaurant.user?.email ||
                    restaurant.email ||
                    'Email not provided'}
                </span>
              </div>

              <div className='flex justify-between items-center'>
                <span className=' text-[13px] leading-[14px] tracking-[-0.25px] capitalize text-[#626974]'>
                  Phone Number
                </span>
                <span className=' text-[13px] leading-[19px] tracking-[-0.04em] capitalize text-[#1F2937]'>
                  {restaurant.user?.phone ||
                    restaurant.phoneNumber ||
                    'Phone not provided'}
                </span>
              </div>
            </div>
          </div>

          {/* Location Card */}
          <div className='flex flex-col items-center p-[13px_12px_16px] gap-[14px] w-full max-w-[341px] h-[182px] bg-white rounded-[6px] shadow-[0px_1px_2px_rgba(16,24,40,0.05)]'>
            {/* Header */}
            <div className='flex flex-col items-center p-0 gap-[8px] w-full h-[26px]'>
              <div className='flex justify-space-between items-center p-0 gap-[4px] w-full h-[26px]'>
                <h3 className='margin-auto w-[119px] h-[15px]  font-bold text-[14px] leading-[15px] tracking-[-0.02em] capitalize text-[#2F2F2F]'>
                  Operational Hours
                </h3>
              </div>
            </div>

            {/* Divider */}
            <div className='w-full h-0 border-b border-[#F2F0EA]' />

            {/* Fields */}
            <div className='flex flex-col justify-center items-start p-[15px_14px] gap-[21px] w-full h-[99px] bg-white border border-[rgba(236,231,219,0.6)] rounded-[8px]'>
              <div className='flex items-start gap-[9px] w-full h-[69px]'>
                {/* Days Field */}
                <div className='flex gap-[18px] h-[69px] flex-1'>
                  <div className='flex flex-col items-start gap-[10px] h-[69px] flex-1'>
                    <span className=' font-semibold text-[12px] leading-[13px] tracking-[-0.03em] capitalize text-[#675E47]'>
                      Days
                    </span>
                    <div className='flex items-center p-[6px_11px] w-full h-[46px] bg-white border border-[#ECE7DB] rounded-[8px]'>
                      <span className='text-[12px] text-[#1F2937]'>
                        Mon-Fri
                      </span>
                    </div>
                  </div>
                </div>

                {/* Opening Field */}
                <div className='flex gap-[18px] h-[69px] flex-1'>
                  <div className='flex flex-col items-start gap-[10px] h-[69px] flex-1'>
                    <span className='font-semibold text-[12px] leading-[13px] tracking-[-0.03em] capitalize text-[#675E47]'>
                      Opening
                    </span>
                    <div className='flex items-center p-[6px_11px] w-full h-[46px] bg-white border border-[#ECE7DB] rounded-[8px]'>
                      <span className='text-[12px] text-[#1F2937]'>
                        {restaurant.operatingHours?.monday?.openTime ||
                          '08:00 AM'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Closing Field */}
                <div className='flex gap-[18px] h-[69px] flex-1'>
                  <div className='flex flex-col items-start gap-[10px] h-[69px] flex-1'>
                    <span className=' font-semibold text-[12px] leading-[13px] tracking-[-0.03em] capitalize text-[#675E47]'>
                      Closing
                    </span>
                    <div className='flex items-center justify-center w-full h-[46px] bg-white border border-[#ECE7DB] rounded-[8px]'>
                      <span className='  text-[12px] capitalize text-[#1F2937]'>
                        {restaurant.operatingHours?.monday?.closeTime ||
                          '07:00 PM'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className='flex flex-col items-center p-[17px_0_30px] gap-[1px] flex-1 bg-white rounded-[10px] overflow-y-auto max-h-full'>
          {/* Tabs */}
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
                    className={` text-[14px] leading-[20px] tracking-[-0.02em] capitalize ${
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
