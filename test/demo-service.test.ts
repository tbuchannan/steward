import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDemoService } from "../src/server/demo/service.js";
import { createAuth } from "../src/server/auth.js";
import { createDatabase } from "../src/server/database.js";
import { pglitePool } from "./support/pglite-pool.js";

const config = {
  baseUrl: "http://localhost:3000",
  secret: "synthetic-test-secret-at-least-32-characters",
  trustedOrigins: ["http://localhost:3000"],
};
const pg = new PGlite();
const pool = pglitePool(pg);
const auth = createAuth(createDatabase(pool), config);
const demo = createDemoService(pool, config);

const sessionFrom = (cookies: Headers) =>
  auth.api.getSession({
    headers: new Headers({
      cookie: cookies
        .getSetCookie()
        .map((value) => value.split(";")[0])
        .join("; "),
    }),
    query: { disableRefresh: true },
  });

describe("demo database lifecycle", () => {
  beforeAll(async () => {
    for (const file of [
      "0000_chemical_bloodstorm.sql",
      "0001_demo_lifecycle.sql",
    ]) {
      await pg.exec(
        await readFile(new URL(`../drizzle/${file}`, import.meta.url), "utf8"),
      );
    }
  }, 30_000);
  afterAll(async () => {
    await pg.close();
  });

  it("creates separate provider users, accounts and cookies without sharing identity", async () => {
    const first = await demo.create();
    const second = await demo.create();
    const a = await sessionFrom(first.headers);
    const b = await sessionFrom(second.headers);
    expect(a?.user.id).toBeTruthy();
    expect(a?.user.id).not.toBe(b?.user.id);
    expect(first.status).toMatchObject({ isDemo: true, state: "active" });
    expect(first.headers.getSetCookie().join(";")).toContain("HttpOnly");
    const accounts = await pg.query<{ count: number }>(
      'select count(*)::int as count from "account"',
    );
    expect(accounts.rows[0].count).toBe(2);
  });

  it("does not renew on status polling and binds extension tickets to a session", async () => {
    const created = await demo.create();
    const session = (await sessionFrom(created.headers))!;
    const status = await demo.status(session, undefined, true);
    expect(status).toMatchObject({ isDemo: true, state: "active" });
    if (!status.isDemo) throw new Error("Expected demo");
    const again = await demo.status(session);
    expect(again.isDemo && again.expiresAt).toBe(status.expiresAt);
    await pg.query(
      "update demo_identity_metadata set expires_at = clock_timestamp() - interval '30 minutes' where user_id = $1",
      [session.user.id],
    );
    expect(await demo.status(session)).toMatchObject({
      state: "expired",
      canExtend: false,
    });
    expect(await demo.status(session, status.extensionTicket)).toMatchObject({
      state: "expired",
      canExtend: true,
    });
    await expect(demo.activity(session)).rejects.toMatchObject({
      code: "DEMO_EXPIRED",
    });
    await expect(demo.extend(session, "forged-ticket")).rejects.toMatchObject({
      code: "DEMO_EXPIRED",
    });
    const renewed = await demo.extend(session, status.extensionTicket);
    expect(renewed).toMatchObject({ state: "active", canExtend: false });
    if (!renewed.isDemo) throw new Error("Expected demo");
    expect(Date.parse(renewed.expiresAt) - Date.parse(renewed.serverTime)).toBe(
      86_400_000,
    );
  });

  it("rolls provider creation back when lifecycle persistence fails", async () => {
    const before = await pg.query<{ count: number }>(
      'select count(*)::int as count from "user"',
    );
    await pg.exec(`create function reject_demo() returns trigger language plpgsql as $$ begin raise exception 'synthetic failure'; end $$;
      create trigger reject_demo before insert on demo_identity_metadata for each row execute function reject_demo();`);
    try {
      await expect(demo.create()).rejects.toThrow();
    } finally {
      await pg.exec(
        "drop trigger reject_demo on demo_identity_metadata; drop function reject_demo();",
      );
    }
    const after = await pg.query<{ count: number }>(
      'select count(*)::int as count from "user"',
    );
    expect(after.rows).toEqual(before.rows);
  });

  it("conceals extension for regular users and returns regular status", async () => {
    const signedUp = await auth.api.signUpEmail({
      body: {
        name: "Regular",
        email: "regular@example.test",
        password: "synthetic-password",
      },
      returnHeaders: true,
    });
    const regular = (await sessionFrom(signedUp.headers))!;
    expect(await demo.status(regular)).toEqual({ isDemo: false });
    await expect(demo.extend(regular, "anything")).rejects.toMatchObject({
      code: "RESOURCE_NOT_FOUND",
    });
  });

  it("preserves extension grace and regular users, then deletes expired provider records idempotently", async () => {
    const created = await demo.create();
    const session = (await sessionFrom(created.headers))!;
    await demo.status(session, undefined, true);
    await pg.query(
      "update demo_identity_metadata set expires_at = clock_timestamp() - interval '30 minutes' where user_id = $1",
      [session.user.id],
    );
    await demo.cleanup();
    expect(await sessionFrom(created.headers)).not.toBeNull();
    await pg.query(
      "update demo_identity_metadata set expires_at = clock_timestamp() - interval '2 hours' where user_id = $1",
      [session.user.id],
    );
    expect((await demo.cleanup()).deleted).toBe(1);
    expect(await sessionFrom(created.headers)).toBeNull();
    expect(await demo.cleanup()).toMatchObject({ deleted: 0, failed: 0 });
    const regular = await pg.query<{ count: number }>(
      'select count(*)::int as count from "user" where email = $1',
      ["regular@example.test"],
    );
    expect(regular.rows[0].count).toBe(1);
  });

  it("enforces durable creation limits and allows a new window after reset", async () => {
    await demo.limitCreation("synthetic-client", 2, 100);
    await demo.limitCreation("synthetic-client", 2, 100);
    await expect(
      demo.limitCreation("synthetic-client", 2, 100),
    ).rejects.toMatchObject({ code: "RATE_LIMITED" });
    await pg.exec(
      "update demo_creation_limit set reset_at = clock_timestamp() - interval '1 second'",
    );
    await expect(
      demo.limitCreation("synthetic-client", 2, 100),
    ).resolves.toBeUndefined();
  });

  it("rejects another demo's extension ticket and enforces the hard cap", async () => {
    const a = await demo.create();
    const b = await demo.create();
    const first = (await sessionFrom(a.headers))!;
    const second = (await sessionFrom(b.headers))!;
    const firstStatus = await demo.status(first, undefined, true);
    if (!firstStatus.isDemo) throw new Error("Expected demo");
    await demo.status(second, undefined, true);
    await pg.query(
      "update demo_identity_metadata set expires_at = clock_timestamp() - interval '30 minutes' where user_id = $1",
      [second.user.id],
    );
    await expect(
      demo.extend(second, firstStatus.extensionTicket),
    ).rejects.toMatchObject({ code: "DEMO_EXPIRED" });
    await pg.query(
      "update demo_identity_metadata set created_at = clock_timestamp() - interval '7 days', expires_at = clock_timestamp() - interval '1 second' where user_id = $1",
      [first.user.id],
    );
    await expect(
      demo.extend(first, firstStatus.extensionTicket),
    ).rejects.toMatchObject({ code: "DEMO_EXPIRED" });
    await demo.cleanup();
    expect(await sessionFrom(a.headers)).toBeNull();
    expect(await sessionFrom(b.headers)).not.toBeNull();
  });

  it("rolls all deletion back when provider deletion fails", async () => {
    const created = await demo.create();
    const session = (await sessionFrom(created.headers))!;
    await pg.query(
      "update demo_identity_metadata set expires_at = clock_timestamp() - interval '2 hours' where user_id = $1",
      [session.user.id],
    );
    await pg.exec(`create function reject_user_delete() returns trigger language plpgsql as $$ begin raise exception 'synthetic failure'; end $$;
      create trigger reject_user_delete before delete on "user" for each row execute function reject_user_delete();`);
    try {
      expect((await demo.cleanup()).failed).toBe(1);
      expect(await sessionFrom(created.headers)).not.toBeNull();
      const metadata = await pg.query(
        "select 1 from demo_identity_metadata where user_id = $1",
        [session.user.id],
      );
      expect(metadata.rows).toHaveLength(1);
    } finally {
      await pg.exec(
        'drop trigger reject_user_delete on "user"; drop function reject_user_delete();',
      );
    }
    expect((await demo.cleanup()).deleted).toBe(1);
  });

  it("serializes concurrent creation attempts against the same limit", async () => {
    await pg.exec("delete from demo_creation_limit");
    const attempts = await Promise.allSettled(
      Array.from({ length: 6 }, () => demo.limitCreation("concurrent", 2, 100)),
    );
    expect(
      attempts.filter((result) => result.status === "fulfilled"),
    ).toHaveLength(2);
    expect(
      attempts.filter((result) => result.status === "rejected"),
    ).toHaveLength(4);
  });

  it("drains more than one hundred expired identities in a daily cleanup", async () => {
    await pg.exec(`insert into "user" (id, name, email)
      select 'backlog-' || n, 'Synthetic guest', 'backlog-' || n || '@example.test' from generate_series(1, 101) n;
      insert into demo_identity_metadata (user_id, created_at, expires_at)
      select 'backlog-' || n, clock_timestamp() - interval '2 days', clock_timestamp() - interval '2 hours' from generate_series(1, 101) n;`);
    const result = await demo.cleanup();
    expect(result).toEqual({ deleted: 101, failed: 0 });
    expect(
      (await pg.query('select 1 from "user" where id like $1', ["backlog-%"]))
        .rows,
    ).toHaveLength(0);
  });
});
