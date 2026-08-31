import { describe, expect, it } from "vitest";

import { loadRuntimeConfig } from "../src/config.js";

describe("loadRuntimeConfig", () => {
  it("loads database configuration with safe server defaults", () => {
    expect(
      loadRuntimeConfig({
        DATABASE_URL: "postgresql://steward:local@localhost:5432/steward",
      }),
    ).toEqual({
      databaseUrl: "postgresql://steward:local@localhost:5432/steward",
      host: "0.0.0.0",
      port: 3000,
    });
  });

  it("accepts Railway's assigned port", () => {
    expect(
      loadRuntimeConfig({
        DATABASE_URL: "postgres://steward:local@postgres.railway.internal/db",
        HOST: "::",
        PORT: "9876",
      }),
    ).toMatchObject({ host: "::", port: 9876 });
  });

  it("reports invalid variable names without exposing their values", () => {
    expect(() =>
      loadRuntimeConfig({
        DATABASE_URL: "top-secret-value",
        PORT: "not-a-port",
      }),
    ).toThrowError("Invalid runtime configuration: DATABASE_URL, PORT.");
  });
});
