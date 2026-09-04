# Local Development

**Status:** Current through the authentication vertical slice
**Last verified:** 2026-09-11

This document describes the walking skeleton plus email/password authentication.
Seed, integration-test, and browser-test setup will be added by the vertical
slices that first require them.

## Prerequisites

- Repository-pinned Node.js version
- Repository-pinned pnpm version
- Locally installed PostgreSQL
- A container runtime, once Testcontainers integration tests are implemented

Docker Compose is not required for normal application development.

## Current Setup

```text
pnpm install
Copy-Item .env.example .env
pnpm db:migrate
pnpm dev
```

Replace the example authentication secret, then set the variables from `.env`
in the shell that starts Steward; the application does not automatically load
environment files. Run `pnpm db:migrate` once for a new database and whenever a
branch adds migrations. The root `predev` script builds
`@steward/contracts` before starting workspace development processes. Vite
proxies relative `/api` requests to the local API. `GET /api/health` runs a
minimal PostgreSQL readiness query, and the frontend displays the result.

The Better Auth schema is required for registration and session workflows. No
seed data is required.

## Current Checks

```text
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Database Commands

```text
pnpm db:generate
pnpm db:migrate
```

Generate a migration only after intentionally changing a Drizzle schema. Review
the generated SQL before applying it. Migrations require `DATABASE_URL` in the
calling shell.

## Planned Commands

When persistence and browser workflows are implemented, this guide will add
safe environment-file setup, local PostgreSQL creation, migrations, seed data,
integration tests, and end-to-end tests. The corresponding planned command
interface is:

```text
pnpm db:seed
pnpm test:integration
pnpm test:e2e
```

No credentials or real financial information belong in local seed data.
