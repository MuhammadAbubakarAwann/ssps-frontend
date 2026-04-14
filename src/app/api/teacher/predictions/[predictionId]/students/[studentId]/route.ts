import { NextRequest, NextResponse } from 'next/server';
import { getSession, refreshAccessToken } from '@/lib/auth-service';

const API_BASE_URL = process.env.BACKEND_API_URL || '';

interface PredictionHistoryItem {
  id?: string;
  reportCode?: string;
  report_code?: string;
}

function getEndpointCandidates(baseUrl: string, predictionId: string, studentId: string): string[] {
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const endpoint = `/teacher/predictions/${predictionId}/students/${studentId}`;
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

async function resolvePredictionId(activeToken: string, predictionId: string): Promise<string | null> {
  const normalizedId = predictionId.trim();

  if (!normalizedId)
    return null;

  const historyEndpoints = [
    `${API_BASE_URL.replace(/\/+$/, '')}/teacher/predictions/history?scope=CLASS`,
    `${API_BASE_URL.replace(/\/+$/, '')}/api/teacher/predictions/history?scope=CLASS`
  ];

  for (const endpoint of historyEndpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${activeToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok)
        continue;

      const raw = await response.text();
      const data = safeJsonParse(raw);
      const predictions = (data as { data?: { predictions?: PredictionHistoryItem[] } } | null)?.data?.predictions || [];

      const matched = predictions.find((item) => {
        const itemId = String(item.id || '').trim();
        const itemReportCode = String(item.reportCode || item.report_code || '').trim();
        return itemId === normalizedId || itemReportCode === normalizedId;
      });

      if (matched?.id)
        return String(matched.id).trim();
    } catch {
      // ignore and try next endpoint
    }
  }

  return null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ predictionId: string; studentId: string }> }
) {
  try {
    const session = await getSession();

    if (!session)
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );

    const { predictionId, studentId } = await params;

    if (!predictionId)
      return NextResponse.json(
        { success: false, message: 'Prediction id is required' },
        { status: 400 }
      );

    if (!studentId)
      return NextResponse.json(
        { success: false, message: 'Student id is required' },
        { status: 400 }
      );

    const endpoints = getEndpointCandidates(API_BASE_URL, predictionId, studentId);
    let lastStatus = 502;
    let lastMessage = 'Failed to fetch prediction comparison details';
    let activeToken = session.accessToken;
    let didRefreshToken = false;
    let effectivePredictionId = predictionId;

    const maybeResolvedPredictionId = await resolvePredictionId(activeToken, predictionId);
    if (maybeResolvedPredictionId)
      effectivePredictionId = maybeResolvedPredictionId;

    for (let i = 0; i < endpoints.length; i += 1) {
      const endpoint = endpoints[i].replace(`/predictions/${predictionId}/`, `/predictions/${effectivePredictionId}/`);
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${activeToken}`,
          'Content-Type': 'application/json'
        }
      });

      const raw = await response.text();
      const data = safeJsonParse(raw);

      if (response.ok && data) {
        console.log('[teacher prediction comparison]', JSON.stringify({
          requestedPredictionId: predictionId,
          effectivePredictionId,
          studentId,
          endpoint,
          response: data
        }, null, 2));

        const nextResponse = NextResponse.json(data, { status: response.status });

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
  } catch (error) {
    console.error('Error fetching teacher prediction comparison details:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
