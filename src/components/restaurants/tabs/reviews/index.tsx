'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { fetchRestaurantReviews } from '@/lib/server-actions/restaurant-actions';
import type { ReviewsApiResponse, RatingDistribution, Review } from '@/types/reviews';

// Helper function to format timestamp
const formatTimestamp = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInDays < 30) return `${diffInDays} days ago`;
  
  return date.toLocaleDateString();
};

interface RatingFilter {
  label: string;
  value: string;
  count: number;
}

const StarRating = ({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeMap = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className='flex gap-1 items-center'>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`${sizeMap[size]} ${
            i < Math.floor(rating)
              ? 'fill-yellow-400 text-yellow-400'
              : i < rating
                ? 'fill-yellow-200 text-yellow-400'
                : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
};

interface ReviewsTabProps {
  restaurantId: string;
}

export default function ReviewsTab({ restaurantId }: ReviewsTabProps) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [reviewsData, setReviewsData] = useState<ReviewsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch reviews data
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchRestaurantReviews(restaurantId);
        setReviewsData(data);
      } catch (err) {
        console.error('Error loading reviews:', err);
        setError(err instanceof Error ? err.message : 'Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId) {
      loadReviews();
    }
  }, [restaurantId]);

  // Transform API data for UI
  const ratingDistribution: RatingDistribution[] = reviewsData
    ? [
        { rating: 5, count: reviewsData.data.ratingStats.distribution['5'], percentage: reviewsData.data.ratingStats.ratingPercentages['5'] },
        { rating: 4, count: reviewsData.data.ratingStats.distribution['4'], percentage: reviewsData.data.ratingStats.ratingPercentages['4'] },
        { rating: 3, count: reviewsData.data.ratingStats.distribution['3'], percentage: reviewsData.data.ratingStats.ratingPercentages['3'] },
        { rating: 2, count: reviewsData.data.ratingStats.distribution['2'], percentage: reviewsData.data.ratingStats.ratingPercentages['2'] },
        { rating: 1, count: reviewsData.data.ratingStats.distribution['1'], percentage: reviewsData.data.ratingStats.ratingPercentages['1'] },
      ]
    : [];

  // Generate rating filters based on actual data
  const ratingFilters: RatingFilter[] = reviewsData
    ? [
        { label: 'All', value: 'all', count: reviewsData.data.ratingStats.totalReviews },
        ...ratingDistribution.filter(r => r.count > 0).map(r => ({
          label: r.rating.toString(),
          value: r.rating.toString(),
          count: r.count
        }))
      ]
    : [{ label: 'All', value: 'all', count: 0 }];

  const averageRating = reviewsData?.data.ratingStats.averageRating || 0;
  const totalReviews = reviewsData?.data.ratingStats.totalReviews || 0;
  const allReviews = reviewsData?.data.reviews || [];

  // Filter reviews based on selected rating
  const filteredReviews = selectedFilter === 'all' 
    ? allReviews 
    : allReviews.filter(review => review.rating === parseInt(selectedFilter));

  if (loading)
    return (
      <div className='flex flex-col h-full bg-white rounded-lg overflow-hidden'>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
            <p className='text-gray-600'>Loading reviews...</p>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className='flex flex-col h-full bg-white rounded-lg overflow-hidden'>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <div className='text-red-500 text-lg mb-2'>Error loading reviews</div>
            <p className='text-gray-600'>{error}</p>
          </div>
        </div>
      </div>
    );

  return (
    <div className='flex flex-col h-full w-full bg-white rounded-lg overflow-hidden'>
      {/* Rating Summary Section */}
      <div className='flex gap-8 p-6 mt-4 border-2 border-[#EDEDEB] rounded-xl '>
        {/* Left: Distribution Bars */}
        <div className='flex-1 '>
          {ratingDistribution.map((item) => (
            <div key={item.rating} className='flex items-center gap-3 mb-2 last:mb-0'>
              <span className='text-sm text-gray-700 w-2'>{item.rating}</span>
              <Star className='w-4 h-4 fill-yellow-400 text-yellow-400' />
              <div className='flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-xs'>
                <div
                  className='h-full bg-yellow-700 rounded-full transition-all'
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Right: Rating Display */}
        <div className='flex flex-col items-end justify-center gap-3'>
          <div className='text-5xl font-bold text-gray-900'>{averageRating.toFixed(1)}</div>
          <StarRating rating={averageRating} size='lg' />
          <div className='text-sm font-medium text-gray-700'>{totalReviews} Reviews</div>
        </div>
      </div>

      {/* Rating Filters */}
      <div className='flex gap-2 py-4 overflow-x-auto border-b border-gray-100'>
        {ratingFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setSelectedFilter(String(filter.value))}
            className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-all flex-shrink-0 ${
              selectedFilter === String(filter.value)
                ? 'bg-yellow-100 border border-yellow-400 text-yellow-900'
                : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
            }`}
          >
            {filter.label} {filter.count > 0 && <span className='ml-1'>({filter.count})</span>}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className='flex-1 overflow-y-auto px-6 py-4 space-y-4'>
        {filteredReviews.map((review) => (
          <div
            key={review.id}
            className='pb-4 border-b border-gray-200 last:border-b-0'
          >
            {/* Review Header */}
            <div className='flex gap-3 mb-2'>
              {/* Avatar */}
              <div className='flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gray-200'>
                {review.customer.avatar ? (
                  <img
                    src={review.customer.avatar}
                    alt={review.customer.name}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center bg-gray-300'>
                    <span className='text-gray-600 text-sm font-medium'>
                      {review.customer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Author Info */}
              <div className='flex-1'>
                <div className='flex items-center justify-between gap-2'>
                  <h4 className='font-semibold text-gray-900 text-sm'>{review.customer.name}</h4>
                  <span className='text-xs text-gray-500'>{formatTimestamp(review.createdAt)}</span>
                </div>
                <StarRating rating={review.rating} size='sm' />
              </div>
            </div>

            {/* Review Text */}
            <p className='text-sm text-gray-700 leading-relaxed'>{review.comment}</p>
          </div>
        ))}
        
        {filteredReviews.length === 0 && allReviews.length > 0 && (
          <div className='text-center py-12'>
            <p className='text-gray-600'>No reviews found for {selectedFilter} star rating</p>
          </div>
        )}
        
        {allReviews.length === 0 && (
          <div className='text-center py-12'>
            <p className='text-gray-600'>No reviews available</p>
          </div>
        )}
      </div>
    </div>
  );
}
