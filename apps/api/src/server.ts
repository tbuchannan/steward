import { buildApp } from "./app.js";
import { loadRuntimeConfig } from "./config.js";
import { checkDatabase, createDatabasePool } from "./database.js";

let app: ReturnType<typeof buildApp> | undefined;

const start = async () => {
  try {
    const config = loadRuntimeConfig(process.env);
    const pool = createDatabasePool(config.databaseUrl);

    app = buildApp(undefined, {
      checkReadiness: () => checkDatabase(pool),
      close: () => pool.end(),
    });

    await app.listen({ port: config.port, host: config.host });
  } catch (err) {
    if (app) {
      app.log.error(err);
      await app.close();
    } else {
      console.error(err instanceof Error ? err.message : "API startup failed.");
    }
    process.exitCode = 1;
  }
};

type ShutdownSignal = "SIGINT" | "SIGTERM";
let isShuttingDown = false;

const shutdown = async (signal: ShutdownSignal) => {
  if (isShuttingDown || !app) {
    return;
  }
  isShuttingDown = true;

  app.log.info({ signal }, "Shutdown signal received.");

  try {
    await app.close();
  } catch (err) {
    app.log.error(err);
    process.exitCode = 1;
  }
};

process.once("SIGINT", () => {
  void shutdown("SIGINT");
});

process.once("SIGTERM", () => {
  void shutdown("SIGTERM");
});

void start();
