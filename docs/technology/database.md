# Database

## Decision

Steward will use PostgreSQL as its relational database.

Drizzle ORM will provide the TypeScript schema and query layer.

Drizzle Kit will generate and apply version-controlled migrations.

Better Auth will use its Drizzle PostgreSQL adapter.

Railway PostgreSQL will host the production database.

Testcontainers for Node.js will provide disposable PostgreSQL databases for automated integration testing.

The PostgreSQL driver remains undecided.

## Selected Technologies

The confirmed database technologies are:

- PostgreSQL
- Drizzle ORM
- Drizzle Kit
- Better Auth Drizzle adapter
- Railway PostgreSQL
- Testcontainers for Node.js
- PostgreSQL Testcontainer
- Vitest

Still undecided:

- PostgreSQL driver
- Local PostgreSQL development tooling
- Production backup schedule
- Long-term archival strategy
- Database administration client
- Connection-pool limits
- Read-replica strategy

## Responsibilities

PostgreSQL is responsible for:

- Relational persistence
- Foreign keys
- Unique constraints
- Required values
- Check constraints
- Transactional integrity
- Better Auth records
- Financial account records
- Transaction records
- Category records
- Budget records
- Budget allocations
- User preferences
- Demo-user financial data

Drizzle ORM is responsible for:

- TypeScript table definitions
- Typed selects
- Typed inserts
- Typed updates
- Typed deletes
- Typed joins
- Transactions
- Query composition
- Database relations

Drizzle Kit is responsible for:

- Migration generation
- Migration metadata
- Migration execution
- Schema-difference inspection where appropriate

## Database Architecture

```text
Fastify application
        |
        | Drizzle ORM
        v
PostgreSQL
```

Production:

```text
Railway Fastify service
        |
        | Private database connection
        v
Railway PostgreSQL
```

Integration tests:

```text
Vitest
        |
        | Drizzle ORM
        v
Disposable PostgreSQL Testcontainer
```

## Source of Truth

The Drizzle TypeScript schema is the source of truth for intended database structure.

Version-controlled SQL migrations are the source of truth for how environments evolve over time.

The application should not rely on undocumented manual production changes.

## Schema Approach

Steward will use a code-first schema approach.

The workflow is:

```text
Edit Drizzle schema
→ Generate SQL migration
→ Review generated SQL
→ Commit migration
→ Apply migration
```

Schema changes should not be applied casually through ad hoc production SQL.

Emergency manual changes must be captured in a follow-up migration.

## Proposed Database Structure

A likely structure is:

```text
src/database/
├── client.ts
├── relations.ts
├── schema/
│   ├── auth.ts
│   ├── users.ts
│   ├── accounts.ts
│   ├── categories.ts
│   ├── transactions.ts
│   ├── budgets.ts
│   ├── budget-allocations.ts
│   ├── preferences.ts
│   └── index.ts
├── migrations/
├── seed/
│   ├── demo.ts
│   ├── development.ts
│   └── index.ts
└── utilities/
```

The exact structure depends on repository organization.

## Initial Domain Tables

Likely Steward-owned tables include:

- Financial accounts
- Categories
- Transactions
- Budgets
- Budget allocations
- User preferences
- Transfer links or related transaction metadata
- Demo reset metadata if required

Better Auth will manage its required authentication tables.

## Better Auth Tables

Better Auth's exact schema depends on the installed version and enabled features.

Likely authentication data includes:

- Users
- Sessions
- Accounts or credential records
- Verification records

Steward should not manually redefine Better Auth internals without a documented reason.

Application tables should reference the Better Auth user identifier where ownership is required.

## User Ownership

Every user-owned financial table should include a reliable ownership relationship.

Examples include:

```text
accounts.user_id
transactions.user_id
budgets.user_id
preferences.user_id
```

Ownership may also be inferred through parent relationships in some tables.

Direct ownership columns can simplify secure queries and constraints, but duplication should be deliberate.

## Ownership Requirements

Queries must not trust user IDs provided by clients.

The backend should derive the user ID from the Better Auth session.

A typical owned query concept is:

```text
WHERE resource.id = requestedId
AND resource.userId = authenticatedUserId
```

Ownership rules must be covered by integration tests involving at least two users.

## Identifier Strategy

Primary identifiers should use one consistent strategy.

A likely choice is:

- UUIDs
- PostgreSQL-native UUID columns
- Application-generated or database-generated IDs

The final strategy should consider:

- Drizzle support
- Better Auth compatibility
- URL use
- Test-data generation
- Index size
- Migration simplicity

Sequential numeric IDs should not be introduced alongside UUIDs without a clear reason.

