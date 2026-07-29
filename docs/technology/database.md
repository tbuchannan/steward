# Database

## Decision

Steward will use PostgreSQL as its relational database.

PostgreSQL will store:

- Authentication data
- User-owned financial data
- Application preferences
- Demo-account data
- Data required for dashboard summaries and reporting

The ORM or query layer has not yet been selected.

## Responsibilities

PostgreSQL is responsible for persisting:

- Better Auth users
- Better Auth credential accounts
- Better Auth sessions
- Verification records required by Better Auth
- Steward accounts
- Transactions
- Categories
- Budgets
- Budget allocations
- User preferences
- Demo-user financial data

The database should enforce important integrity rules rather than relying entirely on application code.

## Why PostgreSQL

PostgreSQL was selected because Steward has strongly relational data.

Examples include:

- Users own accounts.
- Accounts contain transactions.
- Transactions belong to categories.
- Budgets contain category allocations.
- Dashboard summaries depend on aggregating related financial records.

PostgreSQL provides the relational modeling, constraints, transactions, indexing, and aggregation capabilities required for these workflows.

## Database Ownership

The Fastify backend owns database access.

The frontend must not:

- Connect directly to PostgreSQL
- Receive database credentials
- Construct database queries
- Determine resource ownership without server validation

All database operations should pass through authenticated Fastify routes or server-side application services.

## Initial Domain Entities

The initial Steward domain is expected to include:

```text
User
├── Account
│   └── Transaction
├── Category
├── Budget
│   └── Budget Allocation
└── User Preference
```

Better Auth will also require authentication-related entities such as:

```text
User
Account
Session
Verification
```

The Better Auth `Account` entity represents an authentication method or credential account.

The Steward `Account` entity represents a financial account.

These concepts must use distinct names in application code and database documentation to avoid ambiguity.

Possible names include:

```text
auth_account
financial_account
```

The final table naming convention will be decided during domain and schema design.

## User Identity

The Better Auth user record is the canonical user identity for Steward.

Steward should not create a second unrelated user table for financial ownership.

Financial records should reference the Better Auth user identifier directly or through a clearly documented one-to-one application profile when additional profile data is required.

## User-Owned Data

User-owned entities include:

- Financial accounts
- Transactions
- Categories
- Budgets
- Budget allocations
- Preferences

Every user-owned record must resolve to a Better Auth user.

Queries for user-owned data must always include ownership constraints derived from the authenticated session.

## Authentication Data

Better Auth will store its required authentication records in PostgreSQL.

This includes data used for:

- Users
- Email and password credentials
- Sessions
- Authentication accounts
- Verification behavior if enabled later

Authentication schema changes should be generated or migrated using the supported Better Auth workflow for the selected database adapter.

Steward should not manually recreate Better Auth tables unless there is a documented reason to manage the schema independently.

## Database Schemas

The initial implementation may use the default PostgreSQL `public` schema.

A possible later structure is:

```text
public
├── Steward financial tables
└── Better Auth tables
```

Alternatively, authentication tables may be isolated in a dedicated PostgreSQL schema:

```text
auth
└── Better Auth tables

public
└── Steward financial tables
```

Using a separate schema is optional and should only be adopted if it improves clarity without complicating migrations or local development.

The final schema arrangement should be documented before migrations are committed.

## Identifiers

Primary keys should use one consistent strategy across Steward-owned tables.

UUIDs are a strong candidate because they:

- Can be generated without relying on sequential public identifiers
- Work well across local, test, and deployed environments
- Align with Better Auth's PostgreSQL-compatible identity strategy

The final identifier type should be confirmed during domain-model design.

Client-provided identifiers must never be treated as proof of ownership.

## Money Storage

Financial values must not use floating-point database types.

Monetary amounts should use one of these approaches:

### Integer Minor Units

Store values in the smallest supported unit.

Example:

```text
$25.49
→ 2549 cents
```

Potential PostgreSQL type:

```text
bigint
```

### Fixed-Precision Decimal

Store values using a fixed-precision PostgreSQL numeric type.

Example:

```text
numeric(19, 4)
```

The final choice should be made during domain modeling and used consistently across:

- Account balances
- Transaction amounts
- Budget allocations
- Calculated totals

The application must define clear rounding behavior.

## Currency

The MVP supports one base currency per user or application environment.

Multi-currency conversion is outside the initial scope.

Currency codes should use stable identifiers such as:

```text
USD
```

