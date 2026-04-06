import { NextRequest, NextResponse } from 'next/server';
import { LoginRequest, AuthResponse } from '@/lib/auth-types';
import { UserInfo } from '@/@types';

const API_BASE_URL = process.env.BACKEND_API_URL || 'https://api.domlii.com/api/v1';

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

export async function POST(request: NextRequest) {
  try {
    const credentials: LoginRequest = await request.json();

    const endpointCandidates = getAuthEndpointCandidates(API_BASE_URL, '/auth/login');
    let response: Response | null = null;

    for (const endpoint of endpointCandidates) {
      const currentResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      response = currentResponse;

      // Retry with next candidate only when this endpoint is not found.
      if (currentResponse.status !== 404) {
        break;
      }
    }

    if (!response) {
      return NextResponse.json({
        success: false,
        message: 'Authentication service is unreachable'
      }, { status: 502 });
    }

    const contentType = response.headers.get('content-type') || '';
    const responseText = await response.text();
    let data: AuthResponse | null = null;

    if (contentType.includes('application/json')) {
      try {
        data = JSON.parse(responseText) as AuthResponse;
      } catch (parseError) {
        console.error('Login response JSON parse error:', parseError);
      }
    }

    if (!data) {
      const message = response.ok
        ? 'Invalid response from authentication service'
        : `Authentication service error (${response.status})`;

      return NextResponse.json({
        success: false,
        message,
        details: responseText.slice(0, 200)
      }, { status: response.status >= 400 ? response.status : 502 });
    }

    if (data.success && data.data?.accessToken) {
      // Map backend user to UserInfo format
      const userInfo: UserInfo = {
        id: data.data.user.id,
        name: `${data.data.user.firstName || ''} ${data.data.user.lastName || ''}`.trim() || null,
        email: data.data.user.email,
        role: data.data.user.role as any,
        image: null
      };

      const nextResponse = NextResponse.json(data);

      // Set access token (expires in 2 hours)
      nextResponse.cookies.set('access_token', data.data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 2 * 60 * 60, // 2 hours
        path: '/'
      });

      // Set refresh token (expires in 7 days)
      nextResponse.cookies.set('refresh_token', data.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      });

      // Store user data
      nextResponse.cookies.set('user_data', JSON.stringify(userInfo), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      });

      return nextResponse;
    }

    return NextResponse.json(data, { status: response.status >= 400 ? response.status : 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Network error occurred'
    }, { status: 500 });
  }
}