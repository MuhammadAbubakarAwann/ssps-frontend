'use server';

import type { Restaurant, RestaurantsCount, RestaurantFilterStatus } from '@/types/restaurant';
import type { MenuApiResponse } from '@/types/menu';
import type { ReviewsApiResponse } from '@/types/reviews';
import type { DocumentsApiResponse } from '@/types/documents';
import { requireAdmin, refreshAccessToken } from '@/lib/auth-service';

const API_BASE_URL = process.env.BACKEND_API_URL || 'https://api.domlii.com/api/v1';

// Export interface types
export interface FetchRestaurantsParams {
  tab?: RestaurantFilterStatus
  search?: string
  page?: number
  limit?: number
  includeStats?: boolean
}

export interface FetchRestaurantsResult {
  restaurants: Restaurant[]
  counts?: RestaurantsCount
  totalPages: number
  currentPage: number
}

// Define proper type for operating hours
interface OperatingHours {
  [day: string]: {
    open: string;
    close: string;
    isOpen: boolean;
  } | undefined;
}

// API Response interfaces
interface ApiRestaurant {
  id: string;
  restaurantName: string;
  phoneNumber: string;
  email: string;
  address: string;
  status: string;
  verificationStatus: string;
  registrationDate: string;
  cuisineType: string;
  userId: string;
  userEmail: string;
  userPhone: string;
  userStatus: string;
  latitude: number | null;
  longitude: number | null;
  profilePhotoUrl: string | null;
  coverPhotoUrl: string | null;
  description: string | null;
  operatingHours: OperatingHours | null;
  taxRegistrationNumber: string | null;
  verifiedAt: string | null;
  updatedAt: string;
  stats: {
    totalMeals: number;
    totalOrders: number;
    totalPromotions: number;
  };
}
interface RestaurantDetailsResponse {
  success: boolean;
  data: ApiRestaurant;
}

interface ApiResponse {
  success: boolean;
  data: {
    restaurants: ApiRestaurant[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
    };
  };
}

interface StatsApiResponse {
  success: boolean;
  data: {
    overview: {
      total: number;
      active: number;
      inactive: number;
      verified: number;
      pendingVerification: number;
      rejected: number;
      recentRegistrations: number;
    };
    verificationStatus: {
      PROFILE_INCOMPLETE?: number;
      DOCUMENTS_PENDING?: number;
      UNDER_REVIEW?: number;
      VERIFIED?: number;
      REJECTED?: number;
    };
  };
}

export interface RevenueTimeSeriesData {
  period: string;
  revenue: number;
  orderCount: number;
  averageOrderValue: number;
  formattedPeriod: string;
}

export interface RevenueOverviewResponse {
  success: boolean;
  data: {
    restaurant: {
      id: string;
      name: string;
      ownerName: string;
    };
    timeSeries: RevenueTimeSeriesData[];
    summary: {
      totalRevenue: number;
      totalOrders: number;
      averagePeriodRevenue: number;
      averageOrderValue: number;
      growthRate: number;
      period: string;
      groupBy: string;
      dataPoints: number;
      periodsWithData: number;
    };
  };
  filters: {
    period: string;
    groupBy: string;
    restaurantId: string;
    dateRange: {
      from: string;
      to: string;
    };
  };
}

// Helper functions for authentication
async function getAuthHeaders(): Promise<Record<string, string>> {
  const session = await requireAdmin();
  
  return {
    'Authorization': `Bearer ${session.accessToken}`,
    'Content-Type': 'application/json'
  };
}

async function makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = await getAuthHeaders();
  
  let response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  });

  // If token expired, try to refresh and retry
  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers
        }
      });
    }
  }

  return response;
}

// Map filter values to API filter parameter
function mapFilterToApi(tab: string): string {
  const filterMap: { [key: string]: string } = {
    'ALL': 'all',
    'PENDING': 'pending',
    'APPROVED': 'approved',
    'REJECTED': 'rejected',
    'DISABLED': 'disabled'
  };
  
  return filterMap[tab] || 'all';
}

