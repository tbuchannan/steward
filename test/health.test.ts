import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock("../src/server/runtime.js", () => ({
  getRuntime: () => ({ pool: { query: mocks.query } }),
}));
import { GET } from "../src/app/api/health/route.js";

describe("readiness Route Handler", () => {
  beforeEach(() => {
    mocks.query.mockReset();
  });
  it("checks PostgreSQL and returns an uncached public response", async () => {
    mocks.query.mockResolvedValue({ rows: [] });
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(mocks.query).toHaveBeenCalledWith("select 1");
  });
  it("returns a safe uncached error when PostgreSQL is unavailable", async () => {
    mocks.query.mockRejectedValue(
      new Error("postgresql://user:secret@internal/db"),
    );
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const response = await GET();
      expect(response.status).toBe(500);
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(await response.json()).toEqual({
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred. Try again later.",
        },
      });
      expect(JSON.stringify(log.mock.calls)).not.toContain("secret");
    } finally {
      log.mockRestore();
    }
  });
});
