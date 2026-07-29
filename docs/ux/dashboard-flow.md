# Dashboard User Flow

## Purpose

The dashboard gives the user a quick understanding of their current financial position and provides entry points into more detailed workflows.

## Entry Flow

```text
Login
→ Dashboard
→ Review summaries
→ Open a related detail page
```

The dashboard is the default page after authentication.

## Dashboard Content

The dashboard should include summaries for:

- Total net worth or total balance
- Available cash
- Credit debt
- Monthly income
- Monthly spending
- Budget progress
- Spending by category
- Recent transactions
- Items requiring attention

## Primary Actions

The dashboard may provide quick actions for:

- Add transaction
- Add account
- Edit budget
- Review transactions

Quick actions should open a focused drawer, dialog, or relevant page.

## Widget Navigation

Each major widget should navigate to related detail content.

Examples:

- Accounts summary → Accounts
- Recent transactions → Transactions
- Budget progress → Current monthly budget
- Spending by category → Filtered transaction view
- Attention item → Relevant account, transaction, or budget item

## Updated Data Flow

```text
User edits a transaction or budget
→ Data is saved
→ Related summaries are recalculated
→ Dashboard displays updated values
```

The dashboard should reflect changes made elsewhere in the application without requiring the user to manually refresh the page.

## Loading State

While dashboard data loads:

- Preserve the page layout.
- Show skeletons or placeholders.
- Avoid displaying misleading zero values.
- Allow independently loaded sections to appear when available.

## Empty State

When no financial data exists:

- Explain what information is missing.
- Provide an action to create an account or add financial data.
- Avoid displaying empty charts without context.

## Error State

When dashboard data cannot load:

- Display a clear error message.
- Preserve unaffected content where possible.
- Provide a retry action.
- Avoid replacing the entire application shell with an error screen.

## Success Criteria

The dashboard flow is successful when the user can:

- Understand their current financial position quickly.
- Identify areas that require attention.
- Reach detailed workflows without searching through the application.
- See changes reflected after editing related financial data.
