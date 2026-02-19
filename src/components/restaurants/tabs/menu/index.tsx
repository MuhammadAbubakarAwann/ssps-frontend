'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { fetchRestaurantMenu } from '@/lib/server-actions/restaurant-actions';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  description?: string;
  inStock: boolean;
}

interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

interface MenuTabProps {
  restaurantId: string;
}

export default function MenuTab({ restaurantId }: MenuTabProps) {
  const [menuData, setMenuData] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadMenuData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchRestaurantMenu(restaurantId);
        if (response.success && response.data) {
          // Transform API data to match original UI structure
          const transformedData: MenuCategory[] = Object.entries(response.data.menusByCategory).map(([category, items]) => ({
            id: category.toLowerCase(),
            name: category.charAt(0).toUpperCase() + category.slice(1).toLowerCase().replace(/_/g, ' '),
            items: items.map(item => ({
              id: item.id,
              name: item.name,
              price: item.price,
              imageUrl: item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : undefined,
              description: item.description,
              inStock: item.inStock
            }))
          }));
          
          setMenuData(transformedData);
          
          // Expand the first category by default
          if (transformedData.length > 0)
            setExpandedCategories(new Set([transformedData[0].id]));
        }
      } catch (err) {
        console.error('Error loading menu data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load menu data');
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId)
      void loadMenuData();
  }, [restaurantId]);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      // If the category is already expanded, close it
      newExpanded.delete(categoryId);
    } else {
      // If the category is not expanded, close all others and open this one
      newExpanded.clear();
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  if (loading)
    return (
      <div className='w-full h-full bg-white p-6 overflow-y-auto'>
        <div className='max-w-6xl mx-auto'>
          <div className='flex items-center justify-center h-64'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
              <p className='text-gray-600'>Loading menu...</p>
            </div>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className='w-full h-full bg-white p-6 overflow-y-auto'>
        <div className='max-w-6xl mx-auto'>
          <div className='flex items-center justify-center h-64'>
            <div className='text-center'>
              <div className='text-red-500 text-lg mb-2'>Error loading menu</div>
              <p className='text-gray-600'>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className='w-full h-full bg-white p-6 overflow-y-auto'>
      <div className='max-w-6xl mx-auto space-y-3'>
        {menuData.map((category) => (
          <div
            key={category.id}
            className='overflow-hidden bg-[#FFF5DA] rounded-[6px] shadow-sm'
          >
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category.id)}
              className='w-full flex items-center rounded-[6px] justify-between p-4 bg-[#FFF5DA] hover:bg-[#FFECB3] transition-colors'
            >
              <div className='flex items-center gap-3'>
                <h3 className='font-semibold text-[16px] text-[#2F2F2F]'>
                  {category.name}
                </h3>
                <span className='text-[14px] text-[#6B7280] font-medium'>
                  ({category.items.length})
                </span>
              </div>
              {expandedCategories.has(category.id) ? (
                <ChevronUp className='h-5 w-5 text-[#6B7280]' />
              ) : (
                <ChevronDown className='h-5 w-5 text-[#6B7280]' />
              )}
            </button>

            {/* Menu Items */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                expandedCategories.has(category.id)
                  ? 'max-h-[2000px] opacity-100'
                  : 'max-h-0 opacity-0'
              }`}
            >
              <div className='p-4 space-y-3 bg-[#FFF5DA] rounded-[6px]'>
                {category.items.map((item) => (
                  <div
                    key={item.id}
                    className='flex items-center gap-4 p-3 rounded-[6px] bg-white border border-[#ECE7DB] hover:shadow-md transition-shadow'
                  >
                    {/* Item Image */}
                    <div className='flex-shrink-0 w-12 h-12 rounded-[6px] overflow-hidden bg-gray-200'>
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={56}
                          height={56}
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <div className='w-full h-full flex items-center justify-center'>
                          <svg
                            className='w-6 h-6 text-gray-400'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className='flex-1 min-w-0'>
                      <h4 className='font-semibold text-[16px] text-[#2F2F2F] mb-1'>
                        {item.name}
                      </h4>
                      {item.description && (
                        <p className='text-[13px] text-[#6B7280] line-clamp-2'>
                          {item.description}
                        </p>
                      )}
                      {!item.inStock && (
                        <p className='text-[12px] text-red-600 font-medium mt-1'>
                          Out of Stock
                        </p>
                      )}
                    </div>

                    {/* Price */}
                    <div className='flex-shrink-0 text-right'>
                      <span className='font-bold text-[18px] text-[#2F2F2F]'>
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        
        {menuData.length === 0 && (
          <div className='text-center py-12'>
            <p className='text-gray-600'>No menu items available</p>
          </div>
        )}
      </div>
    </div>
  );
}
