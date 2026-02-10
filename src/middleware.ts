import { NextRequest, NextResponse } from 'next/server';
import { getSession, refreshAccessToken } from '@/lib/auth-service';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/auth/error', '/api/auth'];
  
  // Check if the current path is public
  if (publicPaths.some(path => pathname.startsWith(path))) 
    return NextResponse.next();
  

  // Get session
  let session = await getSession();

  // If no session, try to refresh the token
  if (!session) 
    try {
      const newToken = await refreshAccessToken();
      if (newToken) 
        // Try to get session again after refresh
        session = await getSession();
      
    } catch (error) {
      console.error('Token refresh failed in middleware:', error);
    }
  

  // If still no session after refresh attempt, redirect to login
  if (!session) 
    return NextResponse.redirect(new URL('/login', request.url));
  

  // For admin routes, ensure user has admin role
  if (pathname.startsWith('/admin') || pathname.startsWith('/order-management') || pathname === '/') 
    if (session.user.role !== 'ADMIN') 
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    
  

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, icons, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)'
  ]
};