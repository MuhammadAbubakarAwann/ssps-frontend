import { NextRequest, NextResponse } from 'next/server';
import { getSession, refreshAccessToken } from '@/lib/auth-service';

const API_BASE_URL = process.env.BACKEND_API_URL
  || (process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000/api'
    : 'https://api.domlii.com/api');

function getEndpointCandidates(baseUrl: string): string[] {
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const localBase = 'http://localhost:5000/api';

  const endpoints = [
    '/teacher/new-class-with-students',
    '/teacher/new-class-with-student',
    '/teacher/class-with-students',
    '/teacher/create-class-with-students'
  ];

  const normalizedCandidates = [
    normalizedBase.replace(/\/api\/v1\/teacher$/i, '/api/teacher'),
    normalizedBase.replace(/\/api\/v1$/i, '/api'),
    normalizedBase
  ];

  const localCandidates = [
    localBase,
    localBase.replace(/\/api$/i, '/api/teacher')
  ];

  const baseCandidates = process.env.NODE_ENV === 'development'
    ? [...localCandidates, ...normalizedCandidates]
    : [...normalizedCandidates, ...localCandidates];

  const candidates = endpoints.flatMap((endpoint) => {
    const teacherPath = endpoint.replace(/^\/teacher/, '');

    return baseCandidates.map((base) => {
      if (/\/api\/teacher$/i.test(base))
        return `${base}${teacherPath}`;

      return `${base}${endpoint}`;
    });
  });

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

async function parseResponse(response: Response) {
  const raw = await response.text();
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? safeJsonParse(raw)
    : safeJsonParse(raw);

  return { data, raw };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session)
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );

    const body = await request.json();
    const endpoints = getEndpointCandidates(API_BASE_URL);
    let lastStatus = 502;
    let lastMessage = 'Failed to create class with students';
    let activeToken = session.accessToken;
    let didRefreshToken = false;

    for (let i = 0; i < endpoints.length; i += 1) {
      const endpoint = endpoints[i];
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${activeToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const { data, raw } = await parseResponse(response);

      if (response.ok && data) {
        const nextResponse = NextResponse.json(data);

        if (didRefreshToken && activeToken)
          nextResponse.cookies.set('access_token', activeToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 2 * 60 * 60,
            path: '/'
          });

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

      // Do not mask real backend failures (e.g., 400 validation, 401 auth) with later endpoint 404s.
      // Only continue probing aliases when endpoint is not found/method-not-allowed.
      if (response.status !== 404 && response.status !== 405) {
        return NextResponse.json(
          {
            success: false,
            message: lastMessage
          },
          { status: response.status }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: lastMessage
      },
      { status: lastStatus >= 400 ? lastStatus : 502 }
    );
  } catch (error) {
    console.error('Error creating class with students:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
