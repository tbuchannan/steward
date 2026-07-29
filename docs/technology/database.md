# Database

## Decision

Steward will use PostgreSQL as its relational database and Drizzle ORM as its query layer and schema-management tool.

Drizzle Kit will manage schema migrations.

The confirmed database technologies are:

- PostgreSQL
- Drizzle ORM
- Drizzle Kit
- A PostgreSQL driver supported by Drizzle
- Better Auth’s Drizzle adapter

## Responsibilities

PostgreSQL is responsible for storing:

- Better Auth users
- Better Auth authentication accounts
- Better Auth sessions
- Better Auth verification records where required
- Steward financial accounts
- Transactions
- Categories
- Budgets
- Budget allocations
- User preferences
- Demo-account financial data

Drizzle is responsible for:

- Defining the database schema in TypeScript
- Providing typed queries
- Defining table relationships
- Expressing indexes and constraints
- Managing database transactions
- Generating SQL migrations through Drizzle Kit
- Applying version-controlled migrations
- Providing database access to Fastify services

## Source of Truth

Steward will use a code-first database workflow.

The Drizzle schema files are the source of truth for the database structure.

```text
TypeScript Drizzle schema
→ Drizzle Kit generates SQL migrations
→ Migrations are reviewed and committed
→ Migrations are applied to PostgreSQL
```

Database changes should not be made manually without updating the Drizzle schema and migration history.

## Why PostgreSQL

PostgreSQL was selected because Steward contains strongly relational financial data.

Examples include:

- Users own financial accounts.
- Accounts contain transactions.
- Transactions belong to categories.
- Budgets contain category allocations.
- Dashboard summaries aggregate related financial records.
- Authentication sessions belong to users.

PostgreSQL provides:

- Relational integrity
- Foreign keys
- Transactions
- Constraints
- Indexes
- Aggregation
- Date and time support
- Fixed-precision numeric types

## Why Drizzle ORM

Drizzle was selected because it provides:

- TypeScript-defined schemas
- Typed SQL-like queries
- PostgreSQL support
- Explicit control over generated SQL
- Transactions
- Relations
- Index and constraint definitions
- Version-controlled migration generation
- Better Auth integration
- A relatively small abstraction over SQL

Drizzle should support the application without hiding the relational model or requiring repository-wide generated client code.

## Database Ownership

The Fastify backend owns database access.

The React frontend must not:

- Connect directly to PostgreSQL
- Import the server database client
- Receive database credentials
- Construct database queries
- Treat Drizzle types as a replacement for API contracts
- Determine financial-record ownership without server validation

All database operations should pass through authenticated Fastify routes and application services.

## Proposed Database Structure

A possible structure is:

```text
src/
└── database/
    ├── client.ts
    ├── schema/
    │   ├── index.ts
    │   ├── auth.ts
    │   ├── users.ts
    │   ├── financial-accounts.ts
    │   ├── transactions.ts
    │   ├── categories.ts
    │   ├── budgets.ts
    │   ├── budget-allocations.ts
    │   └── user-preferences.ts
    ├── relations.ts
    ├── migrations.ts
    └── seed/
        ├── index.ts
        └── demo.ts

drizzle/
└── generated migration files

drizzle.config.ts
```

The final location depends on the repository architecture.

If the database code is placed in a shared workspace package, the same responsibilities should remain intact.

## Database Client

The application should expose one configured Drizzle database client.

Conceptually:

```text
PostgreSQL connection pool
→ Drizzle client
→ Fastify database plugin
→ Application services
```

The database client should:

- Use the configured PostgreSQL connection
- Be initialized during application startup
- Be reused across requests
- Be closed during graceful shutdown
- Be available to Better Auth
- Be available to Steward application services
- Avoid creating a new connection per request

## PostgreSQL Driver

The exact PostgreSQL driver should be confirmed during setup.

A likely option is:

```text
pg
```

with:

```text
drizzle-orm/node-postgres
```

The selected driver must support:

- Connection pooling
- Transactions
- Local development
- Integration tests
- The selected deployment provider
- Better Auth’s Drizzle adapter

## Fastify Database Plugin

Fastify should expose Drizzle through a dedicated plugin.

The plugin should:

- Read validated database configuration
- Create the PostgreSQL pool
- Create the Drizzle client
- Decorate Fastify with the database client
- Verify database connectivity where practical
- Close the pool during application shutdown
- Avoid logging database credentials

Conceptually:

```text
fastify.db
```

The final property name should be included in Fastify’s TypeScript declarations.

Feature modules should not create separate Drizzle clients or PostgreSQL pools.

## Drizzle Schema

