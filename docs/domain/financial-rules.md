# Financial Rules

**Status:** Accepted
**Last verified:** 2026-08-03

This document is the source of truth for financial meaning and calculations.

## Currency and Money

- The MVP supports USD only.
- `USD`, the uppercase ISO 4217 code, is the only accepted currency value. API
  responses use the same literal value; symbols and localized names are display
  concerns and are never persisted.
- A financial account's currency is `USD`. Transactions inherit their account's
  currency, and budgets, allocations, investment snapshots, and dashboard totals
  use the user's single MVP currency. Clients cannot select or override currency.
- Persist monetary values in signed 64-bit integer columns. The physical database
  range is `-9,223,372,036,854,775,808` through
  `9,223,372,036,854,775,807` minor units.
- Public API contracts expose money as JSON integer minor units plus the `USD`
  currency code. They do not expose decimal amounts, formatted strings, or
  JavaScript `bigint` values.
- Every request value, response value, and authoritative calculated result must be
  a JavaScript safe integer in the inclusive range
  `-9,007,199,254,740,991` through `9,007,199,254,740,991`. This application
  limit is narrower than the storage type and prevents JSON parsing from silently
  losing precision.
- PostgreSQL may calculate aggregates in a wider intermediate type, but the API
  rejects a mutation that would make a persisted or returned monetary result
  exceed the safe-integer range. Reads fail closed instead of serializing an
  out-of-range value. Database values are converted from 64-bit values without
  first passing through an unsafe JavaScript `number`.
- UI input parses decimal strings without binary floating-point arithmetic.
- UI output uses `Intl.NumberFormat`.
- A future currency feature requires an explicit migration and exchange-rate model.

## Dates and Months

- A transaction and an investment snapshot use date-only `YYYY-MM-DD` strings.
  They are valid proleptic Gregorian calendar dates with four-digit years from
  `0001` through `9999`; rollover values such as `2026-02-29` are rejected.
- An account opening-balance date uses the same date-only representation.
- A budget month uses a `YYYY-MM` string with a four-digit year from `0001`
  through `9999` and a month from `01` through `12`.
- Date-only and month values remain strings in API contracts. Date-only values
  map to PostgreSQL `date`; a budget month maps to a PostgreSQL `date` constrained
  to the month's first day and is serialized without the day. Neither is treated
  as an instant, assigned an offset, or serialized through JavaScript `Date`.
- Audit fields such as `createdAt` and `updatedAt` are server-generated instants.
  PostgreSQL stores them as `timestamptz`; API contracts return RFC 3339 strings
  normalized to UTC with a `Z` suffix, for example
  `2026-08-03T14:05:06.123Z`. Clients cannot supply audit timestamps.
- Registration and demo creation detect an initial IANA timezone from the browser.
- A user can change their IANA timezone in Settings.
- If detection fails, the MVP fallback is `America/New_York`.
- The browser may suggest a runtime-supported IANA timezone and uses the persisted
  preference for presentation. The API validates and persists the identifier and
  is authoritative whenever timezone affects a query or financial result.
- The server uses the user's timezone to derive "today" and the current budget
  month. Scheduled jobs and audit timestamps use the server clock in UTC; the
  database or host's local timezone must not affect domain behavior.
- Month membership is determined by the transaction's date-only value, not the server timezone.
- Changing timezone never reinterprets a stored transaction date.
- Timezone controls the current month, relative-date behavior, and display of timestamp values.

## Closed Value Sets

Public contracts and persistence use the following lowercase values exactly.
Labels shown in the UI are presentation text and do not change the stored value.
Unknown values are rejected rather than mapped to a default.

| Value set              | Allowed values                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| Account type           | `checking`, `savings`, `cash`, `credit_card`, `loan`, `investment`                                            |
| Transaction type       | `income`, `expense`, `refund`                                                                                 |
| Category group         | `income`, `housing`, `food`, `transportation`, `health`, `personal`, `entertainment`, `savings_debt`, `other` |
| Category applicability | `income`, `expense`, `both`                                                                                   |

Category group is organizational; applicability determines which transaction
types and budget features may use a category. Category groups are predefined for
the MVP, while category records within those groups are user-owned and extensible.

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

monthly expense magnitude =
  absolute value of sum(expense amounts dated within the selected month)

monthly refunds =
  sum(refund amounts dated within the selected month)

monthly spending =
  max(monthly expense magnitude - monthly refunds, 0)
```

Loan and investment balances do not contribute to available cash.
Monthly spending includes categorized and uncategorized expenses and refunds.
Category assignment affects budget categorization, not whether activity
contributes to monthly spending.

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
category expense magnitude =
  absolute value of sum(expense amounts for the category and month)

category refunds =
  sum(refund amounts for the category and month)

category spending =
  max(category expense magnitude - category refunds, 0)

remaining = allocation - category spending

overspent = max(category spending - allocation, 0)
```

Rules:

- Uncategorized transactions do not count toward a category.
- Income does not count as category spending.
- Removing a category from one monthly budget does not delete the category or change transactions.
- Editing a category name or group preserves transaction history.
- Budget totals are derived from category allocations and spending.
- Transaction spending belongs to the transaction's date month, even if the record is entered or edited later.

Categorized expense and refund activity without an allocation is unbudgeted
spending:

- It counts toward total monthly spending.
- It reduces overall budget remaining.
- It appears in a separate Unbudgeted spending section.
- It produces an attention item.
- It does not create an allocation automatically.

```text
total allocated = sum(all allocations)

total budget spending =
  sum(category spending for every category with activity in the month,
      including categories without an allocation)

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
- A decimal input uses ordinary base-10 notation with no exponent, currency
  symbol, grouping separator, `NaN`, or infinity. After exact conversion, it must
  be an integer inside the documented JavaScript-safe application range.
- API minor-unit values must be integer JSON numbers; fractional numbers and
  numeric strings are rejected.
- Transaction form amounts must be greater than zero; Steward applies the stored
  sign from the transaction type. A stored transaction amount must be non-zero
  and have the canonical sign for its type.
- Asset opening balances and positive amounts owed entered for liabilities may be
  zero. Steward applies the liability sign before persistence.
- Investment snapshot values may be zero. Budget allocations may be zero but may
  not be negative.
- Derived balances, spending, remaining values, and totals may be zero or negative
  where their documented formulas permit it.
- Every monetary operand and result is range-checked. A request that would overflow
  the application range is rejected atomically with a validation or domain error;
  values are never clamped or wrapped.
- Domain calculations use integers until display formatting.
