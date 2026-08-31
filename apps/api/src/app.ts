import Fastify, { type FastifyServerOptions } from "fastify";
import {
  healthResponseSchema,
  internalErrorResponse,
  internalErrorResponseSchema,
} from "@steward/contracts";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";

type AppDependencies = {
  checkReadiness?: () => Promise<void>;
  close?: () => Promise<void>;
};

const readyWithoutExternalDependencies = async (): Promise<void> => {};

export const buildApp = (
  options: FastifyServerOptions = {
    logger: true,
  },
  dependencies: AppDependencies = {},
) => {
  const app = Fastify(options).withTypeProvider<ZodTypeProvider>();
  const checkReadiness =
    dependencies.checkReadiness ?? readyWithoutExternalDependencies;

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  if (dependencies.close) {
    app.addHook("onClose", dependencies.close);
  }

  app.get(
    "/api/health",
    {
      schema: {
        response: {
          200: healthResponseSchema,
          500: internalErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        await checkReadiness();
        return { status: "ok" as const };
      } catch {
        request.log.error(
          { dependency: "database" },
          "Readiness check failed.",
        );
        return reply.code(500).send(internalErrorResponse);
      }
    },
  );

  return app;
};
