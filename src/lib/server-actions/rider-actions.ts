'use server';

import type { Rider, RidersCount, RiderFilterStatus } from '@/types/rider';
import { requireAdmin, refreshAccessToken } from '@/lib/auth-service';

const API_BASE_URL = process.env.BACKEND_API_URL || 'https://api.domlii.com/api/v1';

// Export interface types
export interface FetchRidersParams {
  tab?: RiderFilterStatus
  search?: string
  page?: number
  limit?: number
  includeStats?: boolean
}

export interface FetchRidersResult {
  riders: Rider[]
  counts?: RidersCount
  totalPages: number
  currentPage: number
}

// API Response interfaces
interface ApiRider {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  status: string;
  isVerified: boolean;
  verification: {
    status: string;
  };
  vehicleInfo: {
    type: string;
    plateNumber: string;
  };
  phone: string;
  firstName?: string;
  lastName?: string;
  registrationDate: string;
  vehicleDetails: {
    vehicleType: string;
    licensePlateNumber: string;
    brand: string;
  };
  bankInformation: {
    accountNumber: string;
    accountName: string;
    bank: string;
  };
  rating: number;
  totalReviews: number;
  totalDeliveries: number;
  totalDeliveriesCompleted: number;
  averageDeliveryTime: string;
  distanceCovered: string;
  totalRevenue: number;
  baseEarnings: number;
  tipsEarned: number;
  verificationStatus: string;
  isAvailable: boolean;
  joinedDate: string;
  lastActive: string;
  lastLocationUpdate: string;
}

interface RiderDetailsResponse {
  success: boolean;
  data: ApiRider;
}

