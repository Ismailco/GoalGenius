import { getCookieCache } from "better-auth/cookies";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

async function hasValidCachedSession(request: NextRequest) {
  try {
    const cachedSession = await getCookieCache(request, {
      isSecure: request.nextUrl.protocol === "https:",
      strategy: "jwe",
    });

    return Boolean(cachedSession?.session && cachedSession.user);
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const hasSession = await hasValidCachedSession(request);

  if (hasSession) {
    return NextResponse.next();
  }

  const signInUrl = new URL("/auth/signin", request.url);
  signInUrl.searchParams.set(
    "callbackUrl",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
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
