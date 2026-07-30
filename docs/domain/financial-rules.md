# Financial Rules

**Status:** Accepted
**Last verified:** 2026-07-30

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
- Each user has an IANA timezone; the MVP default is `America/New_York`.
- Month membership is determined by the transaction's date-only value, not the server timezone.
- Audit fields such as `createdAt` use UTC timestamps.

## Transaction Types and Signs

Amounts are stored from the selected financial account's perspective:

| Type | Stored amount | Meaning |
|---|---:|---|
| Income | Positive | Increases an asset account |
| Expense | Negative | Decreases an asset account |
| Refund | Positive | Reverses prior expense activity |

For liability accounts, UI labels and balance presentation must make the amount owed clear. Account-to-account transfers are deferred and therefore have no MVP transaction type.

## Account Balances

An account has an opening balance and a collection of posted transactions.

```text
current balance = opening balance + sum(posted transaction amounts)
```

The database does not maintain a second independently editable current-balance field. List and dashboard queries may use an explicitly invalidated summary or materialized strategy later, but the transaction ledger remains authoritative.

Account-type presentation:

- Checking, savings, cash, and investment balances are displayed as owned value.
- Credit-card and loan balances are displayed as positive debt when the ledger result represents an amount owed.
- Investment accounts contain one manually managed opening value in the MVP; holdings and prices are deferred.

## Dashboard Metrics

```text
available cash =
  sum(active checking balances)
  + sum(active savings balances)
  + sum(active cash balances)

credit debt =
  sum(amount owed for active credit-card accounts)

monthly income =
  sum(income amounts dated within the selected month)

monthly spending =
  absolute value of net expense activity dated within the selected month
```

Loan and investment balances do not contribute to available cash.

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

## Attention Items

The MVP includes only deterministic attention items:

- A transaction has no category.
- A budget category has `overspent > 0`.
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
