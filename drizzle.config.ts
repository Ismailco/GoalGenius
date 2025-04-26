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
	schema: './lib/db/schema.ts',
	out: './drizzle',
	dialect: 'sqlite',
	...(process.env.NODE_ENV === 'production'
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
					url: 'file:.wrangler/state/v3/d1/miniflare-D1DatabaseObject/2de96be69f5f153c13592d3e6059b36b0c576a977e98836d01f8386c65c8067d.sqlite',
				},
		  }),
});
