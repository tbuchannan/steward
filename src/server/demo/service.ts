import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { Pool, PoolClient } from "pg";

import { createAuth, type AuthConfig } from "../auth";
import { createDatabase } from "../database";
import type { DemoStatus } from "../../lib/contracts/demo";
import {
  cleanupDue,
  demoState,
  DEMO_IDLE_MS,
  renewDemo,
  type DemoLifetime,
} from "./policy";
import { DemoError } from "./errors";

export type DemoSession = { user: { id: string }; session: { id: string } };
type Identity = DemoLifetime & { userId: string };

export const createDemoService = (pool: Pool, config: AuthConfig) => {
  const transaction = async <T>(
    run: (client: PoolClient) => Promise<T>,
  ): Promise<T> => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await run(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  };
  const clock = async (client: PoolClient) =>
    (await client.query<{ now: Date }>("SELECT clock_timestamp() AS now"))
      .rows[0].now;
  const lock = async (client: PoolClient, userId: string) =>
    (
      await client.query<Identity>(
        'SELECT user_id AS "userId", created_at AS "createdAt", expires_at AS "expiresAt" FROM demo_identity_metadata WHERE user_id = $1 FOR UPDATE',
        [userId],
      )
    ).rows[0];
  const ticketFor = (session: DemoSession) =>
    createHmac("sha256", config.secret)
      .update(
        JSON.stringify([
          "demo-extension-v1",
          session.user.id,
          session.session.id,
        ]),
      )
      .digest("hex");
  const hasGrant = async (
    client: PoolClient,
    session: DemoSession,
    ticket?: string,
  ) => {
    if (
      !ticket ||
      !/^[a-f0-9]{64}$/.test(ticket) ||
      !timingSafeEqual(Buffer.from(ticket), Buffer.from(ticketFor(session)))
    )
      return false;
    return (
      (
        await client.query(
          "SELECT 1 FROM demo_session_grant WHERE user_id = $1 AND session_id = $2",
          [session.user.id, session.session.id],
        )
      ).rows.length > 0
    );
  };

  return {
    async create() {
      return transaction(async (client) => {
        const now = await clock(client);
        // Credentials never leave the server; the browser receives provider cookies only.
        const auth = createAuth(createDatabase(client), config, true);
        const result = await auth.api.signUpEmail({
          body: {
            name: "Demo visitor",
            email: `demo-${randomBytes(24).toString("hex")}@guest.steward.invalid`,
            password: randomBytes(48).toString("base64url"),
          },
          returnHeaders: true,
        });
        const identity: Identity = {
          userId: result.response.user.id,
          createdAt: now,
          expiresAt: new Date(now.getTime() + DEMO_IDLE_MS),
        };
        await client.query(
          "INSERT INTO demo_identity_metadata (user_id, created_at, expires_at) VALUES ($1, $2, $3)",
          [identity.userId, identity.createdAt, identity.expiresAt],
        );
        return {
          headers: result.headers,
          status: demoState(identity, now, false),
        };
      });
    },

    async status(
      session: DemoSession,
      ticket?: string,
      observe = false,
    ): Promise<DemoStatus> {
      return transaction(async (client) => {
        const identity = await lock(client, session.user.id);
        if (!identity) return { isDemo: false };
        const now = await clock(client);
        const status = demoState(
          identity,
          now,
          await hasGrant(client, session, ticket),
        );
        if (observe && status.state === "active") {
          await client.query(
            "INSERT INTO demo_session_grant (session_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
            [session.session.id, session.user.id],
          );
          status.extensionTicket = ticketFor(session);
        }
        return status;
      });
    },

    async activity(session: DemoSession): Promise<DemoStatus> {
      return transaction(async (client) => {
        const identity = await lock(client, session.user.id);
        if (!identity) return { isDemo: false };
        const now = await clock(client);
        const expiresAt = renewDemo(identity, now, false);
        if (!expiresAt) throw new DemoError("DEMO_EXPIRED");
        await client.query(
          "UPDATE demo_identity_metadata SET expires_at = $2 WHERE user_id = $1",
          [session.user.id, expiresAt],
        );
        return demoState({ ...identity, expiresAt }, now, false);
      });
    },

    async extend(session: DemoSession, ticket?: string): Promise<DemoStatus> {
      return transaction(async (client) => {
        const identity = await lock(client, session.user.id);
        if (!identity) throw new DemoError("RESOURCE_NOT_FOUND");
        const now = await clock(client);
        if (!(await hasGrant(client, session, ticket)))
          throw new DemoError("DEMO_EXPIRED");
        const expiresAt = renewDemo(identity, now, true);
        if (!expiresAt) throw new DemoError("DEMO_EXPIRED");
        await client.query(
          "UPDATE demo_identity_metadata SET expires_at = $2 WHERE user_id = $1",
          [session.user.id, expiresAt],
        );
        return demoState({ ...identity, expiresAt }, now, false);
      });
    },

    async limitCreation(
      clientKey: string,
      clientLimit: number,
      globalLimit: number,
    ) {
      // Commit rejected attempts as well; rolling them back would defeat limiting.
      const buckets = await transaction(async (client) => {
        const results = [];
        const now = await clock(client);
        for (const [key, maximum] of [
          ["global", globalLimit],
          [
            `client:${createHmac("sha256", config.secret).update(clientKey).digest("hex")}`,
            clientLimit,
          ],
        ] as const) {
          const result = await client.query<{
            attempts: number;
            resetAt: Date;
          }>(
            `INSERT INTO demo_creation_limit (key, attempts, reset_at) VALUES ($1, 1, $2)
             ON CONFLICT (key) DO UPDATE SET
               attempts = CASE WHEN demo_creation_limit.reset_at <= $3 THEN 1 ELSE LEAST(demo_creation_limit.attempts + 1, 1000000000) END,
               reset_at = CASE WHEN demo_creation_limit.reset_at <= $3 THEN $2 ELSE demo_creation_limit.reset_at END
             RETURNING attempts, reset_at AS "resetAt"`,
            [key, new Date(now.getTime() + 3_600_000), now],
          );
          results.push({ ...result.rows[0], maximum, now });
        }
        return results;
      });
      const blocked = buckets.filter(
        (bucket) => bucket.attempts > bucket.maximum,
      );
      if (blocked.length)
        throw new DemoError(
          "RATE_LIMITED",
          Math.max(
            ...blocked.map((bucket) =>
              Math.max(
                1,
                Math.ceil(
                  (bucket.resetAt.getTime() - bucket.now.getTime()) / 1000,
                ),
              ),
            ),
          ),
        );
    },

    async cleanup() {
      const candidates = await pool.query<{ userId: string }>(
        `SELECT user_id AS "userId" FROM demo_identity_metadata d
         WHERE d.created_at + interval '7 days' <= clock_timestamp()
           OR d.expires_at + CASE WHEN EXISTS (SELECT 1 FROM demo_session_grant g WHERE g.user_id = d.user_id)
             THEN interval '1 hour' ELSE interval '0 hours' END <= clock_timestamp()
         ORDER BY expires_at, user_id LIMIT 5000`,
      );
      let deleted = 0;
      let failed = 0;
      for (const candidate of candidates.rows) {
        try {
          const removed = await transaction(async (client) => {
            const identity = await lock(client, candidate.userId);
            if (!identity) return false;
            const grants = await client.query(
              "SELECT 1 FROM demo_session_grant WHERE user_id = $1 LIMIT 1",
              [identity.userId],
            );
            if (
              !cleanupDue(identity, await clock(client), grants.rows.length > 0)
            )
              return false;
            // There are no financial tables in this slice. Add their owner-scoped
            // deletion here before metadata when the financial aggregates ship.
            await client.query(
              "DELETE FROM demo_identity_metadata WHERE user_id = $1",
              [identity.userId],
            );
            const auth = createAuth(createDatabase(client), config, true);
            // Use the pinned provider's own lifecycle, within this transaction.
            await (
              await auth.$context
            ).internalAdapter.deleteUser(identity.userId);
            return true;
          });
          if (removed) deleted++;
        } catch {
          failed++;
          console.error("Demo cleanup transaction failed.");
        }
      }
      await pool.query(
        "DELETE FROM demo_creation_limit WHERE reset_at <= clock_timestamp()",
      );
      return { deleted, failed };
    },
  };
};

export type DemoService = ReturnType<typeof createDemoService>;
