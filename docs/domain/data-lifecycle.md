# Data Lifecycle

**Status:** Accepted
**Last verified:** 2026-08-03

## Ownership

Every financial resource belongs to one authenticated identity, directly or through an owning parent. Protected queries derive identity from the validated session and include ownership in the database query.

A resource ID by itself is never authorization.

## Accounts

- An account with transaction history is archived, not deleted.
- Archived accounts remain referenced by historical transactions.
- Archived accounts are excluded from default lists, selectors, available-cash calculations, and other active summaries.
- An explicit archived view allows inspection.
- Permanent deletion may be supported only for an account with no dependent history. It is not an MVP requirement.

## Transactions

- Transactions may be permanently deleted after confirmation.
- Deletion recalculates affected account, budget, and dashboard results.
- Audit history beyond normal application logs is not an MVP requirement.

## Categories

- Removing a category from a monthly budget removes only its allocation.
- A category referenced by transactions or budget allocations cannot be permanently deleted.
- Referenced categories may be archived and remain visible on historical transactions and saved allocations.
- Archived categories are excluded from selectors for new transactions and allocations but continue to contribute to historical and current calculations.
- Archiving a category does not remove allocations or uncategorize transactions.

## Budgets

- At most one budget exists per user and calendar month.
- A budget record is created on the first save containing at least one allocation.
- Past, current, and future months are editable.
- Removing a budget allocation does not mutate transactions or the reusable category.
- Removing the final allocation leaves an empty record for a previously created budget.
- Deleting an entire historical budget is not an MVP requirement.

## Demo Records

- Canonical seed definitions are immutable application assets or controlled seed records.
- Every demo visitor owns a separate cloned dataset.
- Reset affects only the current demo identity.
- Cleanup affects only expired demo identities.
- Reset and cleanup are transactional and idempotent.

## Authentication Records

Regular-user authentication records are retained until an account-deletion feature is approved. Demo authentication records are deleted after expiration according to the configured retention policy.