interface ApiResponse {
  success: boolean;
  data: {
    riders: ApiRider[];
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
    totalRiders: number;
    verificationStatus: {
      PROFILE_INCOMPLETE: number;
      DOCUMENTS_PENDING: number;
      UNDER_REVIEW: number;
      VERIFIED: number;
      REJECTED: number;
      DISABLED?: number;
    };
    userStatus: {
      ACTIVE: number;
      INACTIVE: number;
      SUSPENDED: number;
      PENDING: number;
    };
    summary: {
      awaitingVerification: number;
      activeVerified: number;
      rejectedRiders: number;
      disabledRiders: number;
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
    'PENDING': 'under_review,document_pending,profile_incomplete',
    'APPROVED': 'verified',
    'REJECTED': 'rejected',
    'DISABLED': 'inactive'
  };

  return filterMap[tab] || 'all';
}

// Map API status to our status format
function mapApiStatus(rider: ApiRider): string {
  // First check the status field
  if (rider.status === 'INACTIVE')
    return 'DISABLED';

  // Then check verification status
  switch (rider.verification.status) {
    case 'VERIFIED':
      return 'APPROVED';
    case 'REJECTED':
      return 'REJECTED';
    case 'PROFILE_INCOMPLETE':
    case 'DOCUMENT_PENDING':
    case 'UNDER_REVIEW':
      return 'PENDING';
    default:
      return 'PENDING';
  }
}

// Map verification status for display in table
// function mapVerificationStatusForDisplay(rider: ApiRider): string {
//   // Show the actual verification status in the table
//   switch (rider.verification.status) {
//     case 'VERIFIED':
//       return 'APPROVED';
//     case 'REJECTED':
//       return 'REJECTED';
//     case 'PROFILE_INCOMPLETE':
//       return 'PROFILE_INCOMPLETE';
//     case 'DOCUMENT_PENDING':
//       return 'DOCUMENTS_PENDING';
//     case 'UNDER_REVIEW':
//       return 'UNDER_REVIEW';
//     default:
//       return 'PENDING';
//   }
// }

// Fetch rider stats from API
async function fetchRiderStats(): Promise<RidersCount> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // Increased to 10 seconds

    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/riders/stats`,
      {
        signal: controller.signal,
        cache: 'no-store'
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      // If endpoint doesn't exist (404), skip to fallback calculation
      if (response.status === 404)
        throw new Error('Stats endpoint not available');
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: StatsApiResponse = await response.json();

    if (!data.success)
      throw new Error('Stats API returned error');


    const { totalRiders, verificationStatus, userStatus } = data.data;

    // Calculate counts prioritizing account status over verification status
    const disabledCount = userStatus.INACTIVE + userStatus.SUSPENDED;
    const verifiedCount = verificationStatus.VERIFIED;
    
    // Active verified riders = all verified minus disabled ones
    const activeVerifiedCount = Math.max(0, verifiedCount - disabledCount);
    
    // Map API response to our interface, prioritizing account status
    return {
      total: totalRiders,
      approved: activeVerifiedCount,
      pending: verificationStatus.PROFILE_INCOMPLETE + verificationStatus.DOCUMENTS_PENDING + verificationStatus.UNDER_REVIEW,
      rejected: verificationStatus.REJECTED,
      disabled: disabledCount
    };
  } catch (error) {
    // If stats endpoint doesn't exist, calculate from all riders
    return calculateStatsFromRiders();
  }
}

// Fallback: Calculate stats by fetching all riders
async function calculateStatsFromRiders(): Promise<RidersCount> {
  try {
    const result = await fetchRidersData({ tab: 'ALL', limit: 1000 });
    const allRiders = result.riders;

    // Count based on the verification status display values
    return {
      total: allRiders.length,
      pending: allRiders.filter(r => 
        r.status === 'PENDING' || 
        r.status === 'PROFILE_INCOMPLETE' || 
        r.status === 'DOCUMENTS_PENDING' || 
        r.status === 'UNDER_REVIEW'
      ).length,
      approved: allRiders.filter(r => r.status === 'APPROVED').length,
      rejected: allRiders.filter(r => r.status === 'REJECTED').length,
      disabled: allRiders.filter(r => r.status === 'DISABLED').length
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
export async function fetchRiderStatsOnly(): Promise<RidersCount> {
  return fetchRiderStats();
}

// Main fetch function with stats
export async function fetchRiders(params: FetchRidersParams = {}): Promise<FetchRidersResult> {
  try {
    // Always fetch riders first for faster UI response
    const result = await fetchRidersData(params);

    // Only fetch stats if explicitly requested or if it's the initial load without search
    if (params?.includeStats !== false && (!params?.search || params?.search === ''))
      try {
        const stats = await fetchRiderStats();
        return {
          riders: result.riders,
          counts: stats,
          totalPages: result.totalPages,
          currentPage: result.currentPage
        };
      } catch (statsError) {
        console.error('Stats fetch failed, returning riders only:', statsError);
        return result;
      }


    return result;
  } catch (error) {
    console.error('Error fetching riders:', error);

    return {
      riders: [],
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

// Fetch riders data from API
async function fetchRidersData(params: FetchRidersParams = {}): Promise<{ riders: Rider[], totalPages: number, currentPage: number }> {
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
  
  // Only add filter if not ALL
  if (tab !== 'ALL')
    searchParams.append('filter', mapFilterToApi(tab));

  if (search)
    searchParams.append('search', search);

  console.log('Fetching riders with params:', {
    tab,
    filter: tab !== 'ALL' ? mapFilterToApi(tab) : 'none',
    page,
    limit,
    search,
    fullUrl: `${API_BASE_URL}/admin/riders}`
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/riders?${searchParams.toString()}`,
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

    // Log the API response for debugging
    console.log('API Response - Get All Riders:', {
      url: `${API_BASE_URL}/admin/riders?${searchParams.toString()}`,
      params,
      totalRiders: data.data.riders.length,
      pagination: data.data.pagination,
      ridersData: data.data.riders.map(r => ({
        id: r.id,
        name: r.name,
        status: r.status,
        verificationStatus: r.verification.status,
        mappedStatus: mapApiStatus(r)
      }))
    });

    // Transform API data to match our component interface
    const riders: Rider[] = data.data.riders.map((apiRider) => ({
      id: apiRider.id,
      riderName: apiRider.name || `${apiRider.firstName} ${apiRider.lastName}`.trim() || 'Pending Setup',
      riderId: `#${apiRider.id.slice(-4)}`,
      phoneNumber: apiRider.phone,
      email: apiRider.email,
      address: 'Not provided', // Address not provided in API response
      status: mapApiStatus(apiRider), // Show account status first, then verification status
      verificationStatus: apiRider.verification.status,
      registrationDate: new Date(apiRider.registrationDate),
      vehicleType: apiRider.vehicleInfo.type || 'Not specified',
      licenseNumber: apiRider.vehicleInfo.plateNumber || 'Not provided'
    }));

    return {
      riders,
      totalPages: data.data.pagination?.totalPages || 1,
      currentPage: data.data.pagination?.currentPage || params.page || 1
    };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function fetchRiderDetails(id: string): Promise<ApiRider> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/riders/${id}/details`,
      {
        cache: 'no-store',
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok)
      throw new Error(`HTTP error! status: ${response.status}`);


    const data: RiderDetailsResponse = await response.json();

    if (!data.success)
      throw new Error('API returned error');


    return data.data;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Error fetching rider details:', error);
    throw new Error('Rider not found');
  }
}

// Define standard API response type
interface StandardApiResponse {
  success: boolean;
  message: string;
}

export async function updateRiderStatus(id: string, status: string): Promise<StandardApiResponse> {
  try {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/riders/${id}/status`,
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
    console.error('Error updating rider status:', error);
    throw new Error('Failed to update status');
  }
}

