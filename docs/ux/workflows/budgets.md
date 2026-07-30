# Budget Workflow

**Requirements:** `BUD-01`–`BUD-06`
**Status:** Accepted

## Browse

```text
Open Budgets
→ View the current month
→ Review allocations, spending, remaining values, and overspending
→ Navigate to another month when needed
```

The selected year and month are part of the route. Invalid months show a safe not-found or validation state.

A month without a saved budget displays an empty editor. Its budget record is created when the user first saves at least one allocation. Past, current, and future months are editable.

## Edit

```text
Select Edit budget
→ Change allocations
→ Add an existing or new category
→ Remove a category from this month's budget
→ Review live draft totals
→ Save all changes or Cancel
```

Removing a category from a budget removes only that month's allocation. It does not delete the reusable category or its transactions.

## Validation

- Allocations must be valid non-negative USD amounts.
- Category names are required when creating a category.
- Duplicate user-scoped category names are rejected according to the domain policy.
- Save is disabled when there are no valid changes or a request is pending.

## Feedback

Overspent values use text and iconography in addition to color. Save updates dashboard budget progress without a manual reload. A failed save preserves the draft so the user can retry or cancel.

Spending for categories without allocations appears in a separate Unbudgeted spending section, counts against overall remaining funds, and creates an attention item. It does not create an allocation automatically.

Rollover, carryover, and copying a prior month's budget are deferred.
