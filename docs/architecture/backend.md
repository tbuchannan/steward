# Backend Architecture

**Status:** Accepted
**Last verified:** 2026-08-06

## Responsibilities

Next.js Route Handlers host the JSON API and Better Auth endpoints. It validates input and output, derives authenticated identity, enforces ownership, coordinates financial workflows, maps database records to public contracts, and logs unexpected failures safely.

The [authentication architecture](authentication.md) defines which endpoints
are public or protected, the Better Auth versus Steward ownership boundary,
session-derived identity, and the authorization behavior shared by regular and
demo identities.

## Module Structure

`src/app/api` contains the public Next.js Route Handlers.
`src/server` owns the runtime, database, Better Auth, and session
lookup. Add feature services there as financial workflows are implemented.

## Request Layers

- Validate public parameters, query strings, bodies, and responses with Zod.
- Resolve the current session at each protected boundary.
- Keep handlers thin and enforce business rules in server-only services.
- Scope protected queries to the authenticated user and use database
  transactions when partial writes would violate financial consistency.
- Use the same services for Server Components and UI-only Server Actions.

## API Conventions

- Base path: `/api`
- Better Auth path: `/api/auth/*`
- JSON request and response bodies
- Resource-oriented routes
- Page-based pagination for transaction lists
- ISO date-only strings for business dates
- JavaScript-safe JSON integer minor units for money
- RFC 3339 UTC strings for server-generated audit timestamps

Representative application areas:

```text
/api/accounts
/api/transactions
/api/budgets
/api/dashboard
/api/demo/reset
/api/health
```

The [initial API surface](api-surface.md) defines the MVP routes, operations,
success responses, and explicit exclusions. [Public API contracts](api-contracts.md)
defines their shared boundary conventions. Implemented public Zod schemas become
the field-level route specification as each endpoint is built.

Paginated route schemas, query services, and response metadata follow
[API collection queries](api-collections.md). Query services apply ownership
and filters before counting, expand only allowlisted sort values, and keep the
count and page read consistent within one response.

Transaction routes mutate only Steward-owned records. They do not integrate with payment rails, banks, brokerages, or money-movement providers.

## Error Contract

All Steward-owned endpoints use the envelope, stable codes, HTTP mappings,
validation details, ownership concealment, safe translation, and request
correlation rules defined in [public API errors](api-errors.md). In particular,
a user-owned resource not accessible to the authenticated user returns the same
`404 RESOURCE_NOT_FOUND` response as an absent resource, while a missing or
invalid session returns `401 AUTHENTICATION_REQUIRED`.

## Transactions

PostgreSQL transactions protect:

- Demo identity seeding
- Demo reset and cleanup
- Multi-record budget updates
- Any mutation whose partial completion would violate financial consistency

Account-to-account transfers are deferred.

## Runtime

- One lazy `pg.Pool` is reused per Node.js process, with at most five connections.
  Deployment limits must account for pools across runtime instances.
- Health checks prove process readiness without exposing sensitive details.
- Structured logs include request and correlation context but exclude credentials, cookies, money descriptions where unnecessary, and database secrets.
- Better Auth supplies authentication rate limiting; application mutation and public-entry rate limits are finalized before public launch.
