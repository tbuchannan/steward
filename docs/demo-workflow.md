# Demo Workflow and Success Criteria

## Purpose

The Steward demo should allow a visitor to understand the application quickly and explore its primary financial workflows without providing real financial information.

The experience should begin with realistic seeded data and guide the visitor through the application’s main capabilities.

## Entry Options

The visitor opens the deployed application and is presented with two ways to enter:

- Register or sign in using an email address and password
- Continue using the predefined demo account

The demo option should be visually prominent enough that a reviewer can begin exploring Steward without creating an account.

## Demo Account

Selecting `Continue with Demo Account` creates or restores a valid authenticated session for the predefined demo user.

The demo account should already contain:

- Multiple financial accounts
- Recent income and expense transactions
- Transaction categories
- A monthly budget
- Budget activity
- Enough historical data to populate dashboard summaries
- At least one item requiring attention

The demo account should use the same protected application routes and authorization model as a regular user.

## Primary Demo Workflow

### 1. Authenticate

The visitor selects `Continue with Demo Account`.

```text
Login
→ Continue with Demo Account
→ Better Auth creates or restores the demo session
→ Redirect to dashboard
```

A regular user may instead register or sign in using an email address and password.

### 2. Review the Dashboard

The visitor can see:

- Account balances
- Available cash
- Credit debt
- Monthly income and spending
- Budget progress
- Recent transactions
- Spending by category
- Items requiring attention

Dashboard widgets should provide clear links to their related detail pages.

### 3. Review Accounts

The visitor opens the accounts section and reviews multiple account types.

The visitor can:

- View grouped accounts
- Review account balances
- Open an account detail page
- Review transactions associated with an account
- Create an account
- Edit an existing account
- Archive an account

### 4. Manage Transactions

The visitor opens the transactions section.

The visitor can:

- Search existing transactions
- Filter transactions
- Navigate paginated results
- Create a transaction
- Edit a transaction
- Assign or change a category
- Delete a transaction

Changes should be reflected consistently in account balances, budget totals, and dashboard summaries.

### 5. Manage a Budget

The visitor opens the budget section.

The visitor can:

- Navigate between budget months
- Review category groups
- Compare budgeted and spent amounts
- Add a budget category
- Edit an allocated amount
- See remaining and overspent states
- Save or cancel changes

### 6. Confirm Updated Summaries

After changing a transaction or budget allocation, the visitor returns to the dashboard.

Relevant totals, progress indicators, and summaries should reflect the saved data.

The visitor should not need to manually reload the browser.

### 7. Update Appearance Settings

The visitor opens settings and changes the application theme.

The preference should:

- Apply throughout the application
- Remain active during navigation
- Remain active after a normal page reload

### 8. Review Demo Settings

The visitor can see that the current user is the predefined demo account.

The visitor may select `Reset Demo Data` to restore the original seeded dataset.

Resetting should not end the authenticated session.

### 9. Sign Out

The visitor selects Sign Out.

```text
Authenticated application
→ Sign Out
→ Better Auth terminates the active session
→ Redirect to login
```

After signing out, protected application routes should no longer be accessible without authenticating again.

## Regular-User Authentication Check

In addition to the primary demo workflow, the application should demonstrate that:

- A new user can register.
- An existing user can sign in.
- A valid session survives normal page reloads.
- Protected routes redirect unauthenticated users to login.
- Signing out reliably ends access to protected data.

This does not need to be the primary reviewer path, but it should function correctly.

## Success Criteria

The demo is successful when:

- A visitor can enter without providing real financial information.
- The demo account uses a valid authenticated session.
- The application contains realistic and internally consistent data.
- Navigation between primary sections is clear.
- Accounts, transactions, and budgets support their core workflows.
- Changes made in one area are reflected in related summaries.
- Protected data cannot be accessed without a valid session.
- Loading, empty, validation, authentication, and error states are understandable.
- The primary workflows function on desktop and mobile layouts.
- The application is deployed and accessible.
- A visitor can understand Steward’s purpose within a few minutes.

## Out of Scope for the Demo

The demo does not require:

- Real bank connections
- Real financial credentials
- Email verification
- Password recovery
- Social authentication
- Multi-factor authentication
- Payment processing
- Live investment pricing
- Multiple users within one financial workspace
- Shared household accounts
