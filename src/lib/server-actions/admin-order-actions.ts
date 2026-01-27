'use server';

import { requireAdmin, refreshAccessToken } from '@/lib/auth-service';

interface OrderItem {
  mealName: string;
  category: string;
  quantity: number;
  price: number;
}

interface ApiOrder {
  orderId: string;
  orderStatus: string;
  restaurantName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  rider: string;
  riderEmail: string | null;
  riderPhone: string | null;
  totalPrice: number;
  subtotalAmount: number;
  tipAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  orderDate: string;
  deliveryAddress: string;
  specialInstructions: string;
  items: OrderItem[];
}

interface ApiResponse {
  success: boolean;
  data: ApiOrder[];
}

interface StatsApiResponse {
  success: boolean;
  data: {
    totalOrders: number;
    pendingOrders: number;
    deliveredOrders: number;
    totalRevenue: number;
  };
}

export interface Order {
  id: string;
  orderId: string;
  status: string;
  vendorName: string;
  customerName: string;
  courier: string;
  totalCost: string;
  paymentStatus: string;
}

const API_BASE_URL = process.env.BACKEND_API_URL || 'https://api.domlii.com/api/v1';

async function getAuthHeaders() {
  const session = await requireAdmin();
  
  return {
    'Authorization': `Bearer ${session.accessToken}`,
    'Content-Type': 'application/json'
  };
}

async function makeAuthenticatedRequest(url: string, options: RequestInit = {}) {
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

async function fetchOrderStats(): Promise<{ total: number; pending: number; delivered: number; cancelled: number }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/orders/stats`,
      {
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) 
      throw new Error(`HTTP error! status: ${response.status}`);
    

    const data: StatsApiResponse = await response.json();

    if (!data.success) 
      throw new Error('Stats API returned error');
    

    return {
      total: data.data.totalOrders,
      pending: data.data.pendingOrders,
      delivered: data.data.deliveredOrders,
      cancelled: 0 // Not provided in API, defaulting to 0
    };
  } catch (error) {
    console.error('Error fetching order stats:', error);
    return {
      total: 0,
      pending: 0,
      delivered: 0,
      cancelled: 0
    };
  }
}

// Export stats function separately for components that only need counts
export async function fetchOrderStatsOnly(): Promise<{ total: number; pending: number; delivered: number; cancelled: number }> {
  return fetchOrderStats();
}

export async function fetchOrders(params?: {
  tab?: string;
  search?: string;
  page?: number;
  limit?: number;
  includeStats?: boolean;
}): Promise<{ orders: Order[]; counts?: { total: number; pending: number; delivered: number; cancelled: number } }> {
  try {
    // Always fetch orders first for faster UI response
    const orders = await fetchOrdersData(params);
    
    // Only fetch stats if explicitly requested or if it's the initial load without search
    if (params?.includeStats !== false && (!params?.search || params?.search === '')) 
      try {
        const stats = await fetchOrderStats();
        return { orders, counts: stats };
      } catch (statsError) {
        console.error('Stats fetch failed, returning orders only:', statsError);
        return { orders }; // Return orders even if stats fail
      }
    
    
    return { orders };
  } catch (error) {
    console.error('Error fetching orders:', error);
    
    // Return empty data on error
    return {
      orders: [],
      counts: {
        total: 0,
        pending: 0,
        delivered: 0,
        cancelled: 0
      }
    };
  }
}

async function fetchOrdersData(params?: {
  tab?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<Order[]> {
  // Build query parameters
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.search) searchParams.append('search', params.search);
  // Use the provided limit or default to 20
  const limit = params?.limit || 10;
  searchParams.append('limit', limit.toString());
  if (params?.tab && params.tab !== 'ALL') searchParams.append('tab', params.tab.toLowerCase());

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/orders?${searchParams.toString()}`,
      {
        cache: 'no-store', // Always fetch fresh data
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
    const orders: Order[] = data.data.map((apiOrder) => ({
      id: apiOrder.orderId,
      orderId: apiOrder.orderId,
      status: apiOrder.orderStatus,
      vendorName: apiOrder.restaurantName,
      customerName: apiOrder.customerName,
      courier: apiOrder.rider || '-',
      totalCost: `$${apiOrder.totalPrice.toFixed(2)}`,
      paymentStatus: apiOrder.paymentStatus
    }));

    return orders;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Interface for detailed order data
export interface OrderDetailsResponse {
  success: boolean;
  data: {
    id: string;
    customerId: string;
    restaurantId: string;
    riderId: string;
    totalAmount: number;
    subtotalAmount: number;
    tipAmount: number;
    tipPercentage: number;
    tipType: string;
    riderEarning: number;
    restaurantEarning: number;
    earningsCalculatedAt: string;
    deliveryAddress: string;
    deliveryLatitude: number;
    deliveryLongitude: number;
    customerAddressId?: string;
    status: string;
    orderDate: string;
    specialInstructions?: string;
    paymentStatus: string;
    paymentMethod: string;
    paymentIntentId: string;
    paidAt: string;
    deliveryVerificationCode: string;
    isDeliveryVerified: boolean;
    deliveryVerifiedAt?: string;
    isSubscriptionOrder: boolean;
    mealDeliveryId?: string;
    createdAt: string;
    updatedAt: string;
    customer: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
    restaurant: {
      id: string;
      businessName: string;
      businessEmail: string;
      contactNumber: string;
      address: string;
      city: string;
    };
    rider: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
    orderItems: Array<{
      id: string;
      orderId: string;
      mealId: string;
      quantity: number;
      priceAtTimeOfOrder: number;
      notes?: string;
      createdAt: string;
      updatedAt: string;
      meal: {
        id: string;
        name: string;
        description: string;
        category: string;
        imageUrls: string[];
      };
    }>;
    customerAddress?: any;
    orderTracking?: {
      id: string;
      orderId: string;
      estimatedDeliveryTime?: string;
      actualPickupTime?: string;
      actualDeliveryTime?: string;
      totalDistance?: number;
      totalDuration?: number;
      currentStatus: string;
      createdAt: string;
      updatedAt: string;
    };
  };
}

// Fetch detailed order information by ID
export async function fetchOrderDetails(orderId: string): Promise<OrderDetailsResponse['data'] | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/orders/${orderId}`,
      {
        cache: 'no-store', // Always fetch fresh data
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) 
      throw new Error(`HTTP error! status: ${response.status}`);
    

    const data: OrderDetailsResponse = await response.json();

    if (!data.success) 
      throw new Error('API returned error');
    

    return data.data;
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
  }
}