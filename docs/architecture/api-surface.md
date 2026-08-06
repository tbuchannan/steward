# Initial API Surface

**Status:** Accepted  
**Last verified:** 2026-08-06

## Purpose

This document defines Steward's initial resource-oriented HTTP surface. It is
the contract blueprint for public Zod schemas and Fastify routes, not a mirror
of PostgreSQL tables or framework internals. Field-level schemas remain in
`packages/contracts` as they are implemented.

The surface covers the accepted MVP requirements. Better Auth continues to own
its authentication request and response details, while Steward owns financial
authorization and the application routes below.

## Conventions

Field-level request, response, validation, strictness, and representation rules
are defined in [public API contracts](api-contracts.md).

- Application routes use the `/api` base path; Better Auth uses `/api/auth/*`.
- Requests and responses use JSON except successful deletes, which return no
  body.
- Protected routes derive the user ID from the validated session. A public
  request never accepts an authoritative user ID.
- A protected request for another user's resource returns `404`; a missing or
  invalid session returns `401`.
- `POST` creates a resource or invokes an explicit command, `PATCH` updates only
  supplied fields, `PUT` replaces the addressed aggregate or upserts a
  naturally keyed child, and `DELETE` permanently removes the addressed
  resource.
- Created resources return `201`. Reads and mutations that return a current
  representation use `200`. A successful delete with no representation uses
  `204`.
- Money is represented as JavaScript-safe signed integer minor units. Business
  dates use `YYYY-MM-DD`, budget months use `YYYY-MM`, and audit timestamps use
  RFC 3339 UTC strings.
- The web application formats date-only values as `MM-DD-YYYY` for display.
  This presentation rule does not change the API value or reinterpret it through
  a timestamp or timezone.
- Collection responses use an `items` array. Paginated collections also return
  `page`, `pageSize`, `totalItems`, and `totalPages`.
- Public resource shapes omit ownership keys and internal persistence details.
  Expected errors use [public API errors](api-errors.md).

## Resource Summary

| Resource           | Responsibility                                                                                | Operations                        |
| ------------------ | --------------------------------------------------------------------------------------------- | --------------------------------- |
| Health             | Report process readiness without private details                                              | Read                              |
| Authentication     | Register, sign in, inspect, and end a Better Auth session                                     | Better Auth-owned                 |
| Demo               | Create an isolated demo identity, expose current demo status, and reset its financial dataset | Read and commands                 |
| Preferences        | Persist the current user's theme and timezone                                                 | Read and update                   |
| Dashboard          | Return one computed current-month overview                                                    | Read only                         |
| Financial accounts | Manage account metadata, lifecycle, calculated balances, and investment valuations            | Collection, detail, and mutations |
| Categories         | Supply reusable user-owned classifications and budget groups                                  | Collection read only for MVP      |
| Transactions       | Manage manually recorded financial activity and user-wide search                              | Collection, detail, and mutations |
| Monthly budgets    | Return and atomically save one month's allocations and computed progress                      | Detail read and replacement       |

Dashboard totals, account balances, budget progress, unbudgeted spending, and
attention items are derived response data, not independently mutable resources.
Budget allocations and investment valuations are children of their owning
aggregate rather than top-level routes.

## Health

| Method and path   | Access | Success | High-level response |
| ----------------- | ------ | ------- | ------------------- |
| `GET /api/health` | Public | `200`   | `{ status: "ok" }`  |

The health response proves that the API process is ready without exposing
configuration, dependency credentials, or financial data.

## Authentication

Better Auth mounts its handler at `/api/auth/*`. The MVP relies on these owned
operations:

| Method and path                | Access         | Responsibility                                                                       |
| ------------------------------ | -------------- | ------------------------------------------------------------------------------------ |
| `POST /api/auth/sign-up/email` | Public         | Register with name, email, and password and establish the supported session behavior |
| `POST /api/auth/sign-in/email` | Public         | Authenticate with email and password                                                 |
| `GET /api/auth/get-session`    | Cookie session | Return the current user and session, or no active session                            |
| `POST /api/auth/sign-out`      | Cookie session | Invalidate the current session                                                       |

Better Auth defines the exact success statuses and JSON shapes for these
routes. Steward public contracts do not copy those schemas. Password
confirmation is client input validation and is never stored or sent as an
authoritative credential field. Protected application routes still perform
server-side authentication and ownership checks.

## Demo

| Method and path        | Access               | Success | High-level response                                                                                      |
| ---------------------- | -------------------- | ------- | -------------------------------------------------------------------------------------------------------- |
| `POST /api/demo`       | Public, rate-limited | `201`   | Demo session summary after isolated identity creation and transactional seeding; sets the session cookie |
| `GET /api/demo`        | Protected            | `200`   | `{ isDemo, expiresAt? }`; never includes another identity or an internal owner ID                        |
| `POST /api/demo/reset` | Protected demo only  | `200`   | Reset completion plus the canonical dataset version needed for client cache invalidation                 |

Reset always targets the session identity and never accepts a user ID. Expired
demo cleanup is an idempotent scheduled service operation, not a public HTTP
route. These boundaries cover `DEMO-01` through `DEMO-05` without exposing
internal lifecycle controls.

## Preferences

| Method and path          | Access    | Success | High-level response                                                      |
| ------------------------ | --------- | ------- | ------------------------------------------------------------------------ |
| `GET /api/preferences`   | Protected | `200`   | Current `{ theme, timezone }` preference representation                  |
| `PATCH /api/preferences` | Protected | `200`   | Updated preferences after validating any supplied theme or IANA timezone |

