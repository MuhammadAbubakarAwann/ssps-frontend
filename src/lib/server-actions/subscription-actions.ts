'use server';

import { 
  CreateSubscriptionPlanInput, 
  UpdateSubscriptionPlanInput, 
  SubscriptionPlan 
} from '@/types';
import { requireAdmin, refreshAccessToken } from '@/lib/auth-service';
import { revalidatePath } from 'next/cache';

const API_BASE_URL = process.env.BACKEND_API_URL || 'https://api.domlii.com/api/v1';

// API Response interfaces
interface SubscriptionPlanApiResponse {
  success: boolean;
  data: SubscriptionPlan;
}

interface SubscriptionPlansApiResponse {
  success: boolean;
  data: {
    plans: SubscriptionPlan[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
    };
  };
}

interface StandardApiResponse {
  success: boolean;
  message: string;
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

export async function getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/subscription-plans`,
      {
        cache: 'no-store'
      }
    );

    if (!response.ok)
      throw new Error(`HTTP error! status: ${response.status}`);

    const data: SubscriptionPlansApiResponse = await response.json();

    if (!data.success)
      throw new Error('API returned error');

    return data.data.plans || [];
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    throw new Error('Failed to fetch subscription plans');
  }
}

export async function createSubscriptionPlan(
  data: CreateSubscriptionPlanInput
): Promise<SubscriptionPlan> {
  try {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/subscription-plans`,
      {
        method: 'POST',
        body: JSON.stringify({
          name: data.name,
          price: typeof data.price === 'string' ? parseFloat(data.price) || 0 : data.price,
          mealsIncluded: data.mealsIncluded,
          features: data.features,
          isActive: data.isActive,
          isMostPopular: data.isMostPopular
        }),
        cache: 'no-store'
      }
    );

    if (!response.ok)
      throw new Error(`HTTP error! status: ${response.status}`);

    const result: SubscriptionPlanApiResponse = await response.json();

    if (!result.success)
      throw new Error('API returned error');

    revalidatePath('/subscription-management');
    return result.data;
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    throw new Error('Failed to create subscription plan');
  }
}

export async function updateSubscriptionPlan(
  data: UpdateSubscriptionPlanInput
): Promise<SubscriptionPlan> {
  try {
    const { id, ...updateData } = data;

    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/subscription-plans/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          name: updateData.name,
          price: typeof updateData.price === 'string' ? parseFloat(updateData.price) || 0 : updateData.price,
          mealsIncluded: updateData.mealsIncluded,
          features: updateData.features,
          isActive: updateData.isActive,
          isMostPopular: updateData.isMostPopular
        }),
        cache: 'no-store'
      }
    );

    if (!response.ok)
      throw new Error(`HTTP error! status: ${response.status}`);

    const result: SubscriptionPlanApiResponse = await response.json();

    if (!result.success)
      throw new Error('API returned error');

    revalidatePath('/subscription-management');
    return result.data;
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    throw new Error('Failed to update subscription plan');
  }
}

export async function deleteSubscriptionPlan(id: string): Promise<void> {
  try {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/subscription-plans/${id}`,
      {
        method: 'DELETE',
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      if (response.status === 400) {
        // Handle case where plan has active subscriptions
        const errorResult: StandardApiResponse = await response.json();
        throw new Error(errorResult.message || 'Cannot delete plan with active subscriptions');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: StandardApiResponse = await response.json();

    if (!result.success)
      throw new Error('API returned error');

    revalidatePath('/subscription-management');
  } catch (error) {
    console.error('Error deleting subscription plan:', error);
    throw error; // Re-throw the specific error message
  }
}

export async function getSubscriptionPlan(id: string): Promise<SubscriptionPlan | null> {
  try {
    const response = await makeAuthenticatedRequest(
      `${API_BASE_URL}/admin/subscription-plans/${id}`,
      {
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      if (response.status === 404)
        return null;
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: SubscriptionPlanApiResponse = await response.json();

    if (!result.success)
      throw new Error('API returned error');

    return result.data;
  } catch (error) {
    console.error('Error fetching subscription plan:', error);
    throw new Error('Failed to fetch subscription plan');
  }
}