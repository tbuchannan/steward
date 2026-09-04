import { describe, expect, it, vi } from "vitest";

import { buildApp } from "../src/app.js";

describe("Better Auth HTTP boundary", () => {
  it("forwards registration JSON and preserves session cookies", async () => {
    const handler = vi.fn(async (request: Request) => {
      expect(request.url).toBe(
        "https://steward.example/api/auth/sign-up/email",
      );
      expect(request.method).toBe("POST");
      expect(await request.json()).toEqual({
        name: "Taylor",
        email: "taylor@example.com",
        password: "correct horse battery staple",
      });

      return new Response(JSON.stringify({ user: { name: "Taylor" } }), {
        status: 200,
        headers: {
          "content-type": "application/json",
          "set-cookie": "better-auth.session_token=opaque; HttpOnly; Path=/",
        },
      });
    });
    const app = buildApp({ logger: false }, { auth: { handler } });

    try {
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/sign-up/email",
        headers: {
          host: "internal.railway.app",
          "x-forwarded-host": "steward.example",
          "x-forwarded-proto": "https",
        },
        payload: {
          name: "Taylor",
          email: "taylor@example.com",
          password: "correct horse battery staple",
        },
      });

      expect(response.statusCode).toBe(200);
      expect(String(response.headers["set-cookie"])).toContain("HttpOnly");
      expect(response.json()).toEqual({ user: { name: "Taylor" } });
      expect(handler).toHaveBeenCalledOnce();
    } finally {
      await app.close();
    }
  });
});
