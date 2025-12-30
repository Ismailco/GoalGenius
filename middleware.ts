import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

// Define public routes that don't require authentication
const publicRoutes = ['/auth/signin', '/auth/signup'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip auth check for public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Better-Auth provides a helper to check for session
  const sessionCookie = getSessionCookie(request);

  // If we have a session, allow access to protected routes
  if (sessionCookie) {
    return NextResponse.next();
  }

  // No valid session, redirect to signin
  const signInUrl = new URL('/auth/signin', request.url);
  signInUrl.searchParams.set('callbackUrl', pathname);
  return NextResponse.redirect(signInUrl);
}

// Apply middleware to all routes
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /_next (Next.js internals)
     * 2. /static (static files)
     * 3. /favicon.ico, /robots.txt (static files)
     * 4. /api/auth/* (auth API routes)
     */
    '/((?!_next|static|favicon.ico|robots.txt|api/auth).*)',
  ],
};
