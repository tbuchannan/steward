# Repository Architecture

**Status:** Accepted
**Last verified:** 2026-07-30

## Layout

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

The final scripts should provide:

```text
pnpm dev
pnpm build
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm test:integration
pnpm test:e2e
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

Exact implementations are added during scaffolding. One lockfile covers all workspaces.

## Versions

Pin the Node.js and pnpm versions in repository-managed configuration. Dependency ranges and the lockfile must support reproducible CI and deployment builds.

## Environment Files

Commit safe `.env.example` files containing variable names and documented sample values. Never commit secrets, production URLs containing credentials, demo passwords, or real financial data.
