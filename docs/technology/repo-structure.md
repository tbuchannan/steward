# Repository Structure

## Decision

Steward will use a monorepo managed with pnpm workspaces.

The repository will contain:

- A React and Vite frontend
- A Fastify backend
- Shared runtime contracts
- End-to-end tests
- Project documentation
- GitHub Actions workflows

Turborepo will not be introduced initially.

pnpm workspaces provide enough functionality for Steward without introducing an additional monorepo orchestration tool.

## Selected Technologies

The repository foundation will use:

- pnpm
- pnpm workspaces
- TypeScript
- GitHub
- GitHub Actions
- A monorepo structure
- TanStack Query
- React Hook Form
- Zod
- `@hookform/resolvers`
- `pg`
- `drizzle-orm/node-postgres`
- Testcontainers for Node.js
- Playwright

## Goals

The repository structure should:

- Keep frontend and backend responsibilities separate
- Allow public Zod contracts to be shared
- Support one dependency installation
- Use one lockfile
- Support consistent TypeScript configuration
- Support independent frontend and backend builds
- Support automated testing
- Remain understandable for one developer
- Make deployment to Vercel and Railway straightforward
- Avoid unnecessary workspace tooling

## Proposed Structure

```text
steward/
├── apps/
│   ├── web/
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── assets/
│   │   │   ├── components/
│   │   │   │   ├── shared/
│   │   │   │   └── ui/
│   │   │   ├── features/
│   │   │   │   ├── accounts/
│   │   │   │   ├── authentication/
│   │   │   │   ├── budgets/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── settings/
│   │   │   │   └── transactions/
│   │   │   ├── hooks/
│   │   │   ├── layouts/
│   │   │   ├── lib/
│   │   │   │   ├── api/
│   │   │   │   ├── auth/
│   │   │   │   ├── environment/
│   │   │   │   ├── query/
│   │   │   │   ├── testing/
│   │   │   │   ├── utilities/
│   │   │   │   └── validation/
│   │   │   ├── routes/
│   │   │   ├── styles/
│   │   │   ├── main.tsx
│   │   │   ├── router.tsx
│   │   │   └── routeTree.gen.ts
│   │   ├── tests/
│   │   ├── components.json
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── vitest.config.ts
│   └── api/
│       ├── drizzle/
│       │   ├── migrations/
│       │   └── meta/
│       ├── src/
│       │   ├── config/
│       │   ├── database/
│       │   │   ├── schema/
│       │   │   ├── seed/
│       │   │   ├── client.ts
│       │   │   └── migrations.ts
│       │   ├── modules/
│       │   │   ├── accounts/
│       │   │   ├── authentication/
│       │   │   ├── budgets/
│       │   │   ├── categories/
│       │   │   ├── dashboard/
│       │   │   ├── demo/
│       │   │   ├── settings/
│       │   │   └── transactions/
│       │   ├── plugins/
│       │   ├── shared/
│       │   ├── app.ts
│       │   └── server.ts
│       ├── tests/
│       ├── drizzle.config.ts
│       ├── package.json
│       ├── tsconfig.json
│       └── vitest.config.ts
├── packages/
│   └── contracts/
│       ├── src/
│       ├── tests/
│       ├── package.json
│       └── tsconfig.json
├── e2e/
│   ├── fixtures/
│   ├── tests/
│   ├── package.json
│   └── playwright.config.ts
├── docs/
│   ├── product/
│   ├── technology/
│   └── ux/
├── .github/
│   └── workflows/
├── .gitignore
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── README.md
```

The exact structure may evolve during implementation.

The main boundaries should remain:

```text
apps/web
→ Browser application

apps/api
→ Server application

packages/contracts
→ Shared public runtime contracts

e2e
→ Full-application browser tests

docs
→ Product, technology, and UX documentation
```

## Workspace Packages

The workspace will initially contain:

```text
apps/web
apps/api
packages/contracts
e2e
```

## Frontend Workspace

The frontend will live in:

```text
apps/web
```

It is responsible for:

- React interface
- Vite development and production builds
- TanStack Router
- TanStack Query
- React Hook Form
- Zod frontend validation
- `@hookform/resolvers`
- Tailwind CSS
- shadcn/ui
- Lucide React
- Frontend unit tests
- React component tests

The frontend must not contain:

- PostgreSQL credentials
- Drizzle database clients
- Better Auth server secrets
- Backend-only environment variables
- Direct database access

## Backend Workspace

The backend will live in:

```text
apps/api
```

It is responsible for:

- Fastify HTTP API
- Better Auth
- Zod request and response validation
- Application services
- Authorization and ownership
- Drizzle ORM
- PostgreSQL through `pg`
- `drizzle-orm/node-postgres`
- One shared `pg.Pool`
- Database migrations
- Database seeds
- PostgreSQL pool shutdown
- Backend unit tests
- Fastify integration tests
- PostgreSQL integration tests

## Shared Contracts Workspace

Shared public contracts will live in:

