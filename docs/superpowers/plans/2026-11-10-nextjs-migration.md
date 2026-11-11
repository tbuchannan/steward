# Next.js Migration Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Consolidate the existing Steward application into Next.js.

**Architecture:** One App Router workspace, with server-only runtime modules,
HTTP Route Handlers, and interactive React forms. Preserve public contracts and
existing database migrations.

**Tech Stack:** Next.js, React, Better Auth, Drizzle, PostgreSQL, Zod, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-10-nextjs-migration-design.md`

## Global Constraints

- Node.js 24.18.x and pnpm 11.18.0; preserve one pnpm lockfile.
- Preserve financial and ownership invariants and all existing routes.
- Credentials remain in server-only modules; builds require no credentials.
- Use `.js` relative imports in TypeScript ESM source.
- Do not deploy, push, or change production resources.

## Review Focus

- Database downtime returns a safe uncached readiness failure.
- Invalid or expired sessions never render the protected accounts page.
- Auth requests preserve bodies and multiple session cookies.
- Login and registration retain validation and navigation behavior.
- Clean builds work without production environment variables.

## Task 1: Server runtime and HTTP routes

Files: `apps/web/src/server/*`, `apps/web/src/app/api/**/route.ts`,
`apps/web/test/*`, `apps/web/drizzle*`, workspace manifests and test config.

Interfaces: `getRuntime()` returns shared `{ auth, pool }`;
`createAuth(database, config)` returns Better Auth including its session API;
`getSession()` resolves a validated session from Next.js request headers.

- [x] Adapt existing config/database tests and add failing HTTP and session tests.
- [x] Run tests and confirm migration assertions fail before implementation.
- [x] Move database schema/migrations unchanged; add lazy server-only runtime.
- [x] Implement Node.js auth and health Route Handlers, explicit contracts,
      no-store headers, safe failure logging, and validated session retrieval.
- [x] Replace manifest dependencies, install with pnpm, run server tests.

## Task 2: App Router UI

Files: `apps/web/src/app/{layout,page}.tsx`, page route directories,
existing page components/tests, Tailwind PostCSS and TypeScript configuration.

- [x] Adapt the existing behavior tests to the Next.js navigation boundary.
- [x] Replace router/entry points, add server accounts guard and Client Components.
- [x] Preserve links, validation, identity display, sign-out errors and redirects.
- [x] Verify component tests, typechecking, and production compilation.

## Task 3: Remove obsolete infrastructure and document the decision

Files: `AGENTS.md`, README, architecture/operations/quality documents,
ADR 008, Vercel config, environment example, ignore files, root scripts.

- [x] Remove tracked obsolete API/Vite/proxy files and update root DB scripts.
- [x] Record accepted Next.js decision and supersede ADRs 001, 002, 005.
- [x] Update current guidance and operations, including Vercel project root,
      PostgreSQL connectivity, deployment migration, and testing limitations.
- [x] Run the complete documented CI sequence, then local production smoke checks.
- [x] Review the complete diff for data loss, secret exposure, stale references,
      dependency drift, auth caching, and server/browser import boundaries.

## Execution ledger

- Baseline: clean working tree on `feat/172-authentication-slice`; 19 tests pass.
- Ruling: execute the user's authorized migration in the current feature branch;
  no extra approval stages, automatic commits, or production changes.
- Ruling: retain Better Auth client-based forms; replacing the auth provider or
  form library is outside Next.js responsibilities and would add avoidable risk.
- Ruling: pin Better Auth 1.7.3 after PostgreSQL smoke testing reproduced a
  registration failure with 1.7.2. The patch restores compatibility with the
  existing account schema, so migration files remain unchanged.
- Review: keep only the pool global across development reloads and leave
  rolling session cookie refresh to the browser-facing auth handler.
- Verification: all six repository CI commands pass, including 21 tests.
  A production build against disposable PostgreSQL passed the migration,
  health, registration, sign-in, session renewal, sign-out, and access checks.
  Vercel deployment and browser automation were not run.
