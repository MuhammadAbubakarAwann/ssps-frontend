import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-service';

const API_BASE_URL = process.env.BACKEND_API_URL || 'https://api.domlii.com/api/v1';

export async function GET(
  request: NextRequest,
  { params }: { params: { customerId: string } }
) {
  try {
    // Check authentication
    const session = await getSession();

    if (!session) {
      console.error('❌ No session found');
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      console.error('❌ User is not admin:', session.user.role);
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period');

    if (!period || !['7', '30', '90'].includes(period)) {
      console.error('❌ Invalid period:', period);
      return NextResponse.json(
        { success: false, message: 'Invalid period. Must be 7, 30, or 90' },
        { status: 400 }
      );
    }

    const customerId = params.customerId;

    if (!customerId) {
      console.error('❌ No customer ID provided');
      return NextResponse.json(
        { success: false, message: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Make request to external API with Bearer token authentication
    const externalResponse = await fetch(
      `${API_BASE_URL}/admin/customers/${customerId}/spending-overview?period=${period}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Domlii-Dashboard/1.0'
        }
      }
    );


    if (!externalResponse.ok) 

      return NextResponse.json(
        {
          success: false,
          message: `External API error: ${externalResponse.status} ${externalResponse.statusText}`
        },
        { status: externalResponse.status }
      );
    

    const data = await externalResponse.json();

    // Return the data as-is from the external API
    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}