# Backend Architecture

**Status:** Accepted
**Last verified:** 2026-08-03

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

The implemented route specification becomes the detailed API reference; this architecture document does not duplicate every endpoint.

Transaction routes mutate only Steward-owned records. They do not integrate with payment rails, banks, brokerages, or money-movement providers.

## Error Contract

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The submitted data is invalid.",
    "details": {
      "fields": {
        "amount": ["Enter a valid amount."]
      }
    }
  }
}
```

Expected application errors map to stable codes and HTTP statuses. Raw PostgreSQL, Drizzle, Zod, stack, cookie, or secret values never appear in public responses.

Authorization failures use a consistent concealment policy: a user-owned resource not accessible to the authenticated user returns `404`, while a missing or invalid session returns `401`.

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
