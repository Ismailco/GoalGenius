import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { drizzle as drizzleLibSQL } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import { getLocalD1DB } from "../../drizzle.config";

let db;

if (process.env.NODE_ENV === "production") {
  // Use D1 in production
  db = drizzleD1(process.env.DB, { schema });
} else {
  // Use libsql in development with the same DB file
  const client = createClient({
    url: `file:${getLocalD1DB()}`,
  });
  db = drizzleLibSQL(client, { schema });
}

export { db };
