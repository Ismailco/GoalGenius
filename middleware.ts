import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isProtectedRoute } from './app/constants/routes';

// Handle subdomain routing and authentication
export default clerkMiddleware(async (auth, request) => {
	const { userId } = await auth();
	const url = new URL(request.url);
	const isDev = process.env.NODE_ENV === 'development';
	const isAppSubdomain = isDev
		? url.hostname === 'app.localhost'
		: url.hostname.startsWith('app.');

	// If on app subdomain, require authentication
	if (isAppSubdomain) {
		if (!userId) {
			const signInUrl = new URL('/sign-in', url);
			signInUrl.hostname = isDev ? 'localhost' : url.hostname.replace('app.', '');
			return NextResponse.redirect(signInUrl);
		}
	} else {
		// On main domain - redirect protected routes to app subdomain
		if (isProtectedRoute(url.pathname)) {
			const appUrl = new URL(url);
			appUrl.hostname = isDev ? 'app.localhost' : `app.${url.hostname}`;
			return NextResponse.redirect(appUrl);
		}
	}

	return NextResponse.next();
});

export const config = {
	matcher: [
		"/((?!.+\\.[\\w]+$|_next).*)",
		"/",
		"/(api|trpc)(.*)",
	],
};