Identity name and email come from the Better Auth session response and remain
read-only in the MVP. Preferences are separate from the financial dataset, so
demo reset preserves them.

## Dashboard

| Method and path      | Access    | Success | High-level response                                                                                                                    |
| -------------------- | --------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/dashboard` | Protected | `200`   | Current budget month, financial summary, budget progress, recent transactions, spending by category, and deterministic attention items |

The server derives the current month from its clock and the user's persisted
timezone. The dashboard is a composed read model; clients mutate accounts,
transactions, and budgets through their owning resources and then refresh this
representation. No dashboard mutation route exists.

## Financial Accounts

| Method and path                                     | Access    | Success | High-level response                                                                                                                 |
| --------------------------------------------------- | --------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/accounts`                                 | Protected | `200`   | `{ items }` containing account summaries and calculated balances; `status=active` is the default and `status=archived` is supported |
| `POST /api/accounts`                                | Protected | `201`   | Created account detail                                                                                                              |
| `GET /api/accounts/:accountId`                      | Protected | `200`   | Account metadata, calculated balance or current investment valuation, and lifecycle state                                           |
| `PATCH /api/accounts/:accountId`                    | Protected | `200`   | Updated account detail after validating editable metadata and historical effects                                                    |
| `POST /api/accounts/:accountId/archive`             | Protected | `200`   | Archived account detail                                                                                                             |
| `POST /api/accounts/:accountId/restore`             | Protected | `200`   | Restored account detail                                                                                                             |
| `PUT /api/accounts/:accountId/valuations/:asOfDate` | Protected | `200`   | Upserted investment valuation for the date                                                                                          |

Related activity uses `GET /api/transactions?accountId=...`, keeping transaction
pagination and ordering in one contract. Investment valuations reject
non-investment accounts and dates before the opening-balance date. Permanent
account deletion is deferred.

## Categories

| Method and path       | Access    | Success | High-level response                                                                                              |
| --------------------- | --------- | ------- | ---------------------------------------------------------------------------------------------------------------- |
| `GET /api/categories` | Protected | `200`   | `{ items }` containing categories in canonical group order; supports active/all status and applicability filters |

The collection supplies transaction and budget selectors, including historical
archived references when requested. The accepted MVP requires seeded reusable
categories but has no category-management workflow, so category create, detail,
edit, archive, restore, and delete routes are deferred rather than exposing
unused CRUD.

## Transactions

| Method and path                           | Access    | Success | High-level response                                           |
| ----------------------------------------- | --------- | ------- | ------------------------------------------------------------- |
| `GET /api/transactions`                   | Protected | `200`   | Paginated transaction summaries with deterministic ordering   |
| `POST /api/transactions`                  | Protected | `201`   | Created transaction detail                                    |
| `GET /api/transactions/:transactionId`    | Protected | `200`   | Transaction detail with account and optional category summary |
| `PATCH /api/transactions/:transactionId`  | Protected | `200`   | Updated transaction detail                                    |
| `DELETE /api/transactions/:transactionId` | Protected | `204`   | No body                                                       |

The collection accepts validated `page`, `pageSize`, `search`, `accountId`,
`categoryId`, `type`, date-range, and approved sort parameters. Defaults follow
the canonical transaction ordering. Mutations record information only and
return after all affected derived views are transactionally consistent; they
never initiate a payment or transfer.

## Monthly Budgets

| Method and path           | Access    | Success | High-level response                                                                                                           |
| ------------------------- | --------- | ------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/budgets/:month` | Protected | `200`   | Month, saved-state indicator, grouped allocations, category spending, totals, unbudgeted spending, and uncategorized spending |
| `PUT /api/budgets/:month` | Protected | `200`   | The complete saved or derived monthly budget representation after atomically replacing the allocation set                     |

`:month` uses `YYYY-MM`. Reading a never-saved month returns a derived empty
representation rather than `404`. The first non-empty save creates the budget;
saving an untouched empty month is a no-op; removing the last allocation from a
previously saved month preserves its empty budget record. Individual allocation
CRUD routes are intentionally absent because one Save or Cancel action applies
the editor's complete allocation set atomically.

## Explicitly Deferred Surface

The initial API has no routes for:

- account-to-account transfers or payment execution;
- bank, brokerage, Plaid, CSV, price, holding, or security integrations;
- pending, cleared, reconciled, or linked transaction states;
- budget rollover, carryover, or copying a prior month;
- category-management UI operations;
- password recovery, email verification or changes, MFA, social login, or
  session management;
- profile editing, multiple currencies, shared workspaces, or public third-party
  API access;
- ordinary account, budget, category, or user deletion; or
- externally callable demo cleanup.

Adding one of these routes requires the corresponding product and domain
decision first.

## Requirement Coverage

| Area                               | Covered requirements                              |
| ---------------------------------- | ------------------------------------------------- |
| Authentication and ownership       | `AUTH-01` through `AUTH-06`, `QUAL-01`, `QUAL-02` |
| Demo                               | `DEMO-01` through `DEMO-05`, `SET-04`             |
| Dashboard                          | `DASH-01` through `DASH-05`                       |
| Accounts and investment valuations | `ACCT-01` through `ACCT-06`                       |
| Transactions and category lookup   | `TXN-01` through `TXN-08`                         |
| Monthly budgets                    | `BUD-01` through `BUD-09`                         |
| Identity and preferences           | `SET-01` through `SET-05`, `SHELL-03`             |

This surface is consistent with the accepted financial entity model and does
not make derived values, internal cleanup operations, or deferred capabilities
publicly mutable.
