import { createAuthClient } from "better-auth/react";

export const { useSession, signIn, signOut, signUp } = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL!,
});
