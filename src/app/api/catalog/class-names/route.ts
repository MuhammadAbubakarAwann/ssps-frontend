import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - no access token' },
        { status: 401 }
      );
    }

    const response = await fetch('http://localhost:5000/api/teacher/catalog/class-names', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: `External API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching class names:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch class names' },
      { status: 500 }
    );
  }
}
