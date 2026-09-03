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

function requestIsHttps(request: NextRequest) {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto) {
    return forwardedProto.split(",")[0]?.trim() === "https";
  }

  return request.nextUrl.protocol === "https:";
}

async function readSessionFromCookieCache(
  request: NextRequest,
  isSecure: boolean,
) {
  return getCookieCache(request, {
    isSecure,
    secret: authSecret,
    strategy: "jwe",
  });
}

async function hasValidSession(request: NextRequest) {
  if (!authSecret) {
    return false;
  }

  try {
    const httpsRequest = requestIsHttps(request);

    for (const isSecure of [httpsRequest, !httpsRequest]) {
      const session = await readSessionFromCookieCache(request, isSecure);
      if (session?.session && session?.user) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
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
