import { NextRequest, NextResponse } from 'next/server';
import { LoginRequest, AuthResponse } from '@/lib/auth-types';
import { UserInfo } from '@/@types';

const API_BASE_URL = process.env.BACKEND_API_URL || 'https://api.domlii.com/api/v1';

export async function POST(request: NextRequest) {
  try {
    const credentials: LoginRequest = await request.json();

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    const data: AuthResponse = await response.json();

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

    return NextResponse.json(data);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Network error occurred'
    }, { status: 500 });
  }
}