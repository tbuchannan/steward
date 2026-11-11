# Repository Architecture

**Status:** Accepted
**Last verified:** 2026-11-10

## Current Layout

```text
src/
  app/           Next.js routes, route-specific screens and tests, global CSS
  server/        server-only auth, runtime configuration, and database access
  components/    shared React components
  lib/           shared helpers
    contracts/   public Zod schemas and types
drizzle/         version-controlled SQL migrations and metadata
test/            Node.js contract, route and server tests; component test setup
docs/            product, architecture, and operations
```

## Module Boundaries

- Client Components may import public contracts but cannot access database code.
- Server Components and Route Handlers call server-only services.
- Keep Drizzle schemas, database types, and secrets out of public contracts.
- The planned browser suite will live in `tests/e2e`.

Use one root manifest and one pnpm lockfile.

## Root Commands

The root currently provides:

```text
pnpm dev
pnpm build
pnpm start
pnpm db:generate
pnpm db:migrate
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
```

The completed MVP is expected to add:

```text
pnpm test:integration
pnpm test:e2e
pnpm db:seed
```

Add commands as the corresponding features are implemented.

## Versions

Pin the Node.js and pnpm versions in repository-managed configuration. Dependency ranges and the lockfile must support reproducible CI and deployment builds.

## Environment Files

Commit safe `.env.example` files containing variable names and documented sample values. Never commit secrets, production URLs containing credentials, demo passwords, or real financial data.
