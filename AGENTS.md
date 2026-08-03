# Steward repository guidance

## Project overview

Steward is a TypeScript personal-finance application organized as a pnpm
workspace monorepo.

- `apps/web` contains the React/Vite frontend.
- `apps/api` contains the Fastify API.
- `packages/contracts` contains public Zod schemas and inferred TypeScript types.
- `docs` contains the accepted product, domain, architecture, and quality decisions.

Steward records financial activity but never initiates payments, transfers funds,
or communicates with financial institutions.

## Toolchain

Use the versions declared in the root `package.json`:

- Node.js 24.18.x
- pnpm 11.18.0

Use pnpm for dependency and workspace operations. Do not introduce npm or Yarn
lockfiles.

The repository is still being scaffolded. Check the implemented package scripts
before using commands described as "intended" in the documentation.

## Sources of truth

Start with `docs/README.md`, which identifies the canonical document for each
subject.

- `docs/product/mvp-requirements.md` defines MVP scope.
- `docs/domain/financial-rules.md` defines financial calculations and terminology.
- `docs/domain/data-lifecycle.md` defines archival, deletion, and reset behavior.
- `docs/architecture/overview.md` defines system boundaries.
- `docs/architecture/repository.md` defines package boundaries.
- `docs/quality/testing-strategy.md` defines verification expectations.
- Accepted ADRs record binding architectural decisions.

When documentation disagrees, follow the precedence in `docs/README.md`.
Treat Draft or Placeholder documents as plans that must be checked against the
current implementation.

Do not duplicate financial formulas outside `docs/domain/financial-rules.md`.
Reference stable requirement IDs such as `AUTH-06` or `TXN-03` when documenting
requirement coverage.

## Architecture boundaries

- `apps/web` may import public contracts, but never database code.
- `apps/api` owns authentication, authorization, business rules, and persistence
  coordination.
- `packages/contracts` owns public request and response schemas.
- Packages must not import another package's internal source files.
- Browser code must not authorize access or calculate authoritative ownership.
- Validate runtime boundaries with Zod; TypeScript types alone are insufficient.
- Keep secrets and database credentials out of browser code.

Use `.js` extensions for relative imports in TypeScript ESM source files, matching
the existing code.

## Financial and security invariants

- Represent USD amounts as signed integer minor units; do not use binary
  floating-point arithmetic for money.
- Preserve the canonical amount signs defined in `financial-rules.md`.
- Transactions use date-only `YYYY-MM-DD` values.
- Budgets use `YYYY-MM` values.
- Do not reinterpret stored transaction dates when a timezone changes.
- Enforce record ownership on the server for every protected operation.
- A request for another user's resource should behave as not found.
- Never trust a client-provided user ID as the authenticated identity.
- Demo identities and datasets must remain isolated.
- Never use production credentials or real financial data in tests, fixtures, or
  seed data.

Changing one of these rules requires an explicit documentation and architecture
decision, not an incidental implementation change.

## Testing

Use Vitest for current unit and API tests.

- Add or update tests with behavioral changes.
- Use Fastify `inject()` for API route tests.
- Close Fastify instances in `finally` blocks.
- Test public schemas for accepted input, rejected input, and omitted internal
  fields where relevant.
- Give financial calculations, authorization, authentication, transactional
  consistency, and demo isolation stronger coverage than presentation details.
- Prefer deterministic dates, values, ordering, and clocks.

Do not add large snapshot tests or tests coupled to internal implementation
details.

## Verification

Run the checks relevant to the changed package while developing. Before
completing a broad change, mirror the current CI sequence:

```text
pnpm --filter @steward/contracts build
pnpm format:check
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Do not claim that integration, database, or end-to-end commands passed unless
those scripts exist and were actually run.

Report any checks that could not be run and explain why.

## Repository hygiene

- Keep `pnpm-lock.yaml` synchronized with dependency changes.
- Do not commit `node_modules`, `dist`, coverage output, local environment files,
  editor settings, credentials, or generated secrets.
- Commit only safe `.env.example` files.
- Preserve unrelated user changes in the working tree.
- Update affected documentation when implementation makes it inaccurate.
