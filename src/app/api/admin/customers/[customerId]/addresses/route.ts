import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-service';

const API_BASE_URL = process.env.BACKEND_API_URL || 'https://api.domlii.com/api/v1';

export async function GET(
  request: Request,
  { params }: { params: { customerId: string } }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { customerId } = params;

    const response = await fetch(
      `${API_BASE_URL}/admin/customers/${customerId}/addresses`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch customer addresses' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Customer addresses API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}