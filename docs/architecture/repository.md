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

Use one root manifest and one npm lockfile.

## Root Commands

The root currently provides:

```text
npm run dev
npm run build
npm run start
npm run db:generate
npm run db:migrate
npm run lint
npm run format:check
npm run typecheck
npm run test
```

The completed MVP is expected to add:

```text
npm run test:integration
npm run test:e2e
npm run db:seed
```

Add commands as the corresponding features are implemented.

## Versions

Pin the Node.js and npm versions in repository-managed configuration. Dependency ranges and the lockfile must support reproducible CI and deployment builds.

## Environment Files

Commit safe `.env.example` files containing variable names and documented sample values. Never commit secrets, production URLs containing credentials, demo passwords, or real financial data.
