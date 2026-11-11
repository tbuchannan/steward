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

Create a PostgreSQL database and role, then from the repository root:

```text
pnpm install
Copy-Item .env.example .env.local
```

Set `DATABASE_URL` to the local database and generate a unique
`BETTER_AUTH_SECRET`. Next.js and Drizzle Kit load the root `.env.local`.

```text
pnpm db:migrate
pnpm dev
```

Open `http://localhost:3000`. `GET /api/health` checks PostgreSQL readiness.
Apply migrations once for a new database and whenever a branch adds migrations.
The current authentication flows need no seed data.

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
app environment or calling shell.
For a dedicated Neon development database, follow the pooled application and
direct migration connection guidance in [configuration](configuration.md#neon-connections).

## Planned Commands

Later slices will add seed data, database integration tests, and
browser tests. The corresponding planned command
interface is:

```text
pnpm db:seed
pnpm test:integration
pnpm test:e2e
```

No credentials or real financial information belong in local seed data.
