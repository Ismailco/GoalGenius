declare global {
	namespace NodeJS {
		interface ProcessEnv extends CloudflareEnv {}
	}
	var DB: D1Database;
}

export type {};
