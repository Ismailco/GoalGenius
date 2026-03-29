import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { env } from "better-auth";
import { getCookieCache } from "better-auth/cookies";

const publicRoutes = ["/auth/signin", "/auth/signup"];
const DEFAULT_AUTH_SECRET = "better-auth-secret-12345678901234567890";

function readEnv(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

const authSecret =
  readEnv("BETTER_AUTH_SECRET") ??
  env.BETTER_AUTH_SECRET ??
  readEnv("AUTH_SECRET") ??
  DEFAULT_AUTH_SECRET;

async function hasValidSession(request: NextRequest) {
  const session = await getCookieCache(request, {
    isSecure: request.nextUrl.protocol === "https:",
    secret: authSecret,
    strategy: "jwe",
  });

  return Boolean(session?.session && session?.user);
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  if (await hasValidSession(request)) {
    return NextResponse.next();
  }

  const signInUrl = new URL("/auth/signin", request.url);
  signInUrl.searchParams.set("callbackUrl", pathname);
  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: ["/((?!_next|static|favicon.ico|robots.txt|api/auth).*)"],
};