Database tables should be defined using Drizzle’s PostgreSQL schema APIs.

The schema should define:

- Columns
- Primary keys
- Foreign keys
- Unique constraints
- Check constraints
- Indexes
- Defaults
- Timestamps
- Relationships

Drizzle table definitions should remain focused on persistent structure.

Application workflow logic should remain in services rather than being embedded into schema declarations.

## Schema Organization

Schema files should be organized by domain rather than stored in one very large file.

A possible organization is:

```text
schema/
├── auth.ts
├── financial-accounts.ts
├── transactions.ts
├── categories.ts
├── budgets.ts
├── budget-allocations.ts
└── user-preferences.ts
```

A central file should export the schema expected by:

- The Drizzle client
- Drizzle Kit
- Better Auth’s Drizzle adapter
- Integration tests
- Seed scripts

## Better Auth Schema

Better Auth will use the official Drizzle adapter with PostgreSQL.

The Better Auth schema should be generated using the Better Auth CLI and incorporated into Steward’s Drizzle schema.

The expected authentication tables include records for:

- Users
- Authentication accounts
- Sessions
- Verification records

The generated schema should be reviewed before being committed.

Steward should not independently invent alternate authentication tables that duplicate Better Auth’s schema.

## Better Auth Drizzle Adapter

Better Auth should use:

```text
@better-auth/drizzle-adapter
```

with:

```text
provider: "pg"
```

Conceptually:

```ts
betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
});
```

The actual schema mapping should match the exported Drizzle tables.

If table names are customized, the adapter schema mapping must explicitly connect Better Auth’s expected entities to the corresponding Drizzle tables.

## Authentication and Financial Account Naming

Better Auth uses the word `account` for authentication-provider or credential records.

Steward also uses `account` for financial accounts.

Application code and database naming must distinguish these concepts.

Recommended terminology:

```text
Authentication account
Financial account
```

Possible table names:

```text
auth_account
financial_account
```

The final naming convention should be consistent across:

- Drizzle schema files
- API contracts
- Services
- Documentation
- Tests

## User Identity

The Better Auth user record is Steward’s canonical user identity.

Steward should not create a second unrelated user table.

Financial records should reference the Better Auth user ID directly or through a clearly documented one-to-one profile record if additional application-specific profile information becomes necessary.

## User-Owned Data

User-owned entities include:

- Financial accounts
- Transactions
- Categories
- Budgets
- Budget allocations
- Preferences

Every user-owned record must resolve to a Better Auth user.

Queries involving user-owned data must include ownership conditions derived from the authenticated session.

## Initial Domain Relationships

The initial domain relationship model is:

```text
Better Auth User
├── Financial Accounts
│   └── Transactions
├── Categories
├── Budgets
│   └── Budget Allocations
└── User Preferences
```

Transactions may reference:

- One financial account
- One optional category
- One authenticated owner
- One optional linked transfer

Budget allocations reference:

- One budget
- One category

## Drizzle Relations

Drizzle relations may be defined to support typed relational queries and Better Auth requirements.

Relations should reflect actual foreign-key relationships.

They should not replace database foreign keys.

The schema should avoid:

- Duplicate relation aliases
- Ambiguous reverse relations
- Multiple inconsistent names for the same relationship
- Relations without corresponding ownership rules

When multiple foreign keys reference the same table, relation names should be explicit and consistent.

## Identifiers

Steward-owned tables should use one consistent primary-key strategy.

UUIDs are the preferred initial choice.

The final UUID implementation may use:

- PostgreSQL-generated UUIDs
- Application-generated UUIDs

The choice should remain consistent across Steward-owned tables.

Client-provided identifiers must never be treated as proof of ownership.

## Money Storage

Financial values must not use floating-point database types.

Steward should store monetary values using integer minor units.

Example:

```text
$25.49
→ 2549
```

Recommended PostgreSQL representation:

```text
bigint
```

This applies to:

- Transaction amounts
- Account starting balances where stored
- Budget allocations
- Cached or snapshot financial totals if introduced later

The application must define:

- Currency
- Minor-unit conversion
- Rounding behavior
- Serialization between PostgreSQL and JSON
- Handling of JavaScript bigint values

If bigint serialization becomes too cumbersome, a fixed-precision PostgreSQL numeric strategy may be reconsidered before implementation.

## Currency

The MVP supports one base currency.

Currency values should use stable codes such as:

```text
USD
```

Currency formatting belongs to the frontend.

Stored monetary values must remain independent of visual formatting.

Multi-currency conversion is outside the MVP.

## Dates and Times

The database should distinguish between:

