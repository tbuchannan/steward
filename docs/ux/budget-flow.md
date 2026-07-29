# Budget Management Flow

## Purpose

The budget section allows users to assign monthly spending targets and track actual spending against those targets.

## Budget Entry Flow

```text
Dashboard or navigation
→ Budgets
→ Open current month
→ Review totals and categories
```

The current month should open by default.

## Budget Summary

The page should display:

- Total budgeted
- Total spent
- Remaining amount
- Overall budget progress
- Selected month
- Relevant rollover or reset information where applicable

## Month Navigation

```text
Current budget
→ Select previous or next month
→ Load selected month's budget
```

The selected month should remain visually clear.

Navigating between months should preserve the same page structure.

## Category Groups

Budget categories may be organized into groups such as:

- Needs
- Wants
- Savings
- Debt payments

Each category should show:

- Budgeted amount
- Spent amount
- Remaining amount
- Progress
- Overspent state where applicable

## Edit Budget Flow

```text
Budget
→ Enter edit mode
→ Change allocated amounts
→ Review updated totals
→ Save or cancel
→ Recalculate progress
```

Unsaved changes should be visually clear.

The user should not lose unsaved changes without confirmation.

## Add Category Flow

```text
Budget
→ Add category
→ Enter category name
→ Select group
→ Enter monthly allocation
→ Save
→ New category appears
```

The add-category interaction may use a dialog or drawer.

## Edit Category Flow

```text
Budget category
→ Edit
→ Change name, group, or allocation
→ Save or cancel
```

Changing a category name or group should not remove the transaction history associated with that category.

## Remove Category Flow

```text
Budget category
→ Remove
→ Show confirmation
→ Confirm
→ Remove from current budget
```

If the category is already used by transactions, the interface should explain how those transactions will be handled.

Removal from a budget should not necessarily delete the category from the entire application.

## Overspending State

When spending exceeds the allocated amount:

- Show the overspent amount clearly.
- Use a semantic warning or error treatment.
- Do not rely on color alone.
- Keep the budgeted and actual amounts visible.

## Empty State

If no budget exists for the selected month:

- Explain that no budget has been created.
- Provide an action to create one.
- Optionally allow copying the previous month's budget.

## Loading State

While budget data loads:

- Preserve the page structure.
- Show placeholders for totals and categories.
- Avoid briefly displaying incorrect totals.

## Validation State

Validation should identify:

- Invalid or negative allocations
- Missing category names
- Duplicate category names where relevant
- Invalid group selections

## Error State

If changes fail to save:

- Preserve unsaved values.
- Explain that the update failed.
- Provide retry and cancel options.
- Avoid showing updated summaries as though the save succeeded.

## Success Criteria

The budget flow is successful when the user can:

- Understand the current month's budget quickly.
- Compare budgeted and actual spending.
- Add and edit categories.
- Change allocations safely.
- Identify remaining and overspent amounts.
- See related dashboard summaries update after saving.
