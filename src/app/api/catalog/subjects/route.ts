import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - no access token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const programCode = searchParams.get('programCode');
    const semesterNumber = searchParams.get('semesterNumber');

    if (!programCode || !semesterNumber) {
      return NextResponse.json(
        { success: false, message: 'Missing required parameters: programCode and semesterNumber' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `http://localhost:5000/api/teacher/catalog/subjects?programCode=${programCode}&semesterNumber=${semesterNumber}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`
        }
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: `External API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch subjects' },
      { status: 500 }
    );
  }
}
