import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	async rewrites() {
		const isDev = process.env.NODE_ENV === 'development';

		return {
			beforeFiles: [
				// Rewrite everything on app subdomain to /app/ path
				{
					source: '/:path*',
					has: [
						{
							type: 'host',
							value: isDev ? 'app.localhost:3000' : 'app.goalgenius.soultware.com',
						},
					],
					destination: '/app/:path*',
				},
			],
			afterFiles: [],
			fallback: [],
		};
	},
	images: {
		domains: [
			'localhost',
			'app.localhost',
			'goalgenius.soultware.com',
			'app.goalgenius.soultware.com'
		],
	},
};

export default nextConfig;
