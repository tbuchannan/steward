import { buildApp } from "./app.js";

const app = buildApp();

const start = async () => {
  try {
    const port = Number(process.env.PORT ?? 3000);

    await app.listen({ port, host: "0.0.0.0" });
  } catch (err) {
    app.log.error(err);
    process.exitCode = 1;
  }
};

type ShutdownSignal = "SIGINT" | "SIGTERM";
let isShuttingDown = false;

const shutdown = async (signal: ShutdownSignal) => {
  if (isShuttingDown) {
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
