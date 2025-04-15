import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/auth/login', '/auth/register'];

const protectedRoutes = [
  '/dashboard',
  '/exercises',
  '/exercises/submissions',
  '/exercises/analytics'
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAuthenticated = request.cookies.has('auth');

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route));
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));

  // If user is not authenticated and trying to access a protected route
  if (!isAuthenticated && isProtectedRoute) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // If user is authenticated and trying to access auth routes
  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // For authenticated users trying to access the root path
  if (isAuthenticated && path === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // For unauthenticated users trying to access the root path
  if (!isAuthenticated && path === '/') {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};