- Transaction business date
- Record creation timestamp
- Record update timestamp
- Session expiration timestamp
- Budget month

System timestamps should be stored consistently in UTC.

Transaction dates may use a date-only PostgreSQL type when time-of-day is not relevant.

Monthly budgets should use an unambiguous year-and-month representation.

## Constraints

Drizzle schema definitions should express database constraints for invariants that must always remain true.

Examples include:

- Required user ownership
- Required account ownership
- Required transaction account
- Unique user email requirements managed by Better Auth
- One budget per user per month
- One allocation per budget and category
- Non-negative budget allocations
- Valid transaction types
- Valid account types
- Valid category ownership

Frontend and Fastify validation should complement database constraints rather than replace them.

## Foreign Keys

Foreign keys should enforce relationships between entities.

Conceptually:

```text
financial_account.user_id
→ Better Auth user

transaction.user_id
→ Better Auth user

transaction.account_id
→ financial_account

transaction.category_id
→ category

category.user_id
→ Better Auth user

budget.user_id
→ Better Auth user

budget_allocation.budget_id
→ budget

budget_allocation.category_id
→ category

user_preference.user_id
→ Better Auth user
```

Deletion behavior should be selected intentionally for every relationship.

## Archival and Deletion

Financial accounts should generally be archived rather than permanently deleted.

Archival preserves:

- Transaction history
- Historical reporting
- Budget calculations
- Dashboard consistency

A financial account may include fields such as:

```text
archived_at
is_archived
```

The final approach should use one consistent archival strategy.

Permanent deletion should be limited to scenarios where dependent financial history does not exist or where deletion has been explicitly designed.

## Query Organization

Drizzle queries should be organized by application domain.

A possible pattern is:

```text
modules/accounts/
├── account.service.ts
├── account.queries.ts
└── account.types.ts
```

Query functions should:

- Accept the authenticated user ID
- Apply ownership conditions
- Return defined domain or API-ready results
- Avoid returning unrelated database fields
- Remain testable independently from Fastify route handlers

Route handlers should not contain large inline Drizzle queries.

## Query Style

Queries should prefer Drizzle’s typed query APIs.

Raw SQL may be used when:

- Drizzle cannot express a required query clearly
- A complex aggregation is easier to understand in SQL
- A PostgreSQL-specific feature provides meaningful value

Raw SQL must remain:

- Parameterized
- Scoped to the authenticated user
- Covered by tests
- Documented when non-obvious

Drizzle should not be treated as a reason to avoid SQL knowledge.

## Transactions

Drizzle transactions should be used when multiple database changes must succeed or fail together.

Examples include:

- Creating linked transfer transactions
- Resetting demo data
- Creating a budget and its allocations
- Importing a transaction batch
- Moving a transaction between accounts where dependent values change

Transaction boundaries should live in application services.

Fastify route handlers should not manually coordinate unrelated database writes.

## Transfers

A transfer between financial accounts should be represented through linked records rather than an unrelated expense and income.

Possible approaches include:

- Two transactions sharing a transfer ID
- A transfer table with two associated transaction records
- A journal-entry model

The final design will be selected during the Financial Domain Model epic.

Transfer creation and deletion must be atomic.

## Derived Values

Values that can be calculated from source records should not be duplicated without a clear reason.

Potential derived values include:

- Current account balance
- Monthly spending
- Budget progress
- Category totals
- Net worth

The initial implementation should calculate these through Drizzle queries and PostgreSQL aggregations.

If cached summaries or snapshots are later introduced, their consistency strategy must be documented.

## Dashboard Queries

Dashboard queries may aggregate:

- Financial accounts
- Transactions
- Categories
- Budgets
- Budget allocations

Expected summaries include:

- Available cash
- Credit debt
- Monthly income
- Monthly spending
- Spending by category
- Budget progress
- Recent transactions
- Items requiring attention

Dashboard-specific query functions may be grouped in a dedicated dashboard module.

## Indexes

Indexes should reflect actual query patterns.

Likely indexes include:

```text
financial_account.user_id

transaction.user_id
transaction.account_id
transaction.category_id
transaction.transaction_date

category.user_id

budget.user_id
budget.month

budget_allocation.budget_id
budget_allocation.category_id
```

Likely composite indexes include:

```text
transaction(user_id, transaction_date)

transaction(user_id, account_id, transaction_date)

transaction(user_id, category_id, transaction_date)

budget(user_id, month)
```

Indexes should be defined in the Drizzle schema and included in generated migrations.

## Search and Filtering

Transaction search and filtering should begin with normal PostgreSQL queries expressed through Drizzle.

Filters include:

