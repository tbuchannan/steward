# Deployment

**Status:** Walking-skeleton production deployment verified
**Last verified:** 2026-08-31

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

The committed Railway configuration runs:

```text
pnpm --filter @steward/contracts build
pnpm --filter @steward/api build
pnpm --filter @steward/api start
```

The Vercel project builds `@steward/web` from the workspace root and publishes
`apps/web/dist`. The production Railway URL is recorded in the Vercel rewrite
only after Railway assigns and verifies that URL.

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

For the walking skeleton:

1. Create a Railway project from this repository.
2. Add a PostgreSQL service.
3. Add an API service with the repository root as its root directory.
4. Reference the PostgreSQL service's `DATABASE_URL` from the API service.
5. Generate an API public domain.
6. Confirm Railway activates the deployment using `/api/health` from
   `railway.json`.

The committed build and start commands install from the workspace root. The API
uses Railway's assigned `PORT`, maintains one shared five-connection `pg.Pool`,
queries PostgreSQL before returning health success, and closes the pool during
Fastify shutdown.

## Walking-Skeleton Verification

Before this slice is complete:

1. `GET https://<railway-api>/api/health` returns `{ "status": "ok" }`.
2. Vercel rewrites `/api/:path*` to the verified Railway API domain without
   enabling rewrite caching.
3. The Vercel application loads at `/` and at one nested SPA path.
4. The rendered deployment status changes from `checking` to `connected`.
5. The repository CI workflow succeeds for the deployed commit.

Production URLs:

- Frontend: <https://steward-omega-puce.vercel.app>
- API: <https://api-production-ff989.up.railway.app>

The Vercel project is connected to the GitHub repository for automatic
deployments. On 2026-08-31, the production root, a nested SPA path, and the
same-origin `/api/health` rewrite all returned HTTP 200. The health response was
`{ "status": "ok" }` and was not served from the Vercel edge cache.

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
