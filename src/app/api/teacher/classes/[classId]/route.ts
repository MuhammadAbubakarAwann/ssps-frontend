import { NextRequest, NextResponse } from 'next/server';
import { getSession, refreshAccessToken } from '@/lib/auth-service';

const API_BASE_URL = process.env.BACKEND_API_URL || '';

function getEndpointCandidates(baseUrl: string, classId: string): string[] {
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const endpoint = `/teacher/classes/${classId}`;
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

async function proxyClassRequest(
  classId: string,
  method: 'GET' | 'DELETE'
): Promise<NextResponse> {
  const session = await getSession();

  if (!session)
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );

  if (!classId)
    return NextResponse.json(
      { success: false, message: 'Class id is required' },
      { status: 400 }
    );

  const endpoints = getEndpointCandidates(API_BASE_URL, classId);
  let lastStatus = 502;
  const fallbackMessage = method === 'DELETE'
    ? 'Failed to delete class'
    : 'Failed to fetch class details';
  let lastMessage = fallbackMessage;
  let activeToken = session.accessToken;
  let didRefreshToken = false;

  for (let i = 0; i < endpoints.length; i += 1) {
    const endpoint = endpoints[i];
    const response = await fetch(endpoint, {
      method,
      headers: {
        Authorization: `Bearer ${activeToken}`,
        'Content-Type': 'application/json'
      }
    });

    const raw = await response.text();
    const data = safeJsonParse(raw);

    if (response.ok) {
      const payload = data || {
        success: true,
        message: method === 'DELETE'
          ? 'Class deleted successfully'
          : 'Request successful'
      };
      const nextResponse = NextResponse.json(payload);

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

    if (response.status === 401 || response.status === 403)
      break;
  }

  return NextResponse.json(
    {
      success: false,
      message: lastMessage
    },
    { status: lastStatus >= 400 ? lastStatus : 502 }
  );
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    return await proxyClassRequest(classId, 'GET');
  } catch (error) {
    console.error('Error fetching teacher class details:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    return await proxyClassRequest(classId, 'DELETE');
  } catch (error) {
    console.error('Error deleting teacher class:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}