## Timestamps

Most mutable tables should include:

- Created timestamp
- Updated timestamp

Some tables may also include:

- Archived timestamp
- Deleted timestamp
- Last-used timestamp
- Reset timestamp

Timestamp values should be stored consistently.

Likely behavior:

```text
created_at
updated_at
archived_at
```

The exact naming convention should remain consistent throughout the schema.

## Date-Only Values

Transaction dates may represent a calendar date rather than a moment in time.

If time-of-day is not meaningful, use an appropriate PostgreSQL date type.

Budget months should use a representation that clearly identifies:

- Year
- Month

Possible approaches include:

- First day of month as a date
- Separate year and month columns
- A validated canonical month key

The final choice should avoid accidental time-zone shifts.

## Monetary Values

Steward must use a safe canonical representation for money.

Recommended options include:

### Integer minor units

Example:

```text
$72.18
→ 7218
```

Advantages:

- Exact integer arithmetic
- Simple application calculations
- No binary floating-point error

Tradeoffs:

- Currency precision assumptions must be documented
- Display conversion is required

### PostgreSQL numeric

Example:

```text
NUMERIC(14, 2)
```

Advantages:

- Exact decimal representation
- Familiar database display

Tradeoffs:

- Driver values may arrive as strings
- Application arithmetic must remain deliberate

The final representation should be selected before schema implementation.

JavaScript floating-point values should not be the authoritative persistence representation.

## Currency

The MVP may initially support one currency, such as USD.

Even with single-currency support, the schema should document whether currency is:

- Global application configuration
- User preference
- Account-specific
- Transaction-specific

Multi-currency support should not be implied unless the application implements exchange-rate behavior.

## Account Table

A financial account may include:

- ID
- User ID
- Name
- Account type
- Institution
- Starting balance or imported opening balance
- Current balance strategy
- Description
- Archived timestamp
- Created timestamp
- Updated timestamp

Supported account types may include:

- Checking
- Savings
- Credit card
- Cash
- Loan
- Investment

The exact enum must remain aligned across:

- PostgreSQL
- Drizzle
- Zod
- API contracts
- UI controls

## Balance Strategy

Steward must explicitly decide whether account balances are:

### Stored directly

The database stores the current balance.

Tradeoffs:

- Fast reads
- Requires careful synchronization with transactions

### Derived

The balance is calculated from starting balance and transaction activity.

Tradeoffs:

- Stronger source-of-truth model
- More expensive aggregation
- Requires careful transfer behavior

### Hybrid

The application stores cached or reconciled balances while preserving transaction history.

Tradeoffs:

- More complexity
- Requires reconciliation rules

The final strategy should be documented before account and transaction implementation.

## Category Table

Categories may include:

- ID
- User ID or system ownership
- Name
- Type
- Icon reference
- Display order
- Archived state
- Created timestamp
- Updated timestamp

The design should distinguish:

- System categories
- User-created categories
- Income categories
- Expense categories
- Transfer behavior

Deleting a category should not silently corrupt historical transactions.

Archival may be safer than destructive deletion.

## Transaction Table

A transaction may include:

- ID
- User ID
- Account ID
- Category ID
- Type
- Amount
- Description
- Transaction date
- Notes
- Transfer reference
- Created timestamp
- Updated timestamp

Supported types may include:

- Income
- Expense
- Transfer

The exact sign convention must be documented.

## Transaction Sign Convention

Possible strategies include:

### Signed amount

```text
Income: positive
Expense: negative
Transfer out: negative
Transfer in: positive
```

### Positive amount plus explicit type

```text
Amount always positive
Type determines financial direction
```

Either approach can work.

The project must choose one canonical convention and use it consistently across:

- Database
- Drizzle queries
- API contracts
- Frontend forms
- Calculations
- Tests

## Transfers

Transfers should preserve both sides of an account movement.

Possible approaches include:

### Paired transactions

Create one outgoing and one incoming transaction linked by a transfer ID.

### Transfer record plus entries

Create a transfer parent record and related account entries.

The selected design should support:

- Atomic creation
- Atomic deletion
- Consistent editing
- Ownership
- Clear reporting
- Exclusion from income and expense totals

Transfer operations must use a PostgreSQL transaction.

## Budget Table

A budget may include:

- ID
- User ID
- Budget month
- Expected income
- Created timestamp
- Updated timestamp

A user should normally have at most one active budget per month.

This should be protected by a unique constraint.

Conceptually:

```text
UNIQUE(user_id, budget_month)
```

## Budget Allocation Table

A budget allocation may include:

- ID
- Budget ID
- Category ID
- Assigned amount
- Created timestamp
- Updated timestamp

