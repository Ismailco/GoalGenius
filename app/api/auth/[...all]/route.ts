import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export let runtime = "nodejs";
if (process.env.NODE_ENV === "production") {
  runtime = "edge";
}

export const { GET, POST } = toNextJsHandler(auth);
