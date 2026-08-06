# Backend Architecture

**Status:** Accepted
**Last verified:** 2026-08-06

## Responsibilities

Fastify hosts the JSON API and Better Auth endpoints. It validates input and output, derives authenticated identity, enforces ownership, coordinates financial workflows, maps database records to public contracts, and logs unexpected failures safely.

## Module Structure

```text
apps/api/src/
├── app.ts                  application factory
├── server.ts               environment loading and network listening
├── plugins/
│   ├── auth.ts
│   ├── database.ts
│   ├── errors.ts
│   └── validation.ts
├── modules/
│   ├── accounts/
│   ├── budgets/
│   ├── dashboard/
│   ├── demo/
│   └── transactions/
└── shared/
```

`app.ts` creates a testable Fastify instance without listening. `server.ts` validates configuration, starts the listener, and handles graceful shutdown.

## Request Layers

```text
Route schema
→ authentication hook
→ thin route handler
→ application service
→ ownership-scoped query
→ PostgreSQL
```

- Route schemas validate parameters, query strings, bodies, and documented responses.
- Request and response schemas follow the strictness, omission, serialization,
  and primitive rules in [public API contracts](api-contracts.md).
- Handlers translate HTTP details and call one service operation.
- Services enforce business rules and transaction boundaries.
- Query functions express database access and always include ownership where required.

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

- One shared `pg.Pool` is created at startup and closed during shutdown.
- Health checks prove process readiness without exposing sensitive details.
- Structured logs include request and correlation context but exclude credentials, cookies, money descriptions where unnecessary, and database secrets.
- Better Auth supplies authentication rate limiting; application mutation and public-entry rate limits are finalized before public launch.
