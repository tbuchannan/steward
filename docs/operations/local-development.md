# Local Development

**Status:** Placeholder until scaffolding
**Last verified:** 2026-07-30

This document will become the executable clean-setup guide when application code exists. Commands below describe the intended interface and must be corrected against the implementation before the first development release.

## Prerequisites

- Repository-pinned Node.js version
- Repository-pinned pnpm version
- Locally installed PostgreSQL
- A container runtime for Testcontainers integration tests

Docker Compose is not required for normal application development.

## Intended Setup

```text
pnpm install
copy safe environment examples
create local PostgreSQL database
pnpm db:migrate
pnpm db:seed
pnpm dev
```

The final guide must include exact supported versions, database creation instructions, local URLs, expected health output, seed identities, and troubleshooting for common setup failures.

## Intended Checks

```text
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration
pnpm build
pnpm test:e2e
```

No credentials or real financial information belong in local seed data.
