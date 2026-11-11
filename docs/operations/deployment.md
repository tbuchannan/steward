# Deployment

**Status:** Next.js deployment configuration prepared; production cutover pending

## Topology

Vercel runs the Next.js application, including pages, Better Auth, and the
Steward HTTP API. The browser calls relative `/api/*` URLs on the application
origin. Neon hosts PostgreSQL, as recorded in
[ADR 009](../architecture/decisions/009-neon-postgresql.md).

## Vercel Project

1. Use the repository root and the Next.js framework preset. Clear any
   `apps/web` Root Directory override before deploying this layout.
2. Remove any dashboard Output Directory override for the old static build.
   Use the commands in the root `vercel.json` and the Node.js/npm pins.
3. Set `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and
   `TRUSTED_ORIGINS` as described in [configuration](configuration.md).
   Use the public HTTPS origin for Better Auth. Preserve the existing auth
   secret on the production origin if existing sessions should remain valid.
4. Set the app's `DATABASE_URL` to the Neon pooled endpoint, preserving its TLS
   parameters. Account for up to five client connections per Node.js process
   when sizing the Neon project. Use the direct URL for migration jobs, as
   described in [configuration](configuration.md#neon-connections).

Preview deployments use a separate database and auth secret. Use an explicitly
trusted preview origin or keep authenticated previews disabled until configured.

## Release and Cutover

1. Pass the repository quality checks and test the release against a disposable
   database. When schema changes exist, apply backward-compatible migrations
   once before deploying the app. The Next.js refactor moves existing
   migrations without changing their SQL or journal.
2. Deploy the Next.js application and verify the same-origin routes below.
3. Complete the database cutover below before retiring Railway services.

## Railway to Neon Database Cutover

1. Create the Neon destination and configure separate production and preview
   credentials. Preview/test databases must contain only synthetic data.
2. If existing records must be preserved, stop writes to the source, take a
   final backup, and restore it into Neon using direct connections. Preserve
   authentication tables and the Drizzle migration history. Validate schema,
   row counts, ownership, and sign-in before allowing writes. Keep backups
   outside the repository and out of development/test fixtures.
3. For a fresh database with no data to retain, apply the committed migrations
   to Neon. For a restored database, apply only pending migrations. Run
   `npm run db:migrate` with the direct destination URL in `DATABASE_URL`.
4. Set Vercel's application `DATABASE_URL` to the destination pooled URL and
   redeploy. Preserve the production auth secret and public origin when
   retaining existing sessions. Perform the smoke checks below.
5. Keep the source database and its backup available until verification and
   a Neon restore rehearsal succeed. Once Neon accepts writes, reverting the
   URL alone would lose those writes; reconcile them before any rollback.
6. After accepting the cutover, remove the old Railway services and obsolete
   deployment credentials. Repository changes do not perform these dashboard
   operations or transfer database contents automatically.

## Smoke Checks

- Open `/` and switch between login and registration. `/?mode=signup` opens
  registration directly. Removed `/login` and `/register` paths return 404.
- Verify same-origin `GET /api/health` returns `200 {"status":"ok"}` with
  `Cache-Control: no-store`.
- In a clean browser, verify `/accounts` redirects to `/`.
- With an approved synthetic test account, verify registration or sign-in,
  an authenticated reload of `/accounts`, and sign-out. Check production
  cookies use Secure and HttpOnly and personalized responses are private.
- Verify a stale or revoked session no longer opens the protected page.

As MVP features ship, add demo entry, demo reset, and a representative
financial workflow to release smoke checks. Before public launch, finalize
error monitoring, log retention, availability checks, rate limits, and alert
ownership.
