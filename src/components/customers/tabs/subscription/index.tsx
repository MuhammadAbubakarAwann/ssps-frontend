'use client';

import { useState, useEffect } from 'react';
import { Crown, Calendar, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SubscriptionTabProps {
  customerId: string;
}

interface SubscriptionData {
  totalSubscriptions: number;
  subscriptions: Subscription[];
}

interface Subscription {
  id: string;
  plan: {
    id: string;
    name: string;
    price: number;
    restaurant: {
      id: string;
      name: string;
    };
  };
  subscriptionDetails: {
    startDate: string;
    totalCost: number;
    status: string;
  };
  planMeals: {
    [key: string]: Meal[];
  };
  deliveries: {
    delivered: Delivery[];
    scheduled: Delivery[];
  };
}

interface Meal {
  name: string;
  mealType: string;
}

interface Delivery {
  meal: string;
  deliveredAt?: string;
  scheduledDate?: string;
}

interface SubscriptionTabProps {
  customerId: string;
}

export default function SubscriptionTab({ customerId }: SubscriptionTabProps) {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch subscription data from API
  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const apiUrl = `/api/admin/customers/${customerId}/subscriptions`;



      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });


      if (!response.ok) {
        console.error('❌ API call failed with status:', response.status);
        console.error('❌ Response status text:', response.statusText);

        // Try to get error details from response
        try {
          const errorText = await response.text();
          console.error('❌ Error response body:', errorText);
        } catch (textError) {
          console.error('❌ Could not read error response body:', textError);
        }

        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) 
        setSubscriptionData(result.data);
       else {
        console.error('❌ API returned success=false');
        console.error('❌ API message:', result.message);
        throw new Error(result.message || 'Failed to fetch subscriptions');
      }
    } catch (error) {

      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSubscriptions();
  }, [customerId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) 
    return (
      <div className='flex flex-col gap-4 w-full pt-5'>
        <div className='flex items-center justify-center h-96'>
          <Loader2 className='w-8 h-8 animate-spin text-[#FABB17]' />
        </div>
      </div>
    );
  

  if (!subscriptionData || subscriptionData.totalSubscriptions === 0) 
    return (
      <div className='flex flex-col gap-4 w-full pt-5'>
        <div className='bg-white border border-[#EDEDEB] rounded-[10px] p-8 text-center'>
          <Crown className='w-16 h-16 text-[#6B7280] mx-auto mb-4' />
          <h3 className='text-xl font-semibold text-[#1F2937] mb-2'>No Active Subscriptions</h3>
          <p className='text-[#6B7280]'>
            This customer doesn&apos;t have any active subscription plans.
          </p>
        </div>
      </div>
    );
  

  // Combine all deliveries from all subscriptions
  const allDeliveries: Array<{
    id: string;
    meal: string;
    status: 'delivered' | 'scheduled';
    date: string;
    subscriptionId: string;
    restaurantName: string;
  }> = [];

  subscriptionData.subscriptions.forEach(sub => {
    sub.deliveries.delivered.forEach(delivery => {
      allDeliveries.push({
        id: `${sub.id}-delivered-${delivery.deliveredAt}`,
        meal: delivery.meal,
        status: 'delivered',
        date: delivery.deliveredAt || '',
        subscriptionId: sub.id,
        restaurantName: sub.plan.restaurant.name
      });
    });

    sub.deliveries.scheduled.forEach(delivery => {
      allDeliveries.push({
        id: `${sub.id}-scheduled-${delivery.scheduledDate}`,
        meal: delivery.meal,
        status: 'scheduled',
        date: delivery.scheduledDate || '',
        subscriptionId: sub.id,
        restaurantName: sub.plan.restaurant.name
      });
    });
  });

  // Sort deliveries by date (most recent first)
  allDeliveries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className='flex flex-col gap-6 w-full pt-5'>
      {/* Subscription Plans */}
      {subscriptionData.subscriptions.map((subscription) => (
        <div key={subscription.id} className='bg-white border border-[#EDEDEB] rounded-[10px] p-6'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <Crown className='w-8 h-8 text-[#FABB17]' />
              <div>
                <h3 className='text-xl font-bold text-[#1F2937]'>{subscription.plan.name}</h3>
                <p className='text-sm text-[#6B7280]'>from {subscription.plan.restaurant.name}</p>
              </div>
            </div>
            <div className='text-right'>
              <div className='text-2xl font-bold text-[#FABB17]'>
                ${subscription.plan.price}/month
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                subscription.subscriptionDetails.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              } mt-1`}>
                <CheckCircle className='w-3 h-3 mr-1' />
                {subscription.subscriptionDetails.status}
              </span>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
            <div className='text-sm'>
              <span className='text-[#6B7280]'>Start Date:</span>
              <span className='font-medium text-[#1F2937] ml-2'>
                {new Date(subscription.subscriptionDetails.startDate).toLocaleDateString()}
              </span>
            </div>
            <div className='text-sm'>
              <span className='text-[#6B7280]'>Total Cost:</span>
              <span className='font-medium text-[#1F2937] ml-2'>
                ${subscription.subscriptionDetails.totalCost}
              </span>
            </div>
            <div className='text-sm'>
              <span className='text-[#6B7280]'>Status:</span>
              <span className={`font-medium ml-2 ${
                subscription.subscriptionDetails.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'
              }`}>
                {subscription.subscriptionDetails.status}
              </span>
            </div>
          </div>

          {/* Plan Meals */}
          <div className='mb-4'>
            <h4 className='font-semibold text-[#1F2937] mb-2'>Plan Meals:</h4>
            <div className='space-y-2'>
              {Object.entries(subscription.planMeals).map(([day, meals]) => (
                <div key={day} className='flex items-center gap-2'>
                  <span className='text-sm font-medium text-[#6B7280] capitalize'>{day}:</span>
                  <div className='flex flex-wrap gap-1'>
                    {meals.map((meal, index) => (
                      <span
                        key={index}
                        className='px-2 py-1 bg-[#F6F2E8] border border-[#EDEDEB] rounded text-xs text-[#1F2937]'
                      >
                        {meal.name} ({meal.mealType})
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Delivery History */}
      <div className='bg-white border border-[#EDEDEB] rounded-[10px] overflow-hidden'>
        <div className='px-6 py-4 border-b border-[#EDEDEB]'>
          <h3 className='text-lg font-semibold text-[#1F2937]'>Delivery History</h3>
          <p className='text-sm text-[#6B7280]'>All deliveries across your subscriptions</p>
        </div>

        <div className='divide-y divide-[#F2F0EA]'>
          {allDeliveries.map((delivery) => (
            <div key={delivery.id} className='p-6 hover:bg-[#F9FAFB] transition-colors'>
              <div className='flex items-start justify-between gap-4'>
                <div className='flex items-start gap-3 flex-1'>
                  {delivery.status === 'delivered' ? (
                    <CheckCircle className='w-5 h-5 text-green-500' />
                  ) : (
                    <Clock className='w-5 h-5 text-blue-500' />
                  )}
                  <div className='flex-1'>
                    <h4 className='font-semibold text-[#1F2937] mb-1'>{delivery.meal}</h4>
                    <p className='text-sm text-[#6B7280] mb-2'>from {delivery.restaurantName}</p>

                    <div className='flex items-center gap-4 text-sm'>
                      <div className='flex items-center gap-1'>
                        <Calendar className='w-4 h-4 text-[#6B7280]' />
                        <span className='text-[#6B7280]'>
                          {delivery.status === 'delivered' ? 'Delivered' : 'Scheduled'}: {formatDate(delivery.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='text-right'>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    delivery.status === 'delivered'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {delivery.status === 'delivered' ? 'Delivered' : 'Scheduled'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='bg-white border border-[#EDEDEB] rounded-[10px] p-4 text-center'>
          <div className='text-2xl font-bold text-[#1F2937] mb-1'>
            {allDeliveries.filter(d => d.status === 'delivered').length}
          </div>
          <div className='text-sm text-[#6B7280]'>Items Delivered</div>
        </div>
        <div className='bg-white border border-[#EDEDEB] rounded-[10px] p-4 text-center'>
          <div className='text-2xl font-bold text-[#1F2937] mb-1'>
            {allDeliveries.filter(d => d.status === 'scheduled').length}
          </div>
          <div className='text-sm text-[#6B7280]'>Scheduled</div>
        </div>
        <div className='bg-white border border-[#EDEDEB] rounded-[10px] p-4 text-center'>
          <div className='text-2xl font-bold text-[#1F2937] mb-1'>
            {subscriptionData.totalSubscriptions}
          </div>
          <div className='text-sm text-[#6B7280]'>Active Subscriptions</div>
        </div>
      </div>
    </div>
  );
}