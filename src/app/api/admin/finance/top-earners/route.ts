import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-service';

const API_BASE_URL = process.env.BACKEND_API_URL || 'https://api.domlii.com/api/v1';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type) {
      return NextResponse.json(
        { success: false, message: 'Type parameter is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/admin/finance/top-earners?type=${type}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: 'Failed to fetch top earners' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching top earners:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}