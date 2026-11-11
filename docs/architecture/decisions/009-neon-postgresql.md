# ADR 009: Neon PostgreSQL Hosting

**Status:** Accepted
**Date:** 2026-11-10

## Context

Steward is retiring Railway and deploying its Next.js application on Vercel.
The database needs a managed PostgreSQL endpoint reachable from that runtime.

## Decision

Use Neon for hosted PostgreSQL. This supersedes only the production hosting
choice in [ADR 003](003-postgresql-drizzle.md). Retain Drizzle ORM, Drizzle Kit,
and the existing `pg.Pool` driver; no schema or financial-rule change is needed.

Use a Neon pooled connection for the application and a direct connection to the
same branch and database for migration and backup tooling. Keep TLS parameters
from the Neon Connect dialog. Both use `DATABASE_URL` in their respective
execution environments; no additional environment variable is read by the app.

## Consequences

- Local PostgreSQL remains supported.
- Preview and test databases must remain separate from production; do not use
  a branch containing production data as a test fixture.
- Recovery retention and restore procedures must be verified for the selected
  Neon project before retiring the former database.
- The provider cutover follows the [deployment runbook](../../operations/deployment.md).

## Alternatives

Keeping Railway conflicts with the chosen hosting migration. Switching to a
Neon-specific driver is unnecessary for the current Node.js PostgreSQL runtime.