Currency formatting belongs to the application layer, while stored values should remain independent of presentation formatting.

## Dates and Times

PostgreSQL timestamps should be used consistently.

The database should distinguish between:

- A transaction's financial date
- Record creation time
- Record update time
- Session expiration time
- Budget month

Recommended general behavior:

- Store system timestamps in UTC.
- Preserve transaction dates as business dates.
- Format dates in the user's locale at the application boundary.

A monthly budget should be represented with an unambiguous month identifier rather than an arbitrary display string.

## Constraints

The schema should use database constraints for rules that must always remain true.

Examples include:

- Required foreign keys
- Non-null required fields
- Valid enum or status values
- Unique user email requirements managed by Better Auth
- One budget per user and month where applicable
- One allocation per budget and category
- Valid account ownership
- Valid category ownership
- Non-negative budget allocations

Application validation should complement database constraints rather than replace them.

## Foreign Keys

Foreign keys should enforce relationships between related entities.

Examples:

```text
financial_account.user_id
→ Better Auth user

transaction.account_id
→ financial_account

transaction.category_id
→ category

budget.user_id
→ Better Auth user

budget_allocation.budget_id
→ budget

budget_allocation.category_id
→ category
```

Deletion behavior should be selected intentionally.

Possible behaviors include:

- Restrict deletion
- Cascade deletion
- Set the relationship to null
- Archive the parent record instead of deleting it

Financial history should not be destroyed accidentally through broad cascade rules.

## Archival and Deletion

Financial accounts should generally support archival.

Archiving preserves:

- Transaction history
- Historical balances
- Budget calculations
- Reporting consistency

Permanent deletion may be allowed for newly created records without dependent data, but it should not be the default behavior for accounts with transaction history.

The deletion strategy for users and authentication records must be defined before implementation.

## Transactions

PostgreSQL transactions should be used when an operation changes multiple related records that must succeed or fail together.

Examples include:

- Creating a transfer between two accounts
- Resetting demo-user data
- Creating a budget with allocations
- Updating a transaction and affected derived data
- Importing a batch of transactions

Application services should define transaction boundaries.

HTTP route handlers should not contain scattered transaction-management logic.

## Transfers

A transfer between two financial accounts should not be represented as an unrelated expense and income without a shared relationship.

Possible models include:

- Two linked transaction records
- A transfer record with two transaction entries
- A double-entry-inspired journal structure

The final approach will be selected during financial-domain modeling.

Transfer creation should be atomic.

## Derived Values

Values that can be calculated from source records should not automatically be duplicated in the database without a clear reason.

Potential derived values include:

- Current account balance
- Monthly spending
- Budget progress
- Category totals
- Net worth

The initial implementation should prefer calculating these from source data unless performance or historical requirements justify storing snapshots or cached totals.

If derived values are stored, the application must define how they remain consistent.

## Dashboard Queries

Dashboard summaries may require aggregations across:

- Accounts
- Transactions
- Categories
- Budgets
- Budget allocations

The database design should support efficient queries for:

- Current balances
- Monthly income
- Monthly spending
- Spending by category
- Budget progress
- Recent transactions
- Items requiring attention

Dashboard requirements should influence indexes only after the expected query patterns are documented.

## Indexes

Indexes should be based on actual access patterns.

Likely index candidates include:

```text
financial_account.user_id

transaction.user_id
transaction.account_id
transaction.category_id
transaction.transaction_date

budget.user_id
budget.month

budget_allocation.budget_id
budget_allocation.category_id
```

Composite indexes may be useful for common filtered queries such as:

```text
transaction(user_id, transaction_date)

transaction(user_id, account_id, transaction_date)

budget(user_id, month)
```

Indexes should not be added speculatively to every column.

## Search and Filtering

Transaction search and filtering should initially support predictable relational queries.

Likely filters include:

- User
- Account
- Category
- Date range
- Transaction type
- Amount range

Text search may begin with case-insensitive matching over merchant or description fields.

PostgreSQL full-text search or trigram indexing may be considered later if simple search becomes insufficient.

## Pagination

Transaction lists should use deterministic ordering.

A stable default order may be:

```text
transaction_date DESC
created_at DESC
id DESC
```

Offset pagination is acceptable for the initial MVP.

Cursor pagination may be considered later if transaction volume or performance creates a clear need.

## Connection Management

The Fastify backend should use a shared PostgreSQL connection pool.

The pool should:

