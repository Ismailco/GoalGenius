import { env } from "better-auth";
import { getCookieCache } from "better-auth/cookies";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function readEnv(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

const authSecret =
  readEnv("BETTER_AUTH_SECRET") ??
  env.BETTER_AUTH_SECRET ??
  readEnv("AUTH_SECRET");

async function hasValidSession(request: NextRequest) {
  if (!authSecret) {
    return false;
  }

  const session = await getCookieCache(request, {
    isSecure: request.nextUrl.protocol === "https:",
    secret: authSecret,
    strategy: "jwe",
  });

  return Boolean(session?.session && session?.user);
}

export async function middleware(request: NextRequest) {
  if (await hasValidSession(request)) {
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
