import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const allowedDashboardRoles = ['ADMIN', 'TEACHER', 'STUDENT'];

  // Temporarily disable self-registration route without removing page files.
  if (pathname.startsWith('/register')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/auth/error', '/unauthorized'];
  
  // Check if the current path is public
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Get cookies from request
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;
  const userData = request.cookies.get('user_data')?.value;

  // If no authentication cookies, redirect to login
  if (!accessToken || !refreshToken || !userData) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Parse user data to check role
    const user = JSON.parse(userData);

    // Ensure only supported dashboard roles can access protected pages.
    if (!allowedDashboardRoles.includes(user.role)) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error parsing user data:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
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