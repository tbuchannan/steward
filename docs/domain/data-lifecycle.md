# Data Lifecycle

**Status:** Accepted
**Last verified:** 2026-08-03

## Ownership

Every financial resource belongs to one authenticated identity, directly or through an owning parent. Protected queries derive identity from the validated session and include ownership in the database query.

A resource ID by itself is never authorization.

The Better Auth user ID is the ownership key for Steward-owned aggregate roots.
The following ownership paths are authoritative:

| Entity                      | Ownership path                                                             | Authorization rule                                                                                                      |
| --------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Financial account           | `financial_account.userId -> Better Auth user`                             | Query by account ID and the session-derived user ID.                                                                    |
| Transaction                 | `transaction.userId -> Better Auth user` and an account owned by that user | Query by transaction ID and the session-derived user ID; constrain its account and optional category to the same owner. |
| Category                    | `category.userId -> Better Auth user`                                      | Query by category ID and the session-derived user ID.                                                                   |
| Budget                      | `budget.userId -> Better Auth user`                                        | Query by budget ID and the session-derived user ID.                                                                     |
| Budget allocation           | allocation -> budget -> Better Auth user                                   | Authorize through the budget; constrain the referenced category to the budget owner.                                    |
| Investment balance snapshot | snapshot -> financial account -> Better Auth user                          | Authorize through the parent account.                                                                                   |
| User preference             | `user_preference.userId -> Better Auth user`                               | Query by the session-derived user ID.                                                                                   |
| Demo identity metadata      | `demo_identity_metadata.userId -> Better Auth user`                        | Internal demo entry, reset, and cleanup services only.                                                                  |

Clients never submit an authoritative user ID. A copied ownership key on a child
or relationship row exists only to support a database constraint and must equal
the owning parent's user ID. It does not create a second ownership path.

Cross-user references are rejected by both the service and the database. Root
tables expose an owner-qualified candidate key such as `(id, userId)`.
Transactions use owner-qualified foreign keys to their account and optional
category. Budget allocations use owner-qualified foreign keys to their budget
and category. Children with only one parent, such as investment balance
snapshots, inherit ownership through that required parent foreign key. A
protected request for another user's resource behaves as not found.

## Lifecycle Summary

| Entity                          | Archive behavior                                                | Ordinary permanent deletion                                                         | Approved identity cleanup                                                                                 |
| ------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Financial account               | Supported; preserves transactions and snapshots.                | Not an MVP workflow; a future operation may delete only an account with no history. | Deleted after its transactions and snapshots.                                                             |
| Transaction                     | Not archived.                                                   | Deleted after user confirmation; no tombstone is retained.                          | Deleted before referenced accounts and categories.                                                        |
| Category                        | Supported; preserves transaction and allocation references.     | Not an MVP workflow; references restrict deletion.                                  | Deleted after transactions and allocations.                                                               |
| Budget                          | Not archived; saved empty months remain.                        | Whole-budget deletion is not an MVP workflow.                                       | Deleted after transactions; contained allocations cascade.                                                |
| Budget allocation               | Not archived.                                                   | Removed explicitly through a budget save; cascades with its budget.                 | Removed explicitly or by its budget cascade.                                                              |
| Investment balance snapshot     | Not archived independently; preserved with an archived account. | No independent delete workflow; managed through its investment account.             | Deleted before its account.                                                                               |
| User preference                 | Not archived.                                                   | No regular-user deletion workflow until account deletion is approved.               | Deleted for an expired demo identity.                                                                     |
| Demo identity metadata          | Not archived.                                                   | No public delete workflow.                                                          | Deleted only after expiration is rechecked as part of full demo cleanup.                                  |
| Better Auth records             | Steward defines no archive behavior.                            | Better Auth owns ordinary lifecycle; regular-user deletion is deferred.             | Better Auth user, authentication account, and sessions are deleted for the claimed expired demo identity. |
| Canonical demo seed definitions | Immutable and not user-owned.                                   | Never deleted by user actions.                                                      | Never targeted.                                                                                           |

## Accounts

