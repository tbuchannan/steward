# Steward repository guidance

## Project overview

Steward is a TypeScript personal-finance application in a single Next.js project
at the repository root.

- `src/app` contains the Next.js App Router pages and HTTP API.
- `src/server` contains the application's server-only modules.
- `src/lib/contracts` contains public Zod schemas and inferred TypeScript types.
- `docs` contains the accepted product, domain, architecture, and quality decisions.

Steward records financial activity but never initiates payments, transfers funds,
or communicates with financial institutions.

## Toolchain

Use the versions declared in the root `package.json`:

- Node.js 24.18.x
- pnpm 11.18.0

Use pnpm for dependency management. Do not introduce npm or Yarn lockfiles.

The repository is still being scaffolded. Check the implemented package scripts
before using commands described as "intended" in the documentation.

## Sources of truth

Start with `docs/README.md`, which identifies the canonical document for each
subject.

- `docs/product/mvp-requirements.md` defines MVP scope.
- `docs/domain/financial-rules.md` defines financial calculations and terminology.
- `docs/domain/data-lifecycle.md` defines archival, deletion, and reset behavior.
- `docs/architecture/overview.md` defines system boundaries.
- `docs/architecture/repository.md` defines module boundaries.
- `docs/quality/testing-strategy.md` defines verification expectations.
- Accepted ADRs record binding architectural decisions.

When documentation disagrees, follow the precedence in `docs/README.md`.
Treat Draft or Placeholder documents as plans that must be checked against the
current implementation.

Do not duplicate financial formulas outside `docs/domain/financial-rules.md`.
Reference stable requirement IDs such as `AUTH-06` or `TXN-03` when documenting
requirement coverage.

## Architecture boundaries

- Client Components may import public contracts, but never database or other
  server-only modules.
- Next.js server modules own authentication, authorization, business rules,
  and persistence coordination. Route Handlers define the public HTTP API.
- `src/lib/contracts` owns public request and response schemas.
- Browser code must not authorize access or calculate authoritative ownership.
- Validate runtime boundaries with Zod; TypeScript types alone are insufficient.
- Keep secrets and database credentials out of browser code.

Use `.js` extensions for relative imports in TypeScript ESM source files.
In the Next.js app, use the `@/` alias for imports from `src`.

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
- Test Next.js Route Handlers with Web `Request` and `Response` objects.
  Use HTTP integration tests for framework routing and cookie behavior.
- Close test database connections and HTTP servers in `finally` blocks.
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
