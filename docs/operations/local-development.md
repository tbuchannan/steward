# Local Development

**Status:** Current for the initial scaffold; database setup pending persistence implementation
**Last verified:** 2026-08-03

This document describes the runnable initial scaffold. Database, integration,
and browser-test setup will be added as those parts of the accepted architecture
are implemented.

## Prerequisites

- Repository-pinned Node.js version
- Repository-pinned pnpm version
- Locally installed PostgreSQL, once persistence is implemented
- A container runtime, once Testcontainers integration tests are implemented

Docker Compose is not required for normal application development.

## Current Setup

```text
pnpm install
pnpm dev
```

The root `predev` script builds `@steward/contracts` before starting workspace
development processes. The current API exposes `GET /api/health`; the frontend
is a placeholder application. Neither currently requires a database or seeded
identity.

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