- An account with transaction or investment snapshot history is archived, not deleted.
- Archived accounts remain referenced by historical transactions and investment balance snapshots.
- Archived accounts are excluded from default lists, selectors, available-cash calculations, and other active summaries.
- An explicit archived view allows inspection.
- Archiving an account does not mutate its balances, dates, transactions, or snapshots.
- Permanent deletion may be supported only for an account with no dependent transaction or snapshot history. It is not an MVP requirement.

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

## User Preferences

- A preference record is an optional singleton for one Better Auth user.
- It is updated independently and is not part of the financial dataset.
- It is removed during expired-demo cleanup, but a demo financial-data reset
  preserves it.

## Demo Records

- Canonical seed definitions are immutable application assets or controlled seed records.
- Every demo visitor owns a separate cloned dataset.
- `demo_identity_metadata` is an application-owned optional singleton keyed by
  Better Auth user ID. Its presence marks a demo identity; regular users have no
  metadata row.
- Metadata records the immutable `createdAt` instant and the required
  `expiresAt` instant used to select cleanup candidates. Reset eligibility comes
  from a valid current session plus the presence of that session user's metadata
  row. The public API never accepts a demo user ID.
- Reset affects only the current demo identity. In one transaction it deletes
  and recreates that user's financial accounts, transactions, categories,
  budgets, allocations, and investment balance snapshots from the canonical
  seed definitions.
- Reset preserves the Better Auth user, authentication account, sessions, demo
  metadata, expiration, and user preferences. It is idempotent with respect to
  the canonical seed state and rolls back completely on failure.
- Cleanup selects only metadata rows whose `expiresAt` is at or before the
  database clock. In one transaction per identity, it rechecks and locks that
  metadata row, removes all Steward-owned data for that user, then removes the
  Better Auth identity through Better Auth-supported server behavior in a safe
  dependency order.
- Cleanup removes financial records, user preferences, demo metadata, sessions,
  authentication accounts, and the Better Auth user. Canonical seed definitions
  and every other regular or demo identity are outside its boundary.
- The Steward-owned dependency order removes transactions, investment snapshots,
  and allocations before their restricted parents; then budgets, categories,
  accounts, preferences, and demo metadata. Better Auth removes its sessions,
  authentication accounts, and user according to its generated schema.
- Cleanup is idempotent: an already-removed identity is a successful no-op, and
  a failure cannot commit a partially removed identity.

## Authentication Records

Better Auth owns its user, authentication-account, session, verification, and
other generated authentication records, including their schema and internal
foreign-key actions. Steward does not add application fields to those tables or
make an authentication account the owner of financial data; Steward references
only the Better Auth user ID.

All Steward-owned foreign keys to a Better Auth user restrict direct user
deletion. This prevents an authentication-table operation from silently
discarding financial history. Regular-user authentication records are retained
until an account-deletion feature is approved. Expired-demo cleanup first
removes the application-owned dependency graph and only then asks Better Auth to
remove its records.

## Foreign-Key Delete Actions

| Relationship                                            | Delete action | Reason                                                                                                                                          |
| ------------------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Better Auth user -> any Steward-owned root or singleton | `RESTRICT`    | Authentication operations must not silently delete financial history; approved cleanup deletes Steward records first.                           |
| Financial account -> transaction                        | `RESTRICT`    | Transaction history requires the account to remain and be archived.                                                                             |
| Financial account -> investment balance snapshot        | `RESTRICT`    | Valuation history requires the account to remain and be archived.                                                                               |
| Category -> transaction                                 | `RESTRICT`    | Deleting a category must not uncategorize history.                                                                                              |
| Category -> budget allocation                           | `RESTRICT`    | Deleting a category must not rewrite saved budgets.                                                                                             |
| Budget -> budget allocation                             | `CASCADE`     | An allocation is contained by one budget and has no meaning without it; whole-budget deletion remains an internal cleanup operation in the MVP. |

No history-preserving relationship uses `SET NULL`. Transaction deletion and
allocation removal are explicit child-row deletions. Demo cleanup uses the
defined dependency order rather than weakening these constraints.
