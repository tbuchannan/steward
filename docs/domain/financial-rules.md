# Financial Rules

**Status:** Accepted
**Last verified:** 2026-08-03

This document is the source of truth for financial meaning and calculations.

## Currency and Money

- The MVP supports USD only.
- Persist monetary values as signed 64-bit integer minor units.
- API contracts expose minor-unit integers and the `USD` currency code.
- UI input parses decimal strings without binary floating-point arithmetic.
- UI output uses `Intl.NumberFormat`.
- A future currency feature requires an explicit migration and exchange-rate model.

## Dates and Months

- A transaction uses a date-only `YYYY-MM-DD` value.
- A budget month uses `YYYY-MM`.
- Registration and demo creation detect an initial IANA timezone from the browser.
- A user can change their IANA timezone in Settings.
- If detection fails, the MVP fallback is `America/New_York`.
- Month membership is determined by the transaction's date-only value, not the server timezone.
- Changing timezone never reinterprets a stored transaction date.
- Timezone controls the current month, relative-date behavior, and display of timestamp values.
- Audit fields such as `createdAt` use UTC timestamps.

## Transaction Types and Signs

All MVP transactions are manual, immediately posted records. Steward never uses them to initiate or authorize external financial activity.

Amounts are stored as their contribution to the account's net value:

| Type    | Stored amount | Meaning                         |
| ------- | ------------: | ------------------------------- |
| Income  |      Positive | Increases an asset account      |
| Expense |      Negative | Decreases an asset account      |
| Refund  |      Positive | Reverses prior expense activity |

Users enter positive decimal amounts and Steward applies the canonical sign. A refund is standalone, requires an expense-capable category, does not require a link to an original expense, and does not count as income.

Pending, cleared, reconciled, and void states are not part of the MVP. Account-to-account transfers are deferred and have no MVP transaction type.

## Account Balances

Checking, savings, cash, credit-card, and loan accounts have an opening balance and a collection of posted transactions.

```text
current balance = opening balance + sum(posted transaction amounts)
```

The database does not maintain a second independently editable current-balance field. List and dashboard queries may use an explicitly invalidated summary or materialized strategy later, but the transaction ledger remains authoritative.

Canonical signs:

- Asset value is positive.
- Liability value is negative.
- Checking, savings, and cash opening balances are entered and stored as positive owned value.
- Credit-card and loan opening balances are entered in the UI as a positive amount owed and stored as a negative net-value contribution.
- An expense is negative for both asset and liability accounts; on a liability it increases the amount owed.
- A refund is positive for both asset and liability accounts; on a liability it reduces the amount owed.
- Credit-card and loan balances are displayed in account views as the positive magnitude owed while remaining negative in net-value calculations.
- Transactions dated before the account's opening-balance date are rejected.

Investment accounts use manual balance snapshots rather than transaction-derived balances:

- A snapshot contains a signed value and an `asOfDate`.
- The newest snapshot is the current investment value; when none exists, the account's opening balance is current.
- Editing a current investment value creates or replaces the snapshot for that date; it does not rewrite the original opening value.
- Investment accounts do not accept transactions in the MVP.
- Holdings, prices, trades, and performance calculations are deferred.

Account fields, supported types, and snapshot constraints are defined in
[financial accounts](financial-accounts.md).

## Dashboard Metrics

```text
available cash =
  sum(active checking balances)
  + sum(active savings balances)
  + sum(active cash balances)

credit debt =
  sum(absolute value of negative active credit-card balances)

monthly income =
  sum(income amounts dated within the selected month)

monthly spending =
  absolute value of net expense activity dated within the selected month
```

Loan and investment balances do not contribute to available cash.

## Categories

Each user receives a basic set of categories copied into user-owned records. Users may create additional categories.

- Category groups are predefined for the MVP.
- Custom groups are deferred.
- Category names are case-insensitively unique within a group for one user.
- A category is applicable to `income`, `expense`, or `both`.
- Only expense-capable categories may receive budget allocations or be assigned to refunds.
- Referenced categories may be renamed or archived without losing history.

Category fields, supported groups and applicability, and persistence constraints
are defined in [financial categories and budgets](financial-categories-budgets.md).

## Budget Lifecycle

- A budget is created when the user first saves at least one allocation for a month.
- A month without a stored budget renders as an empty editable budget.
- Past, current, and future months are editable.
- Rollover, carryover, and copy-from-prior-month behavior are not included.
- Removing the final allocation leaves an empty budget record after the month has first been saved.

Budget and allocation fields, relationships, and persistence constraints are
defined in [financial categories and budgets](financial-categories-budgets.md).

## Budget Spending

Only categorized expense and refund activity affects a budget:

```text
category spending =
  absolute value of expenses for the category and month
  - refunds for the category and month

remaining = allocation - category spending

overspent = max(category spending - allocation, 0)
```

Rules:

- Uncategorized transactions do not count toward a category.
- Income does not count as category spending.
- Spending cannot be less than zero; excess refunds clamp spending to zero.
- Removing a category from one monthly budget does not delete the category or change transactions.
- Editing a category name or group preserves transaction history.
- Budget totals are derived from category allocations and spending.
- Transaction spending belongs to the transaction's date month, even if the record is entered or edited later.

Categorized expense activity without an allocation is unbudgeted spending:

- It counts toward total monthly spending.
- It reduces overall budget remaining.
- It appears in a separate Unbudgeted spending section.
- It produces an attention item.
- It does not create an allocation automatically.

```text
total allocated = sum(all allocations)

total budget spending =
  sum(all categorized expense activity for the month)

overall remaining =
  total allocated - total budget spending
```

Uncategorized transactions remain a separate attention item and cannot affect a category allocation until categorized.

## Attention Items

The MVP includes only deterministic attention items:

- A transaction has no category.
- A budget category has `overspent > 0`.
- A category has spending in the month but no budget allocation.
- An active asset account has a negative balance.

Items link to a filtered transaction list, the affected budget month, or the affected account.

## Ordering and Pagination

- Transaction lists sort by transaction date descending, then creation timestamp descending, then ID descending.
- Offset pagination is acceptable for the MVP.
- Page numbers start at 1.
- The default page size is 25 and the maximum is 100.

## Rounding and Validation

- Decimal input accepts no more than two fractional digits for USD.
- Conversion to minor units is exact and occurs before persistence.
- Stored values must remain inside the documented 64-bit range.
- Zero-value transactions are rejected.
- Domain calculations use integers until display formatting.
