import Fastify, { type FastifyServerOptions } from "fastify";
import { healthResponseSchema } from "@steward/contracts";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";

export const buildApp = (
  options: FastifyServerOptions = {
    logger: true,
  },
) => {
  const app = Fastify(options).withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.get(
    "/api/health",
    {
      schema: {
        response: {
          200: healthResponseSchema,
        },
      },
    },
    () => {
      return { status: "ok" as const };
    },
  );

  return app;
};
