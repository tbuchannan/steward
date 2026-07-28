# Demo Workflow and Success Criteria

## Purpose

The Steward demo should allow a visitor to understand the application quickly and explore its primary financial workflows without needing to create real financial data.

The experience should begin with realistic seeded data and guide the visitor through the application's main capabilities.

## Demo Entry

The visitor opens the deployed application and enters through a demo login or predefined demo account.

The demo account should already contain:

- Multiple financial accounts
- Recent income and expense transactions
- Transaction categories
- A monthly budget
- Budget activity
- Enough historical data to populate dashboard summaries and charts

## Primary Demo Workflow

### 1. Sign in

The visitor enters the demo account through a simple authentication flow.

After signing in, the visitor is taken to the dashboard.

### 2. Review the dashboard

The visitor can see:

- Account balances
- Cash and credit summaries
- Monthly income and spending
- Budget progress
- Recent transactions
- Spending by category
- Items requiring attention

Dashboard widgets should provide clear links to their related detail pages.

### 3. Review accounts

The visitor opens the accounts section and reviews multiple account types.

The visitor can:

- View account balances
- Open an account detail page
- Create an account
- Edit an existing account

### 4. Manage transactions

The visitor opens the transactions section.

The visitor can:

- Search existing transactions
- Filter transactions
- Create a transaction
- Edit a transaction
- Assign or change a category
- Delete a transaction
- Navigate through paginated results

Changes should be reflected consistently throughout the application.

### 5. Manage a budget

The visitor opens the budget section.

The visitor can:

- Navigate between budget months
- Review category groups
- Compare budgeted and spent amounts
- Add a budget category
- Edit an allocated amount
- See remaining or overspent states
- Save or cancel changes

### 6. Confirm updated summaries

After changing a transaction or budget amount, the visitor returns to the dashboard.

Relevant totals, progress indicators, and summaries should reflect the updated data.

### 7. Update settings

The visitor opens settings and changes a basic preference, such as switching between light and dark themes.

The preference should be reflected throughout the application.

## Success Criteria

The demo is successful when:

- A visitor can enter without creating a real financial account
- The application contains realistic and internally consistent data
- Navigation between the primary sections is clear
- Accounts, transactions, and budgets support their core workflows
- Changes made in one area are reflected in related summaries
- Loading, empty, validation, and error states are understandable
- The primary workflows function on desktop and mobile layouts
- The application is deployed and accessible
- A visitor can understand the purpose of Steward within a few minutes

## Out of Scope for the Demo

The demo does not require:

- Real bank connections
- Real financial credentials
- Email verification
- Password recovery
- Payment processing
- Live investment pricing
- Multiple users or shared household accounts
