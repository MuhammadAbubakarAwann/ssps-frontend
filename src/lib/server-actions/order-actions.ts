'use server';

import { requireAdmin, refreshAccessToken } from '@/lib/auth-service';
import { OrderFilterStatus, OrdersCount, OrderWithDetails } from '@/types/order';

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

export async function getOrders(
  status: OrderFilterStatus = 'ALL',
  search: string = ''
): Promise<OrderWithDetails[]> {
  try {
    const params = new URLSearchParams();
    if (status !== 'ALL') params.append('status', status);
    if (search) params.append('search', search);

    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/orders?${params.toString()}`,
      {
        method: 'GET',
        cache: 'no-store' // Always fetch fresh data for admin
      }
    );

    if (!response.ok) {
      if (response.status === 401) throw new Error('Unauthorized');
      if (response.status === 403) throw new Error('Forbidden');
      throw new Error(`Failed to fetch orders: ${response.status}`);
    }

    const data = await response.json();
    return (data.data?.orders || []) as OrderWithDetails[];
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

export async function getOrdersCount(): Promise<OrdersCount> {
  try {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/orders/count`,
      {
        method: 'GET',
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      if (response.status === 401) throw new Error('Unauthorized');
      if (response.status === 403) throw new Error('Forbidden');
      throw new Error(`Failed to fetch orders count: ${response.status}`);
    }

    const data = await response.json();
    const count = data.data?.count;
    if (count && typeof count === 'object' && 'all' in count && 'pending' in count && 'delivered' in count) 
      return count as OrdersCount;
    
    return { all: 0, pending: 0, delivered: 0, total: 0, cancelled: 0 };
  } catch (error) {
    console.error('Error fetching orders count:', error);
    return { all: 0, pending: 0, delivered: 0, total: 0, cancelled: 0 };
  }
}