import { drizzle } from "drizzle-orm/libsql";
import { createClient, Client } from "@libsql/client";
import * as schema from "./schema";

const createDbClient = () => {
  return createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_TOKEN,
  });
};

const globalForDb = globalThis as unknown as {
  client: Client | undefined;
};

const client = globalForDb.client ?? createDbClient();

if (process.env.NODE_ENV !== "production") {
  globalForDb.client = client;
}

export const db = drizzle(client, { schema });
