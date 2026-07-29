# Core Page Wireframes

## Purpose

The wireframes define the initial structure, information hierarchy, and placement of primary actions for Steward's core pages.

They are intentionally low fidelity and should not be treated as final visual designs.

## Required Wireframes

### Login

Should include:

- Steward identity
- Demo login action
- Minimal explanation of the application
- Loading state
- Authentication error state

### Dashboard

Should include:

- Primary navigation
- Financial summary cards
- Budget progress
- Spending summary
- Recent transactions
- Items requiring attention
- Quick actions

### Accounts

Should include:

- Account groups
- Account names
- Account types
- Balances
- Total summaries
- Add account action

### Account Detail

Should include:

- Account information
- Current balance
- Related transactions
- Edit action
- Archive action

### Transactions

Should include:

- Search
- Filters
- Transaction list or table
- Pagination
- Add transaction action
- Edit and delete access

### Budget

Should include:

- Month navigation
- Budget summary
- Category groups
- Budgeted, spent, and remaining values
- Progress states
- Edit budget action
- Add category action
- Overspending state

### Settings

Should include:

- Theme preferences
- Basic display settings
- Demo-user information
- Sign-out action

## Interaction Guidance

Summary widgets should link to full detail pages.

Focused actions may use dialogs or drawers.

Examples:

- Add transaction
- Edit transaction
- Add budget category
- Edit budget allocation
- Confirm deletion

More complex workflows should use full pages.

Examples:

- Account detail
- Transaction history
- Monthly budget
- Settings

## Responsive Expectations

Desktop wireframes should consider:

- Persistent sidebar navigation
- Wide data tables
- Multi-column dashboard layouts
- Side-by-side summary content

Mobile wireframes should consider:

- Condensed navigation
- Stacked cards
- Simplified transaction rows
- Drawers or full-screen forms
- Touch-friendly controls
- Reduced information density

The mobile experience should preserve the same primary workflows rather than simply shrinking the desktop layout.

## Visual Fidelity

Wireframes should focus on:

- Page hierarchy
- Content priority
- Navigation
- Main actions
- Interaction patterns
- Responsive structure

Wireframes should not attempt to finalize:

- Color palette
- Typography
- Shadows
- Exact spacing
- Final chart styling
- Component-level visual polish

## Storage

Wireframe images should be stored in:

```text
docs/ux/wireframes/
```

Recommended filenames:

```text
login.png
dashboard.png
accounts.png
account-detail.png
transactions.png
budget.png
settings.png
```

Mobile wireframes may use names such as:

```text
login-mobile.png
dashboard-mobile.png
transactions-mobile.png
budget-mobile.png
```

## Current Design References

More detailed visual explorations may be linked from this document, but they should remain clearly identified as design references rather than finalized screens.

The purpose of these wireframes is to establish structure and interaction decisions before implementation and visual polish begin.