```text
packages/contracts
```

Possible contents include:

- Public Zod request schemas
- Public Zod response schemas
- Pagination schemas
- Error schemas
- Shared filter schemas
- Shared enums
- Types inferred from public Zod schemas

Example structure:

```text
packages/contracts/src/
├── accounts/
├── authentication/
├── budgets/
├── categories/
├── common/
├── transactions/
└── index.ts
```

The package should not include:

- PostgreSQL connection code
- Drizzle database clients
- Fastify instances
- React components
- Server secrets
- Better Auth server configuration
- Backend environment parsing

Drizzle table definitions should not automatically become public frontend contracts.

## End-to-End Workspace

Playwright tests will live in:

```text
e2e
```

The workspace may contain:

```text
e2e/
├── fixtures/
├── tests/
│   ├── authentication.spec.ts
│   ├── accounts.spec.ts
│   ├── transactions.spec.ts
│   ├── budgets.spec.ts
│   └── demo-reset.spec.ts
└── playwright.config.ts
```

## Package Manager

Steward will use pnpm.

Reasons include:

- Strong workspace support
- Efficient dependency installation
- Strict dependency resolution
- One repository lockfile
- Workspace package references
- TypeScript monorepo compatibility
- Recursive script execution

## Workspace Configuration

The repository will include:

```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "e2e"
```

in:

```text
pnpm-workspace.yaml
```

## Workspace Dependencies

Internal dependencies should use the workspace protocol.

Example:

```json
{
  "dependencies": {
    "@steward/contracts": "workspace:*"
  }
}
```

This ensures the repository version of the package is used.

## Package Names

Recommended workspace package names are:

```text
@steward/web
@steward/api
@steward/contracts
@steward/e2e
```

These packages do not need to be published.

## Root Package

The root package should be private.

Example:

```json
{
  "name": "steward",
  "private": true,
  "packageManager": "pnpm@<pinned-version>"
}
```

The exact pnpm version should be pinned when the repository is initialized.

## Node.js Version

The repository should document a supported Node.js version.

Possible mechanisms include:

- `engines` in `package.json`
- `.nvmrc`
- `.node-version`

Local development, GitHub Actions, Vercel, and Railway should use compatible versions.

## Root Scripts

The root package should coordinate workspace scripts.

Recommended commands include:

```text
dev
build
build:web
build:api
typecheck
lint
format
format:check
test
test:run
test:unit
test:component
test:integration
test:coverage
test:e2e
test:e2e:ui
ci
db:generate
db:migrate
db:seed
```

Expected behavior:

```text
pnpm dev
→ Run the frontend and backend development servers

pnpm build
→ Build workspace packages and applications

pnpm test
→ Run Vitest in watch mode

pnpm test:run
→ Run Vitest once

pnpm test:integration
→ Run Fastify and PostgreSQL integration tests

pnpm ci
→ Run the complete non-interactive validation sequence used by GitHub Actions

pnpm test:e2e
→ Run Playwright

pnpm db:generate
→ Generate Drizzle migration files

pnpm db:migrate
→ Apply committed Drizzle migrations

pnpm db:seed
→ Seed the configured non-production database explicitly
```

## Workspace Commands

pnpm may run scripts recursively:

```bash
pnpm -r build
pnpm -r typecheck
pnpm -r test:run
```

An individual workspace may be selected with a filter:

```bash
pnpm --filter @steward/web dev
pnpm --filter @steward/api dev
```

## Turborepo

Turborepo will not be used initially.

pnpm workspaces are sufficient for:

- Dependency management
- Shared packages
- Recursive scripts
- One lockfile
- Vercel builds
- Railway builds
- GitHub Actions

Turborepo may be reconsidered if Steward later needs:

- Remote build caching
- Complex task dependencies
- Change-aware selective builds
- More advanced monorepo orchestration

It should not be introduced before a clear need exists.

## TypeScript Configuration

The repository should include:

```text
tsconfig.base.json
```

Workspace configurations should extend it.

Examples:

```text
apps/web/tsconfig.json
apps/api/tsconfig.json
packages/contracts/tsconfig.json
```

The shared base configuration may define:

- Strict mode
- Common compiler checks
- Consistent file-name casing
- Common interoperability settings
- Shared unused-code checks

Frontend and backend settings should remain separate where they differ.

## Imports and Package Boundaries

Cross-workspace imports should use package names:

```ts
import { accountSchema } from "@steward/contracts";
```

They should not use filesystem paths that reach into another workspace:

```ts
// Avoid
import { accountSchema } from "../../../packages/contracts/src";
```

Application-local aliases may still be used.

Examples include:

```text
@/components
@/features
@/lib
```

## Dependency Ownership

Dependencies should be installed in the workspace that directly uses them.

Examples:

