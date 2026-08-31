import { it, expect, describe } from "vitest";
import { buildApp } from "../src/app.js";

describe("health check", () => {
  it("returns status ok after its dependencies respond", async () => {
    let readinessChecks = 0;
    const app = buildApp(
      { logger: false },
      {
        checkReadiness: async () => {
          readinessChecks += 1;
        },
      },
    );
    try {
      const response = await app.inject({
        method: "GET",
        url: "/api/health",
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ status: "ok" });
      expect(readinessChecks).toBe(1);
    } finally {
      await app.close();
    }
  });

  it("returns a safe error when a dependency is unavailable", async () => {
    const app = buildApp(
      { logger: false },
      {
        checkReadiness: async () => {
          throw new Error("postgresql://user:secret@internal/database");
        },
      },
    );

    try {
      const response = await app.inject({
        method: "GET",
        url: "/api/health",
      });

      expect(response.statusCode).toBe(500);
      expect(response.json()).toEqual({
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred. Try again later.",
        },
      });
      expect(response.body).not.toContain("secret");
    } finally {
      await app.close();
    }
  });

  it("closes shared dependencies with the Fastify instance", async () => {
    let closeCalls = 0;
    const app = buildApp(
      { logger: false },
      {
        close: async () => {
          closeCalls += 1;
        },
      },
    );

    await app.close();

    expect(closeCalls).toBe(1);
  });
});