A category should normally appear once per budget.

This can be protected through a unique constraint:

```text
UNIQUE(budget_id, category_id)
```

## Budget Spending

Budget spending should be derived from eligible transactions.

The calculation should define:

- Included transaction types
- Date range
- Category behavior
- Archived-account behavior
- Transfer exclusion
- Refund behavior
- Deleted-transaction behavior

These rules should be tested against real PostgreSQL queries.

## User Preferences

Preferences may include:

- Theme
- Currency
- Date format
- First day of week
- Display density
- Budget defaults

Presentation-only values may remain in browser storage.

Preferences needed across devices should be stored in PostgreSQL.

The project should avoid storing the same preference in multiple authoritative locations.

## Soft Deletion and Archival

Steward may use archival rather than deletion for records that should remain historically meaningful.

Likely archival candidates include:

- Accounts
- Categories

Transaction deletion may be hard or soft depending on audit requirements.

The initial MVP does not require a full immutable accounting ledger, but destructive behavior should be deliberate.

## Foreign Keys

Foreign keys should protect relationships such as:

```text
account.user_id → auth user
transaction.user_id → auth user
transaction.account_id → account
transaction.category_id → category
budget.user_id → auth user
budget_allocation.budget_id → budget
budget_allocation.category_id → category
```

Foreign-key delete behavior must be selected intentionally.

## Delete Behavior

Possible delete actions include:

- Restrict
- Cascade
- Set null

Examples:

- Deleting a budget may cascade to its allocations.
- Deleting a category may be restricted if transactions reference it.
- Deleting an account may be restricted or replaced by archival.
- Deleting a Better Auth user may require an explicit account-deletion workflow.

Database cascades should not replace application authorization.

## Unique Constraints

Likely unique constraints include:

- One budget per user per month
- One category allocation per budget
- Better Auth-required unique values
- User-scoped category names where the product requires uniqueness

Uniqueness rules should match application behavior.

## Check Constraints

Possible check constraints include:

- Supported monetary ranges
- Valid budget month values
- Source and destination accounts differ where represented in one row
- Supported account types
- Supported transaction types
- Non-empty names where database enforcement is useful

Zod validation and PostgreSQL constraints should complement each other.

## Indexes

Indexes should support common query patterns.

Likely indexes include:

```text
accounts(user_id)
transactions(user_id, transaction_date)
transactions(user_id, account_id, transaction_date)
transactions(user_id, category_id, transaction_date)
budgets(user_id, budget_month)
budget_allocations(budget_id)
sessions(user_id)
```

Indexes should be added based on expected access patterns and measured query behavior.

Over-indexing should be avoided.

## Deterministic Ordering

List queries should use deterministic ordering.

For example:

```text
ORDER BY transaction_date DESC, created_at DESC, id DESC
```

A secondary order is important when multiple records share the same primary sort value.

Stable ordering is required for reliable pagination.

## Pagination

Transaction queries will likely use page-based pagination for the MVP.

The database query should support:

- Validated page
- Validated page size
- Maximum page size
- Stable order
- Total count
- Filtered count

Cursor pagination may be considered later for very large datasets.

## Search

Transaction search may include:

- Description
- Notes
- Category name
- Account name

The MVP should prefer straightforward PostgreSQL search behavior.

More advanced full-text search should only be introduced when needed.

User input must remain parameterized through Drizzle.

## Drizzle Schema Organization

Drizzle table definitions should be grouped by domain.

Example:

```text
schema/
├── auth.ts
├── accounts.ts
├── categories.ts
├── transactions.ts
├── budgets.ts
├── preferences.ts
└── index.ts
```

Relations may be declared centrally or close to tables.

The project should use one consistent pattern.

## Drizzle Types

Drizzle may infer:

- Select types
- Insert types
- Update input helpers

These types describe database operations.

They should not automatically become public API contracts.

API schemas should remain deliberate Zod schemas.

## Query Organization

Large Drizzle queries should live in domain query files.

Example:

```text
modules/transactions/transaction.queries.ts
```

Query functions should:

- Accept explicit values
- Enforce ownership
- Project only required fields
- Use parameterized expressions
- Remain testable
- Avoid hidden global state

## Database Client

The backend should initialize one shared connection pool and one shared Drizzle client.

Conceptually:

```text
PostgreSQL pool
→ Drizzle client
→ Fastify database plugin
```

The application must not create a new connection pool for every request.

## Connection Pooling

Connection-pool settings should account for:

- Railway service limits
- PostgreSQL plan limits
- Number of backend replicas
- Test concurrency
- Long-running queries
- Graceful shutdown