- Authenticated user
- Account
- Category
- Date range
- Transaction type
- Amount range

Text search may initially use case-insensitive matching over:

- Merchant
- Description
- Notes where supported

PostgreSQL full-text search or trigram indexes may be considered later if necessary.

## Pagination

Transaction queries should use deterministic ordering.

A default order may be:

```text
transaction_date DESC
created_at DESC
id DESC
```

Offset pagination is acceptable for the MVP.

The query should apply:

- User ownership
- Search
- Filters
- Sorting
- Pagination

in one predictable query flow.

## Migrations

Drizzle Kit will manage Steward’s migrations.

The expected workflow is:

```text
Update Drizzle schema
→ Generate SQL migration
→ Review generated SQL
→ Commit migration
→ Apply migration
```

Expected commands will be based on:

```text
drizzle-kit generate
drizzle-kit migrate
```

Direct schema pushing may be used for temporary local experimentation, but committed environments should use reviewable migrations.

Generated SQL migrations must be checked before being applied.

## Drizzle Configuration

The repository should include:

```text
drizzle.config.ts
```

The configuration should define:

- PostgreSQL dialect
- Schema entry path
- Migration output directory
- Database credentials loaded from environment variables

The configuration must not contain committed secrets.

## Better Auth Schema Generation

Better Auth’s CLI should generate the Drizzle schema required for authentication.

The generated authentication schema should then participate in the normal Drizzle migration workflow.

Conceptually:

```text
Generate Better Auth Drizzle schema
→ Review schema
→ Export it through the database schema
→ Generate Drizzle migration
→ Review SQL
→ Apply migration
```

Better Auth schema generation and Drizzle migrations should not operate as two unrelated migration histories.

## Seed Data

The database package should include deterministic seed logic for:

- Demo Better Auth user
- Authentication credentials where required
- Financial accounts
- Categories
- Transactions
- Budgets
- Budget allocations
- Preferences

Seed data should:

- Be realistic
- Be internally consistent
- Produce meaningful dashboard summaries
- Avoid real financial information
- Be reproducible

## Demo Reset

Demo reset should use a Drizzle transaction.

The reset operation should:

1. Validate the Better Auth session.
2. Confirm the authenticated user is the designated demo user.
3. Delete or restore only that user’s financial records.
4. Recreate the canonical demo dataset.
5. Preserve the Better Auth user identity.
6. Preserve unrelated users.
7. Roll back if any step fails.

Authentication records should not be recreated unless the demo user itself is missing during initial seeding.

## Testing

Integration tests should use PostgreSQL and Drizzle rather than replacing the database layer with broad mocks.

Tests should cover:

- Migrations
- Schema constraints
- Foreign keys
- Drizzle queries
- Transactions
- Better Auth schema integration
- User-data isolation
- Demo seeding
- Demo reset
- Financial aggregations

Unit tests may mock query boundaries when testing isolated application logic.

## Test Database

Tests must use an isolated PostgreSQL database.

The test workflow should support:

- Applying Drizzle migrations
- Seeding required users
- Resetting state
- Running tests independently
- Closing database resources

Tests must not run against:

- Production
- A shared persistent environment
- A developer’s normal local database

## Local Development

Local development should provide a PostgreSQL database that can be started and reset consistently.

Docker is a likely implementation choice but remains a separate infrastructure decision.

Expected environment configuration includes:

```text
DATABASE_URL
```

Local credentials must not be committed.

## Security

Database access should follow these rules:

- Use parameterized Drizzle queries
- Keep credentials outside source control
- Use limited PostgreSQL privileges
- Scope protected queries by authenticated user
- Avoid returning raw database records blindly
- Avoid logging SQL parameters containing sensitive financial data
- Avoid exposing the Drizzle client to the browser
- Use encrypted production connections where supported

## Non-Goals

The initial database architecture will not require:

- Prisma
- Sequelize
- TypeORM
- Multiple ORMs
- Multiple database engines
- Database sharding
- Read replicas
- Event sourcing
- A separate analytics database
- A data warehouse
- Multi-region replication

These should only be introduced in response to concrete requirements.

## Success Criteria

The database architecture is successful when:

- PostgreSQL stores authentication and financial data.
- Drizzle defines the schema in TypeScript.
- Better Auth uses the Drizzle PostgreSQL adapter.
- Drizzle Kit generates reviewable migrations.
- User-owned queries enforce ownership.
- Financial values use a safe storage strategy.
- Database transactions protect multi-record operations.
- Demo data can be seeded and reset safely.
- Integration tests run against isolated PostgreSQL data.
- The schema and queries remain understandable for a solo developer.
