# Transaction Management Flow

## Purpose

The transactions section allows users to browse, search, filter, create, edit, categorize, and delete financial activity.

## Transaction List Flow

```text
Dashboard or navigation
→ Transactions
→ Browse transaction list
→ Search, filter, paginate, or select a transaction
```

Each transaction row should display enough information to identify it quickly:

- Date
- Merchant or description
- Category
- Account
- Amount
- Transaction type or status where relevant

## Search Flow

```text
Transactions
→ Enter search query
→ Results update
→ Clear query
→ Full list returns
```

Search should match relevant fields such as:

- Merchant
- Description
- Category
- Account

Search behavior should be predictable and should not require a full page reload.

## Filter Flow

Users should be able to filter transactions by:

- Date range
- Account
- Category
- Income or expense
- Amount range where useful

Active filters should be visible and easy to clear.

Changing filters should normally return the user to the first page of results.

## Create Transaction Flow

```text
Transactions
→ Add transaction
→ Enter transaction details
→ Validate
→ Save
→ Transaction appears in the list
→ Related summaries update
```

Transaction information may include:

- Date
- Merchant or description
- Account
- Category
- Amount
- Income or expense type
- Optional notes

## Edit Transaction Flow

```text
Transaction list
→ Select transaction
→ Edit
→ Save or cancel
→ List and related summaries update
```

Cancelling should preserve the original transaction.

## Categorization Flow

A user can assign or change a transaction category during creation or editing.

A quick category-change action may also be available from the transaction list.

Category changes should update related budget and spending summaries.

## Delete Flow

```text
Transaction
→ Delete
→ Confirm
→ Remove transaction
→ Recalculate affected summaries
```

Deletion should require confirmation.

The confirmation should explain that affected account balances, category totals, or budget summaries may change.

## Pagination

The transaction list should support predictable pagination.

Pagination should preserve the current:

- Search query
- Filters
- Sort order
- Page size where applicable

Changing the search query or filters should normally return the user to the first page.

## Loading State

Display a stable table or list structure with loading placeholders.

Existing rows should not unexpectedly disappear during background refreshes unless the data has actually changed.

## Empty State

Differentiate between:

- No transactions exist
- No transactions match the current search or filters

When no transactions exist, provide an Add transaction action.

When filters return no results, provide an action to clear the filters.

## Validation State

Validation should identify:

- Missing account
- Missing date
- Invalid amount
- Missing description where required
- Invalid category selection

## Error State

If loading or saving fails:

- Show a clear message.
- Preserve user input where possible.
- Provide a retry action.
- Avoid silently failing or leaving the interface in an uncertain state.

## Success Criteria

The transaction flow is successful when the user can:

- Find relevant transactions quickly.
- Create and update transactions without unnecessary navigation.
- Understand the effect of categorization.
- Delete transactions safely.
- See related summaries update consistently.