// Map API status to our status format
function mapApiStatus(restaurant: ApiRestaurant): string {
  if (restaurant.status !== 'Active') 
    return 'DISABLED';
  
  
  switch (restaurant.verificationStatus) {
    case 'VERIFIED':
      return 'APPROVED';
    case 'REJECTED':
      return 'REJECTED';
    case 'PROFILE_INCOMPLETE':
      return 'PROFILE_INCOMPLETE';
    case 'DOCUMENTS_PENDING':
      return 'DOCUMENTS_PENDING';
    case 'UNDER_REVIEW':
      return 'PENDING';
    default:
      return 'PENDING';
  }
}

// Fetch restaurant stats from API
async function fetchRestaurantStats(): Promise<RestaurantsCount> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // Increased to 10 seconds

    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/restaurants/stats`,
      {
        signal: controller.signal,
        cache: 'no-store'
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      // If endpoint doesn't exist (404), skip to fallback calculation
      if (response.status === 404) {
        throw new Error('Stats endpoint not available');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: StatsApiResponse = await response.json();

    if (!data.success) 
      throw new Error('Stats API returned error');
    

    const overview = data.data.overview;
    
    // Map API response to our interface
    return {
      total: overview.total,
      approved: overview.verified,
      pending: overview.pendingVerification,
      rejected: overview.rejected,
      disabled: overview.inactive
    };
  } catch (error) {
    // If stats endpoint doesn't exist, calculate from all restaurants
    return calculateStatsFromRestaurants();
  }
}

// Fallback: Calculate stats by fetching all restaurants
async function calculateStatsFromRestaurants(): Promise<RestaurantsCount> {
  try {
    const result = await fetchRestaurantsData({ tab: 'ALL', limit: 1000 });
    const allRestaurants = result.restaurants;
    
    return {
      total: allRestaurants.length,
      pending: allRestaurants.filter(r => r.status === 'PENDING').length,
      approved: allRestaurants.filter(r => r.status === 'APPROVED').length,
      rejected: allRestaurants.filter(r => r.status === 'REJECTED').length,
      disabled: allRestaurants.filter(r => r.status === 'DISABLED').length
    };
  } catch (error) {
    console.error('Error calculating stats:', error);
    return {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      disabled: 0
    };
  }
}

// Export stats function separately
export async function fetchRestaurantStatsOnly(): Promise<RestaurantsCount> {
  return fetchRestaurantStats();
}

// Main fetch function with stats
export async function fetchRestaurants(params: FetchRestaurantsParams = {}): Promise<FetchRestaurantsResult> {
  try {
    // Always fetch restaurants first for faster UI response
    const result = await fetchRestaurantsData(params);
    
    // Only fetch stats if explicitly requested or if it's the initial load without search
    if (params?.includeStats !== false && (!params?.search || params?.search === '')) 
      try {
        const stats = await fetchRestaurantStats();
        return { 
          restaurants: result.restaurants, 
          counts: stats,
          totalPages: result.totalPages,
          currentPage: result.currentPage
        };
      } catch (statsError) {
        console.error('Stats fetch failed, returning restaurants only:', statsError);
        return result;
      }
    
    
    return result;
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    
    return {
      restaurants: [],
      counts: {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        disabled: 0
      },
      totalPages: 1,
      currentPage: 1
    };
  }
}

// Fetch restaurants data from API
async function fetchRestaurantsData(params: FetchRestaurantsParams = {}): Promise<{ restaurants: Restaurant[], totalPages: number, currentPage: number }> {
  const {
    tab = 'ALL',
    search = '',
    page = 1,
    limit = 10
  } = params;

  // Build query parameters
  const searchParams = new URLSearchParams();
  searchParams.append('page', page.toString());
  searchParams.append('limit', limit.toString());
  searchParams.append('filter', mapFilterToApi(tab));
  
  if (search) 
    searchParams.append('search', search);
  

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/restaurants?${searchParams.toString()}`,
      {
        cache: 'no-store',
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) 
      throw new Error(`HTTP error! status: ${response.status}`);
    

    const data: ApiResponse = await response.json();

    if (!data.success) 
      throw new Error('API returned error');
    

    // Transform API data to match our component interface
    const restaurants: Restaurant[] = data.data.restaurants.map((apiRestaurant) => ({
      id: apiRestaurant.id,
      restaurantName: apiRestaurant.restaurantName === 'N/A' ? 'Pending Setup' : apiRestaurant.restaurantName,
      restaurantId: `#${apiRestaurant.id.slice(-4)}`,
      phoneNumber: apiRestaurant.phoneNumber,
      email: apiRestaurant.email,
      address: apiRestaurant.address === 'N/A' ? 'Not provided' : apiRestaurant.address,
      status: mapApiStatus(apiRestaurant),
      verificationStatus: apiRestaurant.verificationStatus,
      registrationDate: new Date(apiRestaurant.registrationDate),
      cuisineType: apiRestaurant.cuisineType === 'N/A' ? 'Not specified' : apiRestaurant.cuisineType
    }));

    return {
      restaurants,
      totalPages: data.data.pagination?.totalPages || 1,
      currentPage: data.data.pagination?.currentPage || params.page || 1
    };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function fetchRestaurantDetails(id: string): Promise<ApiRestaurant> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/restaurants/${id}`,
      {
        cache: 'no-store',
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) 
      throw new Error(`HTTP error! status: ${response.status}`);
    

    const data: RestaurantDetailsResponse = await response.json();

    if (!data.success) 
      throw new Error('API returned error');
    

    return data.data;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Error fetching restaurant details:', error);
    throw new Error('Restaurant not found');
  }
}


// Define proper return type for best selling items
interface BestSellingItemsResponse {
  success: boolean;
  data: unknown; // You should define a proper interface based on your API response
}

export async function fetchBestSellingItems(restaurantId?: string): Promise<BestSellingItemsResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    let url = `${API_BASE_URL}/admin/best-selling-items`;
    if (restaurantId) 
      url += `?restaurantId=${restaurantId}`;
    

    const response = await makeAuthenticatedRequest(url, {
      cache: 'no-store',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('Best selling items API error:', response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: BestSellingItemsResponse = await response.json();

    if (!data.success) {
      console.error('API returned success: false', data);
      throw new Error('API returned error');
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Error fetching best selling items:', error);
    throw error;
  }
}

// Define standard API response type
interface StandardApiResponse {
  success: boolean;
  message: string;
}

export async function updateRestaurantStatus(id: string, status: string): Promise<StandardApiResponse> {
  try {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/restaurants/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
        cache: 'no-store'
      }
    );

    if (!response.ok) 
      throw new Error(`HTTP error! status: ${response.status}`);
    

    const data = await response.json();

    if (!data.success) 
      throw new Error('API returned error');
    

    return { success: true, message: 'Status updated successfully' };
  } catch (error) {
    console.error('Error updating restaurant status:', error);
    throw new Error('Failed to update status');
  }
}

export async function deleteRestaurant(id: string): Promise<StandardApiResponse> {
  try {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/restaurants/${id}`,
      {
        method: 'DELETE',
        cache: 'no-store'
      }
    );

    if (!response.ok) 
      throw new Error(`HTTP error! status: ${response.status}`);
    

    const data = await response.json();

    if (!data.success) 
      throw new Error('API returned error');
    

    return { success: true, message: 'Restaurant deleted successfully' };
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    throw new Error('Failed to delete restaurant');
  }
}

