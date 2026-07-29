# MVP Scope

## Objective

The Steward MVP should provide a complete personal-finance workflow that allows a user to manage accounts, transactions, budgets, and financial summaries using realistic data.

The MVP should be polished enough to demonstrate the main product experience without requiring real financial-institution integrations.

## Included

### Authentication

- Better Auth
- Email and password registration
- Email and password sign-in
- Persistent authenticated sessions
- Protected application routes and data
- Sign out
- Predefined demo user
- Demo-account shortcut from the login page
- Seeded financial data associated with the demo user
- Financial-data isolation by authenticated user

### Application Shell

- Responsive authenticated layout
- Navigation between primary sections
- Active navigation state
- Light, dark, and system themes
- Basic display settings
- User or account menu
- Authentication-aware loading and redirect states

### Dashboard

- Account balance summary
- Monthly income and spending summary
- Budget progress
- Recent transactions
- Spending by category
- Items requiring attention
- Links from summary widgets to related detail pages
- Quick access to common actions

### Accounts

- View financial accounts
- View accounts grouped by type
- View account details
- Create an account
- Edit an account
- Archive an account
- Support common account types:
  - Checking
  - Savings
  - Credit card
  - Cash
  - Loan
  - Investment

### Transactions

- View transactions
- Create transactions
- Edit transactions
- Delete transactions
- Categorize transactions
- Search transactions
- Filter transactions
- Sort transactions where useful
- Paginate transaction results
- Update related balances and summaries

### Budgets

- View a monthly budget
- Navigate between months
- Organize categories into groups
- Create and edit budget categories
- Assign budget amounts
- Track spending against budget amounts
- Display remaining and overspent amounts
- Save or cancel budget changes
- Reflect saved changes in dashboard summaries

### Settings

- Light, dark, and system theme selection
- Basic display preferences
- Basic authenticated-user information
- Sign out
- Demo-account indicator
- Reset Demo Data action for the predefined demo account

### Demo Data

- Predefined demo user
- Realistic seeded accounts
- Realistic seeded transactions
- Seeded categories
- Seeded monthly budget data
- Internally consistent dashboard summaries
- Ability to restore the initial demo dataset

### Quality

- Responsive layouts
- Accessible core interactions
- Server-side authorization for protected data
- Validation with useful field-level messages
- Authentication loading and error states
- Financial-data loading, empty, and error states
- Tests for important workflows
- Deployment and setup documentation

## Optional After the Core MVP

These features may be included after the primary workflow is complete:

- CSV transaction imports
- Net-worth history
- Spending analytics
- Investment summaries
- Recurring transaction detection
- Financial goals
- Password recovery
- Email verification
- Password changes
- Management of multiple active sessions

## MVP Completion Criteria

The MVP is complete when a user can:

1. Register using an email address and password.
2. Sign in and maintain a valid session across normal page reloads.
3. Enter through the predefined demo account.
4. Access protected financial data only while authenticated.
5. View a populated dashboard.
6. Review and manage financial accounts.
7. Create, edit, categorize, search, filter, and delete transactions.
8. Create and edit a monthly budget.
9. See transaction and budget changes reflected in financial summaries.
10. Update basic appearance preferences.
11. Sign out and lose access to protected routes.
12. Reset the predefined demo data.
13. Use the primary workflows on desktop and mobile layouts.
14. Access a deployed version of the application.
