import { db } from "@/lib/db/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

// console.log(db.$client);
export const auth = betterAuth({
  // trustedOrigins: ["http://localhost:3000", "https://nutryfit.online"],
  // trustHost: true,
	database: drizzleAdapter(db, {
		provider: 'sqlite',
	}),
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		google: {
			enabled: true,
			clientId: process.env.NEXT_PUBLIC_AUTH_GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.NEXT_PUBLIC_AUTH_GOOGLE_CLIENT_SECRET as string,
			// redirectUri: process.env.NEXT_PUBLIC_AUTH_GOOGLE_REDIRECT_URI as string,
		},
		github: {
			enabled: true,
			clientId: process.env.NEXT_PUBLIC_AUTH_GITHUB_CLIENT_ID as string,
			clientSecret: process.env.NEXT_PUBLIC_AUTH_GITHUB_CLIENT_SECRET as string,
			// redirectUri: process.env.NEXT_PUBLIC_AUTH_GITHUB_REDIRECT_URI as string,
		},
	},
});
