# Configuration

**Status:** Draft pending scaffolding
**Last verified:** 2026-07-30

## Version Pins

At scaffolding, record and enforce exact compatible versions for:

- Node.js
- pnpm
- React and Vite
- TanStack Router and Query
- Fastify and `fastify-type-provider-zod`
- Better Auth and its Drizzle adapter
- Drizzle ORM, Drizzle Kit, PostgreSQL driver, and PostgreSQL
- Tailwind CSS and shadcn/ui CLI
- Vitest, Testcontainers, and Playwright

The lockfile is committed. Dependency upgrades that affect schemas, generated code, runtime requirements, or deployment receive explicit review.

## Frontend

Likely public configuration:

```text
VITE_APP_ENV
```

Production browser API calls use relative `/api` paths. A local API URL or Vite development proxy may be configured without exposing secrets.

## API

Likely server configuration:

```text
NODE_ENV
HOST
PORT
DATABASE_URL
BETTER_AUTH_SECRET
BETTER_AUTH_URL
TRUSTED_ORIGINS
LOG_LEVEL
DEMO_RETENTION_HOURS
DEMO_CLEANUP_SCHEDULE
```

Configuration is parsed with Zod during startup. Missing or invalid required values fail startup with a safe diagnostic.

## Environments

Local, test, preview, and production values are separate. Preview deployments never receive production database credentials or authentication secrets.

Commit `.env.example` files with safe samples. Never prefix a secret with `VITE_`.

## Demo Controls

Demo retention and cleanup are configurable. Rate limits for demo identity creation and reset are documented with the implemented limiter before public launch.
