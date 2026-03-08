'use client';

import { useState, useEffect } from 'react';
import { MapPin, Star, Loader2, XCircle } from 'lucide-react';

interface Address {
  id: string;
  formattedAddress: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  addressComponents: {
    city?: string;
    state?: string;
    country?: string;
    streetName?: string;
  };
  isDefault: boolean;
  usageStats: {
    totalOrders: number;
    recentOrders: any[];
  };
  createdAt: string;
  updatedAt: string;
}

interface AddressesTabProps {
  customerId: string;
}

export default function AddressesTab({ customerId }: AddressesTabProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/customers/${customerId}/addresses`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Addresses API error response:', errorText);
        throw new Error(`Failed to fetch addresses: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Handle different response structures
      let addressesData: Address[] = [];
      if (Array.isArray(data)) {
        addressesData = data;
      } else if (data && typeof data === 'object') {
        // Check for common response wrapper patterns
        addressesData = data.data?.addresses || data.addresses || data.data || data.results || [];
        if (!Array.isArray(addressesData)) {
          console.warn('Addresses data is wrapped but not an array, defaulting to empty list');
          addressesData = [];
        }
      } else {
        console.warn('Addresses data is not an object or array, defaulting to empty list');
        addressesData = [];
      }

      setAddresses(addressesData);
    } catch (err) {
      console.error('Error fetching addresses:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      void fetchAddresses();
    }
  }, [customerId]);

  const getAddressTypeIcon = () => {
    // Use consistent icon for all addresses
    return <MapPin className='w-5 h-5 text-[#FABB17]' />;
  };

  const getAddressTypeColor = () => {
    // Use consistent color for all city labels
    return 'bg-blue-100 text-blue-800';
  };

  const getAddressTypeLabel = (address: Address) => {
    return address.addressComponents?.city || 'Unknown City';
  };

  const mostUsedAddress = addresses.length > 0 ? addresses.reduce((prev, current) =>
    (prev.usageStats?.totalOrders || 0) > (current.usageStats?.totalOrders || 0) ? prev : current
  ) : null;

  if (loading) {
    return (
      <div className='flex items-center justify-center h-96'>
        <div className='flex flex-col items-center gap-3'>
          <Loader2 className='w-8 h-8 animate-spin text-[#FABB17]' />
          <p className='text-[#6B7280] font-medium'>Loading addresses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-96'>
        <div className='text-center'>
          <XCircle className='w-12 h-12 text-red-500 mx-auto mb-3' />
          <p className='text-red-600 font-medium mb-2'>Failed to load addresses</p>
          <p className='text-[#9CA3AF] text-sm'>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-4 w-full pt-5'>
      {/* Address Statistics */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='bg-white border border-[#F2F0EA] rounded-[10px] p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <MapPin className='w-5 h-5 text-[#FABB17]' />
            <span className='text-sm font-medium text-[#6B7280]'>Total Addresses</span>
          </div>
          <div className='text-2xl font-bold text-[#1F2937]'>{addresses.length}</div>
        </div>

        <div className='bg-white border border-[#F2F0EA] rounded-[10px] p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <Star className='w-5 h-5 text-[#FABB17]' />
            <span className='text-sm font-medium text-[#6B7280]'>Most Used</span>
          </div>
          <div className='text-lg font-bold text-[#1F2937]'>
            {mostUsedAddress ? getAddressTypeLabel(mostUsedAddress) : 'None'}
          </div>
          <div className='text-sm text-[#6B7280]'>
            {mostUsedAddress ? `${mostUsedAddress.usageStats?.totalOrders || 0} orders` : 'No orders'}
          </div>
        </div>
      </div>

      {/* Addresses List Header */}
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-[#1F2937]'>Saved Addresses</h3>
    
      </div>

      {/* Addresses List */}
      <div className='space-y-4'>
        {addresses.length > 0 ? addresses.map((address) => (
          <div key={address.id} className='bg-white border border-[#F2F0EA] rounded-[10px] p-6 hover:shadow-sm transition-shadow'>
            <div className='flex items-start justify-between'>
              <div className='flex items-start gap-4 flex-1'>
                <div className='mt-1'>
                  {getAddressTypeIcon()}
                </div>

                <div className='flex-1'>
                  <div className='flex items-center gap-3 mb-2'>
                    <h4 className='text-lg font-semibold text-[#1F2937]'>{getAddressTypeLabel(address)}</h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAddressTypeColor()}`}>
                      {getAddressTypeLabel(address)}
                    </span>
                    {address.isDefault && (
                      <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                        <Star className='w-3 h-3 mr-1 fill-current' />
                        Default
                      </span>
                    )}
                  </div>

                  <div className='text-[#374151] mb-3'>
                    <p>{address.formattedAddress}</p>
                    {address.addressComponents && (
                      <p>
                        {[address.addressComponents.city, address.addressComponents.state, address.addressComponents.country]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    )}
                  </div>

                  <div className='grid grid-cols-2 md:grid-cols-2 gap-4 text-sm'>
                    
                    <div>
                      <span className='text-[#6B7280]'>Created:</span>
                      <span className='font-medium text-[#1F2937] ml-1'>
                        {new Date(address.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className='text-[#6B7280]'>Last Updated:</span>
                      <span className='font-medium text-[#1F2937] ml-1'>
                        {new Date(address.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

 
            </div>


          </div>
        )) : (
          <div className='flex items-center justify-center h-96 text-center'>
            <div>
              <MapPin className='w-12 h-12 text-[#FABB17] mx-auto mb-3' />
              <p className='text-[#6B7280] font-medium'>No addresses found</p>
              <p className='text-[#9CA3AF] text-sm'>No saved addresses for this customer</p>
            </div>
          </div>
        )}
      </div>


  
    </div>
  );
}