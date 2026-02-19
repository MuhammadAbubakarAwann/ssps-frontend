// Types for Reviews API Response
export interface Customer {
  id: string;
  name: string;
  avatar: string | null;
}

export interface Order {
  id: string;
  orderDate: string;
  createdAt: string;
  status: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  isAnonymous: boolean;
  createdAt: string;
  customer: Customer;
  order: Order;
}

export interface RatingStats {
  distribution: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
  totalReviews: number;
  averageRating: number;
  ratingPercentages: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
}

export interface Restaurant {
  id: string;
  businessName: string;
  businessEmail: string;
  profilePhotoUrl: string | null;
  verificationStatus: string;
  isActive: boolean;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AppliedFilters {
  restaurantId: string;
  rating: number | null;
}

export interface ReviewsApiResponse {
  success: boolean;
  data: {
    restaurant: Restaurant;
    ratingStats: RatingStats;
    reviews: Review[];
    pagination: Pagination;
    appliedFilters: AppliedFilters;
  };
}

export interface RatingDistribution {
  rating: number;
  count: number;
  percentage: number;
}