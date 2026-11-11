import { describe, expect, it } from "vitest";

import { loadRuntimeConfig } from "../src/server/config.js";

describe("loadRuntimeConfig", () => {
  it("loads database configuration with safe server defaults", () => {
    expect(
      loadRuntimeConfig({
        DATABASE_URL: "postgresql://steward:local@localhost:5432/steward",
        BETTER_AUTH_SECRET: "a-development-secret-at-least-32-characters",
        BETTER_AUTH_URL: "http://localhost:3000",
        TRUSTED_ORIGINS: "http://localhost:3000",
      }),
    ).toEqual({
      databaseUrl: "postgresql://steward:local@localhost:5432/steward",
      authSecret: "a-development-secret-at-least-32-characters",
      authUrl: "http://localhost:3000",
      trustedOrigins: ["http://localhost:3000"],
    });
  });

  it("accepts explicit production and preview origins", () => {
    expect(
      loadRuntimeConfig({
        DATABASE_URL:
          "postgresql://steward:example@ep-example-pooler.us-east-2.aws.neon.tech/steward?sslmode=require",
        BETTER_AUTH_SECRET: "a-development-secret-at-least-32-characters",
        BETTER_AUTH_URL: "https://api.example.com",
        TRUSTED_ORIGINS: "https://example.com, https://preview.example.com",
        HOST: "::",
        PORT: "9876",
      }),
    ).toMatchObject({
      databaseUrl:
        "postgresql://steward:example@ep-example-pooler.us-east-2.aws.neon.tech/steward?sslmode=require",
      trustedOrigins: ["https://example.com", "https://preview.example.com"],
    });
  });

  it("reports invalid variable names without exposing their values", () => {
    expect(() =>
      loadRuntimeConfig({
        DATABASE_URL: "top-secret-value",
        BETTER_AUTH_SECRET: "short",
        BETTER_AUTH_URL: "not-a-url",
        TRUSTED_ORIGINS: "not-an-origin",
        PORT: "not-a-port",
      }),
    ).toThrowError(
      "Invalid runtime configuration: BETTER_AUTH_SECRET, BETTER_AUTH_URL, DATABASE_URL, TRUSTED_ORIGINS.",
    );
  });
});
