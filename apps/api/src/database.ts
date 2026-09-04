import { Pool } from "pg";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";

import { authSchema } from "./schema.js";

export type DatabasePool = Pick<Pool, "end" | "query">;

export const createDatabasePool = (databaseUrl: string): Pool =>
  new Pool({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 30_000,
    max: 5,
  });

export type StewardDatabase = NodePgDatabase<typeof authSchema>;

export const createDatabase = (pool: Pool): StewardDatabase =>
  drizzle(pool, { schema: authSchema });

export const checkDatabase = async (pool: DatabasePool): Promise<void> => {
  await pool.query("select 1");
};
