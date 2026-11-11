# Configuration

**Status:** Current through the authentication vertical slice
**Last verified:** 2026-11-10

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

Demo retention and cleanup are configurable. Rate limits for demo identity creation and reset are documented with the implemented limiter before public launch.
