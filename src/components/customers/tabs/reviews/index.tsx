'use client';

import React, { useState, useEffect } from 'react';
import { Star, Filter, Search, Loader2, Store, User } from 'lucide-react';
import { toast } from 'sonner';

interface RestaurantReview {
  id: string;
  type: 'restaurant';
  rating: number;
  comment: string;
  isAnonymous: boolean;
  isPublic: boolean;
  createdAt: string;
  order: {
    id: string;
    orderDate: string;
    totalAmount: number;
  };
  restaurant: {
    id: string;
    name: string;
  };
}

interface RiderReview {
  id: string;
  type: 'rider';
  rating: number;
  comment: string;
  isAnonymous: boolean;
  isPublic: boolean;
  createdAt: string;
  order: {
    id: string;
    orderDate: string;
    totalAmount: number;
  };
  rider: {
    id: string;
    name: string;
  };
}


interface ReviewsTabProps {
  customerId: string;
}

type ReviewType = 'restaurant' | 'rider';

export default function ReviewsTab({ customerId }: ReviewsTabProps) {
  const [activeTab, setActiveTab] = useState<ReviewType>('restaurant');
  const [restaurantReviews, setRestaurantReviews] = useState<RestaurantReview[]>([]);
  const [riderReviews, setRiderReviews] = useState<RiderReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');

  // Fetch reviews from API
  const fetchReviews = async (type: ReviewType) => {
    try {
      const apiUrl = `/api/admin/customers/${customerId}/reviews?type=${type}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });


      if (!response.ok) {

        // Try to get error details from response
        try {
          const errorText = await response.text();
          console.error(`❌ ${type} reviews Error response body:`, errorText);
        } catch (textError) {
          console.error(`❌ Could not read ${type} reviews error response body:`, textError);
        }

        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        // Handle different possible response structures
        const reviews = result.data?.reviews || result.reviews || [];
        if (type === 'restaurant') {
          setRestaurantReviews(reviews as RestaurantReview[]);
        } else {
          setRiderReviews(reviews as RiderReview[]);
        }
      } else {
        console.error(`❌ ${type} reviews API returned success=false`);
        console.error(`❌ ${type} reviews API message:`, result.message);
        throw new Error(result.message || `Failed to fetch ${type} reviews`);
      }
    } catch (error) {
    
      toast.error(`Failed to load ${type} reviews`);
    }
  };

  // Load reviews when component mounts or tab changes
  useEffect(() => {

    const loadReviews = async () => {
      setLoading(true);
      await Promise.all([
        fetchReviews('restaurant'),
        fetchReviews('rider')
      ]);
      setLoading(false);
    };

    void loadReviews();
  }, [customerId]);

  const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
    const stars = [];
    const starSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`${starSize} ${
            i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFilteredReviews = () => {
    const reviews = activeTab === 'restaurant' ? (restaurantReviews || []) : (riderReviews || []);

    return reviews.filter(review => {
      const matchesSearch = !searchQuery ||
        (activeTab === 'restaurant'
          ? (review as RestaurantReview).restaurant.name.toLowerCase().includes(searchQuery.toLowerCase())
          : (review as RiderReview).rider.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        review.comment.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRating = ratingFilter === 'all' || review.rating.toString() === ratingFilter;

      return matchesSearch && matchesRating;
    });
  };

  const renderReviewCard = (review: RestaurantReview | RiderReview) => {
    const isRestaurantReview = review.type === 'restaurant';
    const entityName = isRestaurantReview
      ? (review).restaurant.name
      : (review).rider.name;
    const entityIcon = isRestaurantReview ? Store : User;

    return (
      <div key={review.id} className='bg-white border border-[#EDEDEB] rounded-[10px] p-6 hover:shadow-sm transition-shadow'>
        <div className='flex items-start justify-between mb-4'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2'>
              {React.createElement(entityIcon, { className: 'w-5 h-5 text-[#6B7280]' })}
              <span className='font-medium text-[#1F2937]'>{entityName}</span>
            </div>
            <div className='flex items-center gap-1'>
              {renderStars(review.rating)}
              <span className='text-sm text-[#6B7280] ml-1'>({review.rating}/5)</span>
            </div>
          </div>
          <span className='text-sm text-[#6B7280]'>
            {formatDate(review.createdAt)}
          </span>
        </div>

        <div className='mb-4'>
          <p className='text-[#374151] leading-relaxed'>{review.comment}</p>
        </div>

        <div className='flex items-center justify-between text-sm text-[#6B7280]'>
          <div className='flex items-center gap-4'>
            <span>Order: {review.order.id}</span>
            <span>${review.order.totalAmount.toFixed(2)}</span>
          </div>
          <div className='flex items-center gap-2'>
            {review.isPublic ? (
              <span className='text-green-600'>Public</span>
            ) : (
              <span className='text-gray-500'>Private</span>
            )}
            {review.isAnonymous && (
              <span className='text-blue-600'>Anonymous</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const filteredReviews = getFilteredReviews();
  const totalReviews = activeTab === 'restaurant' ? (restaurantReviews?.length || 0) : (riderReviews?.length || 0);

  return (
    <div className='flex flex-col gap-6 w-full pt-5'>
      {/* Tab Navigation */}
      <div className='flex border-b border-[#EDEDEB]'>
        {[
          { key: 'restaurant' as ReviewType, label: 'Restaurant Reviews', icon: Store },
          { key: 'rider' as ReviewType, label: 'Rider Reviews', icon: User }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 w-full px-4 py-2 border-2 rounded-[10px] font-medium text-[13px] transition-colors ${
              activeTab === tab.key
                ? 'border-[#FABB17] text-[#FABB17]'
                : 'border-transparent text-[#6B7280] hover:text-[#374151]'
            }`}
          >
            <tab.icon className='w-4 h-4' />
            {tab.label}
            <span className='ml-1 text-xs bg-[#EDEDEB] px-2 py-1 rounded-full'>
              {tab.key === 'restaurant' ? (restaurantReviews?.length || 0) : (riderReviews?.length || 0)}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className='flex items-center gap-4 w-full'>
        <div className='flex-1 relative'>
          <Search className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280]' />
          <input
            type='text'
            placeholder={`Search ${activeTab} reviews...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full pl-10 pr-4 py-2 text-[14px] border border-[#EDEDEB] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#FABB17] focus:border-transparent bg-white'
          />
        </div>
        <div className='relative'>
          <Filter className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280]' />
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className='pl-10 pr-10 py-2 text-[14px] border border-[#EDEDEB] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#FABB17] focus:border-transparent bg-white appearance-none cursor-pointer min-w-[150px]'
          >
            <option value='all'>All Ratings</option>
            <option value='5'>5 Stars</option>
            <option value='4'>4 Stars</option>
            <option value='3'>3 Stars</option>
            <option value='2'>2 Stars</option>
            <option value='1'>1 Star</option>
          </select>
        </div>
      </div>
      {/* Summary Stats */}
      {!loading && (
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 '>
          <div className='bg-white border border-[#EDEDEB] rounded-[10px] p-4 text-center'>
            <div className='text-2xl font-bold text-[#1F2937] mb-1'>{totalReviews}</div>
            <div className='text-sm text-[#6B7280]'>Total Reviews</div>
          </div>
          <div className='bg-white border border-[#EDEDEB] rounded-[10px] p-4 text-center'>
            <div className='text-2xl font-bold text-[#1F2937] mb-1'>
              {filteredReviews.length > 0
                ? (filteredReviews.reduce((sum, review) => sum + review.rating, 0) / filteredReviews.length).toFixed(1)
                : '0.0'
              }
            </div>
            <div className='text-sm text-[#6B7280]'>Average Rating</div>
          </div>
          <div className='bg-white border border-[#EDEDEB] rounded-[10px] p-4 text-center'>
            <div className='text-2xl font-bold text-[#1F2937] mb-1'>
              {filteredReviews.filter(review => review.rating === 5).length}
            </div>
            <div className='text-sm text-[#6B7280]'>5-Star Reviews</div>
          </div>
          <div className='bg-white border border-[#EDEDEB] rounded-[10px] p-4 text-center'>
            <div className='text-2xl font-bold text-[#1F2937] mb-1'>
              {filteredReviews.filter(review => review.isPublic).length}
            </div>
            <div className='text-sm text-[#6B7280]'>Public Reviews</div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className='space-y-4'>
        {loading ? (
          <div className='flex items-center justify-center h-96'>
            <Loader2 className='w-8 h-8 animate-spin text-[#FABB17]' />
          </div>
        ) : filteredReviews.length > 0 ? (
          filteredReviews.map(renderReviewCard)
        ) : (
          <div className='flex items-center justify-center h-96 text-center'>
            <div>
              <Star className='w-12 h-12 text-[#D1D5DB] mx-auto mb-3' />
              <p className='text-[#6B7280] font-medium'>No reviews found</p>
              <p className='text-[#9CA3AF] text-sm'>
                {searchQuery || ratingFilter !== 'all'
                  ? 'Try adjusting your search criteria'
                  : `No ${activeTab} reviews yet`
                }
              </p>
            </div>
          </div>
        )}
      </div>

      
    </div>
  );
}