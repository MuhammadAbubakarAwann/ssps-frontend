'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, XCircle, ShoppingCart, DollarSign, Package, Loader2 } from 'lucide-react';

interface Order {
  id: string;
  restaurantName: string;
  customerAddress: string;
  items: { mealName: string; quantity: number; unitPrice?: number; totalPrice?: number; notes?: string }[];
  orderDateTime: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
}

interface OrderCardProps {
  order: Order;
}

function OrderCard({ order }: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const itemsText = Array.isArray(order.items)
    ? order.items.map((item) => `${item.quantity}x ${item.mealName}`).join(', ')
    : 'No items';

  const formattedDate = (() => {
    try {
      return new Date(order.orderDateTime).toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting date:', order.orderDateTime, error);
      return 'Invalid Date';
    }
  })();

  const getStatusColor = () => {
    switch (order.status.toLowerCase()) {
      case 'delivered':
        return 'bg-[#FABB17] border-[#755504]';
      case 'cancelled':
        return 'bg-red-500 border-red-700';
      default:
        return 'border-[#FABB17] bg-white';
    }
  };

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
              <div className={`w-4 h-4 rounded-full border-2 ${getStatusColor()}`} />
              <div className='w-0.5 h-8 bg-[#FABB17]' />
              <div className='w-4 h-4 rounded-full border-2 border-[#FABB17]' />
            </div>

            {/* Text Info */}
            <div className='flex flex-col gap-[18px] ml-2'>
              {/* Restaurant */}
              <div className='flex flex-col gap-2'>
                <h3 className='text-[15px] font-semibold text-left text-[#4A463B] capitalize'>
                  {order.restaurantName}
                </h3>
              </div>

              {/* Delivery Address */}
              <div className='flex flex-col gap-2'>
                <p className='text-[14px] text-left font-normal text-[#4A463B] capitalize'>
                  {order.customerAddress}
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Items and Details */}
          <div className='flex flex-col gap-[14px]'>
            <p className='text-[14px] text-left font-normal text-[#65656A] capitalize'>
              Items Ordered: {itemsText}
            </p>
            <div className='flex flex-col gap-1'>
              <p className='text-[13px] text-left font-normal text-[#454950] lowercase'>
                {formattedDate}
              </p>
            </div>
          </div>
        </div>

        {/* Expanded Row - Order Details */}
        {isExpanded && (
          <>
            <div className='w-full h-px bg-[#EFEFEF]' />
            <div className='flex items-center justify-between p-[15px] bg-[#F6F2E8] rounded-[10px]'>
              <div className='flex flex-col gap-2'>
                <span className='text-[15px] font-medium text-[#4A463B] capitalize'>
                  Order Details
                </span>
                <div className='text-[13px] text-[#65656A]'>
                  <p>Order ID: {order.id}</p>
                  <p>Payment Status: {order.paymentStatus}</p>
                </div>
              </div>
              <div className='text-right'>
                <p className='text-[15px] font-bold text-[#2F2F2F]'>${(order.totalAmount || 0).toFixed(2)}</p>
                <p className='text-[13px] text-[#65656A]'>{Array.isArray(order.items) ? order.items.length : 0} items</p>
              </div>
            </div>
          </>
        )}
      </button>
    </div>
  );
}



interface OrdersTabProps {
  customerId: string;
}

