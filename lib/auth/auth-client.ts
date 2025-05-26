import { createAuthClient } from "better-auth/react";

export const { useSession, signIn, signOut, signUp } = createAuthClient({
	basePath: 'https://app.goalgenius.online/api/auth',
});
