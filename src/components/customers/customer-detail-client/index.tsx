'use client';

import { useState, useEffect } from 'react';
import { Mail, Phone, User, Loader2, Crown, MapPin } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import OverviewTab from '../tabs/overview';
import OrdersTab from '../tabs/orders';
import ReviewsTab from '../tabs/reviews';
import SubscriptionTab from '../tabs/subscription';
import AddressesTab from '../tabs/addresses';

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

interface CustomerDetailClientProps {
  customerId: string;
}

type TabType = 'overview' | 'orders' | 'reviews' | 'subscription' | 'addresses';

export default function CustomerDetailClient({ customerId }: CustomerDetailClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  const tabs: { label: string; key: TabType }[] = [
    { label: 'Overview', key: 'overview' },
    { label: 'Orders', key: 'orders' },
    { label: 'Reviews', key: 'reviews' },
    { label: 'Subscription', key: 'subscription' },
    { label: 'Addresses', key: 'addresses' }
  ];

  // Fetch customer details from API
  const fetchCustomer = async () => {
    try {
      setLoading(true);
      // Use local API route to handle auth server-side (avoids CORS and handles HTTP-only cookies)
      const apiUrl = `/api/admin/customers/${customerId}/details`;


      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });



      const result = await response.json();

      if (result.success) {
        setCustomer(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch customer details');
      }
    } catch (error) {
      
      toast.error('Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCustomer();
  }, [customerId]);

  const getSubscriptionBadgeColor = (type: string | null) => {
    if (!type) return 'bg-gray-100 text-gray-500';
    
    const lowerType = type.toLowerCase();
    switch (lowerType) {
      case 'basic':
        return 'bg-gray-100 text-gray-800';
      case 'standard':
        return 'bg-blue-100 text-blue-800';
      case 'premium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-500';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            customer={customer!}
            onSwitchToOrders={() => setActiveTab('orders')}
          />
        );
      case 'orders':
        return (
          <OrdersTab customerId={customerId} />
        );
      case 'reviews':
        return (
          <ReviewsTab customerId={customerId} />
        );
      case 'subscription':
        return (
          <SubscriptionTab customerId={customerId} />
        );
      case 'addresses':
        return (
          <AddressesTab customerId={customerId} />
        );
      default:
        return null;
    }
  };

  return (
    <div className='flex gap-6 w-full pt-4'>
      <div className='flex gap-4 w-full bg-white'>
        {/* Left Sidebar */}
        <div className='flex flex-col items-center p-4 m-4 w-[20%] min-w-[320px] max-w-[400px] h-auto bg-[#F6F2E8] rounded-[10px] sticky top-0'>
          {/* Profile Picture */}
          <div className='flex justify-center mb-3'>
            <div className='relative w-[189px] h-[189px] rounded-[34px] overflow-hidden border-none flex items-center justify-center bg-[#4f46e5]'>
              {loading ? (
                <Loader2 className='w-16 h-16 text-white animate-spin' />
              ) : customer?.avatar ? (
                <Image
                  fill
                  src={customer.avatar}
                  alt={customer.name}
                  className='object-cover'
                />
              ) : (
                <User className='w-20 h-20 text-white' />
              )}
            </div>
          </div>

          {/* Name */}
          <div>
            <h2 className='text-2xl font-bold text-[#2E2B24] text-center mb-3'>
              {loading ? 'Loading...' : customer?.name || 'Unknown Customer'}
            </h2>

            {/* Subscription and Total Orders */}
            <div className='flex items-center justify-center gap-3 mb-6'>
              <div className={`px-2 py-1 rounded-[4px] font-semibold text-sm flex items-center gap-1 ${
                customer?.subscriptionType ? getSubscriptionBadgeColor(customer.subscriptionType) : 'bg-gray-100 text-gray-500'
              }`}>
                <Crown className='w-4 h-4' />
                <span>
                  {loading ? '...' : customer?.subscriptionType ? customer.subscriptionType.charAt(0).toUpperCase() + customer.subscriptionType.slice(1) : 'No Plan'}
                </span>
              </div>
              <span className='text-[#4A463B] text-sm font-medium'>
                {loading ? '...' : customer?.totalOrders || 0} Orders
              </span>
            </div>
          </div>

          {/* Contact Information */}
          <div className='space-y-3 border-b border-[#E8E4DA] bg-white w-full px-4 py-3 rounded-[10px] flex flex-col items-center'>
            <div className='flex items-center gap-2'>
              <Mail className='w-4 h-4 text-[#1F2937] flex-shrink-0' />
              <span className='text-sm text-[#1F2937] break-all'>
                {loading ? 'Loading...' : customer?.email || 'Not provided'}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <Phone className='w-4 h-4 text-[#1F2937] flex-shrink-0' />
              <span className='text-sm text-[#1F2937]'>
                {loading ? 'Loading...' : customer?.phone || 'Not provided'}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <MapPin className='w-4 h-4 text-[#1F2937] flex-shrink-0' />
              <span className='text-sm text-[#1F2937]'>
                {loading
                  ? 'Loading...'
                  : customer?.addressCity || 'Location not set'}
              </span>
            </div>
          </div>

          {/* Customer Statistics */}
          <div className='bg-white w-full px-4 py-3 rounded-[10px] mt-3'>
            <div className='border-b border-[#E8E4DA] my-1'>
              <h3 className='font-semibold text-[#2E2B24] text-sm mb-3'>
                Customer Statistics
              </h3>
            </div>
            <div className='space-y-3 text-sm'>
              <div className='flex justify-between'>
                <span className='text-[#626974]'>Total Spending</span>
                <span className='font-medium text-[#1F2937]'>
                  {loading
                    ? '...'
                    : `$${customer?.totalSpendings?.toFixed(2) || '0.00'}`}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-[#626974]'>Avg. Order Value</span>
                <span className='font-medium text-[#1F2937]'>
                  {loading
                    ? '...'
                    : `$${customer?.avgOrderValue?.toFixed(2) || '0.00'}`}
                </span>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className='bg-white w-full px-4 py-3 rounded-[10px] mt-3'>
            <div className='border-b border-[#E8E4DA] my-1'>
              <h3 className='font-semibold text-[#2E2B24] text-sm mb-3'>
                Account Information
              </h3>
            </div>
            <div className='space-y-3 text-sm'>
              <div className='flex justify-between'>
                <span className='text-[#626974]'>Join Date</span>
                <span className='font-medium text-[#1F2937]'>
                  {loading
                    ? '...'
                    : customer?.joinDate ? new Date(customer.joinDate).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-[#626974]'>Last Order</span>
                <span className='font-medium text-[#1F2937]'>
                  {loading
                    ? '...'
                    : customer?.lastOrder?.orderDate ? new Date(customer.lastOrder.orderDate).toLocaleDateString() : 'Never'}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-[#626974]'>Status</span>
                <span className={`font-medium ${customer?.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>
                  {loading
                    ? '...'
                    : customer?.status
                      ? customer.status.charAt(0).toUpperCase() + customer.status.slice(1).toLowerCase()
                      : 'Unknown'}
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
                  className={`flex justify-center items-center p-[0_px_16px] gap-[8px] h-[40px] border-b-2 rounded-none ${
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