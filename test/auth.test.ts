import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ handler: vi.fn() }));
vi.mock("../src/server/runtime.js", () => ({
  getRuntime: () => ({ auth: { handler: mocks.handler } }),
}));
import { GET, POST } from "../src/app/api/auth/[...all]/route.js";

describe("Better Auth Route Handler boundary", () => {
  it("preserves registration JSON, status, and multiple session cookies", async () => {
    mocks.handler.mockImplementation(async (request: Request) => {
      expect(request.url).toBe(
        "https://steward.example/api/auth/sign-up/email",
      );
      expect(request.method).toBe("POST");
      expect(await request.json()).toEqual({
        name: "Taylor",
        email: "taylor@example.com",
        password: "password123",
      });
      const headers = new Headers({ "content-type": "application/json" });
      headers.append(
        "set-cookie",
        "better-auth.session_token=opaque; HttpOnly; Path=/",
      );
      headers.append(
        "set-cookie",
        "better-auth.session_data=opaque; HttpOnly; Path=/",
      );
      return new Response(JSON.stringify({ user: { name: "Taylor" } }), {
        status: 201,
        headers,
      });
    });
    const response = await POST(
      new Request("https://steward.example/api/auth/sign-up/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "Taylor",
          email: "taylor@example.com",
          password: "password123",
        }),
      }),
    );
    expect(response.status).toBe(201);
    expect(response.headers.getSetCookie()).toEqual([
      "better-auth.session_token=opaque; HttpOnly; Path=/",
      "better-auth.session_data=opaque; HttpOnly; Path=/",
    ]);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ user: { name: "Taylor" } });
  });
  it("forwards session cookies without rebuilding the incoming request", async () => {
    mocks.handler.mockImplementation(async (request: Request) => {
      expect(request.headers.get("cookie")).toBe(
        "better-auth.session_token=opaque",
      );
      return Response.json(null);
    });
    const response = await GET(
      new Request("https://steward.example/api/auth/get-session", {
        headers: { cookie: "better-auth.session_token=opaque" },
      }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toBeNull();
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});