The final pool size should be configured through environment-aware defaults.

## PostgreSQL Driver

The PostgreSQL driver remains open.

The evaluation should consider:

- Drizzle compatibility
- Railway compatibility
- Connection pooling
- Testcontainers compatibility
- Transaction support
- Type behavior
- Serverless versus persistent-process behavior

Because the Fastify backend runs as a persistent Railway service, the driver should support ordinary pooled connections reliably.

## Migrations

Drizzle Kit will manage migrations.

Production migrations must be:

- Version controlled
- Reviewed
- Applied in order
- Logged
- Allowed to fail the release
- Kept outside normal request handling

## Migration Workflow

```text
Edit Drizzle schema
→ Generate migration
→ Review generated SQL
→ Run against local test database
→ Run integration tests
→ Commit schema and migration
→ Apply during deployment
```

Generated SQL should be reviewed for:

- Destructive changes
- Table rewrites
- Locking behavior
- Default values
- Nullability
- Index creation
- Data migration needs

## Backward-Compatible Migrations

Complex schema changes should use staged deployment.

Example:

```text
Add nullable column
→ Deploy code supporting old and new schema
→ Backfill data
→ Enforce non-null constraint
→ Remove old column later
```

Destructive changes should not be combined casually with application deployment.

## Production Migration Execution

The deployment process should ensure:

```text
Migration succeeds
→ New backend activates

Migration fails
→ Release stops
```

Migrations should run once per release.

They should not run concurrently from multiple backend replicas.

## Rollbacks

Application rollback does not automatically reverse a database migration.

Migration design should consider compatibility with:

- Current backend
- Previous backend
- Current frontend
- Previous frontend

Down migrations may not always be safe.

Recovery may require a forward-fix migration.

## Seed Data

Seed scripts may support:

- Local development
- Integration tests
- Demo user
- Canonical demo financial data
- Required system categories

Seed scripts should be:

- Explicit
- Predictable
- Idempotent where practical
- Safe for the intended environment

Production startup should not automatically reseed user data.

## Demo Data

Demo data should be owned by a dedicated demo user.

The demo reset should:

- Remove or replace only demo-owned financial data
- Preserve unrelated users
- Run transactionally
- Recreate canonical values
- Avoid exposing credentials

Demo reset should be implemented as an authenticated application service.

## Production Hosting

Railway PostgreSQL will host production data.

The Fastify backend should connect using Railway-provided environment variables.

The primary application connection should use:

```text
DATABASE_URL
```

The backend should not construct production credentials from hard-coded values.

## Private Connectivity

The backend should use Railway private networking where available.

The production database should not be publicly exposed without a clear operational need.

Temporary external access may be required for:

- Approved administration
- Migration troubleshooting
- Recovery
- Local inspection

External access should remain restricted.

## Backups

Production backups should be enabled when Steward reaches production readiness.

The backup plan should document:

- Whether backups are enabled
- Backup frequency
- Retention
- Restore procedure
- Access permissions
- Recovery expectations

Backups do not replace:

- Migration review
- Safe deletion behavior
- Integration testing
- Access control

## Recovery

Database recovery planning should cover:

- Restoring a backup
- Correcting a failed migration
- Rebuilding derived data
- Restoring demo data
- Rotating credentials
- Confirming application compatibility

A restore procedure should be tested before it is considered reliable.

## Local Development

The local PostgreSQL approach remains undecided.

Options include:

- Docker Compose
- Local PostgreSQL installation
- A Railway development database
- A reusable Testcontainer-based development command

The selected approach should:

- Be free or low cost
- Be reproducible
- Match production PostgreSQL behavior
- Support migrations
- Avoid using production data

## Test Database Decision

Automated integration tests will use disposable PostgreSQL Testcontainers.

SQLite will not be used as a substitute for PostgreSQL.

The test database should use the same:

- Drizzle schema
- Migrations
- Constraints
- Query layer
- Better Auth integration

as production.

## Testcontainers Flow

A typical integration-test lifecycle is:

```text
Start PostgreSQL container
→ Receive temporary connection URL
→ Create connection pool
→ Create Drizzle client
→ Apply committed migrations
→ Seed required data
→ Run tests
→ Close pool
→ Stop container
```

The PostgreSQL image version should be pinned.

It should remain compatible with the Railway production major version.

## Test Isolation

Tests must not depend on execution order.

Possible isolation approaches include:

- Truncating tables
- Worker-specific schemas
- Worker-specific databases
- Unique fixture values
- Transaction rollback where compatible

The final approach must work with:

- Better Auth
- Multiple database connections
- Drizzle transactions
- Parallel Vitest execution

