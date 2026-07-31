import Fastify, { type FastifyServerOptions } from "fastify";

export const buildApp = (
  options: FastifyServerOptions = {
    logger: true,
  },
) => {
  const app = Fastify(options);

  app.get("/api/health", async () => {
    return { status: "ok" };
  });

  return app;
};
