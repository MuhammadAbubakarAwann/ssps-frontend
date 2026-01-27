'use client';

import React, { useState } from 'react';
import { X, MapPin, Phone, Mail, Package, Clock, DollarSign, CheckCircle2, User, Building2, Truck, FileText } from 'lucide-react';

interface OrderItem {
  id: string
  orderId: string
  mealId: string
  quantity: number
  priceAtTimeOfOrder: number
  notes?: string
  createdAt: string
  updatedAt: string
  meal: {
    id: string
    name: string
    description: string
    category: string
    imageUrls: string[]
  }
}

interface OrderDetailsData {
  id: string
  customerId: string
  restaurantId: string
  riderId: string
  totalAmount: number
  subtotalAmount: number
  tipAmount: number
  tipPercentage: number
  tipType: string
  riderEarning: number
  restaurantEarning: number
  deliveryAddress: string
  deliveryLatitude: number
  deliveryLongitude: number
  status: string
  orderDate: string
  specialInstructions?: string
  paymentStatus: string
  paymentMethod: string
  deliveryVerificationCode: string
  isDeliveryVerified: boolean
  customer: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  restaurant: {
    id: string
    businessName: string
    businessEmail: string
    contactNumber: string
    address: string
    city: string
  }
  rider: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  orderItems: OrderItem[]
  orderTracking?: {
    id: string
    orderId: string
    estimatedDeliveryTime?: string
    actualPickupTime?: string
    actualDeliveryTime?: string
    totalDistance?: number
    totalDuration?: number
    currentStatus: string
    createdAt: string
    updatedAt: string
  }
}

interface OrderDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  orderDetails: OrderDetailsData | null
  loading: boolean
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatCurrency = (amount: number) => {
  return `$${amount.toFixed(2)}`;
};

const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case 'DELIVERED':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' };
    case 'PENDING':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' };
    case 'IN_PROGRESS':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' };
    case 'AWAITING_PICKUP':
      return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' };
    default:
      return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-500' };
  }
};

