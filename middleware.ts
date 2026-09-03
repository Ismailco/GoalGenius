import { getSessionCookie } from "better-auth/cookies";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Optimistic auth gate only.
 * Better Auth recommends checking for the session cookie here and validating
 * the real session in route handlers / server components (API routes already do).
 * @see https://www.better-auth.com/docs/integrations/next#auth-protection
 */
export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (sessionCookie) {
    return NextResponse.next();
  }

  const signInUrl = new URL("/auth/signin", request.url);
  signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: [
    "/",
    "/analytics/:path*",
    "/calendar/:path*",
    "/checkins/:path*",
    "/dashboard/:path*",
    "/docs/:path*",
    "/goals/:path*",
    "/milestones/:path*",
    "/notes/:path*",
    "/settings/:path*",
    "/todos/:path*",
  ],
};
