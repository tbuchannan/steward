import { describe, expect, it } from "vitest";

import {
  healthResponseSchema,
  internalErrorResponse,
  internalErrorResponseSchema,
} from "../src/index.js";

describe("healthResponseSchema", () => {
  it("accepts an okay health response", () => {
    const result = healthResponseSchema.parse({
      status: "ok",
    });

    expect(result).toEqual({
      status: "ok",
    });
  });

  it("rejects an invalid status", () => {
    const result = healthResponseSchema.safeParse({
      status: "degraded",
    });

    expect(result.success).toBe(false);
  });

  it("strips undeclared fields", () => {
    const result = healthResponseSchema.parse({
      status: "ok",
      internal: "do not expose",
    });

    expect(result).toEqual({
      status: "ok",
    });
  });
});

describe("internalErrorResponseSchema", () => {
  it("accepts the safe internal error response", () => {
    expect(internalErrorResponseSchema.parse(internalErrorResponse)).toEqual(
      internalErrorResponse,
    );
  });

  it("strips internal diagnostic details", () => {
    const result = internalErrorResponseSchema.parse({
      ...internalErrorResponse,
      databaseUrl: "do not expose",
      error: {
        ...internalErrorResponse.error,
        stack: "do not expose",
      },
    });

    expect(result).toEqual(internalErrorResponse);
  });
});
