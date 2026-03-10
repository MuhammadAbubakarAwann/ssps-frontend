'use client';

import { useState, useEffect } from 'react';

interface TopPerformer {
  id: string;
  name: string;
  profilePhoto: string | null;
  totalEarnings: number;
}

export function TopPerformersSection() {
  const [restaurants, setRestaurants] = useState<TopPerformer[]>([]);
  const [riders, setRiders] = useState<TopPerformer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopEarners = async () => {
      try {
        setLoading(true);
        setError(null);

        const [restaurantRes, riderRes] = await Promise.all([
          fetch('/api/admin/finance/top-earners?type=restaurant'),
          fetch('/api/admin/finance/top-earners?type=rider')
        ]);

        const restaurantData = await restaurantRes.json();
        const riderData = await riderRes.json();

        if (!restaurantRes.ok) 
          setError(`Failed to load restaurants: ${restaurantData.message || 'Unknown error'}`);
         else if (restaurantData.success) 
          setRestaurants(restaurantData.data.data);
        

        if (!riderRes.ok) 
          setError(`Failed to load riders: ${riderData.message || 'Unknown error'}`);
         else if (riderData.success) 
          setRiders(riderData.data.data);
        
      } catch (error) {
        console.error('Error fetching top earners:', error);
        setError('Network error occurred while loading data');
      } finally {
        setLoading(false);
      }
    };

    void fetchTopEarners();
  }, []);

  if (loading) 
    return (
      <div className='grid grid-cols-2 gap-4'>
        <div className='flex flex-col gap-4 p-6 bg-white border border-[#EDEDEB] rounded-[10px]'>
          <div className='flex items-center justify-center h-[200px]'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#FABB17] mx-auto mb-2'></div>
              <p className='text-[#6B7280]'>Loading restaurants...</p>
            </div>
          </div>
        </div>
        <div className='flex flex-col gap-4 p-6 bg-white border border-[#EDEDEB] rounded-[10px]'>
          <div className='flex items-center justify-center h-[200px]'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#FABB17] mx-auto mb-2'></div>
              <p className='text-[#6B7280]'>Loading riders...</p>
            </div>
          </div>
        </div>
      </div>
    );
  

  if (error) 
    return (
      <div className='grid grid-cols-2 gap-6'>
        <div className='col-span-2 flex items-center justify-center p-8 bg-white border border-[#EDEDEB] rounded-[10px]'>
          <div className='text-center'>
            <p className='text-red-600 mb-2'>Error loading data</p>
            <p className='text-[#6B7280] text-sm'>{error}</p>
          </div>
        </div>
      </div>
    );
  
  return (
    <div className='grid grid-cols-2 gap-6'>
      {/* Top Performing Restaurants */}
      <div className='flex flex-col gap-4 p-6 bg-white border border-[#EDEDEB] rounded-[10px]'>
        <h2 className='text-[15px] font-bold text-[#3F4956] capitalize'>Top Performing Restaurants</h2>
        <div className='flex flex-col gap-3'>
          {restaurants.map((restaurant) => (
            <div key={restaurant.id} className='flex items-center justify-between pb-3 border-b border-[#EDEDEB] last:border-b-0'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 rounded-full bg-[#E8D5C4] flex items-center justify-center text-sm'>
                  {restaurant.name[0]}
                </div>
                <p className='text-[13px] font-medium text-[#1F2937]'>{restaurant.name}</p>
              </div>
              <p className='text-[13px] font-medium text-[#1F2937]'>${restaurant.totalEarnings.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top riders By Earnings */}
      <div className='flex flex-col gap-4 p-6 bg-white border border-[#EDEDEB] rounded-[10px]'>
        <h2 className='text-[15px] font-bold text-[#3F4956] capitalize'>Top riders By Earnings</h2>
        <div className='flex flex-col gap-3'>
          {riders.map((rider) => (
            <div key={rider.id} className='flex items-center justify-between pb-3 border-b border-[#EDEDEB] last:border-b-0'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 rounded-full bg-[#D8C5E8] flex items-center justify-center text-sm'>
                  {rider.name[0]}
                </div>
                <p className='text-[13px] font-medium text-[#1F2937]'>{rider.name}</p>
              </div>
              <p className='text-[13px] font-medium text-[#1F2937]'>${rider.totalEarnings.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
