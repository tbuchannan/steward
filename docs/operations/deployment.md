# Deployment

**Status:** Accepted architecture; runbook pending implementation
**Last verified:** 2026-07-30

## Production Topology

```text
Browser
→ Vercel React/Vite application
→ Vercel /api/* rewrite
→ Railway Fastify service
→ Railway PostgreSQL
```

The rewrite is required by [ADR 005](../architecture/decisions/005-vercel-api-proxy.md). Personalized and authentication API responses must not be cached by the proxy.

## Build Roots

- Vercel builds `apps/web`.
- Railway builds and runs `apps/api`.
- Both install from the repository root using the pinned pnpm version and shared lockfile.

Exact build and start commands are added after scaffolding.

## Release Order

```text
Required CI checks pass
→ Apply backward-compatible database migration once
→ Deploy Railway API
→ Verify API health and compatibility
→ Deploy Vercel frontend
→ Run production smoke checks
```

For a frontend-compatible API-only change, order may vary. A schema change is deployed before code that requires it.

## Vercel

- Unknown application routes rewrite to the SPA entry point.
- `/api/:path*` rewrites to the Railway API.
- API rewrites preserve required request and response headers.
- Authenticated API responses are not edge cached.
- Production and preview configuration are separate.

## Railway

- Fastify listens on the assigned host and port.
- One shared `pg.Pool` observes database connection limits.
- Health checks do not expose sensitive configuration.
- Graceful shutdown stops new work and closes database connections.
- Migrations do not run concurrently in every application replica.

## Preview Environments

Preview frontends use a dedicated non-production API and database or have authenticated behavior disabled until a safe preview strategy exists. Preview hosts are explicitly allowed; an arbitrary `*.vercel.app` trust policy is not used without security review.

## Deployment Gates

- Formatting, linting, and type checking
- Unit, component, API, and database integration tests
- Production frontend and backend builds
- Critical Playwright tests
- Clean migration test

## Smoke Checks

After production deployment:

1. Open the application directly at a nested route.
2. Enter a demo and reload the protected page.
3. Read dashboard data.
4. Create and delete a demo transaction.
5. Reset demo data.
6. Sign out and verify protected-route rejection.

## Observability Before Public Launch

Finalize:

- Error-monitoring provider
- Structured log destination and retention
- Availability checks
- Demo-entry and mutation rate limits
- Alert ownership

These may remain vendor-open during scaffolding but cannot remain behavior-open at public launch.