// Approve restaurant
export async function approveRestaurant(id: string): Promise<StandardApiResponse> {
  try {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/restaurants/${id}/approve`,
      {
        method: 'PUT',
        body: JSON.stringify({}),
        cache: 'no-store'
      }
    );

    if (!response.ok) 
      throw new Error(`HTTP error! status: ${response.status}`);
    

    const data = await response.json();

    if (!data.success) 
      throw new Error('API returned error');
    

    return { success: true, message: 'Restaurant approved successfully' };
  } catch (error) {
    console.error('Error approving restaurant:', error);
    throw new Error('Failed to approve restaurant');
  }
}

// Reject restaurant
export async function rejectRestaurant(id: string, reason: string): Promise<StandardApiResponse> {
  try {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/restaurants/${id}/reject`,
      {
        method: 'PUT',
        body: JSON.stringify({ 
          reason: reason 
        }),
        cache: 'no-store'
      }
    );

    if (!response.ok) 
      throw new Error(`HTTP error! status: ${response.status}`);
    

    const data = await response.json();

    if (!data.success) 
      throw new Error('API returned error');
    

    return { success: true, message: 'Restaurant rejected successfully' };
  } catch (error) {
    console.error('Error rejecting restaurant:', error);
    throw new Error('Failed to reject restaurant');
  }
}

