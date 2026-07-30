# Transaction Workflow

**Requirements:** `TXN-01`–`TXN-08`
**Status:** Accepted

## Browse

```text
Open Transactions
→ Review newest transactions first
→ Search, filter, sort, or change page
→ Open an edit action when needed
```

Search, account, category, type, date, sort, and page state use validated URL search parameters. Invalid parameters resolve to documented defaults.

## Create

```text
Select Add transaction
→ Choose Income, Expense, or Refund
→ Select an active account
→ Enter date, amount, payee or description, category, and optional notes
→ Save
→ Close editor and refresh affected views
```

The amount field accepts a positive decimal input; the application applies the canonical sign based on the selected transaction type. Transfer is not an available type.

## Edit

Editing uses the same fields and validation as creation. Cancel discards unsaved changes. A successful edit refreshes account balance, budget spending, attention items, and dashboard summaries.

## Delete

```text
Open transaction actions
→ Select Delete
→ Confirm using a description of the selected transaction
→ Delete and refresh affected views
```

Delete is unavailable while the request is pending. Failure leaves the transaction visible and reports that no confirmed change occurred.

## Empty and Failure States

No-data and no-filter-results states are distinct. The first offers creation; the second offers clearing filters. Pagination returns to a valid page when a mutation removes the last item on the current page.