## Migration Testing

Integration tests must apply committed migrations to a clean database.

Tests should verify:

- All migrations apply successfully
- Migrations apply in order
- Required tables exist
- Better Auth tables exist
- Required constraints exist
- Important indexes exist
- Current Drizzle queries work
- Seed commands work
- Fastify can start against the migrated schema

A direct schema push is not a replacement for migration testing.

## Constraint Testing

Database tests should cover:

- Required fields
- Foreign keys
- Unique constraints
- Check constraints
- Supported enums
- Delete behavior
- Ownership relationships
- Budget uniqueness
- Allocation uniqueness
- Monetary restrictions
- Date restrictions

## Query Testing

Drizzle query tests should cover:

- Inserts
- Reads
- Updates
- Deletes
- Filtering
- Sorting
- Pagination
- Joins
- Aggregation
- Archived records
- Deterministic ordering
- Ownership
- Transactions

## Ownership Testing

Every user-owned query should be tested with at least two users.

Examples:

```text
User A cannot read User B's account.
User A cannot update User B's transaction.
User A cannot delete User B's budget.
User B's records remain unchanged.
```

Ownership behavior must not rely solely on route-level checks.

## Transaction Testing

Real PostgreSQL transaction tests should cover:

- Transfer creation
- Transfer deletion
- Budget creation with allocations
- Demo reset
- Related transaction updates
- Future batch imports

Tests should deliberately fail after a partial operation and verify that no partial state remains.

## Pagination Testing

Database pagination tests should cover:

- Default page
- Default page size
- Maximum page size
- Empty result
- Final partial page
- Stable ordering
- Filtered counts
- Multiple records sharing the same date

## Filter Testing

Transaction filtering tests should cover:

- Search
- Account
- Category
- Type
- Date range
- Amount range
- Combined filters
- No matches
- Ownership
- Archived-account behavior

## Better Auth Integration Testing

The PostgreSQL Testcontainer must support Better Auth's Drizzle schema.

Integration tests should verify:

- User creation
- Session persistence
- Session lookup
- Logout invalidation
- Ownership links between authentication users and Steward tables

## Seed Testing

Seed tests should verify:

- Clean-database execution
- Expected records
- Idempotence where required
- Demo-user scoping
- No modification of unrelated users
- Safe failure behavior

## Performance

Initial performance work should focus on:

- Transaction-list queries
- Dashboard aggregations
- Budget spending calculations
- Pagination
- Index usage
- Avoiding N+1 queries

Performance changes should be based on measured behavior.

The MVP does not require read replicas, sharding, or distributed databases.

## Security

Database security should include:

- Server-side-only credentials
- Private networking where possible
- Least-privilege access
- No credentials in frontend bundles
- No database URLs in logs
- Parameterized Drizzle queries
- Ownership conditions
- Controlled production access
- Backups
- Secret rotation

## Logging

Database errors may be logged server-side with safe context.

Logs must not include:

- Full connection URL
- Password
- Raw financial payloads
- Session values
- Unnecessary SQL containing sensitive data

Query logging should be limited by environment and operational need.

## Non-Goals

The initial database architecture will not use:

- SQLite
- MongoDB
- MySQL
- Prisma
- Sequelize
- TypeORM
- Supabase database hosting
- Neon database hosting
- Client-side database access
- Production data in automated tests
- Heavy Drizzle mocking
- Manual undocumented production schema changes
- Automatic destructive schema synchronization
- Read replicas
- Sharding
- Multi-region active-active databases

These choices should not change without revisiting the database decision.

## Open Decisions

The following database decisions remain open:

- PostgreSQL driver
- Monetary column representation
- Transaction sign convention
- Account balance strategy
- Local PostgreSQL tooling
- Exact production PostgreSQL version
- Connection-pool size
- Test cleanup strategy
- Backup frequency
- Backup retention
- Administration client
- Final delete and archival policies

## Success Criteria

The database architecture is successful when:

- PostgreSQL stores Steward's relational data reliably.
- Drizzle provides typed schema definitions and queries.
- Drizzle Kit provides reviewed version-controlled migrations.
- Better Auth uses the same PostgreSQL and Drizzle setup.
- User ownership is enforced in database-backed queries.
- Financial values use a safe canonical representation.
- Transfers and multi-record workflows are transactional.
- Migrations apply cleanly to fresh databases.
- Railway PostgreSQL works reliably with the Fastify backend.
- Production credentials remain server-side.
- Testcontainers provide isolated real PostgreSQL environments.
- Integration tests verify constraints, ownership, and rollback.
- Automated tests never depend on production data.
