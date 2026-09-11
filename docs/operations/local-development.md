# Local Development

**Status:** Current for the deployed walking skeleton
**Last verified:** 2026-09-11

This document describes the runnable deployed walking skeleton. Schema,
migration, seed, integration-test, and browser-test setup will be added by the
vertical slices that first require persistent application data.

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
pnpm dev
```

Set the variables from `.env` in the shell that starts Steward; the application
does not automatically load environment files. The root `predev` script builds
`@steward/contracts` before starting workspace development processes. Vite
proxies relative `/api` requests to the local API. `GET /api/health` runs a
minimal PostgreSQL readiness query. The account-access shell does not display
the health response; verify the endpoint directly when checking local API and
database readiness.

No application schema or seed data is required for this readiness check.

## Current Checks

```text
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Planned Setup and Commands

When persistence and browser workflows are implemented, this guide will add
safe environment-file setup, local PostgreSQL creation, migrations, seed data,
integration tests, and end-to-end tests. The corresponding planned command
interface is:

```text
pnpm db:migrate
pnpm db:seed
pnpm test:integration
pnpm test:e2e
```

No credentials or real financial information belong in local seed data.
