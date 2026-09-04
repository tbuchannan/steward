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
import type { AuthService } from "./auth.js";

type AppDependencies = {
  auth?: AuthService;
  checkReadiness?: () => Promise<void>;
  close?: () => Promise<void>;
};

const readyWithoutExternalDependencies = async (): Promise<void> => {};

const forwardAuthRequest = async (
  auth: AuthService,
  request: {
    body?: unknown;
    headers: Record<string, string | string[] | undefined>;
    method: string;
    url: string;
  },
  reply: {
    code: (statusCode: number) => unknown;
    header: (name: string, value: string | string[]) => unknown;
    send: (payload?: string) => unknown;
  },
) => {
  const forwardedProtocol = request.headers["x-forwarded-proto"];
  const protocol =
    typeof forwardedProtocol === "string" ? forwardedProtocol : "http";
  const host = request.headers["x-forwarded-host"] ?? request.headers.host;
  const requestHost = typeof host === "string" ? host : "localhost";
  const headers = new Headers();

  for (const [name, value] of Object.entries(request.headers)) {
    if (Array.isArray(value)) {
      value.forEach((item) => headers.append(name, item));
    } else if (value !== undefined) {
      headers.set(name, value);
    }
  }

  const requestInit: RequestInit = {
    method: request.method,
    headers,
    ...(request.method === "GET" || request.method === "HEAD"
      ? {}
      : { body: JSON.stringify(request.body ?? {}) }),
  };
  const response = await auth.handler(
    new Request(
      new URL(request.url, `${protocol}://${requestHost}`),
      requestInit,
    ),
  );

  reply.code(response.status);
  const cookies = response.headers.getSetCookie();
  if (cookies.length > 0) reply.header("set-cookie", cookies);
  response.headers.forEach((value, name) => {
    if (name !== "set-cookie") reply.header(name, value);
  });

  const body = await response.text();
  return reply.send(body || undefined);
};

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

  if (dependencies.auth) {
    app.route({
      method: ["GET", "POST"],
      url: "/api/auth/*",
      handler: (request, reply) =>
        forwardAuthRequest(dependencies.auth!, request, reply),
    });
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