export async function deleteRider(id: string): Promise<StandardApiResponse> {
  try {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/riders/${id}`,
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


    return { success: true, message: 'Rider deleted successfully' };
  } catch (error) {
    console.error('Error deleting rider:', error);
    throw new Error('Failed to delete rider');
  }
}

// Approve rider
export async function approveRider(id: string): Promise<StandardApiResponse> {
  try {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/riders/${id}/approve`,
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


    return { success: true, message: 'Rider approved successfully' };
  } catch (error) {
    console.error('Error approving rider:', error);
    throw new Error('Failed to approve rider');
  }
}

// Reject rider
export async function rejectRider(id: string, reason: string): Promise<StandardApiResponse> {
  try {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/riders/${id}/reject`,
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


    return { success: true, message: 'Rider rejected successfully' };
  } catch (error) {
    console.error('Error rejecting rider:', error);
    throw new Error('Failed to reject rider');
  }
}

// Disable rider
export async function disableRider(id: string, reason?: string): Promise<StandardApiResponse> {
  try {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/riders/${id}/disable`,
      {
        method: 'PUT',
        body: JSON.stringify({
          reason: reason || 'Disabled by admin'
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
      message: 'Rider disabled successfully'
    };
  } catch (error) {
    console.error('Error disabling rider:', error);
    throw new Error('Failed to disable rider');
  }
}

// Enable rider
export async function enableRider(id: string): Promise<StandardApiResponse> {
  try {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/riders/${id}/enable`,
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

    return {
      success: true,
      message: 'Rider enabled successfully'
    };
  } catch (error) {
    console.error('Error enabling rider:', error);
    throw new Error('Failed to enable rider');
  }
}

// Rider detail interfaces
interface RiderDetailsResponse {
  success: boolean;
  data: ApiRider;
}

interface RiderMetricsResponse {
  success: boolean;
  data: {
    averageDeliveryTime: string;
    totalDeliveries: number;
    distanceCovered: string;
    totalRevenue: number;
    tipsEarned: number;
    customerRating: number;
  };
}

export interface RiderRevenueData {
  date: string;
  revenue: number;
}

interface RiderRevenueResponse {
  success: boolean;
  data: {
    timeSeries: RiderRevenueData[];
    summary: {
      totalRevenue: number;
      growthRate: number;
    };
  };
}

// Fetch rider metrics
export async function fetchRiderMetrics(id: string): Promise<RiderMetricsResponse['data']> {
  try {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/riders/${id}/metrics`,
      {
        cache: 'no-store'
      }
    );

    if (!response.ok)
      throw new Error(`HTTP error! status: ${response.status}`);

    const data: RiderMetricsResponse = await response.json();

    if (!data.success)
      throw new Error('API returned error');

    return data.data;
  } catch (error) {
    console.error('Error fetching rider metrics:', error);
    throw new Error('Failed to fetch rider metrics');
  }
}

// Fetch rider revenue overview
export async function fetchRiderRevenueOverview(id: string): Promise<RiderRevenueResponse['data']> {
  try {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/riders/${id}/revenue-overview?period=monthly`,
      {
        cache: 'no-store'
      }
    );

    if (!response.ok)
      throw new Error(`HTTP error! status: ${response.status}`);

    const data: RiderRevenueResponse = await response.json();

    if (!data.success)
      throw new Error('API returned error');

    return data.data;
  } catch (error) {
    console.error('Error fetching rider revenue data:', error);
    throw new Error('Failed to fetch rider revenue data');
  }
}