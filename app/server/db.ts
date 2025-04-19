import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { drizzle as drizzleLibSQL } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
// import { getLocalD1DB } from "../../drizzle.config";

// Define a type for our database (will be inferred from drizzle)
let db: ReturnType<typeof drizzleD1<typeof schema>> | ReturnType<typeof drizzleLibSQL<typeof schema>>;

if (process.env.NEXT_PUBLIC_NODE_ENV === "production") {
  // Use D1 in production
  db = drizzleD1(process.env.DB, { schema });
  console.log("Using D1 in production ", process.env.DB);
} else {
  // Use libsql in development with the same DB file
  const client = createClient({
    // url: `file:${getLocalD1DB()}`,
    url: "file:.wrangler/state/v3/d1/miniflare-D1DatabaseObject/7ea06d4d8d20122be67243a61291b0fef1f2f34ada256d282420c8f24bfcd015.sqlite",
  });
  db = drizzleLibSQL(client, { schema });
}

export { db };