export function OrderDetailsModal({ isOpen, onClose, orderDetails, loading }: OrderDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  if (!isOpen) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Package },
    { id: 'items', label: 'Items', icon: Package },
    { id: 'tracking', label: 'Tracking', icon: Truck },
    { id: 'documents', label: 'Documents', icon: FileText }
  ];

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div 
        className='absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity'
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className='relative bg-white shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden'>
        {/* Header with gradient */}
        <div className='border-b border-gray-300 bg-white px-8 py-6 flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold text-[#F9A825]'>Order Details</h2>
            {orderDetails && <p className='text-[#F9A825]/80 text-sm mt-1'>Order #{orderDetails.id}</p>}
          </div>
          <button
            onClick={onClose}
            className='bg-[#F5F5F5] hover:bg-[#E5E5E5] text-black rounded-full p-2 transition-colors'
          >
            <X className='h-6 w-6' />
          </button>
        </div>

        {loading ? (
          <div className='p-16 text-center flex flex-col items-center justify-center'>
            <div className='animate-spin rounded-full h-16 w-16 border-4 border-[#F3F4F6] border-t-[#FABB17] mb-4' />
            <p className='text-gray-600 font-medium'>Loading order details...</p>
          </div>
        ) : orderDetails ? (
          <div className='flex h-[calc(90vh-100px)]'>
            {/* Left Sidebar */}
            <div className='w-80 bg-gradient-to-b from-[#FFFBF0] to-[#FFF8E7] border-r border-[#F0E6D2] p-6 overflow-y-auto'>
              {/* Restaurant/Order Header */}
              <div className='mb-6'>
                <div className='relative mb-4'>
                  <div className='h-32 bg-gradient-to-r from-[#FABB17] to-[#F59E0B] rounded-lg overflow-hidden' />
                  <div className='absolute -bottom-4 left-4'>
                    <div className='w-16 h-16 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center'>
                      <Building2 className='w-8 h-8 text-[#FABB17]' />
                    </div>
                  </div>
                </div>
                <div className='mt-6'>
                  <h3 className='text-xl font-bold text-gray-900'>{orderDetails.restaurant.businessName}</h3>
                  <div className='flex items-center gap-2 mt-2'>
                    <div className='text-[#FABB17] font-bold'>Order #{orderDetails.id.slice(0, 8)}</div>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className={`${getStatusColor(orderDetails.status).bg} ${getStatusColor(orderDetails.status).border} border rounded-xl p-4 mb-6`}>
                <p className='text-xs text-gray-600 font-semibold uppercase mb-1'>Status</p>
                <p className={`${getStatusColor(orderDetails.status).text} text-lg font-bold`}>
                  {orderDetails.status}
                </p>
              </div>

              {/* Key Information */}
              <div className='space-y-4'>
                <div className='bg-white rounded-xl p-4 border border-gray-200 '>
                  <h4 className='text-sm font-bold text-gray-900 mb-3'>Business Details</h4>
                  <div className='space-y-2 text-sm'>
                    <div className='flex items-center gap-2 text-gray-700'>
                      <Mail className='h-4 w-4 text-gray-500' />
                      <span className='truncate'>{orderDetails.restaurant.businessEmail}</span>
                    </div>
                    <div className='flex items-center gap-2 text-gray-700'>
                      <Phone className='h-4 w-4 text-gray-500' />
                      <span>{orderDetails.restaurant.contactNumber}</span>
                    </div>
                    <div className='flex items-start gap-2 text-gray-700'>
                      <MapPin className='h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0' />
                      <span className='text-xs'>{orderDetails.restaurant.address}</span>
                    </div>
                  </div>
                </div>

                <div className='bg-white rounded-xl p-4 border border-gray-200'>
                  <h4 className='text-sm font-bold text-gray-900 mb-3'>Customer Info</h4>
                  <div className='space-y-2 text-sm'>
                    <p className='font-semibold text-gray-900'>{orderDetails.customer.firstName} {orderDetails.customer.lastName}</p>
                    <div className='flex items-center gap-2 text-gray-700'>
                      <Mail className='h-4 w-4 text-gray-500' />
                      <span className='truncate text-xs'>{orderDetails.customer.email}</span>
                    </div>
                    <div className='flex items-center gap-2 text-gray-700'>
                      <Phone className='h-4 w-4 text-gray-500' />
                      <span className='text-xs'>{orderDetails.customer.phone}</span>
                    </div>
                  </div>
                </div>

                <div className='bg-white rounded-xl p-4 border border-gray-200'>
                  <h4 className='text-sm font-bold text-gray-900 mb-3'>Delivery To</h4>
                  <p className='text-xs text-gray-700 leading-relaxed'>{orderDetails.deliveryAddress}</p>
                </div>
              </div>
            </div>

            {/* Right Content Area */}
            <div className='flex-1 flex flex-col overflow-hidden'>
              {/* Tab Navigation */}
              <div className='border-b border-gray-200 px-8 pt-6 flex gap-8 bg-white'>
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`pb-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all ${
                        activeTab === tab.id
                          ? 'border-[#FABB17] text-[#FABB17]'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Icon className='h-4 w-4' />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <div className='flex-1 overflow-y-auto p-8'>
                {activeTab === 'overview' && (
                  <div className='space-y-6'>
                    {/* Stat Cards */}
                    <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                      {/* Status Card */}
                      <div className='bg-white border border-[#F2F0EA] rounded-xl p-4'>
                        <div className='flex items-start gap-3'>
                          <div className='bg-[#FABB17] rounded-full p-2 mt-1'>
                            <CheckCircle2 className='h-4 w-4 text-white' />
                          </div>
                          <div>
                            <p className='text-xs font-medium text-black'>Order Status</p>
                            <p className='text-black text-lg font-bold mt-1'>
                              {orderDetails.status}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Date Card */}
                      <div className='bg-white border border-[#F2F0EA] rounded-xl p-4'>
                        <div className='flex items-start gap-3'>
                          <div className='bg-[#FABB17] rounded-full p-2'>
                            <Clock className='h-4 w-4 text-white' />
                          </div>
                          <div>
                            <p className='text-xs font-medium text-black'>Order Date</p>
                            <p className='text-black text-sm font-bold mt-1'>{formatDate(orderDetails.orderDate)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Total Amount Card */}
                      <div className='bg-white border border-[#F2F0EA] rounded-xl p-4'>
                        <div className='flex items-start gap-3'>
                          <div className='bg-[#FABB17] rounded-full p-2'>
                            <DollarSign className='h-4 w-4 text-white' />
                          </div>
                          <div>
                            <p className='text-xs font-medium text-black'>Total Amount</p>
                            <p className='text-black text-lg font-bold mt-1'>{formatCurrency(orderDetails.totalAmount)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Main Grid Layout */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      {/* Order Information Card */}
                      <div className='bg-white rounded-xl border border-[#F2F0EA] p-6'>
                        <div className='flex items-center gap-2 mb-6'>
                          <Package className='h-6 w-6 text-[#FABB17]' />
                          <h3 className='text-xl font-bold text-black'>Order Information</h3>
                        </div>
                        <div className='space-y-3'>
                          <div className='flex justify-between items-center pb-3 border-b border-[#F2F0EA]'>
                            <span className='text-black text-sm font-medium'>Order ID:</span>
                            <span className='text-black text-sm font-bold font-mono bg-[#FAFAF8] px-3 py-1 rounded-lg'>{orderDetails.id}</span>
                          </div>
                          <div className='flex justify-between items-center pb-3 border-b border-[#F2F0EA]'>
                            <span className='text-black text-sm font-medium'>Payment Method:</span>
                            <span className='text-black text-sm font-semibold'>{orderDetails.paymentMethod}</span>
                          </div>
                          <div className='flex justify-between items-center'>
                            <span className='text-black text-sm font-medium'>Payment Status:</span>
                            <span className='text-black text-sm font-bold'>
                              {orderDetails.paymentStatus}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Pricing Breakdown Card */}
                      <div className='bg-white rounded-xl border border-[#F2F0EA] p-6'>
                        <div className='flex items-center gap-2 mb-4'>
                          <DollarSign className='h-5 w-5 text-[#FABB17]' />
                          <h3 className='text-lg font-bold text-black'>Pricing Breakdown</h3>
                        </div>
                        <div className='space-y-3'>
                          <div className='flex justify-between pb-3 border-b border-[#F2F0EA]'>
                            <span className='text-black text-sm font-medium'>Subtotal:</span>
                            <span className='text-black text-sm font-bold'>{formatCurrency(orderDetails.subtotalAmount)}</span>
                          </div>
                          <div className='flex justify-between pb-3 border-b border-[#F2F0EA]'>
                            <span className='text-black text-sm font-medium'>Tip ({orderDetails.tipPercentage}%):</span>
                            <span className='text-black text-sm font-bold'>{formatCurrency(orderDetails.tipAmount)}</span>
                          </div>
                          <div className='flex justify-between pt-2 bg-[#FAFAF8] rounded-lg px-3 py-2'>
                            <span className='text-black font-bold'>Total:</span>
                            <span className='text-black font-bold text-lg'>{formatCurrency(orderDetails.totalAmount)}</span>
                          </div>
                          <div className='mt-4 pt-3 border-t border-[#F2F0EA] space-y-2'>
                            <div className='flex justify-between text-sm'>
                              <span className='text-black font-medium'>Restaurant Earning:</span>
                              <span className='text-black font-bold'>{formatCurrency(orderDetails.restaurantEarning)}</span>
                            </div>
                            <div className='flex justify-between text-sm'>
                              <span className='text-black font-medium'>Rider Earning:</span>
                              <span className='text-black font-bold'>{formatCurrency(orderDetails.riderEarning)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Customer, Restaurant, and Rider Information */}
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                      {/* Customer Card */}
                      <div className='bg-white rounded-xl border border-[#F2F0EA] p-6'>
                        <div className='flex items-center gap-2 mb-4'>
                          <User className='h-5 w-5 text-[#FABB17]' />
                          <h3 className='text-lg font-bold text-black'>Customer</h3>
                        </div>
                        {orderDetails.customer ? (
                          <div className='space-y-3'>
                            <div className='bg-[#FAFAF8] rounded-lg p-3'>
                              <p className='text-black font-bold text-sm'>{orderDetails.customer.firstName} {orderDetails.customer.lastName}</p>
                            </div>
                            <div className='flex items-center gap-2 text-black'>
                              <Mail className='h-4 w-4 text-[#FABB17]' />
                              <p className='text-xs truncate'>{orderDetails.customer.email}</p>
                            </div>
                            <div className='flex items-center gap-2 text-black'>
                              <Phone className='h-4 w-4 text-[#FABB17]' />
                              <p className='text-xs font-medium'>{orderDetails.customer.phone}</p>
                            </div>
                          </div>
                        ) : (
                          <p className='text-black text-sm italic'>Customer information not available</p>
                        )}
                      </div>

                      {/* Restaurant Card */}
                      <div className='bg-white rounded-xl border border-[#F2F0EA] p-6'>
                        <div className='flex items-center gap-2 mb-4'>
                          <Building2 className='h-5 w-5 text-[#FABB17]' />
                          <h3 className='text-lg font-bold text-black'>Restaurant</h3>
                        </div>
                        {orderDetails.restaurant ? (
                          <div className='space-y-3'>
                            <div className='bg-[#FAFAF8] rounded-lg p-3'>
                              <p className='text-black font-bold text-sm'>{orderDetails.restaurant.businessName}</p>
                            </div>
                            <div className='flex items-center gap-2 text-black'>
                              <Mail className='h-4 w-4 text-[#FABB17]' />
                              <p className='text-xs truncate'>{orderDetails.restaurant.businessEmail}</p>
                            </div>
                            <div className='flex items-center gap-2 text-black'>
                              <Phone className='h-4 w-4 text-[#FABB17]' />
                              <p className='text-xs font-medium'>{orderDetails.restaurant.contactNumber}</p>
                            </div>
                            <div className='flex items-start gap-2 text-black'>
                              <MapPin className='h-4 w-4 mt-0.5 flex-shrink-0 text-[#FABB17]' />
                              <p className='text-xs leading-tight'>{orderDetails.restaurant.address}</p>
                            </div>
                          </div>
                        ) : (
                          <p className='text-black text-sm italic'>Restaurant information not available</p>
                        )}
                      </div>

                      {/* Rider Card */}
                      <div className='bg-white rounded-xl border border-[#F2F0EA] p-6'>
                        <div className='flex items-center gap-2 mb-4'>
                          <Package className='h-5 w-5 text-[#FABB17]' />
                          <h3 className='text-lg font-bold text-black'>Rider</h3>
                        </div>
                        {orderDetails.rider ? (
                          <div className='space-y-3'>
                            <div className='bg-[#FAFAF8] rounded-lg p-3'>
                              <p className='text-black font-bold text-sm'>{orderDetails.rider.firstName} {orderDetails.rider.lastName}</p>
                            </div>
                            <div className='flex items-center gap-2 text-black'>
                              <Mail className='h-4 w-4 text-[#FABB17]' />
                              <p className='text-xs truncate'>{orderDetails.rider.email}</p>
                            </div>
                            <div className='flex items-center gap-2 text-black'>
                              <Phone className='h-4 w-4 text-[#FABB17]' />
                              <p className='text-xs font-medium'>{orderDetails.rider.phone}</p>
                            </div>
                          </div>
                        ) : (
                          <p className='text-black text-sm italic'>Rider not assigned</p>
                        )}
                      </div>
                    </div>

                    {/* Delivery Information */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      {/* Delivery Details Card */}
                      <div className='bg-white rounded-xl border border-[#F2F0EA] p-6'>
                        <div className='flex items-center gap-2 mb-4'>
                          <MapPin className='h-5 w-5 text-[#FABB17]' />
                          <h3 className='text-lg font-bold text-black'>Delivery Details</h3>
                        </div>
                        <div className='space-y-4'>
                          <div>
                            <span className='text-black text-xs font-bold block mb-2 uppercase'>Delivery Address:</span>
                            <div className='bg-[#FAFAF8] rounded-lg p-3 border border-[#F2F0EA]'>
                              <span className='text-black text-sm leading-relaxed'>{orderDetails.deliveryAddress}</span>
                            </div>
                          </div>
                          {orderDetails.isDeliveryVerified && (
                            <div className='bg-[#FAFAF8] border border-[#F2F0EA] rounded-lg p-3'>
                              <div className='flex items-start gap-3'>
                                <CheckCircle2 className='h-5 w-5 text-[#FABB17] flex-shrink-0 mt-0.5' />
                                <div>
                                  <p className='text-black font-bold text-sm'>Delivery Verified</p>
                                  <p className='text-black text-xs mt-1'>Code: <span className='font-mono font-bold'>{orderDetails.deliveryVerificationCode}</span></p>
                                </div>
                              </div>
                            </div>
                          )}
                          {orderDetails.specialInstructions && (
                            <div>
                              <span className='text-black text-xs font-bold block mb-2 uppercase'>Special Instructions:</span>
                              <div className='bg-white rounded-lg p-3 border border-[#F2F0EA] border-l-4 border-l-[#FABB17]'>
                                <span className='text-black text-sm whitespace-pre-line'>{orderDetails.specialInstructions}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Order Tracking Card */}
                      {orderDetails.orderTracking && (
                        <div className='bg-white rounded-xl border border-[#F2F0EA] p-6'>
                          <div className='flex items-center gap-2 mb-4'>
                            <Clock className='h-5 w-5 text-[#FABB17]' />
                            <h3 className='text-lg font-bold text-black'>Order Tracking</h3>
                          </div>
                          <div className='space-y-3'>
                            <div className='bg-[#FAFAF8] rounded-lg p-3 border-l-4 border-l-[#FABB17]'>
                              <p className='text-black text-xs font-bold uppercase mb-1'>Current Status</p>
                              <p className='text-black text-bold text-base'>{orderDetails.orderTracking.currentStatus}</p>
                            </div>
                            {orderDetails.orderTracking.actualPickupTime && (
                              <div className='flex items-start gap-3 pt-2 border-t border-[#F2F0EA]'>
                                <CheckCircle2 className='h-4 w-4 text-[#FABB17] mt-1 flex-shrink-0' />
                                <div>
                                  <p className='text-black text-xs font-bold'>Pickup Time</p>
                                  <p className='text-black text-sm font-medium mt-1'>{formatDate(orderDetails.orderTracking.actualPickupTime)}</p>
                                </div>
                              </div>
                            )}
                            {orderDetails.orderTracking.actualDeliveryTime && (
                              <div className='flex items-start gap-3 pt-2 border-t border-[#F2F0EA]'>
                                <CheckCircle2 className='h-4 w-4 text-[#FABB17] mt-1 flex-shrink-0' />
                                <div>
                                  <p className='text-black text-xs font-bold'>Delivery Time</p>
                                  <p className='text-black text-sm font-medium mt-1'>{formatDate(orderDetails.orderTracking.actualDeliveryTime)}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Order Items */}
                    <div className='bg-white rounded-xl border border-[#F2F0EA] p-6'>
                      <div className='flex items-center gap-2 mb-6'>
                        <Package className='h-6 w-6 text-[#FABB17]' />
                        <h3 className='text-xl font-bold text-black'>Order Items</h3>
                      </div>
                      <div className='space-y-3'>
                        {orderDetails.orderItems && orderDetails.orderItems.length > 0 ? (
                          orderDetails.orderItems.map((item) => (
                            <div key={item.id} className='flex gap-4 p-4 bg-[#FAFAF8] border border-[#F2F0EA] rounded-xl hover:shadow-md transition-shadow'>
                              {item.meal?.imageUrls?.[0] && (
                                <img
                                  src={item.meal.imageUrls[0] || '/placeholder.svg'}
                                  alt={item.meal.name || 'Meal image'}
                                  className='w-20 h-20 object-cover rounded-lg flex-shrink-0 border border-[#F2F0EA]'
                                />
                              )}
                              <div className='flex-1 min-w-0'>
                                <div className='flex items-start justify-between mb-2'>
                                  <div>
                                    <h4 className='text-black font-bold text-base'>{item.meal?.name || 'Unknown Item'}</h4>
                                    {item.meal?.description && (
                                      <p className='text-black text-xs mt-1 line-clamp-2'>{item.meal.description}</p>
                                    )}
                                  </div>
                                  <span className='text-black font-bold text-base whitespace-nowrap ml-2'>{formatCurrency(item.priceAtTimeOfOrder)}</span>
                                </div>
                                <div className='flex items-center justify-between mt-2 pt-2 border-t border-[#F2F0EA]'>
                                  <div className='flex items-center gap-2'>
                                    <span className='bg-[#FABB17] text-white text-xs font-bold px-2.5 py-1 rounded-full'>Qty: {item.quantity}</span>
                                  </div>
                                  {item.notes && (
                                    <p className='text-black text-xs italic bg-white px-2 py-1 rounded'>📝 {item.notes}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className='text-center py-8'>
                            <Package className='h-8 w-8 text-[#FABB17] mx-auto mb-2' />
                            <p className='text-black text-sm'>No order items found</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'items' && (
                  <div className='space-y-6'>
                    {/* Order Items */}
                    <div className='bg-white rounded-xl border border-[#F2F0EA] p-6'>
                      <div className='flex items-center gap-2 mb-6'>
                        <Package className='h-6 w-6 text-[#FABB17]' />
                        <h3 className='text-xl font-bold text-black'>Order Items</h3>
                      </div>
                      <div className='space-y-3'>
                        {orderDetails.orderItems && orderDetails.orderItems.length > 0 ? (
                          orderDetails.orderItems.map((item) => (
                            <div key={item.id} className='flex gap-4 p-4 bg-[#FAFAF8] border border-[#F2F0EA] rounded-xl hover:shadow-md transition-shadow'>
                              {item.meal?.imageUrls?.[0] && (
                                <img
                                  src={item.meal.imageUrls[0] || '/placeholder.svg'}
                                  alt={item.meal.name || 'Meal image'}
                                  className='w-20 h-20 object-cover rounded-lg flex-shrink-0 border border-[#F2F0EA]'
                                />
                              )}
                              <div className='flex-1 min-w-0'>
                                <div className='flex items-start justify-between mb-2'>
                                  <div>
                                    <h4 className='text-black font-bold text-base'>{item.meal?.name || 'Unknown Item'}</h4>
                                    {item.meal?.description && (
                                      <p className='text-black text-xs mt-1 line-clamp-2'>{item.meal.description}</p>
                                    )}
                                  </div>
                                  <span className='text-black font-bold text-base whitespace-nowrap ml-2'>{formatCurrency(item.priceAtTimeOfOrder)}</span>
                                </div>
                                <div className='flex items-center justify-between mt-2 pt-2 border-t border-[#F2F0EA]'>
                                  <div className='flex items-center gap-2'>
                                    <span className='bg-[#FABB17] text-white text-xs font-bold px-2.5 py-1 rounded-full'>Qty: {item.quantity}</span>
                                  </div>
                                  {item.notes && (
                                    <p className='text-black text-xs italic bg-white px-2 py-1 rounded'>📝 {item.notes}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className='text-center py-8'>
                            <Package className='h-8 w-8 text-[#FABB17] mx-auto mb-2' />
                            <p className='text-black text-sm'>No order items found</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'tracking' && (
                  <div className='space-y-6'>
                    {orderDetails.orderTracking ? (
                      <>
                        {/* Tracking Timeline */}
                        <div className='bg-white rounded-xl border border-[#F2F0EA] p-6'>
                          <h3 className='text-xl font-bold text-black mb-6 flex items-center gap-2'>
                            <Truck className='h-6 w-6 text-[#FABB17]' />
                            Delivery Timeline
                          </h3>
                          <div className='space-y-4'>
                            <div className='flex gap-4'>
                              <div className='flex flex-col items-center'>
                                <div className='h-10 w-10 rounded-full bg-[#FABB17] flex items-center justify-center text-white'>
                                  <CheckCircle2 className='h-5 w-5' />
                                </div>
                                <div className='w-1 h-12 bg-gradient-to-b from-[#FABB17] to-[#F2F0EA]' />
                              </div>
                              <div className='pb-4'>
                                <p className='font-bold text-black'>Order Confirmed</p>
                                <p className='text-sm text-black'>{formatDate(orderDetails.orderDate)}</p>
                              </div>
                            </div>

                            {orderDetails.orderTracking.actualPickupTime ? (
                              <div className='flex gap-4'>
                                <div className='flex flex-col items-center'>
                                  <div className='h-10 w-10 rounded-full bg-[#FABB17] flex items-center justify-center text-white'>
                                    <CheckCircle2 className='h-5 w-5' />
                                  </div>
                                  <div className='w-1 h-12 bg-gradient-to-b from-[#FABB17] to-[#F2F0EA]' />
                                </div>
                                <div className='pb-4'>
                                  <p className='font-bold text-black'>Picked Up</p>
                                  <p className='text-sm text-black'>{formatDate(orderDetails.orderTracking.actualPickupTime)}</p>
                                </div>
                              </div>
                            ) : (
                              <div className='flex gap-4 opacity-50'>
                                <div className='flex flex-col items-center'>
                                  <div className='h-10 w-10 rounded-full bg-[#F2F0EA] flex items-center justify-center text-black'>
                                    <Package className='h-5 w-5' />
                                  </div>
                                  <div className='w-1 h-12 bg-[#F2F0EA]' />
                                </div>
                                <div className='pb-4'>
                                  <p className='font-bold text-black'>Awaiting Pickup</p>
                                </div>
                              </div>
                            )}

                            {orderDetails.orderTracking.actualDeliveryTime ? (
                              <div className='flex gap-4'>
                                <div className='flex flex-col items-center'>
                                  <div className='h-10 w-10 rounded-full bg-[#FABB17] flex items-center justify-center text-white'>
                                    <CheckCircle2 className='h-5 w-5' />
                                  </div>
                                </div>
                                <div>
                                  <p className='font-bold text-black'>Delivered</p>
                                  <p className='text-sm text-black'>{formatDate(orderDetails.orderTracking.actualDeliveryTime)}</p>
                                </div>
                              </div>
                            ) : (
                              <div className='flex gap-4 opacity-50'>
                                <div className='flex flex-col items-center'>
                                  <div className='h-10 w-10 rounded-full bg-[#F2F0EA] flex items-center justify-center text-black'>
                                    <Truck className='h-5 w-5' />
                                  </div>
                                </div>
                                <div>
                                  <p className='font-bold text-black'>In Transit</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Tracking Details */}
                        <div className='grid grid-cols-2 gap-4'>
                          <div className='bg-white rounded-xl border border-[#F2F0EA] p-4'>
                            <p className='text-xs text-black font-semibold uppercase mb-2'>Current Status</p>
                            <p className='text-lg font-bold text-black'>{orderDetails.orderTracking.currentStatus}</p>
                          </div>
                          {orderDetails.orderTracking.totalDistance && (
                            <div className='bg-white rounded-xl border border-[#F2F0EA] p-4'>
                              <p className='text-xs text-black font-semibold uppercase mb-2'>Distance</p>
                              <p className='text-lg font-bold text-black'>{orderDetails.orderTracking.totalDistance} km</p>
                            </div>
                          )}
                          {orderDetails.orderTracking.totalDuration && (
                            <div className='bg-white rounded-xl border border-[#F2F0EA] p-4'>
                              <p className='text-xs text-black font-semibold uppercase mb-2'>Duration</p>
                              <p className='text-lg font-bold text-black'>{orderDetails.orderTracking.totalDuration} mins</p>
                            </div>
                          )}
                          <div className='bg-white rounded-xl border border-[#F2F0EA] p-4'>
                            <p className='text-xs text-black font-semibold uppercase mb-2'>Rider Earning</p>
                            <p className='text-lg font-bold text-black'>{formatCurrency(orderDetails.riderEarning)}</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className='text-center py-12'>
                        <Truck className='h-12 w-12 text-[#FABB17] mx-auto mb-4' />
                        <p className='text-black font-medium'>No tracking information available</p>
                      </div>
                    )}
                  </div>
                )}
                {activeTab === 'documents' && (
                  <div className='space-y-6'>
                    <div className='bg-white rounded-xl border border-[#F2F0EA] p-6'>
                      <h3 className='text-xl font-bold text-black mb-6 flex items-center gap-2'>
                        <FileText className='h-6 w-6 text-[#FABB17]' />
                        Order Documents
                      </h3>
                      
                      {orderDetails.isDeliveryVerified && (
                        <div className='space-y-3'>
                          <div className='flex items-start gap-4 p-4 bg-[#FAFAF8] rounded-lg border border-[#F2F0EA]'>
                            <CheckCircle2 className='h-5 w-5 text-[#FABB17] flex-shrink-0 mt-0.5' />
                            <div className='flex-1'>
                              <p className='font-bold text-black'>Delivery Verification Certificate</p>
                              <p className='text-sm text-black mt-1'>Verification Code: <span className='font-mono font-bold'>{orderDetails.deliveryVerificationCode}</span></p>
                              <p className='text-xs text-black mt-1'>Verified on {formatDate(orderDetails.orderDate)}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className='mt-6 pt-6 border-t border-[#F2F0EA]'>
                        <h4 className='font-bold text-black mb-4'>Order Summary</h4>
                        <div className='space-y-2 text-sm'>
                          <div className='flex justify-between'>
                            <span className='text-black'>Order ID:</span>
                            <span className='font-mono font-semibold text-black'>{orderDetails.id}</span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-black'>Order Date:</span>
                            <span className='font-semibold text-black'>{formatDate(orderDetails.orderDate)}</span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-black'>Total Amount:</span>
                            <span className='font-semibold text-black font-bold'>{formatCurrency(orderDetails.totalAmount)}</span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-black'>Payment Status:</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              orderDetails.paymentStatus === 'COMPLETED' ? 'bg-[#FAFAF8] text-[#FABB17] border border-[#FABB17]' :
                              orderDetails.paymentStatus === 'PENDING' ? 'bg-[#FAFAF8] text-[#FABB17] border border-[#FABB17]' :
                              'bg-[#FAFAF8] text-[#FABB17] border border-[#FABB17]'
                            }`}>
                              {orderDetails.paymentStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className='p-16 text-center flex flex-col items-center justify-center'>
            <div className='text-red-500 mb-4'>
              <X className='h-12 w-12 mx-auto' />
            </div>
            <p className='text-gray-600 font-medium'>Failed to load order details</p>
            <p className='text-gray-500 text-sm mt-2'>Please try again later</p>
          </div>
        )}
      </div>
    </div>
  );
}
