import { NextResponse } from 'next/server';
import { getSession, refreshAccessToken } from '@/lib/auth-service';

const API_BASE_URL = process.env.BACKEND_API_URL || '';

function getEndpointCandidates(baseUrl: string): string[] {
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const endpoint = '/teacher/dashboard/metrics';
  const teacherPath = endpoint.replace(/^\/teacher/, '');
  const baseCandidates = [
    normalizedBase.replace(/\/api\/v1\/teacher$/i, '/api/teacher'),
    normalizedBase.replace(/\/api\/v1$/i, '/api'),
    normalizedBase
  ];

  const candidates: string[] = [];
  for (const base of baseCandidates) {
    if (/\/api\/teacher$/i.test(base))
      candidates.push(`${base}${teacherPath}`);
    else
      candidates.push(`${base}${endpoint}`);
  }

  return [...new Set(candidates.filter(Boolean))];
}

function safeJsonParse(raw: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object')
      return parsed as Record<string, unknown>;

    return null;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const session = await getSession();

    if (!session)
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const endpoints = getEndpointCandidates(API_BASE_URL);
    let lastStatus = 502;
    let lastMessage = 'Failed to fetch dashboard metrics';
    let activeToken = session.accessToken;
    let didRefreshToken = false;

    for (let i = 0; i < endpoints.length; i += 1) {
      const response = await fetch(endpoints[i], {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${activeToken}`,
          'Content-Type': 'application/json'
        }
      });

      const raw = await response.text();
      const data = safeJsonParse(raw);

      if (response.ok && data) {
        const nextResponse = NextResponse.json(data, { status: response.status });

        if (didRefreshToken && activeToken) {
          nextResponse.cookies.set('access_token', activeToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 2 * 60 * 60,
            path: '/'
          });
        }

        return nextResponse;
      }

      const parsedMessage = typeof data?.message === 'string' ? data.message : null;
      lastStatus = response.status;
      lastMessage = parsedMessage || raw?.slice(0, 200) || lastMessage;

      if ((response.status === 401 || response.status === 403) && !didRefreshToken) {
        const refreshedToken = await refreshAccessToken();

        if (refreshedToken) {
          activeToken = refreshedToken;
          didRefreshToken = true;
          i -= 1;
          continue;
        }
      }

      if (response.status === 401 || response.status === 403)
        break;
    }

    return NextResponse.json({ success: false, message: lastMessage }, { status: lastStatus >= 400 ? lastStatus : 502 });
  } catch (error) {
    console.error('Error fetching teacher dashboard metrics:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
