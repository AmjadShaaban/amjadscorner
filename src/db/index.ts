import { attachDatabasePool } from "@vercel/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "@/lib/env";
import * as schema from "./schema";

// Reuse one connection pool across hot reloads in dev.
const globalForDb = globalThis as unknown as { pgPool?: Pool };
const pool = globalForDb.pgPool ?? new Pool({ connectionString: env.DATABASE_URL });
if (process.env.NODE_ENV !== "production") globalForDb.pgPool = pool;

// On Vercel (Fluid compute), closes idle connections before the function is suspended
// so they don't pile up on the database. Does nothing elsewhere.
attachDatabasePool(pool);

export const db = drizzle({ client: pool, schema });
export type DB = typeof db;