export default function OrdersTab({ customerId }: OrdersTabProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching orders for customer:', customerId);

      const response = await fetch(`/api/admin/customers/${customerId}/orders`);
      console.log('Orders API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Orders API error response:', errorText);
        throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Orders API response data:', data);
      console.log('Orders API response data type:', typeof data);
      console.log('Orders API response data keys:', Object.keys(data));

      // Handle different response structures
      let ordersData: Order[] = [];
      if (Array.isArray(data)) {
        ordersData = data;
      } else if (data && typeof data === 'object') {
        // Check for common response wrapper patterns
        ordersData = data.data?.orders || data.orders || data.data || data.results || [];
        if (!Array.isArray(ordersData)) {
          console.warn('Orders data is wrapped but not an array, defaulting to empty list');
          ordersData = [];
        }
      } else {
        console.warn('Orders data is not an object or array, defaulting to empty list');
        ordersData = [];
      }

      console.log('Normalized orders data after parse:', ordersData);
      setOrders(ordersData);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      void fetchOrders();
    }
  }, [customerId]);

  // guard against non-array responses
  const filteredOrders = Array.isArray(orders)
    ? orders.filter(order => {
const matchesSearch = !searchQuery ||
          order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.items.some(item => item.mealName.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
      })
    : [];

  console.log('Orders data:', orders);
  console.log('Filtered orders:', filteredOrders);


  const totalOrders = Array.isArray(filteredOrders) ? filteredOrders.length : 0;
  const totalSpent = Array.isArray(filteredOrders)
    ? filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0)
    : 0;
  const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

  if (loading) {
    return (
      <div className='flex items-center justify-center h-96'>
        <div className='flex flex-col items-center gap-3'>
          <Loader2 className='w-8 h-8 animate-spin text-[#FABB17]' />
          <p className='text-[#6B7280] font-medium'>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-96'>
        <div className='text-center'>
          <XCircle className='w-12 h-12 text-red-500 mx-auto mb-3' />
          <p className='text-red-600 font-medium mb-2'>Failed to load orders</p>
          <p className='text-[#9CA3AF] text-sm'>{error}</p>
        </div>
      </div>
    );
  }

  // Get unique statuses for filter dropdown
  const uniqueStatuses = Array.isArray(orders)
    ? Array.from(new Set(orders.map(order => order.status.toLowerCase())))
    : [];

  return (
    <div className='flex flex-col gap-4 w-full pt-5'>
      {/* Summary Statistics */}
      <div className='grid grid-cols-3 gap-3 w-full'>
        <div className='flex flex-col justify-center items-start p-6 gap-4 w-full h-[99px] bg-white border border-[#EDEDEB] rounded-[10px] shadow-sm'>
          <div className='flex items-center gap-3 w-full'>
            <ShoppingCart className='text-[20px] text-[#FABB17] flex-shrink-0' />
            <span className='text-[13px] leading-[24px] tracking-[-0.02em] capitalize text-[#4C515C] flex-1'>Total Orders</span>
          </div>
          <div className='flex items-center w-full'>
            <span className='font-public-sans font-bold text-[20px] leading-[24px] tracking-[-0.05em] text-[#2F2F2F]'>{totalOrders}</span>
          </div>
        </div>
        <div className='flex flex-col justify-center items-start p-6 gap-4 w-full h-[99px] bg-white border border-[#EDEDEB] rounded-[10px] shadow-sm'>
          <div className='flex items-center gap-3 w-full'>
            <DollarSign className='text-[20px] text-[#FABB17] flex-shrink-0' />
            <span className='text-[13px] leading-[24px] tracking-[-0.02em] capitalize text-[#4C515C] flex-1'>Total Spent</span>
          </div>
          <div className='flex items-center w-full'>
            <span className='font-public-sans font-bold text-[20px] leading-[24px] tracking-[-0.05em] text-[#2F2F2F]'>${totalSpent.toFixed(2)}</span>
          </div>
        </div>
        <div className='flex flex-col justify-center items-start p-6 gap-4 w-full h-[99px] bg-white border border-[#EDEDEB] rounded-[10px] shadow-sm'>
          <div className='flex items-center gap-3 w-full'>
            <DollarSign className='text-[20px] text-[#FABB17] flex-shrink-0' />
            <span className='text-[13px] leading-[24px] tracking-[-0.02em] capitalize text-[#4C515C] flex-1'>Average Order</span>
          </div>
          <div className='flex items-center w-full'>
            <span className='font-public-sans font-bold text-[20px] leading-[24px] tracking-[-0.05em] text-[#2F2F2F]'>${averageOrderValue.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className='flex items-center gap-4 w-full'>
        <div className='flex-1 relative'>
          <Search className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280]' />
          <input
            type='text'
            placeholder='Search orders...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full pl-10 pr-4 py-2 text-[14px] border border-[#EDEDEB] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#FABB17] focus:border-transparent bg-white'
          />
        </div>
        <div className='relative'>
          <Filter className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280]' />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className='pl-10 pr-10 py-2 text-[14px] border border-[#EDEDEB] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#FABB17] focus:border-transparent bg-white appearance-none cursor-pointer min-w-[150px]'
          >
            <option value='all'>All Status</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className='space-y-3 w-full'>
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))
        ) : (
          <div className='flex items-center justify-center h-96 text-center'>
            <div>
              <Package className='w-12 h-12 text-[#D1D5DB] mx-auto mb-3' />
              <p className='text-[#6B7280] font-medium'>No orders found</p>
              <p className='text-[#9CA3AF] text-sm'>
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search criteria'
                  : 'No orders available for this customer'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}