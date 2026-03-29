import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

const publicRoutes = ['/auth/signin', '/auth/signup'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);

  if (sessionCookie) {
    return NextResponse.next();
  }

  const signInUrl = new URL('/auth/signin', request.url);
  signInUrl.searchParams.set('callbackUrl', pathname);
  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: [
    '/((?!_next|static|favicon.ico|robots.txt|api/auth).*)',
  ],
};
