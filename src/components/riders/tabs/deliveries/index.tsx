'use client';

import { useState, useEffect } from 'react';
import { Package, Star } from 'lucide-react';
import { fetchRiderDeliveries, type RiderDelivery } from '@/lib/server-actions/rider-actions';
import { toast } from 'sonner';

interface DeliveryCardProps {
  delivery: RiderDelivery;
}

function DeliveryCard({ delivery }: DeliveryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const itemsText = delivery.itemsDelivered
    .map((item) => `${item.quantity}x ${item.name}`)
    .join(', ');

  const formattedDate = new Date(delivery.dateTime).toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className='flex flex-col border border-[#EFEFEF] rounded-[10px] bg-white overflow-hidden'>
      {/* Main Card Content - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='w-full flex flex-col gap-5 p-[21px] hover:bg-gray-50 transition-colors'
      >
        {/* Top Row - Restaurant Info and Items/Timestamp */}
        <div className='flex items-center justify-between gap-[97px]'>
          {/* Left Side - Timeline and Info */}
          <div className='flex items-center gap-2'>
            {/* Timeline */}
            <div className='flex flex-col items-center h-[65px] gap-0'>
              <div className='w-4 h-4 rounded-full bg-[#FABB17] border-2 border-[#755504]' />
              <div className='w-0.5 h-8 bg-[#FABB17]' />
              <div className='w-4 h-4 rounded-full border-2 border-[#FABB17]' />
            </div>

            {/* Text Info */}
            <div className='flex flex-col gap-[18px] ml-2'>
              {/* Restaurant */}
              <div className='flex flex-col gap-2'>
                <h3 className='text-[15px] font-semibold text-left  text-[#4A463B] capitalize'>
                  {delivery.restaurantName}
                </h3>
              </div>

              {/* Address */}
              <div className='flex flex-col gap-2'>
                <p className='text-[14px] text-left font-normal text-[#4A463B] capitalize'>
                  {delivery.customerDeliveryAddress}
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Items and Time */}
          <div className='flex flex-col gap-[14px] '>
            <p className='text-[14px] text-left font-normal text-[#65656A] capitalize'>
              Items Delivered: {itemsText}
            </p>
            <p className='text-[13px] text-left font-normal text-[#454950] lowercase'>
              {formattedDate}
            </p>
          </div>
        </div>

        {/* Divider */}

        {/* Expanded Row - Delivery Rating */}
        {isExpanded && delivery.rating && (
          <>
            <div className='w-full h-px bg-[#EFEFEF]' />
            <div className='flex items-center justify-between  p-[15px]  bg-[#F6F2E8] rounded-[10px]'>
              <span className='text-[15px] font-medium text-[#4A463B] capitalize'>
                Delivery Rating
              </span>
              <div className='flex items-center gap-2 bg-[#FABB17] px-[5px] py-[2px] rounded-[4px]'>
                <span className='text-[14px] font-medium text-black'>
                  {delivery.rating.toFixed(1)}
                </span>
                <Star className='w-3 h-3 fill-black text-black' />
              </div>
            </div>
          </>
        )}
      </button>
    </div>
  );
}

interface DeliveriesTabProps {
  riderId: string;
}

export default function DeliveriesTab({ riderId }: DeliveriesTabProps) {
  const [deliveries, setDeliveries] = useState<RiderDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        setLoading(true);
        const data = await fetchRiderDeliveries({
          riderId,
          page: pagination.page,
          limit: pagination.limit
        });
        setDeliveries(data.deliveries);
        setPagination(data.pagination);
      } catch (error) {
        console.error('Error fetching deliveries:', error);
        toast.error('Failed to load deliveries');
        setDeliveries([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchDeliveries();
  }, [riderId, pagination.page, pagination.limit]);

  return (
    <div className='py-6 w-full'>
      <div className='space-y-3'>
        {loading ? (
          <div className='flex items-center justify-center h-96 text-center'>
            <div>
              <Package className='w-12 h-12 text-[#D1D5DB] mx-auto mb-3 animate-pulse' />
              <p className='text-[#6B7280] font-medium'>Loading deliveries...</p>
            </div>
          </div>
        ) : deliveries.length === 0 ? (
          <div className='flex items-center justify-center h-96 text-center'>
            <div>
              <Package className='w-12 h-12 text-[#D1D5DB] mx-auto mb-3' />
              <p className='text-[#6B7280] font-medium'>No deliveries yet</p>
              <p className='text-[#9CA3AF] text-sm'>
                Your completed deliveries will appear here
              </p>
            </div>
          </div>
        ) : (
          deliveries.map((delivery) => (
            <DeliveryCard key={delivery.id} delivery={delivery} />
          ))
        )}
      </div>
    </div>
  );
}
