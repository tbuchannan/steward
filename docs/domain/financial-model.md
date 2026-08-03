# Financial Domain Model

**Status:** Draft until schema validation
**Last verified:** 2026-08-03

## Purpose

This document defines the entities, ownership boundaries, and aggregate boundaries required for Steward's MVP. It describes the logical domain model without committing to table names, columns, or ORM implementation details.

The [MVP requirements](../product/mvp-requirements.md) determine initial scope. [Financial rules](financial-rules.md) define calculations and financial meaning, while [data lifecycle](data-lifecycle.md) defines archival, deletion, and reset behavior.

## Ownership Boundaries

### Better Auth-owned entities

Better Auth owns the authentication model:

- **User** is the canonical identity for a registered person or temporary demo visitor.
- **Authentication account** stores the credential or identity-provider relationship used to authenticate a user.
- **Session** represents an authenticated browser session.

Steward references the Better Auth user ID but does not add financial or application fields to Better Auth-owned entities. Better Auth schema generation and migrations remain authoritative for these records.

### Steward-owned entities

Steward owns all application and financial records:

- Financial Account
- Transaction
- Category
- Budget
- Budget Allocation
- User Preference
- Demo Identity Metadata
- Investment Balance Snapshot

Every Steward record belongs to exactly one Better Auth user. Most aggregate
roots store that ownership directly. Transaction ownership is established
through its required financial-account relationship, while child-entity
ownership is established through the owning aggregate. The authenticated
session, never a client-supplied user ID, determines the owner for protected
operations.

## Entity Catalog

### Financial Account

- **Role:** Aggregate root.
- **Responsibility:** Represents one manually maintained checking, savings, cash, credit-card, loan, or investment account.
- **Ownership:** Belongs to exactly one Better Auth user.
- **Relationships:** Non-investment accounts are referenced by transactions. Investment accounts own investment balance snapshots.
- **Lifecycle:** Created and edited independently. An account with transaction history is archived rather than deleted so historical records retain their meaning.
- **Derived behavior:** Checking, savings, cash, credit-card, and loan balances derive from the opening balance and posted transactions. An investment account's current value derives from its newest dated snapshot.

### Transaction

- **Role:** Independently addressable aggregate root.
- **Responsibility:** Records one manual income, expense, or refund event and its contribution to an account's net value.
- **Ownership:** Belongs to exactly one Better Auth user through its required financial account.
- **Relationships:** Must reference one financial account owned by that user and may reference one category owned by the same user.
- **Lifecycle:** Independently identified, queried, edited, and permanently deleted after confirmation.
- **Derived behavior:** Transaction mutations affect account balances, budget spending, dashboard summaries, and attention items. These cross-aggregate effects are coordinated by an application service rather than by nesting the transaction inside another aggregate.

### Category

- **Role:** Aggregate root.
- **Responsibility:** Provides a reusable user-owned classification for income, expense, or both.
- **Ownership:** Belongs to exactly one Better Auth user.
- **Relationships:** May be referenced by many transactions and by budget allocations across many monthly budgets.
- **Lifecycle:** Created, renamed, and archived independently. A referenced category is preserved so transaction and budget history remain meaningful.

### Budget

- **Role:** Aggregate root.
- **Responsibility:** Represents one user's saved allocation plan for one calendar month.
- **Ownership:** Belongs to exactly one Better Auth user.
- **Relationships:** Owns zero or more budget allocations.
- **Lifecycle:** Created on the first save containing at least one allocation. Once created, it remains even if its final allocation is later removed.
- **Consistency boundary:** Allocation changes for a budget are validated and saved together so a partial update cannot leave the month inconsistent.

### Budget Allocation

- **Role:** Child entity within the Budget aggregate.
- **Responsibility:** Assigns an amount from one monthly budget to one reusable category.
- **Ownership:** Inherited through its owning budget.
- **Relationships:** Must reference its budget and one expense-capable category owned by the same user.
- **Lifecycle:** Created, edited, or removed only through its budget. It has no independent meaning without the budget month.

### User Preference

- **Role:** Steward-owned singleton aggregate.
- **Responsibility:** Stores application preferences that do not belong in the authentication schema, including theme and IANA timezone.
- **Ownership:** A preference record belongs to exactly one Better Auth user. A Better Auth user has zero or one preference record.
- **Lifecycle:** Created for a user when needed and updated independently through Settings. Removing authentication identity removes its preferences.

### Demo Identity Metadata

- **Role:** Optional Steward-owned singleton aggregate.
- **Responsibility:** Marks a Better Auth user as a temporary demo identity and records the information required for reset eligibility and expiration cleanup.
- **Ownership:** Has a required relationship to exactly one Better Auth user. A Better Auth user has zero or one demo metadata record.
- **Lifecycle:** Created when a visitor enters the demo and removed when the expired demo identity is cleaned up. Regular registered users have no demo metadata record.
- **Isolation:** Demo visitors never share a mutable identity or dataset. Each visitor receives a separate Better Auth user, session, metadata record, and cloned financial dataset.

### Investment Balance Snapshot

- **Role:** Child entity within the Financial Account aggregate.
- **Responsibility:** Records the signed manual value of one investment account on one date.
- **Ownership:** Inherited through its owning investment account.
- **Relationships:** Must reference exactly one investment financial account.
- **Lifecycle:** Created or replaced through an investment account value update. It has no independent lifecycle or meaning outside that account.
- **Derived behavior:** The newest dated snapshot supplies the investment account's current value.

## Aggregate Boundaries

```text
Better Auth User (external identity root)
|
|-- Financial Account (aggregate root)
|   `-- Investment Balance Snapshot (child)
|-- Transaction (aggregate root)
|-- Category (aggregate root)
|-- Budget (aggregate root)
|   `-- Budget Allocation (child) --> Category
|-- User Preference (singleton aggregate)
`-- Demo Identity Metadata (optional singleton aggregate)
```

Relationships between aggregate roots are references, not containment. In particular:

- A transaction references a financial account and optionally a category, but it remains independently addressable because users search, edit, and delete transactions across accounts.
- A category is not owned by a transaction or budget because it is reused across both and has an independent lifecycle.
- A budget allocation is contained by a budget because it has no independent meaning outside that budget month.
- An investment balance snapshot is contained by an investment account because it describes only that account's value history.
- User Preference and Demo Identity Metadata extend a Better Auth identity without modifying the Better Auth-owned user schema.

Operations that affect several aggregate roots use application services and database transactions where atomicity is required. Examples include demo seeding and reset, multi-allocation budget updates, and transaction changes that refresh derived summaries.

## Initial Model Exclusions

The following concepts are intentionally deferred and are not entities in the MVP model:

- Account-to-account transfers and linked transaction entries
- Investment securities, holdings, quantities, prices, trades, and performance history
- Net-worth history snapshots
- Multiple currencies and exchange rates
- Household workspaces, shared ownership, invitations, and roles
- Recurring transactions and financial goals
- Institution import and synchronization records

These concepts require separate product and modeling decisions before they can alter the initial aggregates.

Steward also explicitly excludes payment execution, bill payment, automated trading, storage of bank credentials, cryptocurrency wallets, and other mechanisms that initiate or authorize movement of real funds.