```text
React
→ apps/web

TanStack Query
→ apps/web

React Hook Form
→ apps/web

@hookform/resolvers
→ apps/web

Lucide React
→ apps/web

Fastify
→ apps/api

Drizzle ORM
→ apps/api

drizzle-orm/node-postgres
→ apps/api

pg
→ apps/api

Testcontainers PostgreSQL integration
→ apps/api

Playwright
→ e2e

Zod
→ packages/contracts and any workspace that directly validates runtime data

Shared Zod contracts
→ packages/contracts
```

Root development dependencies should be limited to repository-wide tools.

## Environment Files

Environment files should remain scoped to the application that consumes them.

Possible files include:

```text
apps/web/.env.example
apps/web/.env.local
apps/api/.env.example
apps/api/.env.local
```

Committed example files should contain variable names and safe sample values.

The repository must not commit:

- Database passwords
- Production database URLs
- Better Auth secrets
- Session tokens
- Private API keys
- Demo-user passwords

## Frontend Environment Variables

Possible frontend variables include:

```text
VITE_API_URL
VITE_APP_ENV
```

These values are exposed to browser-delivered code.

They must not contain server secrets.

## Backend Environment Variables

Possible backend variables include:

```text
NODE_ENV
HOST
PORT
DATABASE_URL
BETTER_AUTH_SECRET
BETTER_AUTH_URL
FRONTEND_ORIGIN
TRUSTED_ORIGINS
LOG_LEVEL
DEMO_USER_EMAIL
```

## Git Ignore

The root `.gitignore` should exclude:

```text
node_modules
dist
coverage
playwright-report
test-results
.env
.env.local
*.local
```

Application-specific generated files should be reviewed individually.

Generated source required by the application may be committed when appropriate.

## Documentation

Documentation will remain in:

```text
docs/
```

Likely categories include:

```text
docs/product/
docs/technology/
docs/ux/
```

Documentation should be updated when accepted architectural decisions change.

## GitHub Actions

GitHub Actions will provide continuous integration.

Workflow files will live in:

```text
.github/workflows/
```

GitHub Actions should run formatting, linting, type checking, unit tests, component tests, Fastify integration tests, PostgreSQL Testcontainer tests, migration verification, builds, and critical Playwright workflows.

The initial project may use one workflow:

```text
.github/workflows/ci.yml
```

It may later be separated into:

```text
ci.yml
e2e.yml
deployment.yml
```

## Deployment Roots

Vercel should deploy the frontend from:

```text
apps/web
```

Railway should deploy the backend from:

```text
apps/api
```

Alternatively, the platforms may use repository-root workspace commands.

The final configuration should remain documented.

## Local Development

Local development will use:

```text
React and Vite frontend
→ Local Fastify backend
→ Locally installed PostgreSQL
```

Docker Compose is not required.

PostgreSQL will be installed and run directly for normal local development.

Testcontainers will be used only for disposable automated integration-test databases.

The frontend and backend do not need to be containerized.

Kubernetes will not be used.

## Testing Layout

Vitest tests may be colocated with source files:

```text
transaction.service.ts
transaction.service.test.ts
```

Integration tests may be placed in:

```text
apps/api/tests/integration/
```

Playwright tests will remain in:

```text
e2e/tests/
```

The convention should remain consistent within each workspace.

## Build Order

The shared contracts package should be built or made available before applications that consume it.

A normal production build should conceptually follow:

```text
packages/contracts
→ apps/web
→ apps/api
```

The frontend and backend may build in parallel after required shared packages are ready.

pnpm scripts should express this clearly without requiring Turborepo.

## Build Outputs

Likely build outputs include:

```text
apps/web/dist/
apps/api/dist/
packages/contracts/dist/
```

Build output should not be committed.

## Versioning

Steward does not initially require independent package versioning.

All workspaces may develop together in one repository.

Changesets or similar release tools should not be added unless packages are later published separately.

## Non-Goals

The initial repository will not use:

- Multiple repositories
- Turborepo
- Nx
- Lerna
- Yarn workspaces
- npm workspaces
- Bazel
- Kubernetes
- Docker Compose as a required local dependency
- Dockerized frontend or backend development as a requirement
- Per-package independent versioning
- Independent package publishing
- Microservice repositories

## Open Decisions

The following setup details may be decided during implementation:

- Exact pnpm version
- Exact Node.js version
- Test colocation convention
- Exact root script implementation
- Exact build-order implementation
- Exact linting configuration
- Exact formatting configuration
- Whether Playwright remains a separate workspace package

## Success Criteria

The repository structure is successful when:

- One pnpm installation resolves all dependencies.
- One lockfile covers the repository.
- Frontend and backend remain clearly separated.
- Shared public contracts can be consumed safely.
- Workspace scripts are easy to run.
- Vercel can build the frontend.
- Railway can build the backend.
- The backend can use one shared `pg.Pool` through `drizzle-orm/node-postgres`.
- Local development works with directly installed PostgreSQL.
- Testcontainers provide disposable PostgreSQL integration databases.
- GitHub Actions can test the repository.
- No unnecessary monorepo orchestration is required.
- New features can be added without breaking package boundaries.
