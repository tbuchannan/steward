import "server-only";

import { createAuth } from "./auth";
import { loadRuntimeConfig } from "./config";
import { createDatabase, createDatabasePool } from "./database";

// Share connections across requests and development reloads within this process.
const runtimeGlobal = globalThis as typeof globalThis & {
  stewardDatabasePool?: ReturnType<typeof createDatabasePool>;
};

const createPool = (databaseUrl: string) => {
  const pool = createDatabasePool(databaseUrl);
  pool.on("error", () =>
    console.error("Unexpected idle database connection error."),
  );
  return pool;
};

const createRuntime = () => {
  const config = loadRuntimeConfig(process.env);
  const pool = (runtimeGlobal.stewardDatabasePool ??= createPool(
    config.databaseUrl,
  ));
  const auth = createAuth(createDatabase(pool), {
    baseUrl: config.authUrl,
    secret: config.authSecret,
    trustedOrigins: config.trustedOrigins,
  });
  return { auth, pool };
};

let runtime: ReturnType<typeof createRuntime> | undefined;

export const getRuntime = () => (runtime ??= createRuntime());
