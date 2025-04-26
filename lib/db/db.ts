import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { drizzle as drizzleLibSQL } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
// import { getLocalD1DB } from "../../drizzle.config";

// Define a type for our database (will be inferred from drizzle)
let db: ReturnType<typeof drizzleD1<typeof schema>> | ReturnType<typeof drizzleLibSQL<typeof schema>>;

if (process.env.NODE_ENV === "production") {
  // Access D1 in production through Cloudflare bindings
  // @ts-ignore - Cloudflare bindings are injected at runtime
  if (typeof globalThis.DB !== "undefined") {
    // We're in a Cloudflare Pages/Workers environment with D1 binding
    // @ts-ignore
    db = drizzleD1(globalThis.DB, { schema });
  } else {
    // Fallback for other production environments if needed
    db = drizzleD1(process.env.DB, { schema });
  }
} else {
  // Use libsql in development with the same DB file
  const client = createClient({
		// url: `file:${getLocalD1DB()}`,
		url: 'file:.wrangler/state/v3/d1/miniflare-D1DatabaseObject/2de96be69f5f153c13592d3e6059b36b0c576a977e98836d01f8386c65c8067d.sqlite',
	});
  db = drizzleLibSQL(client, { schema });
}

export { db };
