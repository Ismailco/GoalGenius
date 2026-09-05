import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";

export async function getAuthenticatedUserId(
  request: NextRequest,
): Promise<string | null> {
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user?.id ?? null;
}
