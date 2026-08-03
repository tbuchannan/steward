# Financial Accounts

**Status:** Accepted
**Last verified:** 2026-08-03

This document is the source of truth for the financial-account model. Financial
meaning and calculations remain defined in
[financial rules](financial-rules.md), while archival and deletion behavior
remain defined in [data lifecycle](data-lifecycle.md).

## Supported Types

The MVP supports six account types. An account's class and balance model are
derived from its type rather than stored independently.

| Type          | Class      | Balance model         |
| ------------- | ---------- | --------------------- |
| `checking`    | Asset      | Transaction-derived   |
| `savings`     | Asset      | Transaction-derived   |
| `cash`        | Asset      | Transaction-derived   |
| `credit_card` | Liability  | Transaction-derived   |
| `loan`        | Liability  | Transaction-derived   |
| `investment`  | Investment | Manual dated snapshot |

Investment is a distinct class for MVP behavior even though its value
contributes positively to net value. Brokerage subtypes, holdings, securities,
prices, trades, and performance history are deferred.

## Financial Account

`financial_account` is a user-owned aggregate root with these fields:

| Field                 | Required | Meaning                                                             |
| --------------------- | -------- | ------------------------------------------------------------------- |
| `id`                  | Yes      | Steward-generated UUID                                              |
| `userId`              | Yes      | Owning Better Auth user identifier                                  |
| `name`                | Yes      | User-visible account name                                           |
| `type`                | Yes      | One of the six supported account types                              |
| `institutionName`     | No       | User-entered display metadata; it is not an institution integration |
| `currencyCode`        | Yes      | `USD` for the MVP                                                   |
| `openingBalanceMinor` | Yes      | Signed 64-bit integer baseline in minor units                       |
| `openingBalanceDate`  | Yes      | Date-only `YYYY-MM-DD` on which the baseline applies                |
| `archivedAt`          | No       | UTC timestamp; null means active                                    |
| `createdAt`           | Yes      | UTC creation timestamp                                              |
| `updatedAt`           | Yes      | UTC timestamp of the latest persisted change                        |

The server derives `userId` from the authenticated session. Clients never
supply ownership. `id`, `userId`, `createdAt`, and `updatedAt` are not editable
account fields.

`openingBalanceDate` is a calendar date and is never reinterpreted when the
user's timezone changes. The opening balance is the account's value immediately
before Steward-managed activity begins on that date. Transactions earlier than
that date are rejected.

Opening-balance signs follow [financial rules](financial-rules.md): assets are
stored as positive owned value, credit-card and loan amounts owed are stored as
negative net-value contributions, and investment values are stored as signed
net-value contributions. The UI accepts a positive magnitude for liability
amounts owed and applies the stored sign at the server boundary.

## Balance Models

Checking, savings, cash, credit-card, and loan accounts have zero or more posted
transactions. Their current balance is derived from the opening balance and
transactions using the canonical formula in
[financial rules](financial-rules.md). No independently editable current balance
is stored.

Investment accounts do not accept transactions in the MVP. Their opening
balance is the initial manual valuation. Later valuations are represented by
investment balance snapshots. The current investment value is the newest
snapshot by `asOfDate`, or the account opening balance when no snapshot exists.
Changing an investment's current value upserts the snapshot for the supplied
date and never changes its opening balance.

## Investment Balance Snapshot

`investment_balance_snapshot` is a child of one investment account:

| Field        | Required | Meaning                                           |
| ------------ | -------- | ------------------------------------------------- |
| `id`         | Yes      | Steward-generated UUID                            |
| `accountId`  | Yes      | Parent financial-account UUID                     |
| `valueMinor` | Yes      | Signed 64-bit integer manual value in minor units |
| `asOfDate`   | Yes      | Date-only `YYYY-MM-DD` for the valuation          |
| `createdAt`  | Yes      | UTC creation timestamp                            |
| `updatedAt`  | Yes      | UTC timestamp of the latest persisted change      |

Exactly one snapshot may exist for an account and `asOfDate`; the database
enforces uniqueness on `(accountId, asOfDate)`. A snapshot must belong to an
`investment` account owned by the authenticated user. The service enforces the
account-type rule and proves ownership through the parent account in the same
operation.

Snapshot dates before the account's `openingBalanceDate` are rejected. The
current-value query orders snapshots by `asOfDate` descending; uniqueness makes
the result deterministic. Snapshot timestamps are audit metadata and do not
affect which value is current.

## Archive and History

Archiving sets `archivedAt` and preserves the account, its transactions, and its
investment snapshots. Archived accounts are excluded from active lists,
selectors, and summaries unless explicitly requested. Archiving an account does
not rewrite balances, dates, or child records.

Permanent deletion is not an MVP user workflow. Any later deletion operation
must follow [data lifecycle](data-lifecycle.md) and must not orphan transactions
or investment snapshots.

## Required Constraints

- `financial_account.id` is the primary key.
- `financial_account.userId` is non-null and references the authoritative
  authentication user.
- Account type is restricted to the supported enum and currency to `USD`.
- Opening balances and snapshot values use signed 64-bit integers.
- Opening-balance and snapshot dates use PostgreSQL `date`, not timestamps.
- `investment_balance_snapshot.id` is the primary key.
- `investment_balance_snapshot.accountId` is non-null and references its parent.
- `(accountId, asOfDate)` is unique for investment snapshots.
- Protected reads and writes include session-derived ownership; an account or
  snapshot owned by another user behaves as not found.
