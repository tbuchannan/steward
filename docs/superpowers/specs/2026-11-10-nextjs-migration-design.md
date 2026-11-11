# Next.js consolidation

## Intent and scope

The user authorized replacing every applicable framework responsibility with
Next.js. Preserve existing registration, sign-in, sign-out, accounts shell,
health response, contracts, and database migration history. This is an
architectural migration, not implementation of additional MVP features.

## Architecture

Use one Next.js App Router application in `apps/web`. Route Handlers own
`/api/health` and `/api/auth/*`; pages own `/`, `/register`, `/login`, and
`/accounts`. Server-only modules own configuration, Better Auth, Drizzle,
PostgreSQL, and validated session retrieval. The accounts page validates the
session on the server before rendering. Interactive forms remain Client
Components and use Better Auth's client and Next.js navigation.

Retain public Zod schemas in `packages/contracts`. Explicitly parse public
responses; Next.js does not replace Fastify's validation/serialization policy.
Keep existing migrations unchanged and move them beside the consolidated app.
Initialize runtime dependencies lazily so builds do not need credentials or a
database. Reuse one pool per server process, including development reloads;
deployment connection limits must account for multiple function instances.

## Replacement boundaries

Remove Fastify, its Zod adapter, the API workspace and listener, Vite application
tooling, TanStack Router, the development API proxy, Railway API configuration,
and Vercel external API/SPA rewrites. Use Tailwind PostCSS integration. Vitest
retains its own Vite-based test tooling; Next.js does not replace a test runner.
Keep React, Better Auth, PostgreSQL, Drizzle, Zod, styling, forms, contracts,
TypeScript, pnpm, and testing tools.

## Security and compatibility

Keep secrets server-only. Validate runtime environment without disclosing
values. Preserve Better Auth cookies and provider-owned HTTP contracts through
its official Next.js adapter. Disable caching of authentication, readiness,
and personalized pages. Preserve all financial, ownership, and demo invariants.
Existing financial API specifications remain the intended HTTP interface.
No production services or database records are changed by local migration.

## Deployment

Vercel runs the full Next.js app with `apps/web` as its project root. Build
contracts before Next.js. PostgreSQL must be reachable securely from Vercel;
Railway private DNS is unsuitable for that connection. Operators configure
environment variables, apply migrations once, deploy, verify, and only then
retire the previous API service. Update accepted architecture via ADR 008.

## Verification

Retain component behaviors and database/configuration tests. Add Route Handler
tests for readiness success, safe failure and no-store responses, authentication
body/cookie passthrough, and server session rejection. Run contracts build,
format check, typecheck, lint, tests, and production build; then smoke test
Next.js page routing, missing pages, auth routing, and safe health failure with
synthetic local configuration. Real PostgreSQL authentication integration and
production rollout require a disposable database/deployment and must be
reported separately if unavailable.
