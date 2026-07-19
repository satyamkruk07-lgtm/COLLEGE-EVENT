import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const userRole = request.cookies.get('user_role')?.value;
  
  // 1. Prevent logged-in users from accessing the homepage (/) and login page (/login)
  if (path === '/' || path === '/login') {
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin-dashboard', request.url));
    } else if (userRole) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  const isProtectedRoute = path.startsWith('/dashboard') || path.startsWith('/admin-dashboard');
  
  if (isProtectedRoute) {
    // Redirect unauthenticated users to login
    if (!userRole) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Redirect students trying to access admin dashboard back to their portal
    if (path.startsWith('/admin-dashboard') && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/',
    '/login',
    '/dashboard/:path*', 
    '/admin-dashboard/:path*'
  ],
};
