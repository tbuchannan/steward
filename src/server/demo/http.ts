import "server-only";
import { isIP } from "node:net";
import { randomUUID, timingSafeEqual } from "node:crypto";
import { z } from "zod";

import { getRuntime } from "../runtime";
import { demoCommandSchema, demoStatusSchema } from "../../lib/contracts/demo";
import { DemoError } from "./errors";

const errors = {
  AUTHENTICATION_REQUIRED: [401, "Sign in to continue."],
  DEMO_EXPIRED: [401, "Your demo expired. Start a new demo to continue."],
  RESOURCE_NOT_FOUND: [404, "The requested resource was not found."],
  VALIDATION_ERROR: [400, "The submitted data is invalid."],
  RATE_LIMITED: [429, "Too many requests. Try again later."],
  INTERNAL_ERROR: [500, "An unexpected error occurred. Try again later."],
} as const;

const responseHeaders = () =>
  new Headers({
    "cache-control": "private, no-store",
    "x-request-id": randomUUID(),
  });
const errorResponse = (error: unknown, headers: Headers) => {
  const code = error instanceof DemoError ? error.code : "INTERNAL_ERROR";
  const [status, message] = errors[code];
  if (error instanceof DemoError && error.retryAfter)
    headers.set("retry-after", String(error.retryAfter));
  if (code === "INTERNAL_ERROR")
    console.error(`Demo request failed (${headers.get("x-request-id")}).`);
  return Response.json({ error: { code, message } }, { status, headers });
};

export const demoRequest = async (
  request: Request,
  action: "status" | "create" | "activity" | "extend",
) => {
  const headers = responseHeaders();
  try {
    const { auth, demo, config } = getRuntime();
    if (action !== "status") {
      const origin = request.headers.get("origin");
      const ownOrigin = new URL(config.authUrl).origin;
      if (
        !origin ||
        origin !== new URL(request.url).origin ||
        (origin !== ownOrigin && !config.trustedOrigins.includes(origin))
      )
        throw new DemoError("VALIDATION_ERROR");
    }
    const session = await auth.api.getSession({
      headers: request.headers,
      query: { disableRefresh: true },
    });
    if (!session && action !== "create")
      throw new DemoError("AUTHENTICATION_REQUIRED");
    if (action !== "status") {
      if (
        request.headers.get("content-type")?.split(";")[0].trim() !==
        "application/json"
      )
        throw new DemoError("VALIDATION_ERROR");
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        throw new DemoError("VALIDATION_ERROR");
      }
      if (!demoCommandSchema.safeParse(body).success)
        throw new DemoError("VALIDATION_ERROR");
    }
    const ticket = request.headers.get("x-demo-extension") ?? undefined;
    if (action === "create") {
      if (session) {
        const current = await demo.status(session);
        if (!current.isDemo || current.state === "active")
          return Response.json(demoStatusSchema.parse(current), { headers });
      }
      // Vercel overwrites this header at ingress. Other deployments share one
      // conservative bucket until their trusted address source is configured.
      const address =
        config.demoClientIpSource === "vercel"
          ? request.headers.get("x-vercel-forwarded-for")
          : null;
      await demo.limitCreation(
        address && isIP(address) ? address : "unknown",
        config.demoCreationLimit,
        config.demoCreationGlobalLimit,
      );
      const result = await demo.create();
      const body = demoStatusSchema.parse(result.status);
      for (const cookie of result.headers.getSetCookie())
        headers.append("set-cookie", cookie);
      return Response.json(body, { status: 201, headers });
    }
    if (!session) throw new DemoError("AUTHENTICATION_REQUIRED");
    const result =
      action === "status"
        ? await demo.status(session, ticket, true)
        : action === "activity"
          ? await demo.activity(session)
          : await demo.extend(session, ticket);
    return Response.json(demoStatusSchema.parse(result), { headers });
  } catch (error) {
    return errorResponse(error, headers);
  }
};

export const demoCleanupRequest = async (request: Request) => {
  const headers = responseHeaders();
  try {
    const { demo, config } = getRuntime();
    if (!config.cronSecret) throw new Error("Scheduler is not configured.");
    const expected = Buffer.from(`Bearer ${config.cronSecret}`);
    const supplied = Buffer.from(request.headers.get("authorization") ?? "");
    if (
      supplied.length !== expected.length ||
      !timingSafeEqual(supplied, expected)
    )
      throw new DemoError("AUTHENTICATION_REQUIRED");
    const result = z
      .strictObject({
        deleted: z.number().int().nonnegative(),
        failed: z.number().int().nonnegative(),
      })
      .parse(await demo.cleanup());
    if (result.failed) throw new Error("Cleanup requires retry.");
    return Response.json(result, { headers });
  } catch (error) {
    return errorResponse(error, headers);
  }
};
