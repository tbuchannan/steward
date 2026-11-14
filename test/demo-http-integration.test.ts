import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { expect, it, vi } from "vitest";
import { createAuth } from "../src/server/auth.js";
import { createDatabase } from "../src/server/database.js";
import { createDemoService } from "../src/server/demo/service.js";
import { pglitePool } from "./support/pglite-pool.js";

const state = vi.hoisted(() => ({ runtime: undefined as unknown }));
vi.mock("../src/server/runtime.js", () => ({
  getRuntime: () => state.runtime,
}));
import { GET, POST } from "../src/app/api/demo/route.js";
import { POST as activity } from "../src/app/api/demo/activity/route.js";
import { POST as extend } from "../src/app/api/demo/extend/route.js";

it("carries real provider cookies through guest entry, expiry, extension, isolation and sign-out over HTTP", async () => {
  const database = new PGlite();
  const pool = pglitePool(database);
  let origin = "";
  let auth: ReturnType<typeof createAuth>;
  const server = createServer(async (incoming, outgoing) => {
    try {
      const chunks: Buffer[] = [];
      for await (const chunk of incoming) chunks.push(Buffer.from(chunk));
      const headers = new Headers();
      for (const [name, value] of Object.entries(incoming.headers)) {
        if (value)
          headers.set(name, Array.isArray(value) ? value.join(", ") : value);
      }
      const request = new Request(`${origin}${incoming.url}`, {
        method: incoming.method,
        headers,
        ...(incoming.method === "POST"
          ? { body: Buffer.concat(chunks).toString() }
          : {}),
      });
      const path = new URL(request.url).pathname;
      const response = path.startsWith("/api/auth/")
        ? await auth.handler(request)
        : path === "/api/demo/activity"
          ? await activity(request)
          : path === "/api/demo/extend"
            ? await extend(request)
            : request.method === "GET"
              ? await GET(request)
              : await POST(request);
      outgoing.statusCode = response.status;
      response.headers.forEach((value, key) => {
        if (key !== "set-cookie") outgoing.setHeader(key, value);
      });
      outgoing.setHeader("set-cookie", response.headers.getSetCookie());
      outgoing.end(await response.text());
    } catch {
      outgoing.statusCode = 500;
      outgoing.end();
    }
  });
  try {
    for (const file of [
      "0000_chemical_bloodstorm.sql",
      "0001_demo_lifecycle.sql",
    ])
      await database.exec(
        await readFile(new URL(`../drizzle/${file}`, import.meta.url), "utf8"),
      );
    await new Promise<void>((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolve);
    });
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("Expected TCP address");
    origin = `http://127.0.0.1:${address.port}`;
    const authConfig = {
      baseUrl: origin,
      secret: "synthetic-http-test-secret-at-least-32-characters",
      trustedOrigins: [origin],
    };
    auth = createAuth(createDatabase(pool), authConfig);
    const demo = createDemoService(pool, authConfig);
    state.runtime = {
      auth,
      demo,
      config: {
        authUrl: origin,
        trustedOrigins: [origin],
        demoCreationLimit: 10,
        demoCreationGlobalLimit: 100,
        demoClientIpSource: "shared",
      },
    };
    const post = (path: string, cookie = "", ticket = "") =>
      fetch(`${origin}${path}`, {
        method: "POST",
        headers: {
          origin,
          cookie,
          "content-type": "application/json",
          "x-demo-extension": ticket,
        },
        body: "{}",
      });
    const cookieFrom = (response: Response) =>
      response.headers
        .getSetCookie()
        .map((value) => value.split(";")[0])
        .join("; ");
    const first = await post("/api/demo");
    const second = await post("/api/demo");
    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    const a = cookieFrom(first);
    const b = cookieFrom(second);
    expect(a).not.toBe(b);
    const provider = await fetch(`${origin}/api/auth/get-session`, {
      headers: { cookie: a },
    });
    const session = await provider.json();
    expect(session.user.name).toBe("Demo visitor");
    const status = await (
      await fetch(`${origin}/api/demo`, { headers: { cookie: a } })
    ).json();
    expect(status.extensionTicket).toHaveLength(64);
    await database.query(
      "update demo_identity_metadata set expires_at = clock_timestamp() - interval '30 minutes' where user_id = $1",
      [session.user.id],
    );
    expect((await post("/api/demo/activity", a)).status).toBe(401);
    expect(
      (await post("/api/demo/extend", b, status.extensionTicket)).status,
    ).toBe(401);
    const extended = await post("/api/demo/extend", a, status.extensionTicket);
    expect(extended.status).toBe(200);
    expect(await extended.json()).toMatchObject({ state: "active" });
    expect((await post("/api/auth/sign-out", a)).status).toBe(200);
    expect(
      (await fetch(`${origin}/api/demo`, { headers: { cookie: a } })).status,
    ).toBe(401);
    expect(
      (await fetch(`${origin}/api/demo`, { headers: { cookie: b } })).status,
    ).toBe(200);
  } finally {
    if (server.listening)
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    await database.close();
  }
}, 30_000);
