import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-service';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/auth/error', '/api/auth'];
  
  // Check if the current path is public
  if (publicPaths.some(path => pathname.startsWith(path))) 
    return NextResponse.next();
  

  // Get session
  const session = await getSession();

  // If no session and trying to access protected route, redirect to login
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