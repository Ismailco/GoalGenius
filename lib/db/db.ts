import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import * as schema from "./schema";

type DatabaseClient = ReturnType<typeof drizzleD1<typeof schema>>;

let cachedDb: DatabaseClient | undefined;

function createDb() {
  const { env } = getCloudflareContext();

  if (!env.DB) {
    throw new Error(
      "Cloudflare D1 binding 'DB' is not available in the current request context.",
    );
  }

  return drizzleD1(env.DB, { schema });
}

export function getDb(): DatabaseClient {
  if (cachedDb) {
    return cachedDb;
  }

  cachedDb = createDb();

  return cachedDb;
}

export const db = new Proxy({} as DatabaseClient, {
  get(_target, property) {
    const target = getDb();
    const value = Reflect.get(target, property, target);

    return typeof value === "function" ? value.bind(target) : value;
  },
  has(_target, property) {
    return property in getDb();
  },
});
