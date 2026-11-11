# ADR 008: Consolidate Steward on Next.js

**Status:** Accepted
**Date:** 2026-11-10

## Context

The initial stack used a static React app, a separate Node.js API, and a
deployment rewrite to keep browser requests on one origin. The implementation
has a small HTTP surface and no independent API consumer that needs a separate
service.

## Decision

Use the Next.js App Router at the repository root to serve pages and Node.js Route
Handlers. Use Server Components for server reads and protected page checks,
Client Components for interaction, and HTTP routes for the documented API.
Retain Better Auth, PostgreSQL, Drizzle and the public Zod contracts in
`src/lib/contracts`. Build them together from one root package.
Server modules validate sessions and authorize financial data access. Client
Components cannot import database access or secrets.

Use one Vercel application deployment. The PostgreSQL service remains separate
and requires a connection endpoint reachable from the application runtime.

Supersedes [ADR 001](001-react-vite-spa.md), [ADR 002](002-fastify-api.md),
and [ADR 005](005-vercel-api-proxy.md).

## Consequences

- Local development needs one application server. Production requires no
  external application API or cross-service rewrite.
- Public Route Handlers explicitly validate requests and shape responses
  using Zod. Framework routing does not enforce ownership.
- Auth, readiness, and personalized responses must not be publicly cached.
- PostgreSQL connection limits must account for pools in each runtime process.

## Alternatives

Keeping a separate API behind Next.js preserves separate release cycles but
retains a second runtime and proxy. Replacing the public HTTP interface with
Server Actions would discard the existing API contract. Server Actions may
serve UI-only flows while sharing the same application services.
