'use client';

import { useState, useEffect } from 'react';
import { MapPin, Clock, CheckCircle, XCircle, Package } from 'lucide-react';

interface Delivery {
  id: string;
  orderId: string;
  customerName: string;
  restaurantName: string;
  pickupAddress: string;
  deliveryAddress: string;
  status: string;
  deliveryTime: string;
  distance: string;
  amount: number;
  tip: number;
  createdAt: string;
}

interface DeliveriesTabProps {
  riderId: string;
}

export default function DeliveriesTab({ riderId }: DeliveriesTabProps) {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Simulate API call - replace with actual API call
    const mockDeliveries: Delivery[] = [
      {
        id: '1',
        orderId: 'ORD-001',
        customerName: 'John Doe',
        restaurantName: 'Pizza Palace',
        pickupAddress: '123 Restaurant St',
        deliveryAddress: '456 Customer Ave',
        status: 'delivered',
        deliveryTime: '25',
        distance: '3.2',
        amount: 24.50,
        tip: 3.00,
        createdAt: '2024-03-01T10:30:00Z'
      },
      {
        id: '2',
        orderId: 'ORD-002',
        customerName: 'Jane Smith',
        restaurantName: 'Burger House',
        pickupAddress: '789 Food Court',
        deliveryAddress: '321 Home Street',
        status: 'delivered',
        deliveryTime: '18',
        distance: '2.1',
        amount: 32.75,
        tip: 5.00,
        createdAt: '2024-03-01T14:15:00Z'
      }
    ];

    setTimeout(() => {
      setDeliveries(mockDeliveries);
      setLoading(false);
    }, 1000);
  }, [riderId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className='w-5 h-5 text-green-600' />;
      case 'cancelled':
        return <XCircle className='w-5 h-5 text-red-600' />;
      case 'in-progress':
        return <Package className='w-5 h-5 text-blue-600' />;
      default:
        return <Clock className='w-5 h-5 text-yellow-600' />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    if (filter === 'all') return true;
    return delivery.status === filter;
  });

  if (loading)
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-[#6B7280]'>Loading deliveries...</div>
      </div>
    );

  return (
    <div className='flex flex-col gap-6 p-6 w-full'>
      {/* Header with filters */}
      <div className='flex justify-between items-center'>
        <h2 className='text-xl font-semibold text-[#1F2937]'>Delivery History</h2>
        
        <div className='flex gap-2'>
          {['all', 'delivered', 'cancelled', 'in-progress'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === status
                  ? 'bg-[#FABB17] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All' : status.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Deliveries List */}
      <div className='space-y-4'>
        {filteredDeliveries.length === 0 ? (
          <div className='text-center py-12 text-[#6B7280]'>
            <Package className='w-16 h-16 mx-auto mb-4 text-gray-300' />
            <h3 className='text-lg font-medium mb-2'>No deliveries found</h3>
            <p className='text-sm'>
              {filter === 'all' 
                ? 'This rider has no delivery history yet.'
                : `No ${filter.replace('-', ' ')} deliveries found.`
              }
            </p>
          </div>
        ) : (
          filteredDeliveries.map((delivery) => (
            <div
              key={delivery.id}
              className='bg-white border border-[#E5E7EB] rounded-[10px] p-6 shadow-sm hover:shadow-md transition-shadow'
            >
              <div className='flex justify-between items-start mb-4'>
                <div className='flex items-center gap-3'>
                  {getStatusIcon(delivery.status)}
                  <div>
                    <h3 className='font-semibold text-[#1F2937]'>Order #{delivery.orderId}</h3>
                    <p className='text-sm text-[#6B7280]'>
                      {new Date(delivery.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(delivery.status)}`}>
                  {delivery.status.replace('-', ' ')}
                </span>
              </div>

              <div className='grid grid-cols-2 gap-6 mb-4'>
                <div>
                  <h4 className='font-medium text-[#1F2937] mb-2'>Customer</h4>
                  <p className='text-sm text-[#6B7280]'>{delivery.customerName}</p>
                </div>
                
                <div>
                  <h4 className='font-medium text-[#1F2937] mb-2'>Restaurant</h4>
                  <p className='text-sm text-[#6B7280]'>{delivery.restaurantName}</p>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-6 mb-4'>
                <div>
                  <h4 className='font-medium text-[#1F2937] mb-2 flex items-center gap-2'>
                    <MapPin className='w-4 h-4' />
                    Pickup
                  </h4>
                  <p className='text-sm text-[#6B7280]'>{delivery.pickupAddress}</p>
                </div>
                
                <div>
                  <h4 className='font-medium text-[#1F2937] mb-2 flex items-center gap-2'>
                    <MapPin className='w-4 h-4' />
                    Delivery
                  </h4>
                  <p className='text-sm text-[#6B7280]'>{delivery.deliveryAddress}</p>
                </div>
              </div>

              <div className='flex justify-between items-center pt-4 border-t border-[#F3F4F6]'>
                <div className='flex gap-6'>
                  <div className='text-center'>
                    <p className='text-xs text-[#6B7280] mb-1'>Delivery Time</p>
                    <p className='font-semibold text-[#1F2937]'>{delivery.deliveryTime} min</p>
                  </div>
                  
                  <div className='text-center'>
                    <p className='text-xs text-[#6B7280] mb-1'>Distance</p>
                    <p className='font-semibold text-[#1F2937]'>{delivery.distance} km</p>
                  </div>
                </div>
                
                <div className='text-right'>
                  <p className='text-sm text-[#6B7280] mb-1'>
                    Amount: <span className='font-semibold text-[#1F2937]'>${delivery.amount.toFixed(2)}</span>
                  </p>
                  <p className='text-sm text-[#6B7280]'>
                    Tip: <span className='font-semibold text-green-600'>${delivery.tip.toFixed(2)}</span>
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}