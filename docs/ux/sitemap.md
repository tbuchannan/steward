# Application Sitemap and Navigation

## Overview

Steward uses a dashboard-oriented application structure with persistent navigation between its primary financial-management sections.

The navigation should make common workflows easy to find while keeping authentication, secondary tools, and settings from cluttering the main interface.

## Public Routes

```text
/
├── /login
└── /register
```

### Root Route

The root route should direct the visitor based on authentication state:

```text
Authenticated user
→ /dashboard

Unauthenticated user
→ /login
```

### Login

The login page allows an existing user to sign in using an email address and password.

It also provides a direct option to enter the predefined Steward demo account.

After successful authentication, the user is redirected to the dashboard or, when practical, the protected page they originally requested.

### Registration

The registration page allows a new user to create an account using:

- Name
- Email address
- Password
- Password confirmation

After successful registration, an authenticated session is created and the user is redirected to the dashboard.

Email verification is not required for the initial MVP.

### Demo Account

The login page includes a `Continue with Demo Account` action.

Selecting it authenticates the visitor as a predefined demo user and opens Steward with realistic seeded financial data.

The demo account should use the same authenticated application experience as a regular user.

## Protected Routes

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
├── /settings/profile
└── /settings/security
```

The exact use of dedicated create and edit routes may change if those interactions are implemented with dialogs or drawers.

Potential post-MVP routes may include:

```text
/insights
/investments
/goals
/import
```

These routes are not required for the initial MVP.

## Primary Navigation

The authenticated primary navigation contains:

- Dashboard
- Accounts
- Transactions
- Budgets

These sections represent Steward’s primary financial-management workflows.

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
- Provide access to settings and sign out
- Support a collapsed state if needed

## Mobile Navigation

Mobile layouts may use:

- A bottom navigation bar for primary sections
- A menu or profile control for secondary actions
- Full-screen or drawer-based forms for focused actions

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
- Login and registration

Use dialogs or drawers for focused actions.

Examples:

- Create transaction
- Edit transaction
- Add account
- Add budget category
- Edit budget allocation
- Confirm deletion

The final choice should consider deep linking, complexity, responsive behavior, and how much context the user needs.

## Authentication Navigation Rules

- Unauthenticated users attempting to access protected pages should be redirected to `/login`.
- Authenticated users visiting `/login` or `/register` should be redirected to `/dashboard`.
- A successful login should return the user to the originally requested page when practical.
- Signing out should terminate the active session and redirect the user to `/login`.
- Session validation should occur before protected financial data is displayed.
- Server requests for protected data should independently verify the authenticated user.
- A missing or invalid session should never be treated as a valid client-only state.

## General Navigation Rules

- The active section should be visually clear.
- Browser back and forward controls should behave predictably.
- Deep links should open the intended page.
- Summary content should link naturally to detailed content.
- Desktop and mobile layouts should use the same page hierarchy.
- Navigation should not discard unsaved changes without warning.
- Error pages should provide a clear route back into the application.

## Success Criteria

The sitemap is successful when:

- Every MVP page has a defined location.
- Public and protected routes are clearly separated.
- Primary workflows require minimal navigation.
- Summary content links naturally to detailed content.
- Desktop and mobile navigation use the same information hierarchy.
- Authentication redirects behave predictably.
- Future features can be added without reorganizing the MVP structure.
