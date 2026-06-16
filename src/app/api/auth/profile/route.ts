import { NextRequest, NextResponse } from 'next/server';
import { getSession, refreshAccessToken } from '@/lib/auth-service';

const API_BASE_URL = process.env.BACKEND_API_URL || '';

function getEndpoints(baseUrl: string): string[] {
  const base = baseUrl.replace(/\/+$/, '');
  const candidates = [
    `${base}/auth/profile`,
    base.endsWith('/api') ? `${base}/v1/auth/profile` : null,
    base.endsWith('/api/v1') ? `${base.replace(/\/api\/v1$/, '/api')}/auth/profile` : null
  ];
  return [...new Set(candidates.filter(Boolean))] as string[];
}

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.accessToken)
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const endpoints = getEndpoints(API_BASE_URL);
    let activeToken = session.accessToken;
    let didRefresh = false;

    for (let i = 0; i < endpoints.length; i += 1) {
      const res = await fetch(endpoints[i], {
        method: 'GET',
        headers: { Authorization: `Bearer ${activeToken}`, 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        const data: unknown = await res.json();
        return NextResponse.json(data);
      }

      if ((res.status === 401 || res.status === 403) && !didRefresh) {
        const refreshed = await refreshAccessToken();
        if (refreshed) { activeToken = refreshed; didRefresh = true; i -= 1; continue; }
      }

      if (res.status !== 404 && res.status !== 405)
        return NextResponse.json({ success: false, message: `API error: ${res.statusText}` }, { status: res.status });
    }

    return NextResponse.json({ success: false, message: 'Profile endpoint not found' }, { status: 502 });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.accessToken)
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const body: unknown = await request.json();
    const endpoints = getEndpoints(API_BASE_URL);
    let activeToken = session.accessToken;
    let didRefresh = false;

    for (let i = 0; i < endpoints.length; i += 1) {
      const res = await fetch(endpoints[i], {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${activeToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        const data: unknown = await res.json();
        const nextRes = NextResponse.json(data);

        // Sync updated name into the user_data cookie so the sidebar reflects the change
        const payload = data as { data?: { firstName?: string; lastName?: string; name?: string } };
        const updatedName =
          payload.data?.name ||
          [payload.data?.firstName, payload.data?.lastName].filter(Boolean).join(' ') ||
          null;

        if (updatedName) {
          const { cookies } = await import('next/headers');
          const cookieStore = cookies();
          const raw = cookieStore.get('user_data')?.value;
          if (raw) {
            try {
              const userData = JSON.parse(raw) as Record<string, unknown>;
              userData.name = updatedName;
              nextRes.cookies.set('user_data', JSON.stringify(userData), {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60,
                path: '/'
              });
            } catch { /* ignore parse errors */ }
          }
        }

        return nextRes;
      }

      if ((res.status === 401 || res.status === 403) && !didRefresh) {
        const refreshed = await refreshAccessToken();
        if (refreshed) { activeToken = refreshed; didRefresh = true; i -= 1; continue; }
      }

      const errData: unknown = await res.json().catch(() => ({}));
      const msg = (errData as { message?: string }).message || res.statusText;
      return NextResponse.json({ success: false, message: msg }, { status: res.status });
    }

    return NextResponse.json({ success: false, message: 'Profile endpoint not found' }, { status: 502 });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
