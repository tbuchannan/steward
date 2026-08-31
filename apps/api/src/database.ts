import { Pool } from "pg";

export type DatabasePool = Pick<Pool, "end" | "query">;

export const createDatabasePool = (databaseUrl: string): Pool =>
  new Pool({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 30_000,
    max: 5,
  });

export const checkDatabase = async (pool: DatabasePool): Promise<void> => {
  await pool.query("select 1");
};
