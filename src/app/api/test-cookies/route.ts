import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const cookies = {
    access_token: request.cookies.get('access_token')?.value || 'Not found',
    refresh_token: request.cookies.get('refresh_token')?.value || 'Not found',
    user_data: request.cookies.get('user_data')?.value || 'Not found'
  };

  return NextResponse.json({
    message: 'Cookie test',
    cookies,
    headers: Object.fromEntries(request.headers.entries())
  });
}