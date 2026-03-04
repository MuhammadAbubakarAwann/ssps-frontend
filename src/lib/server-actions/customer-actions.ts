'use server';

import type { Customer } from '@/types/customer';
import { requireAdmin, refreshAccessToken } from '@/lib/auth-service';

const API_BASE_URL = process.env.BACKEND_API_URL || 'https://api.domlii.com/api/v1';

// Export interface types
export interface FetchCustomersParams {
  search?: string
  page?: number
  limit?: number
}

export interface FetchCustomersResult {
  customers: Customer[]
  totalPages: number
  currentPage: number
  totalCustomers: number
}

// API Response interfaces
interface ApiCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  registrationDate: string;
  totalOrders: number;
  totalSpendings: number;
  subscriptionPlan: 'basic' | 'standard' | 'premium' | null;
}

interface ApiResponse {
  success: boolean;
  data: {
    customers: ApiCustomer[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCustomers: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
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

// Main fetch function
export async function fetchCustomers(params: FetchCustomersParams = {}): Promise<FetchCustomersResult> {
  try {
    const result = await fetchCustomersData(params);
    return result;
  } catch (error) {
    console.error('Error fetching customers:', error);
    
    return {
      customers: [],
      totalPages: 1,
      currentPage: 1,
      totalCustomers: 0
    };
  }
}

// Fetch customers data from API
async function fetchCustomersData(params: FetchCustomersParams = {}): Promise<FetchCustomersResult> {
  const {
    search = '',
    page = 1,
    limit = 10
  } = params;

  // Build query parameters
  const searchParams = new URLSearchParams();
  searchParams.append('page', page.toString());
  searchParams.append('limit', limit.toString());
  
  if (search) 
    searchParams.append('search', search);

  console.log('Fetching customers with params:', {
    page,
    limit,
    search,
    fullUrl: `${API_BASE_URL}/admin/customers?${searchParams.toString()}`
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/customers?${searchParams.toString()}`,
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
    
    console.log('API Response - Get All Customers:', {
      url: `${API_BASE_URL}/admin/customers?${searchParams.toString()}`,
      params,
      totalCustomers: data.data.customers.length,
      pagination: data.data.pagination
    });

    // Transform API data to match our component interface
    const customers: Customer[] = data.data.customers.map((apiCustomer) => ({
      id: apiCustomer.id,
      name: apiCustomer.name,
      phone: apiCustomer.phone,
      email: apiCustomer.email,
      avatar: apiCustomer.avatar,
      registrationDate: new Date(apiCustomer.registrationDate),
      totalOrders: apiCustomer.totalOrders,
      totalSpendings: apiCustomer.totalSpendings,
      subscriptionPlan: apiCustomer.subscriptionPlan
    }));

    return {
      customers,
      totalPages: data.data.pagination.totalPages,
      currentPage: data.data.pagination.currentPage,
      totalCustomers: data.data.pagination.totalCustomers
    };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}