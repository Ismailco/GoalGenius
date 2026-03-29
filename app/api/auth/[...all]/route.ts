import { auth } from "@/lib/auth/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const runtime = "nodejs";

const handlers = toNextJsHandler(auth);

function withAuthErrorLogging(handler: typeof handlers.GET) {
  return async function authRouteHandler(request: Request) {
    try {
      return await handler(request);
    } catch (error) {
      console.error("[auth route] Auth handler failed", error);

      if (error instanceof Error && error.cause) {
        console.error("[auth route] Auth handler cause", error.cause);
      }

      throw error;
    }
  };
}

export const GET = withAuthErrorLogging(handlers.GET);
export const POST = withAuthErrorLogging(handlers.POST);
