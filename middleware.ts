import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

export function middleware(request: NextRequest) {
  // Better-Auth provides a helper to check for session
  const sessionCookie = getSessionCookie(request);
  console.log('Cookie check for path:', request.nextUrl.pathname);
  console.log('Session cookie present:', !!sessionCookie);

  // If we have a session, allow access to protected routes
  if (sessionCookie) {
    console.log('User is authenticated');
    return NextResponse.next();
  }

  // No valid session, redirect to signin
  console.log('No session found, redirecting to signin');
  const signInUrl = new URL('/auth/signin', request.url);
  signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
  return NextResponse.redirect(signInUrl);
}

// Only apply middleware to protected routes
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/todos/:path*',
    '/notes/:path*',
    '/checkins/:path*'
  ],
};
