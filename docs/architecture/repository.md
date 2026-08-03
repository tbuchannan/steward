# Repository Architecture

**Status:** Accepted
**Last verified:** 2026-08-03

## Current State

The current scaffold contains `apps/web`, `apps/api`, and
`packages/contracts`. The database, shared test-utility, and end-to-end
workspaces shown below are accepted target boundaries but have not yet been
created.

## Target MVP Layout

```text
steward/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   ├── contracts/
│   ├── database/
│   └── test-utils/
├── tests/
│   └── e2e/
├── docs/
├── package.json
├── pnpm-lock.yaml
└── pnpm-workspace.yaml
```

Use pnpm workspaces without Turborepo initially.

## Package Boundaries

- `apps/web` imports public contracts, never database code.
- `apps/api` imports contracts and database packages.
- `packages/contracts` contains public Zod schemas and inferred types.
- `packages/database` contains Drizzle schema, migrations, client creation, and database-only types.
- `packages/test-utils` contains shared factories and fixtures without production runtime dependencies.

Packages do not reach into another package's internal source path.

## Root Commands

The root currently provides:

```text
pnpm dev
pnpm build
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
```

The completed MVP is expected to add:

```text
pnpm test:integration
pnpm test:e2e
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

The missing commands are added with the packages that implement them. One
lockfile covers all workspaces.

## Versions

Pin the Node.js and pnpm versions in repository-managed configuration. Dependency ranges and the lockfile must support reproducible CI and deployment builds.

## Environment Files

Commit safe `.env.example` files containing variable names and documented sample values. Never commit secrets, production URLs containing credentials, demo passwords, or real financial data.
