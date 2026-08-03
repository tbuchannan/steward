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
- Investment value comes from the latest dated manual snapshot, falling back to
  the opening balance when no snapshot exists.

Financial meaning is defined in [financial rules](../domain/financial-rules.md).
Category, budget, and allocation fields and relationships are defined in
[financial categories and budgets](../domain/financial-categories-budgets.md).
Transaction fields and relationships are defined in
[financial transactions](../domain/financial-transactions.md).
Account fields and relationships are defined in
[financial accounts](../domain/financial-accounts.md).
Logical entity responsibilities and aggregate boundaries are defined in the [financial domain model](../domain/financial-model.md).

## Initial Model

```text
Better Auth user
├── authentication accounts
├── sessions
├── financial accounts
│   └── investment balance snapshots
├── transactions ── financial account, optional category
├── categories
├── budgets
│   └── budget allocations ── category
├── user preferences
└── demo identity metadata
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
- Steward-owned root and singleton foreign keys to the Better Auth user use
  `ON DELETE RESTRICT`; authentication deletion cannot silently cascade through
  financial history.
- User-owned root tables provide an owner-qualified unique key `(id, userId)`.
  Cross-root relationships use composite foreign keys that include `userId`, so
  PostgreSQL rejects cross-user account, category, transaction, and budget
  references.
- A copied `userId` on `budget_allocation` is an immutable constraint key, not
  an independent ownership source. It must match both the owning budget and the
  referenced category.
- At most one budget exists per user and month.
- One allocation exists per budget and category.
- Budget months are first-of-month PostgreSQL `date` values.
- Allocation amounts are non-negative signed 64-bit integer minor units.
- Transaction amounts are non-zero.
- Transaction type and amount sign agree, and transaction dates do not precede
  the parent account's opening-balance date.
- Currency is `USD` in the MVP.
- Monetary columns use signed 64-bit storage and application/database constraints
  keep persisted public values within the JavaScript safe-integer range defined
  in [financial rules](../domain/financial-rules.md).
- Account type, transaction type, category group, and category applicability use
  the closed values defined in [financial rules](../domain/financial-rules.md).
- Business dates use PostgreSQL `date` semantics without timezone conversion;
  budget months use `date` values constrained to the first day; audit instants
  use `timestamptz` and are written by the server.
- Financial-account types are restricted to `checking`, `savings`, `cash`,
  `credit_card`, `loan`, and `investment`.
- One investment balance snapshot exists per account and date.
- Category names are case-insensitively unique within a predefined group for one user.
- Account foreign keys from transactions and investment snapshots and category
  foreign keys from transactions and allocations use `ON DELETE RESTRICT`.
  Budget allocations use `ON DELETE CASCADE` from their owning budget. No
  history-preserving relationship uses `SET NULL`. The complete matrix is in
  [data lifecycle](../domain/data-lifecycle.md).

## Demo Identity Metadata

`demo_identity_metadata` is a Steward-owned optional singleton and does not
modify the Better Auth-generated schema:

| Field       | Constraint                                               | Meaning                                                                                              |
| ----------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `userId`    | Primary key; restrictive foreign key to Better Auth user | The temporary demo identity. Presence of this row distinguishes a demo identity from a regular user. |
| `createdAt` | Non-null `timestamptz`                                   | Immutable creation instant written by the server.                                                    |
| `expiresAt` | Non-null `timestamptz`, indexed                          | Absolute instant at or after which cleanup may claim the identity.                                   |

The server derives `userId`; no public request supplies it. Demo entry creates
the Better Auth records, metadata, and cloned Steward dataset as one coordinated
workflow. Reset requires the current session user's metadata row and preserves
that row and its expiration. Cleanup selects indexed expiration candidates,
rechecks the locked metadata row, deletes Steward-owned records in dependency
order, and then removes authentication records through Better Auth-supported
server behavior. Better Auth remains authoritative for its own table shapes and
foreign-key actions.

## Query Rules

- The session-derived user ID is included in every protected root query.
- Child ownership is proved through a join or parent constraint. Relationship
  mutations also use owner-qualified foreign keys; service checks are not the
  only cross-user defense.
- Ordering includes a stable unique tie-breaker.
- The default transaction order is transaction date descending, creation
  timestamp descending, then ID descending.
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

Demo reset replaces only that identity's accounts, transactions, categories,
budgets, allocations, and investment snapshots. It preserves user preferences,
demo metadata, expiration, Better Auth records, and the current session. Expired
demo cleanup removes the full identity-owned graph; regular identities and
canonical seed definitions are never cleanup candidates.

## Testing

Integration tests run against a pinned PostgreSQL container image, apply real
migrations, and verify constraints, ownership, financial queries, rollback, and
seed consistency. Constraint tests attempt cross-user transaction/account,
transaction/category, and budget/category references and assert that PostgreSQL
rejects them. Delete-action tests prove that history-preserving parents are
restricted, budget children cascade only with their budget, and demo cleanup
cannot target regular or unexpired identities. Tests never use SQLite as a
PostgreSQL substitute or access production data.
