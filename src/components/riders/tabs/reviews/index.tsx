'use client';

import { useState, useEffect } from 'react';
import { Star, MessageCircle } from 'lucide-react';

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  orderId: string;
  createdAt: string;
  restaurantName: string;
}

interface ReviewsTabProps {
  riderId: string;
}

export default function ReviewsTab({ riderId }: ReviewsTabProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Simulate API call - replace with actual API call
    const mockReviews: Review[] = [
      {
        id: '1',
        customerName: 'Sarah Johnson',
        rating: 5,
        comment: 'Excellent service! Very fast delivery and the food was still hot. Paul was very professional and friendly.',
        orderId: 'ORD-001',
        createdAt: '2024-03-01T10:45:00Z',
        restaurantName: 'Pizza Palace'
      },
      {
        id: '2',
        customerName: 'Mike Chen',
        rating: 4,
        comment: 'Good delivery time and the rider was polite. Food arrived in good condition.',
        orderId: 'ORD-002',
        createdAt: '2024-03-01T14:30:00Z',
        restaurantName: 'Burger House'
      },
      {
        id: '3',
        customerName: 'Emma Wilson',
        rating: 5,
        comment: 'Amazing service! The rider went above and beyond to ensure my order was delivered safely. Highly recommended!',
        orderId: 'ORD-003',
        createdAt: '2024-02-28T19:20:00Z',
        restaurantName: 'Sushi Express'
      }
    ];

    setTimeout(() => {
      setReviews(mockReviews);
      setLoading(false);
    }, 1000);
  }, [riderId]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const ratingCounts = [5, 4, 3, 2, 1].map(rating => 
    reviews.filter(review => review.rating === rating).length
  );

  const filteredReviews = reviews.filter(review => {
    if (filter === 'all') return true;
    return review.rating === parseInt(filter);
  });

  if (loading)
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-[#6B7280]'>Loading reviews...</div>
      </div>
    );

  return (
    <div className='flex flex-col gap-6 p-6 w-full'>
      {/* Reviews Overview */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Average Rating Card */}
        <div className='bg-white border border-[#E5E7EB] rounded-[10px] p-6 shadow-sm'>
          <h3 className='text-lg font-semibold text-[#1F2937] mb-4'>Overall Rating</h3>
          <div className='flex items-center gap-4'>
            <div className='text-4xl font-bold text-[#1F2937]'>{averageRating}</div>
            <div className='flex flex-col'>
              <div className='flex items-center gap-1 mb-2'>
                {renderStars(Math.round(parseFloat(averageRating)))}
              </div>
              <p className='text-sm text-[#6B7280]'>
                Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className='bg-white border border-[#E5E7EB] rounded-[10px] p-6 shadow-sm'>
          <h3 className='text-lg font-semibold text-[#1F2937] mb-4'>Rating Distribution</h3>
          <div className='space-y-2'>
            {[5, 4, 3, 2, 1].map((rating, index) => (
              <div key={rating} className='flex items-center gap-3'>
                <span className='text-sm font-medium text-[#1F2937] w-8'>
                  {rating} ⭐
                </span>
                <div className='flex-1 bg-gray-200 rounded-full h-2'>
                  <div
                    className='bg-[#FABB17] h-2 rounded-full transition-all duration-300'
                    style={{
                      width: reviews.length > 0 
                        ? `${(ratingCounts[index] / reviews.length) * 100}%`
                        : '0%'
                    }}
                  />
                </div>
                <span className='text-sm text-[#6B7280] w-6'>{ratingCounts[index]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className='flex justify-between items-center'>
        <h2 className='text-xl font-semibold text-[#1F2937]'>Customer Reviews</h2>
        
        <div className='flex gap-2'>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-[#FABB17] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {[5, 4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => setFilter(rating.toString())}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === rating.toString()
                  ? 'bg-[#FABB17] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {rating} ⭐
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className='space-y-4'>
        {filteredReviews.length === 0 ? (
          <div className='text-center py-12 text-[#6B7280]'>
            <MessageCircle className='w-16 h-16 mx-auto mb-4 text-gray-300' />
            <h3 className='text-lg font-medium mb-2'>No reviews found</h3>
            <p className='text-sm'>
              {filter === 'all' 
                ? 'This rider has no reviews yet.'
                : `No ${filter}-star reviews found.`
              }
            </p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className='bg-white border border-[#E5E7EB] rounded-[10px] p-6 shadow-sm hover:shadow-md transition-shadow'
            >
              <div className='flex justify-between items-start mb-4'>
                <div>
                  <h3 className='font-semibold text-[#1F2937] mb-1'>{review.customerName}</h3>
                  <div className='flex items-center gap-2 mb-2'>
                    <div className='flex items-center gap-1'>
                      {renderStars(review.rating)}
                    </div>
                    <span className='text-sm text-[#6B7280]'>
                      Order #{review.orderId}
                    </span>
                  </div>
                  <p className='text-sm text-[#6B7280]'>
                    {review.restaurantName} • {new Date(review.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <p className='text-[#1F2937] leading-relaxed'>{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}