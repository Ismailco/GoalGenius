import { db } from "@/app/server/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

const baseURL = process.env.BETTER_AUTH_URL;
const githubClientId = process.env.AUTH_GITHUB_ID;
const githubClientSecret = process.env.AUTH_GITHUB_SECRET;
const googleClientId = process.env.AUTH_GOOGLE_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: githubClientId!,
      clientSecret: githubClientSecret!,
      redirectUri: `${baseURL}/api/auth/callback/github`,
    },
    google: {
      clientId: googleClientId!,
      clientSecret: googleClientSecret!,
      redirectUri: `${baseURL}/api/auth/callback/google`,
    },
  },
});
