# Configuration

**Status:** Draft; deployed walking-skeleton configuration implemented
**Last verified:** 2026-08-20

## Version Pins

Record compatible versions as each part of the architecture is implemented:

- Node.js
- pnpm
- React and Vite
- TanStack Router and Query
- Fastify and `fastify-type-provider-zod`
- Better Auth and its Drizzle adapter
- Drizzle ORM, Drizzle Kit, PostgreSQL driver, and PostgreSQL
- Tailwind CSS and shadcn/ui CLI
- Vitest, Testcontainers, and Playwright

The root manifest constrains Node.js and pins pnpm. Package manifests declare
compatible dependency ranges, and the committed lockfile records exact resolved
versions for reproducible installs. Dependency upgrades that affect schemas,
generated code, runtime requirements, or deployment receive explicit review.

## Frontend

The walking skeleton does not require browser-exposed environment variables.
Production requests use relative `/api` paths. Local Vite development proxies
those requests to `http://localhost:3000` by default; `STEWARD_API_ORIGIN` may
override that development-only target.

## API

Implemented server configuration:

```text
DATABASE_URL
HOST (default: 0.0.0.0)
PORT (default: 3000; assigned by Railway in production)
```

Configuration is parsed with Zod during startup. A missing or invalid value
fails startup with a diagnostic that names invalid variables but never includes
their values. Authentication, logging, and demo variables are added with the
vertical slices that consume them.

## Environments

Local, test, preview, and production values are separate. Preview deployments never receive production database credentials or authentication secrets.

Commit `.env.example` files with safe samples. Never prefix a secret with `VITE_`.

## Demo Controls

Demo retention and cleanup are configurable. Rate limits for demo identity creation and reset are documented with the implemented limiter before public launch.
