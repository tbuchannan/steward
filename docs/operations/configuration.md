# Configuration

**Status:** Current through guest authentication and lifecycle
**Last verified:** 2026-11-11

## Version Pins

Record compatible versions as each part of the architecture is implemented:

- Node.js
- npm
- Next.js and React
- Better Auth and its Drizzle adapter
- Drizzle ORM, Drizzle Kit, PostgreSQL driver, and PostgreSQL
- Tailwind CSS and shadcn/ui CLI
- Vitest, Testcontainers, and Playwright

The root manifest constrains Node.js and pins npm. Package manifests declare
compatible dependency ranges, and the committed lockfile records exact resolved
versions for reproducible installs. Dependency upgrades that affect schemas,
generated code, runtime requirements, or deployment receive explicit review.

The manifest's `allowScripts` field approves esbuild's dependency install scripts.

Better Auth 1.7.3 is the minimum compatible 1.7 patch for the existing
Steward account schema. [Better Auth's account schema note](https://better-auth.com/blog/1-7-account-schema)
explains the compatibility change.

## Next.js Application

Copy the root `.env.example` to `.env.local`. Browser requests use
relative `/api` URLs in every environment. No client environment variables
are needed.

| Server variable      | Purpose                                                  |
| -------------------- | -------------------------------------------------------- |
| `DATABASE_URL`       | PostgreSQL connection string reachable from this runtime |
| `BETTER_AUTH_SECRET` | Unique secret of at least 32 characters                  |
| `BETTER_AUTH_URL`    | Public application origin, including scheme              |
| `TRUSTED_ORIGINS`    | Comma-separated explicit browser origins                 |

Next.js loads application environment files and controls the listening port.
Drizzle Kit loads the same local files for CLI commands. Runtime configuration
is validated with Zod on first use; missing or invalid values are reported by
variable name without exposing their values. A build does not need credentials.

## Environments

### Neon Connections

For hosted environments, copy the pooled connection string from the Neon
Connect dialog into the application's `DATABASE_URL`. Its hostname contains
`-pooler`. Preserve the supplied TLS parameters (including `sslmode=require`);
never disable certificate verification to work around a connection failure.
The existing `pg` driver supports Neon without a dependency change.

Run `npm run db:migrate` with `DATABASE_URL` set to the **direct**, non-pooled
connection string for the same Neon branch, database, and role. Supply this
through the migration job's secret environment or a dedicated local shell;
shell environment variables take precedence over `.env.local`. Close that shell
afterward so application commands do not accidentally inherit the migration URL.
The current Drizzle configuration reads only `DATABASE_URL`; variables such as
`DATABASE_URL_UNPOOLED` are not automatically used. Local PostgreSQL can use
the same direct URL for both the app and migrations.

See Neon's [connection guidance](https://neon.com/docs/connect/connect-from-any-app)
and [connection pooling documentation](https://neon.com/docs/connect/connection-pooling).

Local, test, preview, and production values are separate. Preview deployments never receive production database credentials or authentication secrets.

Commit `.env.example` files with safe samples. Never prefix a secret with `NEXT_PUBLIC_`.

## Demo Controls

The accepted demo design uses a 24-hour inactivity window, a hard seven-day
lifetime from creation, and a one-hour explicit-extension grace period bounded
by that lifetime. These durations are fixed application policy, not environment
overrides. Cleanup runs daily at 05:00 UTC through the committed Vercel schedule.

| Server variable              | Default | Purpose                                                                       |
| ---------------------------- | ------- | ----------------------------------------------------------------------------- |
| `DEMO_CREATION_LIMIT`        | `10`    | Attempts per client bucket per hour; integer from 1 to 10,000                 |
| `DEMO_CREATION_GLOBAL_LIMIT` | `100`   | Attempts across the deployment per hour; integer from 1 to 100,000            |
| `CRON_SECRET`                | None    | Server-only scheduler secret, at least 32 characters; required to run cleanup |

The limiter is PostgreSQL-backed and counts rejected and failed attempts. The
global bucket limits total creation even across different client addresses.
Vercel deployments (`VERCEL=1`, supplied by the platform) use the ingress-owned
`x-vercel-forwarded-for` header when it contains a valid address. Other
deployments, including local development, use one shared conservative client
bucket and ignore forwarded headers. A custom hosting platform must add an
explicit trusted ingress policy before using address-based buckets. Raw client
addresses are HMACed before persistence. `429` responses include `Retry-After`.

The scheduler sends `Authorization: Bearer <CRON_SECRET>`; ordinary browser
cookies do not authorize cleanup. Missing scheduler configuration fails closed.
Each invocation examines at most 5,000 eligible expired identities and prunes
expired limit buckets. This exceeds the default global allowance of 2,400
creation attempts per day and gives the daily job recovery capacity. The
function permits up to 300 seconds; observe duration and deletion throughput
before raising creation limits. Repeat authenticated invocations to drain a
larger backlog or retry a timed-out job. A failed
identity deletion rolls back independently; the job returns `500` to signal
retry. Reset limiting follows with the seeded MVP workflow.
