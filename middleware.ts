import { symmetricDecodeJWT } from "better-auth/crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface CookieCachedSession {
  session?: {
    expiresAt?: string | number | Date;
  };
  user?: Record<string, unknown>;
}

function getCookieValue(cookieHeader: string, name: string) {
  const cookies = new Map<string, string>();

  for (const entry of cookieHeader.split(';')) {
    const separatorIndex = entry.indexOf('=');
    if (separatorIndex === -1) continue;

    const cookieName = entry.slice(0, separatorIndex).trim();
    const value = entry.slice(separatorIndex + 1).trim();
    if (cookieName) {
      cookies.set(cookieName, value);
    }
  }

  const cookieValue = cookies.get(name);
  if (cookieValue) return cookieValue;

  const chunks = [...cookies.entries()]
    .filter(([cookieName]) => cookieName.startsWith(`${name}.`))
    .map(([cookieName, value]) => ({
      index: Number.parseInt(cookieName.slice(name.length + 1), 10),
      value,
    }))
    .filter((chunk) => Number.isInteger(chunk.index))
    .sort((left, right) => left.index - right.index);

  return chunks.length > 0 ? chunks.map((chunk) => chunk.value).join('') : null;
}

async function hasValidCachedSession(request: NextRequest) {
  try {
    const cookieName = request.nextUrl.protocol === 'https:'
      ? '__Secure-better-auth.session_data'
      : 'better-auth.session_data';
    const cachedSession = getCookieValue(
      request.headers.get('cookie') ?? '',
      cookieName,
    );
    const authSecret = process.env.BETTER_AUTH_SECRET?.trim();

    if (!cachedSession || !authSecret) {
      return false;
    }

    const payload = await symmetricDecodeJWT<CookieCachedSession>(
      cachedSession,
      authSecret,
      'better-auth-session',
    );
    const expiresAt = payload?.session?.expiresAt;

    return Boolean(
      payload?.session &&
        payload.user &&
        (!expiresAt || new Date(expiresAt).getTime() >= Date.now()),
    );
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
