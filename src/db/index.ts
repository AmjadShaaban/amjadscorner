import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env";
import * as schema from "./schema";

// Reuse one connection pool across hot reloads in dev.
const globalForDb = globalThis as unknown as { pgClient?: postgres.Sql };
const client = globalForDb.pgClient ?? postgres(env.DATABASE_URL);
if (process.env.NODE_ENV !== "production") globalForDb.pgClient = client;

export const db = drizzle(client, { schema });
export type DB = typeof db;
