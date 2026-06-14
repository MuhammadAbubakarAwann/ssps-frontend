import { NextResponse } from 'next/server';
import { getSession, refreshAccessToken } from '@/lib/auth-service';

export const dynamic = 'force-dynamic';

const API_BASE_URL = process.env.BACKEND_API_URL || '';

function getEndpointCandidates(baseUrl: string): string[] {
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const endpoint = '/teacher/catalog/class-names';
  const teacherPath = endpoint.replace(/^\/teacher/, '');
  const baseCandidates = [
    normalizedBase.replace(/\/api\/v1\/teacher$/i, '/api/teacher'),
    normalizedBase.replace(/\/api\/v1$/i, '/api'),
    normalizedBase
  ];

  const candidates: string[] = [];
  for (const base of baseCandidates)
    if (/\/api\/teacher$/i.test(base))
      candidates.push(`${base}${teacherPath}`);
    else
      candidates.push(`${base}${endpoint}`);

  return [...new Set(candidates.filter(Boolean))];
}

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.accessToken)
      return NextResponse.json(
        { success: false, message: 'Unauthorized - no access token' },
        { status: 401 }
      );

    const endpoints = getEndpointCandidates(API_BASE_URL);
    let lastStatus = 502;
    let lastMessage = 'Failed to fetch class names';
    let activeToken = session.accessToken;
    let didRefreshToken = false;

    for (let i = 0; i < endpoints.length; i += 1) {
      const endpoint = endpoints[i];
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }

      lastStatus = response.status;
      lastMessage = `External API error: ${response.statusText}`;

      if ((response.status === 401 || response.status === 403) && !didRefreshToken) {
        const refreshedToken = await refreshAccessToken();

        if (refreshedToken) {
          activeToken = refreshedToken;
          didRefreshToken = true;
          i -= 1;
          continue;
        }
      }

      if (response.status !== 404 && response.status !== 405)
        return NextResponse.json(
          { success: false, message: lastMessage },
          { status: response.status }
        );
    }

    return NextResponse.json(
      { success: false, message: lastMessage },
      { status: lastStatus >= 400 ? lastStatus : 502 }
    );
  } catch (error) {
    console.error('Error fetching class names:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch class names' },
      { status: 500 }
    );
  }
}
