import { defineConfig } from "drizzle-kit";
// import fs from "node:fs";
// import path from "node:path";

// export function getLocalD1DB() {
//   try {
//     const basePath = path.resolve(".wrangler");
//     const dbFile = fs.readdirSync(basePath, { encoding: "utf-8", recursive: true })
//     .find((f) => f.endsWith(".sqlite"));

//     if (!dbFile) {
//       throw new Error(`.sqlite file not found in ${basePath}`);
//     }

//     const url = path.resolve(basePath, dbFile);
//     return url;
//   } catch (error) {
//     throw new Error(`Error ${error}`);
//   }
// }

export default defineConfig({
	schema: './app/server/schema.ts',
	out: './drizzle',
	dialect: 'sqlite',
	...(process.env.NEXT_PUBLIC_NODE_ENV === 'production'
		? {
				driver: 'd1-http',
				dbCredentials: {
					accountId: process.env.NEXT_PUBLIC_CLOUDFLARE_D1_ACCOUNT_ID,
					databaseId: process.env.NEXT_PUBLIC_CLOUDFLARE_D1_DATABASE_ID,
					token: process.env.NEXT_PUBLIC_CLOUDFLARE_D1_API_TOKEN,
				},
		  }
		: {
				dbCredentials: {
					// url: getLocalD1DB(),
					url: 'file:.wrangler/state/v3/d1/miniflare-D1DatabaseObject/7ea06d4d8d20122be67243a61291b0fef1f2f34ada256d282420c8f24bfcd015.sqlite',
				},
		  }),
});