// Disable/Enable restaurant
export async function toggleRestaurantStatus(id: string, disable: boolean): Promise<StandardApiResponse> {
  try {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/restaurants/${id}/disable`,
      {
        method: 'PUT',
        body: JSON.stringify({ 
          disable: disable 
        }),
        cache: 'no-store'
      }
    );

    if (!response.ok) 
      throw new Error(`HTTP error! status: ${response.status}`);
    

    const data = await response.json();

    if (!data.success) 
      throw new Error('API returned error');
    

    return { 
      success: true, 
      message: disable ? 'Restaurant disabled successfully' : 'Restaurant enabled successfully' 
    };
  } catch (error) {
    console.error('Error toggling restaurant status:', error);
    throw new Error(`Failed to ${disable ? 'disable' : 'enable'} restaurant`);
  }
}

// Fetch revenue overview for chart
export async function fetchRevenueOverview(restaurantId: string): Promise<RevenueOverviewResponse> {
  try {
    const url = `${API_BASE_URL}/admin/revenue-overview?restaurantId=${restaurantId}`;
    
    const response = await makeAuthenticatedRequest(url, {
      method: 'GET',
      cache: 'no-store'
    });
    
    if (!response.ok) 
      throw new Error(`HTTP error! status: ${response.status}`);
    
    
    const data: RevenueOverviewResponse = await response.json();
    
    if (!data.success) 
      throw new Error('API returned error');
    
    
    return data;
  } catch (error) {
    console.error('Error fetching revenue overview:', error);
    throw error;
  }
}

// Menu-related actions
export async function fetchRestaurantMenu(restaurantId: string): Promise<MenuApiResponse> {
  try {
    await requireAdmin();

    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/admin/menus?restaurantId=${restaurantId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) 
      throw new Error(`HTTP error! status: ${response.status}`);

    const data: MenuApiResponse = await response.json();

    if (!data.success) 
      throw new Error('API returned error');

    return data;
  } catch (error) {
    console.error('Error fetching restaurant menu:', error);
    throw error;
  }
}

// Fetch restaurant reviews
export async function fetchRestaurantReviews(restaurantId: string, rating?: number | null): Promise<ReviewsApiResponse> {
  try {
    await requireAdmin();

    let url = `${API_BASE_URL}/admin/reviews?restaurantId=${restaurantId}`;
    if (rating) {
      url += `&rating=${rating}`;
    }

    const response = await makeAuthenticatedRequest(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) 
      throw new Error(`HTTP error! status: ${response.status}`);

    const data: ReviewsApiResponse = await response.json();

    if (!data.success) 
      throw new Error('API returned error');

    return data;
  } catch (error) {
    console.error('Error fetching restaurant reviews:', error);
    throw error;
  }
}

// Fetch restaurant documents
export async function fetchRestaurantDocuments(restaurantId: string): Promise<DocumentsApiResponse> {
  try {
    await requireAdmin();

    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/admin/restaurant-documents?restaurantId=${restaurantId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) 
      throw new Error(`HTTP error! status: ${response.status}`);

    const data: DocumentsApiResponse = await response.json();

    if (!data.success) 
      throw new Error('API returned error');

    return data;
  } catch (error) {
    console.error('Error fetching restaurant documents:', error);
    throw error;
  }
}