# Application Sitemap and Navigation

## Overview

Steward uses a dashboard-oriented application structure with persistent navigation between its primary financial-management sections.

The navigation should make common workflows easy to find while keeping secondary tools and settings available without cluttering the main interface.

## Unauthenticated Routes

```text
/
└── /login
```

### Login

The login page provides access to a demo account or lightweight authentication flow.

After successful authentication, the user is redirected to the dashboard.

## Authenticated Routes

```text
/dashboard

/accounts
├── /accounts/new
└── /accounts/:accountId
    └── /accounts/:accountId/edit

/transactions
├── /transactions/new
└── /transactions/:transactionId/edit

/budgets
└── /budgets/:year/:month

/settings
```

Potential post-MVP routes may include:

```text
/insights
/investments
/goals
/import
```

These routes are not required for the initial MVP.

## Primary Navigation

The primary navigation contains:

- Dashboard
- Accounts
- Transactions
- Budgets

These sections represent Steward's main financial-management workflows.

## Secondary Navigation

Secondary navigation contains:

- Settings
- Theme controls
- Sign out

Potential future items may include:

- Import data
- Reports
- Help

## Desktop Navigation

Desktop layouts should use a persistent sidebar.

The sidebar should:

- Show the active section
- Remain available throughout the authenticated application
- Separate primary and secondary navigation
- Support a collapsed state if needed

## Mobile Navigation

Mobile layouts may use:

- A bottom navigation bar for primary sections
- A menu or profile control for secondary actions

The mobile experience should preserve the same information hierarchy as the desktop experience.

## Dashboard Navigation

Dashboard widgets act as summaries and link to related detail pages.

Examples:

- Account summary → Accounts
- Recent transactions → Transactions
- Budget progress → Current monthly budget
- Spending by category → Filtered transactions or spending details
- Items requiring attention → Relevant account, transaction, or budget item

## Pages, Dialogs, and Drawers

Use full pages for workflows that require substantial context.

Examples:

- Account details
- Transaction history
- Monthly budget
- Settings

Use dialogs or drawers for focused actions.

Examples:

- Create transaction
- Edit transaction
- Add budget category
- Edit budget allocation
- Confirm deletion

## Navigation Rules

- The active section should be visually clear.
- Browser back and forward controls should behave predictably.
- Deep links should open the intended authenticated page.
- Unauthenticated access to protected routes should redirect to login.
- Summary content should link naturally to detailed content.
- Desktop and mobile layouts should use the same page hierarchy.

## Success Criteria

The sitemap is successful when:

- Every MVP page has a defined location.
- Primary workflows require minimal navigation.
- Summary content links naturally to detailed content.
- Desktop and mobile navigation can use the same information hierarchy.
- Future features can be added without reorganizing the MVP structure.
