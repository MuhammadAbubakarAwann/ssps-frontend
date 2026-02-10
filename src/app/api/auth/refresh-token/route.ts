import { NextResponse } from 'next/server';
import { refreshAccessToken } from '@/lib/auth-service';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const newToken = await refreshAccessToken();
    
    if (newToken) {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Refresh failed' }, { status: 401 });
    }
    
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}