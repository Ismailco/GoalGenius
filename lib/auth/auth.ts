import { db } from "@/lib/db/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

const AUTH_BASE_PATH = "/api/auth";

function readEnv(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

const authBaseURL =
  readEnv("BETTER_AUTH_URL") ??
  readEnv("NEXT_PUBLIC_BETTER_AUTH_URL") ??
  readEnv("NEXT_PUBLIC_APP_URL") ??
  readEnv("NEXT_PUBLIC_SITE_URL");

const authSecret = readEnv("BETTER_AUTH_SECRET");

export const auth = betterAuth({
  // trustedOrigins: ["http://localhost:3000", "https://goalgenius.online"],
  // trustHost: true,
  basePath: AUTH_BASE_PATH,
  ...(authBaseURL ? { baseURL: authBaseURL } : {}),
  ...(authSecret ? { secret: authSecret } : {}),
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      enabled: true,
      clientId: process.env.AUTH_GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET as string,
      // redirectUri: process.env.AUTH_GOOGLE_REDIRECT_URI as string,
    },
    github: {
      enabled: true,
      clientId: process.env.AUTH_GITHUB_CLIENT_ID as string,
      clientSecret: process.env.AUTH_GITHUB_CLIENT_SECRET as string,
      // redirectUri: process.env.AUTH_GITHUB_REDIRECT_URI as string,
    },
  },
});
