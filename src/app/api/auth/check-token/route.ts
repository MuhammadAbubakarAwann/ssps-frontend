import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    const refreshToken = cookieStore.get('refresh_token')?.value;
    const userData = cookieStore.get('user_data')?.value;

    if (!accessToken || !refreshToken || !userData)
      return NextResponse.json({ error: 'No session' }, { status: 401 });

    return NextResponse.json({ status: 'valid', accessToken }, { status: 200 });
  } catch (error) {
    console.error('Token check error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
