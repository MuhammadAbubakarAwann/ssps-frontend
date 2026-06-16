import { NextRequest, NextResponse } from 'next/server';
import { getSession, refreshAccessToken } from '@/lib/auth-service';

const API_BASE_URL = process.env.BACKEND_API_URL || '';

function getEndpoints(baseUrl: string): string[] {
  const base = baseUrl.replace(/\/+$/, '');
  const candidates = [
    `${base}/auth/change-password`,
    base.endsWith('/api') ? `${base}/v1/auth/change-password` : null,
    base.endsWith('/api/v1') ? `${base.replace(/\/api\/v1$/, '/api')}/auth/change-password` : null
  ];
  return [...new Set(candidates.filter(Boolean))] as string[];
}

export const dynamic = 'force-dynamic';

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
        return NextResponse.json(data);
      }

      if ((res.status === 401 || res.status === 403) && !didRefresh) {
        const refreshed = await refreshAccessToken();
        if (refreshed) { activeToken = refreshed; didRefresh = true; i -= 1; continue; }
      }

      const errData: unknown = await res.json().catch(() => ({}));
      const msg = (errData as { message?: string }).message || res.statusText;
      return NextResponse.json({ success: false, message: msg }, { status: res.status });
    }

    return NextResponse.json({ success: false, message: 'Change-password endpoint not found' }, { status: 502 });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
