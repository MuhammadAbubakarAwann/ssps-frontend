import { UserInfo } from '@/@types';
import { cookies } from 'next/headers';

interface RefreshTokenResponse {
  success: boolean;
  data?: {
    accessToken: string;
  };
}

function getAuthEndpointCandidates(baseUrl: string, endpoint: string): string[] {
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const candidates = [`${normalizedBase}${endpoint}`];

  if (normalizedBase.endsWith('/api')) {
    candidates.push(`${normalizedBase}/v1${endpoint}`);
  }

  if (normalizedBase.endsWith('/api/v1')) {
    candidates.push(`${normalizedBase.replace(/\/api\/v1$/, '/api')}${endpoint}`);
  }

  return [...new Set(candidates)];
}

// Server-side functions only (for server components and server actions)
export async function getSession(): Promise<{ user: UserInfo; accessToken: string; refreshToken: string } | null> {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    const refreshToken = cookieStore.get('refresh_token')?.value;
    const userData = cookieStore.get('user_data')?.value;

    if (!accessToken || !refreshToken || !userData) 
      return null;
    

    const user: UserInfo = JSON.parse(userData);

    return {
      user,
      accessToken,
      refreshToken
    };
  } catch (error) {
    console.error('Session error:', error);
    return null;
  }
}

export async function refreshAccessToken(): Promise<string | null> {
  try {
    const cookieStore = cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!refreshToken) {
      if (process.env.NODE_ENV === 'development') {
        console.debug('No refresh token available');
      }
      return null;
    }

    const API_BASE_URL = process.env.BACKEND_API_URL || 'https://api.domlii.com/api/v1';
    const endpointCandidates = getAuthEndpointCandidates(API_BASE_URL, '/auth/refresh');
    let response: Response | null = null;

    for (const endpoint of endpointCandidates) {
      const currentResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`
        }
      });

      response = currentResponse;

      if (currentResponse.status !== 404) {
        break;
      }
    }

    if (!response) {
      console.error('Token refresh failed: authentication service is unreachable');
      return null;
    }

    if (!response.ok) {
      console.error('Token refresh failed with status:', response.status);
      // Clear invalid tokens
      cookieStore.delete('access_token', { path: '/' });
      cookieStore.delete('refresh_token', { path: '/' });
      cookieStore.delete('user_data', { path: '/' });
      return null;
    }

    const data: RefreshTokenResponse = await response.json();

    if (data.success && data.data?.accessToken) {
      // Update access token cookie
      cookieStore.set('access_token', data.data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 2 * 60 * 60, // 2 hours instead of 15 minutes
        path: '/'
      });

      return data.data.accessToken;
    }

    return null;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}

export async function requireAdmin(): Promise<{ user: UserInfo; accessToken: string; refreshToken: string }> {
  let session = await getSession();
  
  // If no session, try to refresh token
  if (!session) {
    const newToken = await refreshAccessToken();
    if (newToken) 
      session = await getSession();
    
  }

  if (!session) 
    throw new Error('Authentication required');
  

  if (session.user.role !== 'ADMIN') 
    throw new Error('Admin access required');
  

  return session;
}

// Clear all auth cookies
export async function clearAuthCookies(): Promise<void> {
  try {
    const cookieStore = cookies();
    
    // Clear auth cookies
    cookieStore.delete('access_token');
    cookieStore.delete('refresh_token');
    cookieStore.delete('user_data');
  } catch (error) {
    console.error('Error clearing auth cookies:', error);
  }
}