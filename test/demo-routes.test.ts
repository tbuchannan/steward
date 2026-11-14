import { beforeEach, describe, expect, it, vi } from "vitest";
import { DemoError } from "../src/server/demo/errors.js";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  status: vi.fn(),
  create: vi.fn(),
  activity: vi.fn(),
  extend: vi.fn(),
  limitCreation: vi.fn(),
  cleanup: vi.fn(),
}));
vi.mock("../src/server/runtime.js", () => ({
  getRuntime: () => ({
    auth: { api: { getSession: mocks.getSession } },
    demo: mocks,
    config: {
      authUrl: "https://steward.example",
      trustedOrigins: ["https://steward.example"],
      demoClientIpSource: "shared",
      demoCreationLimit: 10,
      demoCreationGlobalLimit: 100,
      cronSecret: "synthetic-cron-secret-at-least-32-characters",
    },
  }),
}));
import { GET, POST } from "../src/app/api/demo/route.js";
import { POST as activity } from "../src/app/api/demo/activity/route.js";
import { POST as extend } from "../src/app/api/demo/extend/route.js";
import { GET as cleanup } from "../src/app/api/internal/demo-cleanup/route.js";

const request = (
  path = "/api/demo",
  body: unknown = {},
  origin = "https://steward.example",
) =>
  new Request(`https://steward.example${path}`, {
    method: "POST",
    headers: {
      origin,
      "content-type": "application/json",
      "x-demo-extension": "a".repeat(64),
    },
    body: JSON.stringify(body),
  });
const active = {
  isDemo: true,
  state: "active",
  expiresAt: "2026-11-12T00:00:00.000Z",
  hardExpiresAt: "2026-11-18T00:00:00.000Z",
  extendUntil: "2026-11-12T01:00:00.000Z",
  serverTime: "2026-11-11T00:00:00.000Z",
  canExtend: false,
};

describe("demo HTTP boundary", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.getSession.mockResolvedValue(null);
    mocks.create.mockResolvedValue({
      status: active,
      headers: new Headers({
        "set-cookie": "better-auth.session_token=opaque; HttpOnly; Path=/",
      }),
    });
    mocks.status.mockResolvedValue(active);
    mocks.activity.mockResolvedValue(active);
    mocks.extend.mockResolvedValue(active);
    mocks.cleanup.mockResolvedValue({ deleted: 1, failed: 0 });
  });
  it("returns isolated entry status and forwards provider cookies without provider JSON", async () => {
    const response = await POST(request());
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual(active);
    expect(response.headers.getSetCookie()[0]).toContain("HttpOnly");
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("x-request-id")).toBeTruthy();
  });
  it("requires authentication for status, activity and extension", async () => {
    for (const response of [
      await GET(new Request("https://steward.example/api/demo")),
      await activity(request()),
      await extend(request()),
    ]) {
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({
        error: {
          code: "AUTHENTICATION_REQUIRED",
          message: "Sign in to continue.",
        },
      });
    }
  });
  it("rejects foreign origins and client-selected ownership", async () => {
    const foreign = await POST(
      request("/api/demo", {}, "https://evil.example"),
    );
    expect(foreign.status).toBe(400);
    const selected = await POST(
      request("/api/demo", { userId: "someone-else" }),
    );
    expect(selected.status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("normalizes malformed JSON and unsupported media types", async () => {
    for (const [contentType, body] of [
      ["application/json", "{"],
      ["text/plain", "{}"],
      ["application/json", ""],
    ]) {
      const response = await POST(
        new Request("https://steward.example/api/demo", {
          method: "POST",
          headers: {
            origin: "https://steward.example",
            "content-type": contentType,
          },
          body,
        }),
      );
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: {
          code: "VALIDATION_ERROR",
          message: "The submitted data is invalid.",
        },
      });
    }
  });
  it("preserves an existing regular or unexpired demo session", async () => {
    mocks.getSession.mockResolvedValue({
      user: { id: "regular" },
      session: { id: "session" },
    });
    mocks.status.mockResolvedValue({ isDemo: false });
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ isDemo: false });
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("returns safe rate errors and retry headers", async () => {
    mocks.limitCreation.mockRejectedValue(new DemoError("RATE_LIMITED", 72));
    const response = await POST(request());
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("72");
    expect(await response.json()).toMatchObject({
      error: { code: "RATE_LIMITED" },
    });
  });
  it("conceals regular-user extension and exposes only the expiry code for expired demos", async () => {
    mocks.getSession.mockResolvedValue({
      user: { id: "regular" },
      session: { id: "session" },
    });
    mocks.extend.mockRejectedValue(new DemoError("RESOURCE_NOT_FOUND"));
    expect((await extend(request())).status).toBe(404);
    mocks.activity.mockRejectedValue(new DemoError("DEMO_EXPIRED"));
    const response = await activity(request());
    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({
      error: { code: "DEMO_EXPIRED" },
    });
  });
  it("does not disclose dependency failures or invalid response fields", async () => {
    mocks.create.mockRejectedValueOnce(
      new Error("SECRET sentinel database password"),
    );
    const failed = await POST(request());
    expect(failed.status).toBe(500);
    expect(JSON.stringify(await failed.json())).not.toContain("sentinel");
    mocks.create.mockResolvedValueOnce({
      status: { ...active, token: "sentinel" },
      headers: new Headers(),
    });
    const invalid = await POST(request());
    expect(invalid.status).toBe(500);
    expect(JSON.stringify(await invalid.json())).not.toContain("sentinel");
  });
  it("requires scheduler credentials and reports cleanup failures as retryable failures", async () => {
    expect(
      (
        await cleanup(
          new Request("https://steward.example/api/internal/demo-cleanup"),
        )
      ).status,
    ).toBe(401);
    const scheduled = new Request(
      "https://steward.example/api/internal/demo-cleanup",
      {
        headers: {
          authorization: "Bearer synthetic-cron-secret-at-least-32-characters",
        },
      },
    );
    const response = await cleanup(scheduled);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ deleted: 1, failed: 0 });
    mocks.cleanup.mockResolvedValueOnce({ deleted: 0, failed: 1 });
    expect((await cleanup(scheduled)).status).toBe(500);
  });
});
