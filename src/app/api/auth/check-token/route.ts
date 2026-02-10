import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Get cookies from the request headers
    const cookies = request.headers.get('cookie') || '';
    const cookieMap = new Map();
    
    cookies.split(';').forEach(cookie => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) {
        cookieMap.set(key, value);
      }
    });

    const accessToken = cookieMap.get('access_token');
    const refreshToken = cookieMap.get('refresh_token');
    const userData = cookieMap.get('user_data');
    
    if (!accessToken || !refreshToken || !userData) {
      return NextResponse.json({ error: 'No session' }, { status: 401 });
    }

    return NextResponse.json({ status: 'valid' }, { status: 200 });
    
  } catch (error) {
    console.error('Token check error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}