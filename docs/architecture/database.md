# Database Architecture

**Status:** Accepted
**Last verified:** 2026-08-03

## Decisions

- PostgreSQL is the production and integration-test database.
- Drizzle defines typed schema and queries.
- Drizzle Kit generates reviewed SQL migrations.
- `pg.Pool` provides runtime connections.
- UUIDs identify Steward financial records.
- Better Auth-generated identifiers remain authoritative for authentication records.
- Money uses signed 64-bit integer minor units.
- Transaction-derived account balance is opening balance plus posted transactions.
- Investment value comes from the latest dated manual snapshot.

Financial meaning is defined in [financial rules](../domain/financial-rules.md).

## Initial Model

```text
Better Auth user
├── authentication accounts
├── sessions
├── financial accounts
│   └── transactions
├── categories
├── budgets
│   └── budget allocations ── category
└── user preferences
```

Likely financial tables:

- `financial_account`
- `transaction`
- `category`
- `budget`
- `budget_allocation`
- `user_preference`
- `demo_identity_metadata`
- `investment_balance_snapshot`

Names are finalized with the generated Better Auth schema to avoid ambiguity between authentication accounts and financial accounts.

## Core Constraints

- Every user-owned root record has a non-null user foreign key.
- At most one budget exists per user and month.
- One allocation exists per budget and category.
- Transaction amounts are non-zero.
- Currency is `USD` in the MVP.
- Monetary columns use signed 64-bit storage and application/database constraints
  keep persisted public values within the JavaScript safe-integer range defined
  in [financial rules](../domain/financial-rules.md).
- Account type, transaction type, category group, and category applicability use
  the closed values defined in [financial rules](../domain/financial-rules.md).
- Business dates use PostgreSQL `date` semantics without timezone conversion;
  budget months use `date` values constrained to the first day; audit instants
  use `timestamptz` and are written by the server.
- Category names are case-insensitively unique within a predefined group for one user.
- Foreign-key delete actions preserve history according to [data lifecycle](../domain/data-lifecycle.md).

## Query Rules

- The session-derived user ID is included in every protected root query.
- Child ownership is proved through a join or parent constraint.
- Ordering includes a stable unique tie-breaker.
- Search and sorting use allowlisted expressions.
- Archived records are excluded unless explicitly requested.

## Migrations

```text
Update Drizzle schema
→ generate SQL migration
→ review SQL
→ test on a clean disposable database
→ commit schema and migration together
→ apply once before code requiring it
```

Production does not use automatic destructive schema synchronization. Rollback planning considers whether the prior application version can read the migrated schema.

## Seed and Demo Data

Development seed commands are explicit and idempotent where practical. Canonical demo definitions use stable semantic identifiers and relative dates. Each visitor receives cloned records under a separate demo identity.

## Testing

Integration tests run against a pinned PostgreSQL container image, apply real migrations, and verify constraints, ownership, financial queries, rollback, and seed consistency. Tests never use SQLite as a PostgreSQL substitute or access production data.
