# Financial Transactions

**Status:** Accepted
**Last verified:** 2026-08-03

This document is the source of truth for the transaction entity model. Financial
meaning and calculations remain defined in
[financial rules](financial-rules.md), while deletion behavior remains defined
in [data lifecycle](data-lifecycle.md).

## Transaction

`transaction` is a user-owned aggregate root that references one financial
account. It is independently addressed for user-wide search, editing, and
deletion while its required account relationship participates in ownership
enforcement. The MVP has no pending, cleared, reconciled, void, or transfer
transaction states.

| Field             | Required | Meaning                                                       |
| ----------------- | -------- | ------------------------------------------------------------- |
| `id`              | Yes      | Steward-generated UUID                                        |
| `userId`          | Yes      | Owning Better Auth user identifier                            |
| `accountId`       | Yes      | Parent financial-account UUID                                 |
| `categoryId`      | No       | Assigned user-owned category UUID; null means uncategorized   |
| `type`            | Yes      | `income`, `expense`, or `refund`                              |
| `amountMinor`     | Yes      | Signed, non-zero 64-bit integer amount in USD minor units     |
| `transactionDate` | Yes      | Date-only value on which the financial activity is recognized |
| `description`     | Yes      | User-visible payee or description                             |
| `notes`           | No       | Additional user-entered detail                                |
| `createdAt`       | Yes      | Immutable UTC creation timestamp                              |
| `updatedAt`       | Yes      | UTC timestamp of the latest persisted change                  |

The server derives `userId` from the authenticated session; clients never
supply it. The account relationship is required. Checking, savings, cash,
credit-card, and loan accounts accept transactions; investment accounts use
manual balance snapshots and reject them. A transaction stores no separate
currency because the MVP account currency is always `USD`.

The category relationship is optional so uncategorized transactions remain
representable. When present, the category must belong to the same user as the
parent account and be applicable to the transaction type. A refund requires an
expense-capable category even though `categoryId` is nullable for the entity as
a whole. Renaming or archiving the category preserves the relationship and its
history.

## Types and Amount Signs

Users enter a positive decimal magnitude. The server converts that input to
minor units exactly and applies the canonical stored sign before persistence.

| Type      | Stored constraint | Balance effect                                         |
| --------- | ----------------: | ------------------------------------------------------ |
| `income`  | `amountMinor > 0` | Adds positive value                                    |
| `expense` | `amountMinor < 0` | Subtracts value; increases a negative liability        |
| `refund`  | `amountMinor > 0` | Reverses expense activity and does not count as income |

Type and stored sign must agree on create and edit. Zero is rejected. Public
contracts expose the canonical signed minor-unit value; a client-provided sign
never overrides the selected type.

A refund is standalone and has no required link to an original expense. Its
expense-capable category determines the budget activity it reverses, as defined
in [financial rules](financial-rules.md).

## Dates and Ordering

`transactionDate` uses PostgreSQL `date` and the public `YYYY-MM-DD` format. It
is a calendar date, not a timestamp, and a timezone change never reinterprets
it. The date controls balance inclusion, budget-month membership, and monthly
summaries even when the record is entered or edited later.

`createdAt` is assigned once when the row is inserted and is never changed by an
edit. It uses a PostgreSQL timestamp with time zone normalized to UTC. `updatedAt`
changes after a persisted edit but does not affect the default order.

The default transaction order is:

```text
transactionDate descending
→ createdAt descending
→ id descending
```

The UUID primary key is the final unique tie-breaker, so rows with the same
transaction date and creation timestamp remain deterministic across pages. An
index beginning with `accountId` and followed by these ordering fields supports
account-detail queries. User-wide queries restrict directly by the
session-derived `userId` and use the same complete ordering. Approved alternate
sorts still append `id` as a unique tie-breaker.

## Account Balances and Opening Dates

Every transaction is immediately posted. For a transaction-derived account,
the transaction contributes its signed `amountMinor` to the canonical current
balance formula in [financial rules](financial-rules.md). No current-balance
column is updated alongside the transaction ledger.

`transactionDate` may equal or follow the parent account's
`openingBalanceDate`; a date before it is rejected on create or edit. Changing
an account's opening-balance date is also rejected if the new date would leave
an existing transaction before the opening date. Both fields are date-only, so
this comparison is independent of server and user timezones.

Creating, editing, or deleting a transaction changes all derived account,
budget, and dashboard results affected by the old and new values. Any later
summary or materialized optimization must be invalidated in the same successful
operation; the transaction ledger remains authoritative.

## Deletion

After user confirmation, an owned transaction may be permanently deleted. The
MVP does not retain a transaction tombstone or application audit-history row.
Deletion removes only that transaction: it does not delete or mutate the parent
account or referenced category. Derived results are then calculated from the
remaining ledger.

Account and category foreign keys restrict parent deletion where history must
be preserved. Accounts with transaction history and referenced categories are
archived according to [data lifecycle](data-lifecycle.md).

## Transfers

Account-to-account transfers are deferred and have no MVP transaction type,
fields, endpoints, or user workflow. Steward does not infer a transfer from two
ordinary transactions, link such records, or promise atomic behavior between
them. Creating any MVP transaction records financial activity only and never
initiates movement of funds.

A post-MVP transfer model requires a separate product and schema decision. That
design must:

- represent one user intent with linked source and destination account effects;
- create, edit, and delete both account effects atomically;
- require distinct accounts with compatible ownership and currency;
- preserve each account's signed ledger contribution and opening-date rules;
- exclude transfer effects from income, spending, refunds, and budget activity;
- define ordering, deletion, and partial-failure behavior for both effects; and
- keep Steward informational, without initiating or authorizing money movement.

A transfer aggregate with two linked ledger legs is the expected design
direction because it preserves transaction-derived balances without treating a
transfer as income or expense. The MVP schema deliberately adds neither a
`transfer` enum value nor dormant transfer-link columns; the post-MVP decision
will select the exact representation and migration.

## Required Constraints

- `transaction.id` is the primary key.
- `transaction.userId` is non-null and references the authoritative Better Auth
  user with restrictive delete behavior.
- `(accountId, userId)` references the owning financial account's `(id, userId)`
  with restrictive delete behavior.
- `(categoryId, userId)` is nullable through `categoryId` and, when present,
  references the category's `(id, userId)` with restrictive delete behavior.
- Transaction type is restricted to `income`, `expense`, or `refund`.
- `amountMinor` is a signed 64-bit integer, is non-zero, and has the sign required
  by its type.
- `transactionDate` uses PostgreSQL `date`; audit fields use UTC timestamps.
- The service rejects transactions before the parent opening-balance date and
  transactions on investment accounts.
- Protected reads and writes restrict by the session-derived `userId` and prove
  the owner-qualified account relationship; a transaction owned by another user
  behaves as not found.