- Be initialized during application startup
- Be made available through a Fastify plugin or application service
- Be reused across requests
- Be closed during graceful shutdown
- Use environment-specific limits
- Avoid creating a new database connection per request

Better Auth and Steward application queries may share the same underlying PostgreSQL environment.

Whether they share the exact pool instance depends on the selected adapter and query-layer design.

## Database Plugin

The Fastify application should register database access through a dedicated plugin.

The plugin should:

- Read validated database configuration
- Create the PostgreSQL connection or pool
- Verify connectivity during startup where practical
- Expose database access to dependent modules
- Close connections during application shutdown
- Avoid leaking database credentials into logs

Feature modules should depend on the registered database abstraction rather than creating their own pools.

## Query Layer

The PostgreSQL query layer remains undecided.

Candidates may include:

- Drizzle ORM
- Prisma
- Kysely
- Direct parameterized SQL
- A PostgreSQL client combined with a lightweight query layer

The selection should consider:

- TypeScript support
- Migration workflow
- SQL visibility
- Better Auth compatibility
- Transaction support
- Query flexibility
- Testing
- Maintenance cost
- Learning goals

Selecting PostgreSQL does not require immediately selecting an ORM.

## Migrations

All schema changes should be managed through version-controlled migrations.

Migrations should:

- Be committed to the repository
- Run consistently across local, test, and deployed environments
- Avoid destructive changes without an explicit migration plan
- Include Better Auth schema requirements
- Include Steward financial schema requirements
- Remain compatible with the selected query layer

Direct production schema changes outside the migration workflow should be avoided.

## Seed Data

The project should include deterministic seed data for:

- Demo user
- Financial accounts
- Transactions
- Categories
- Budgets
- Budget allocations
- User preferences where required

Seed data should:

- Be realistic
- Be internally consistent
- Produce meaningful dashboard summaries
- Be reproducible
- Avoid including real personal financial information

The demo reset workflow should restore the canonical seeded state.

## Demo Reset

Resetting the demo account should run as a PostgreSQL transaction.

The reset should:

1. Confirm the authenticated user is the designated demo user.
2. Remove or restore only that user's Steward data.
3. Recreate the canonical financial dataset.
4. Leave the Better Auth user identity intact.
5. Leave other users untouched.
6. Roll back completely if any step fails.

## Local Development

Local development should use a PostgreSQL instance that is easy to start and reset.

Docker is a likely option but has not yet been finalized as a requirement.

Local configuration should include:

- Database host
- Database port
- Database name
- Database user
- Database password
- Connection string where applicable

Development credentials must not be committed to source control.

## Test Database

Automated integration tests should use an isolated PostgreSQL database.

Tests should not run against:

- A developer's normal local database
- The production database
- A shared environment with persistent user data

The test workflow should support:

- Applying migrations
- Seeding required records
- Resetting state between tests
- Testing transactions
- Testing constraints
- Testing user-data isolation

## Configuration

Database configuration should be provided through environment variables.

Likely configuration includes:

```text
DATABASE_URL
```

Separate environments should use separate databases or credentials.

The application should validate the database configuration during startup and fail clearly when it is missing or invalid.

## Security

Database security should include:

- Credentials stored outside source control
- Parameterized queries
- Limited database-user privileges
- Encrypted production connections where supported
- No database access from the browser
- No sensitive connection details in logs
- User ownership enforced in every protected query
- Separate credentials or databases for local, test, and production environments

## Backups and Recovery

Formal enterprise backup infrastructure is outside the MVP.

The selected deployment provider should still support a reasonable database backup or recovery mechanism.

The project documentation should eventually record:

- How migrations are applied
- How the database is backed up
- How demo data is restored
- How local data can be reset
- How production recovery would be approached

## Non-Goals

The initial database design will not require:

- Multiple database engines
- Multi-region replication
- Read replicas
- Database sharding
- Event sourcing
- A separate analytics database
- A data warehouse
- Multi-currency accounting
- Enterprise disaster-recovery guarantees

These should only be introduced in response to concrete requirements.

## Success Criteria

The PostgreSQL decision is successful when:

- Better Auth persists users and sessions correctly.
- Steward financial data is relational and user-owned.
- Financial values use a safe money-storage strategy.
- Constraints protect important invariants.
- Multi-record operations use transactions.
- Database access is centralized through the Fastify backend.
- Migrations are version controlled.
- Demo data can be seeded and reset safely.
- Integration tests use isolated PostgreSQL data.
- The schema remains understandable and maintainable for a solo developer.
