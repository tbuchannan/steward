# Wireframes

## Purpose

This document defines the initial low-fidelity interface structure for Steward.

The wireframes describe:

- Page hierarchy
- Navigation
- Content placement
- Common interactions
- Responsive behavior
- Empty states
- Loading states
- Error states
- Reusable interface patterns

These wireframes are structural rather than visual mockups.

They should guide implementation without locking Steward into exact spacing, colors, typography, or final component details.

## Design System

The production interface will use:

- Tailwind CSS
- shadcn/ui
- Shared CSS design tokens
- Light and dark themes

The wireframes intentionally remain low fidelity.

Implementation should primarily compose shadcn/ui components such as:

- Button
- Card
- Input
- Label
- Select
- Dialog
- Alert Dialog
- Sheet
- Dropdown Menu
- Tabs
- Table
- Badge
- Tooltip
- Popover
- Skeleton
- Toast or notification components

Custom Steward components should be built by composing these primitives rather than creating a separate component system from scratch.

## Interface Principles

Steward should feel:

- Clear
- Calm
- Trustworthy
- Efficient
- Modern
- Information-dense without feeling crowded

The interface should prioritize:

- Financial clarity
- Fast data entry
- Clear hierarchy
- Predictable navigation
- Accessible interactions
- Responsive layouts
- Minimal unnecessary decoration

## Primary Application Layout

### Desktop

```text
┌──────────────────────────────────────────────────────────────┐
│ Sidebar        │ Header                                      │
│                ├─────────────────────────────────────────────┤
│ Steward        │ Page title                    User menu      │
│                │                                             │
│ Dashboard      │ Main content                                │
│ Accounts       │                                             │
│ Transactions   │                                             │
│ Budgets        │                                             │
│ Settings       │                                             │
│                │                                             │
│                │                                             │
│ Theme          │                                             │
└──────────────────────────────────────────────────────────────┘
```

### Mobile

```text
┌───────────────────────────────┐
│ Menu   Page title   User menu │
├───────────────────────────────┤
│                               │
│ Main content                  │
│                               │
│                               │
│                               │
└───────────────────────────────┘
```

The mobile menu should open in a sheet or drawer.

## Global Navigation

Primary navigation includes:

- Dashboard
- Accounts
- Transactions
- Budgets
- Settings

The current section should be visually distinct.

Navigation items should include:

- Text labels
- Consistent icons where helpful
- Visible keyboard focus
- Accessible names

Icons should not replace labels in primary navigation.

## Application Header

The authenticated application header may contain:

- Mobile navigation trigger
- Page title
- Optional page actions
- User menu

The user menu may include:

- Account information
- Theme control
- Settings link
- Sign out

Page-specific actions may appear beside the page title on larger screens and below it on smaller screens.

## Public Authentication Layout

Authentication pages should use a simpler layout without the authenticated sidebar.

```text
┌─────────────────────────────────────────┐
│                                         │
│              Steward                    │
│                                         │
│        ┌───────────────────────┐        │
│        │ Authentication form   │        │
│        │                       │        │
│        └───────────────────────┘        │
│                                         │
└─────────────────────────────────────────┘
```

The authentication card should remain readable without feeling oversized.

## Login Page

```text
┌─────────────────────────────────────┐
│ Steward                             │
│                                     │
│ Welcome back                        │
│ Sign in to continue                 │
│                                     │
│ Email                               │
│ [_______________________________]   │
│                                     │
│ Password                            │
│ [_______________________________]   │
│                                     │
│ [ Sign in ]                         │
│                                     │
│ [ Try the demo ]                    │
│                                     │
│ No account? Create one              │
└─────────────────────────────────────┘
```

### Login behavior

The page should support:

- Email input
- Password input
- Password visibility toggle where appropriate
- Submit loading state
- Field validation
- Server authentication errors
- Registration navigation
- Demo login

The submit button should be disabled while the login request is in progress.

Errors should remain visible until corrected or dismissed by a new attempt.

## Registration Page

```text
┌─────────────────────────────────────┐
│ Steward                             │
│                                     │
│ Create your account                 │
│                                     │
│ Name                                │
│ [_______________________________]   │
│                                     │
│ Email                               │
│ [_______________________________]   │
│                                     │
│ Password                            │
│ [_______________________________]   │
│                                     │
│ Confirm password                    │
│ [_______________________________]   │
│                                     │
│ [ Create account ]                  │
│                                     │
│ Already registered? Sign in         │
└─────────────────────────────────────┘
```

### Registration behavior

The page should support:

- Name
- Email
- Password
- Password confirmation
- Client validation
- Server validation errors
- Submission loading state
- Login navigation

Password guidance should be visible before submission rather than shown only after failure.

## Dashboard Page

The dashboard provides a summary of the user's financial position.

### Desktop

```text
┌────────────────────────────────────────────────────────────┐
│ Dashboard                             [ Add transaction ]   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────┐ │
│ │ Net worth        │ │ Monthly income   │ │ Expenses     │ │
│ │ $12,450.00       │ │ $4,200.00        │ │ $2,870.00    │ │
│ │ +2.4%            │ │                  │ │               │ │
│ └──────────────────┘ └──────────────────┘ └──────────────┘ │
│                                                            │
│ ┌──────────────────────────────────┐ ┌───────────────────┐ │
│ │ Spending overview                │ │ Budget summary    │ │
│ │                                  │ │                   │ │
│ │ Chart                            │ │ Progress          │ │
│ │                                  │ │ Categories        │ │
│ └──────────────────────────────────┘ └───────────────────┘ │
│                                                            │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Recent transactions                    View all        │ │
│ │                                                        │ │
│ │ Merchant          Account        Category      Amount  │ │
│ │ Grocery Store     Checking       Groceries     -$72.18 │ │
│ │ Employer          Checking       Income      +$950.00  │ │
│ └────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

### Mobile

```text
┌───────────────────────────────┐
│ Dashboard                     │
│ [ Add transaction ]           │
├───────────────────────────────┤
│ Net worth                     │
│ $12,450.00                    │
├───────────────────────────────┤
│ Monthly income                │
│ $4,200.00                     │
├───────────────────────────────┤
│ Expenses                      │
│ $2,870.00                     │
├───────────────────────────────┤
│ Spending overview             │
│ Chart                         │
├───────────────────────────────┤
│ Budget summary                │
│ Progress                      │
├───────────────────────────────┤
│ Recent transactions           │
│ Transaction cards             │
│ [ View all ]                  │
└───────────────────────────────┘
```

## Dashboard Widgets

Likely dashboard widgets include:

- Net worth
- Monthly income
- Monthly expenses
- Budget status
- Spending by category
- Recent transactions
- Account balances
- Cash-flow trend

Widgets should use shared card patterns.

Each widget should support:

- Title
- Primary value
- Supporting context
- Loading state
- Empty state
- Error state
- Optional action
- Optional expanded view

## Dashboard Widget Expansion

Some widgets may expand into a dialog, sheet, or dedicated page.

```text
Dashboard card
→ User selects card or View details
→ Detailed view opens
→ User filters or explores data
→ User closes or navigates back
```

Large, complex visualizations should generally use a dedicated page rather than an oversized modal.

## Dashboard Empty State

When a new user has no financial data:

```text
┌───────────────────────────────────────┐
│ Welcome to Steward                   │
│                                       │
│ Add your first financial account to   │
│ begin tracking balances and activity. │
│                                       │
│ [ Add an account ]                    │
│ [ Try demo data ]                     │
└───────────────────────────────────────┘
```

The dashboard should guide the user to the next meaningful action.

## Accounts Page

The accounts page lists the user's financial accounts.

### Desktop

```text
┌────────────────────────────────────────────────────────────┐
│ Accounts                                  [ Add account ]  │
├────────────────────────────────────────────────────────────┤
│ Total balance                                              │
│ $12,450.00                                                 │
│                                                            │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────┐ │
│ │ Checking         │ │ Savings          │ │ Credit Card  │ │
│ │ Main Checking    │ │ Emergency Fund   │ │ Rewards Card │ │
│ │ $3,240.00        │ │ $10,500.00       │ │ -$1,290.00   │ │
│ └──────────────────┘ └──────────────────┘ └──────────────┘ │
│                                                            │
│ Archived accounts                                          │
│ [ Show archived ]                                          │
└────────────────────────────────────────────────────────────┘
```

### Mobile

```text
┌───────────────────────────────┐
│ Accounts                      │
│ [ Add account ]               │
├───────────────────────────────┤
│ Total balance                 │
│ $12,450.00                    │
├───────────────────────────────┤
│ Main Checking                 │
│ Checking                      │
│ $3,240.00                     │
├───────────────────────────────┤
│ Emergency Fund                │
│ Savings                       │
│ $10,500.00                    │
├───────────────────────────────┤
│ Rewards Card                  │
│ Credit Card                   │
│ -$1,290.00                    │
└───────────────────────────────┘
```

## Account Card

An account card may show:

- Account name
- Account type
- Current balance
- Institution name if supported
- Last activity date
- Color or icon
- Archived status
- Overflow action menu

Potential menu actions:

- View details
- Edit account
- Archive account
- Restore account

Destructive actions should require confirmation where appropriate.

## Add Account Dialog

```text
┌─────────────────────────────────────┐
│ Add account                         │
│                                     │
│ Account name                        │
│ [_______________________________]   │
│                                     │
│ Account type                        │
│ [ Select account type          v ]  │
│                                     │
│ Starting balance                    │
│ [$ _____________________________]   │
│                                     │
│ Institution                         │
│ [_______________________________]   │
│                                     │
│              [ Cancel ] [ Add ]     │
└─────────────────────────────────────┘
```

Possible account types include:

- Checking
- Savings
- Credit card
- Cash
- Loan
- Investment

The exact supported types should follow the database and product decisions.

## Account Detail Page

```text
┌────────────────────────────────────────────────────────────┐
│ Main Checking                         [ Edit ] [ More ]     │
├────────────────────────────────────────────────────────────┤
│ Current balance                                            │
│ $3,240.00                                                  │
│                                                            │
│ Account information                                        │
│ Type: Checking                                             │
│ Institution: Example Bank                                  │
│                                                            │
│ Recent activity                            [ Add transaction ]│
│                                                            │
│ Date        Description       Category             Amount   │
│ Jul 29      Grocery Store     Groceries            -$72.18  │
│ Jul 28      Employer          Income              +$950.00  │
│                                                            │
│ [ View all transactions ]                                  │
└────────────────────────────────────────────────────────────┘
```

## Transactions Page

The transactions page is the primary financial activity workspace.

### Desktop

```text
┌───────────────────────────────────────────────────────────────┐
│ Transactions                              [ Add transaction ] │
├───────────────────────────────────────────────────────────────┤
│ [ Search transactions... ]                                  │
│                                                               │
│ [ Account v ] [ Category v ] [ Type v ] [ Date range ]       │
│ [ More filters ]                               [ Clear all ]  │
│                                                               │
│ Date       Description      Account      Category      Amount │
│ Jul 29     Grocery Store    Checking     Groceries     -$72.18│
│ Jul 28     Employer         Checking     Income       +$950.00│
│ Jul 27     Electric Co.     Checking     Utilities    -$145.00│
│                                                               │
│ Showing 1–25 of 184                       [ Previous ] [ Next ]│
└───────────────────────────────────────────────────────────────┘
```

### Mobile

```text
┌───────────────────────────────┐
│ Transactions                  │
│ [ Add transaction ]           │
├───────────────────────────────┤
│ [ Search... ]                 │
│ [ Filters ] [ Sort ]          │
├───────────────────────────────┤
│ Grocery Store                 │
│ Checking · Groceries          │
│ Jul 29              -$72.18   │
├───────────────────────────────┤
│ Employer                      │
│ Checking · Income             │
│ Jul 28             +$950.00   │
├───────────────────────────────┤
│ [ Load more ]                 │
└───────────────────────────────┘
```

## Transaction Filters

Transaction filters may include:

- Search
- Account
- Category
- Transaction type
- Start date
- End date
- Minimum amount
- Maximum amount
- Sort order

Active filters should be:

- Visible
- Removable
- Represented in the URL
- Restored through browser navigation

On mobile, filters may open in a sheet.

## Add Transaction Dialog

```text
┌──────────────────────────────────────┐
│ Add transaction                      │
│                                      │
│ Type                                 │
│ [ Expense ] [ Income ] [ Transfer ]  │
│                                      │
│ Account                              │
│ [ Select account                v ]  │
│                                      │
│ Amount                               │
│ [$ ______________________________]   │
│                                      │
│ Description                          │
│ [________________________________]   │
│                                      │
│ Category                             │
│ [ Select category               v ]  │
│                                      │
│ Date                                 │
│ [ July 29, 2026                 ]    │
│                                      │
│ Notes                                │
│ [________________________________]   │
│ [________________________________]   │
│                                      │
│               [ Cancel ] [ Save ]    │
└──────────────────────────────────────┘
```

For transfers, the form should replace the single account field with:

- From account
- To account

The same account must not be selected for both sides.

## Edit Transaction

The edit transaction interface should reuse the transaction form pattern.

It should clearly indicate that an existing transaction is being modified.

Actions may include:

- Save changes
- Cancel
- Delete transaction

Deletion should require confirmation.

## Delete Transaction Confirmation

```text
┌──────────────────────────────────────┐
│ Delete transaction?                  │
│                                      │
│ This action will remove the selected │
│ transaction from Steward.            │
│                                      │
│          [ Cancel ] [ Delete ]       │
└──────────────────────────────────────┘
```

The confirmation should identify the transaction when useful.

## Transaction Empty State

```text
┌───────────────────────────────────────┐
│ No transactions yet                   │
│                                       │
│ Add your first transaction to begin   │
│ tracking income and expenses.         │
│                                       │
│ [ Add transaction ]                   │
└───────────────────────────────────────┘
```

Filtered empty states should differ:

```text
No transactions match these filters.

[ Clear filters ]
```

## Budgets Page

The budgets page organizes spending targets by month and category.

### Desktop

```text
┌──────────────────────────────────────────────────────────────┐
│ Budgets                                     [ Create budget ]│
├──────────────────────────────────────────────────────────────┤
│ [ < ] July 2026 [ > ]                                        │
│                                                              │
│ Monthly income                                               │
│ $4,200.00                                                    │
│                                                              │
│ Assigned                 Spent                  Remaining      │
│ $3,800.00                $2,870.00              $930.00       │
│                                                              │
│ Category          Budgeted        Spent         Remaining     │
│ Groceries         $500.00         $372.18       $127.82       │
│ Housing           $2,350.00       $2,350.00     $0.00         │
│ Utilities         $300.00         $145.00       $155.00       │
│ Entertainment     $200.00         $245.00       -$45.00       │
│                                                              │
│ [ Add category ]                                             │
└──────────────────────────────────────────────────────────────┘
```

### Mobile

```text
┌───────────────────────────────┐
│ Budgets                       │
│ [ < ] July 2026 [ > ]         │
├───────────────────────────────┤
│ Income                        │
│ $4,200.00                     │
│                               │
│ Assigned                      │
│ $3,800.00                     │
│                               │
│ Remaining                     │
│ $930.00                       │
├───────────────────────────────┤
│ Groceries                     │
│ $372.18 of $500.00            │
│ [██████████████------]        │
│ $127.82 remaining             │
├───────────────────────────────┤
│ Entertainment                 │
│ $245.00 of $200.00            │
│ [████████████████████]        │
│ $45.00 over                   │
└───────────────────────────────┘
```

## Budget Month Navigation

Users should be able to:

- Move to the previous month
- Move to the next month
- Select a month directly
- Return to the current month

The selected month should be represented in the URL.

## Budget Category Row

Each budget category should show:

- Category name
- Budgeted amount
- Spent amount
- Remaining amount
- Progress
- Overspending state
- Edit action

Color should not be the only indication of overspending.

Use text such as:

```text
$45.00 over budget
```

## Create Budget Flow

When no budget exists for the selected month:

```text
┌───────────────────────────────────────┐
│ No budget for July 2026               │
│                                       │
│ Create a new budget or copy the       │
│ previous month's categories.          │
│                                       │
│ [ Create from scratch ]               │
│ [ Copy June budget ]                  │
└───────────────────────────────────────┘
```

## Budget Editor

```text
┌────────────────────────────────────────────────────┐
│ Edit July budget                                   │
│                                                    │
│ Expected monthly income                            │
│ [$ ____________________________________________]   │
│                                                    │
│ Categories                                         │
│                                                    │
│ Groceries               [$ 500.00 ]      [ Remove ]│
│ Housing                 [$ 2350.00 ]     [ Remove ]│
│ Utilities               [$ 300.00 ]      [ Remove ]│
│                                                    │
│ [ Add category ]                                   │
│                                                    │
│ Assigned: $3,150.00                                │
│ Unassigned: $1,050.00                              │
│                                                    │
│                         [ Cancel ] [ Save budget ]  │
└────────────────────────────────────────────────────┘
```

The editor should update totals as the user changes category allocations.

These frontend totals are previews.

The backend remains authoritative when saving.

## Budget Progress

Budget progress should communicate:

- Amount spent
- Budget amount
- Amount remaining
- Percentage used
- Whether the category is over budget

Possible labels:

```text
$372.18 of $500.00 spent
```

```text
$127.82 remaining
```

```text
$45.00 over budget
```

## Settings Page

The settings page may use tabs or grouped sections.

### Desktop

```text
┌────────────────────────────────────────────────────────────┐
│ Settings                                                   │
├────────────────────────────────────────────────────────────┤
│ [ Profile ] [ Appearance ] [ Preferences ] [ Demo data ]   │
│                                                            │
│ Profile                                                    │
│ Name                                                       │
│ [____________________________________________]             │
│                                                            │
│ Email                                                      │
│ [____________________________________________]             │
│                                                            │
│                                      [ Save changes ]      │
└────────────────────────────────────────────────────────────┘
```

### Mobile

```text
┌───────────────────────────────┐
│ Settings                      │
├───────────────────────────────┤
│ Profile                       │
│ Appearance                    │
│ Preferences                   │
│ Demo data                     │
└───────────────────────────────┘
```

Selecting a settings section may navigate to a dedicated mobile view.

## Profile Settings

Potential profile settings include:

- Display name
- Email address
- Password management
- Account deletion

Authentication-sensitive changes should use Better Auth-supported flows.

## Appearance Settings

```text
Appearance

Theme
( ) Light
( ) Dark
( ) System

Display density
( ) Comfortable
( ) Compact
```

Display density should only be included if it provides a clear benefit.

Theme changes should preview immediately.

## Financial Preferences

Possible preferences include:

- Default currency
- First day of week
- Budget month behavior
- Date format
- Number formatting

Only approved MVP preferences should be implemented.

## Demo Data Settings

```text
┌────────────────────────────────────────────┐
│ Demo data                                  │
│                                            │
│ Reset the demo account to its original     │
│ financial data.                            │
│                                            │
│ [ Reset demo data ]                        │
└────────────────────────────────────────────┘
```

Reset should require confirmation.

```text
Reset demo data?

All changes made in the demo account will be removed.

[ Cancel ] [ Reset ]
```

The reset action must be limited to the authorized demo user.

## Common Page Header

A common page header may contain:

```text
Page title
Optional description
Primary action
Secondary actions
```

### Desktop

```text
Accounts                                  [ Add account ]
Manage your financial accounts.
```

### Mobile

```text
Accounts
Manage your financial accounts.

[ Add account ]
```

The primary action should remain easy to reach on mobile.

## Data Table Pattern

Desktop data tables should support:

- Clear column headings
- Sort controls
- Row actions
- Loading state
- Empty state
- Error state
- Pagination
- Keyboard-accessible controls

Example:

```text
┌────────────────────────────────────────────────────────────┐
│ Date        Description        Category           Amount   │
├────────────────────────────────────────────────────────────┤
│ Jul 29      Grocery Store      Groceries          -$72.18  │
│ Jul 28      Employer           Income            +$950.00  │
└────────────────────────────────────────────────────────────┘
```

Monetary values should align consistently.

## Mobile List Pattern

Wide financial tables may become cards or compact list rows on mobile.

```text
┌───────────────────────────────┐
│ Grocery Store                 │
│ Checking · Groceries          │
│ Jul 29              -$72.18   │
└───────────────────────────────┘
```

Important information should remain visible without horizontal scrolling when possible.

## Search Pattern

```text
[ Search transactions... ]
```

Search fields should include:

- Visible label or accessible name
- Clear action when text exists
- Loading behavior where applicable
- Keyboard support

Search state should persist in the URL where appropriate.

## Filter Pattern

Desktop:

```text
[ Account v ] [ Category v ] [ Type v ] [ Date range ]
```

Mobile:

```text
[ Filters ] [ Sort ]
```

Active filters may appear as removable badges:

```text
[ Checking × ] [ Groceries × ] [ July 2026 × ]
```

## Pagination Pattern

Desktop:

```text
Showing 1–25 of 184

[ Previous ] [ 1 ] [ 2 ] [ 3 ] [ Next ]
```

Mobile may use:

```text
[ Load more ]
```

or simplified previous and next controls.

The final approach should match the selected server-state and API pagination strategy.

## Dialog Pattern

Dialogs should be used for focused tasks such as:

- Creating an account
- Editing a transaction
- Confirming deletion
- Editing a small budget allocation

Dialogs should:

- Have a visible title
- Explain the action
- Trap focus correctly
- Close with Escape when safe
- Return focus to the triggering control
- Provide clear primary and secondary actions

Long or complex workflows should use dedicated pages instead.

## Sheet Pattern

Sheets may be used for:

- Mobile navigation
- Mobile filters
- Account details
- Compact editing workflows
- Supporting information

A sheet should not be used solely for visual novelty.

## Destructive Action Pattern

Destructive actions include:

- Delete transaction
- Archive account
- Delete account
- Reset demo data

Destructive actions should:

- Use clear labels
- Explain the consequence
- Require confirmation when data loss is meaningful
- Avoid vague labels such as `Continue`

Example:

```text
[ Cancel ] [ Delete transaction ]
```

## Toast Pattern

Toasts may be used for brief confirmations such as:

- Account created
- Transaction updated
- Budget saved
- Settings updated

Toasts should not be the only presentation for:

- Field validation errors
- Important financial warnings
- Authentication failures
- Errors requiring user action

## Loading States

### Page loading

```text
┌───────────────────────────────┐
│ Skeleton heading              │
│ Skeleton cards                │
│ Skeleton table                │
└───────────────────────────────┘
```

### Button loading

```text
[ Saving... ]
```

### Inline loading

```text
Loading transactions...
```

Loading states should prevent duplicate actions without unnecessarily blocking unrelated parts of the page.

## Empty States

An empty state should communicate:

1. What is empty
2. Why it matters
3. What the user can do next

Example:

```text
No accounts yet

Add your first account to start tracking balances.

[ Add account ]
```

## Error States

### Page-level error

```text
┌───────────────────────────────────────┐
│ We couldn't load your transactions.   │
│                                       │
│ Check your connection and try again.  │
│                                       │
│ [ Try again ]                         │
└───────────────────────────────────────┘
```

### Field error

```text
Amount
[$ ____________________]
Enter a valid amount.
```

### Authentication error

```text
The email or password is incorrect.
```

Errors should avoid exposing technical implementation details.

## Not-Found Page

```text
┌───────────────────────────────────────┐
│ Page not found                        │
│                                       │
│ The page may have moved or no longer  │
│ exists.                               │
│                                       │
│ [ Return to dashboard ]               │
└───────────────────────────────────────┘
```

## Unauthorized Session State

When a session expires:

```text
Your session has expired.

Sign in again to continue.

[ Go to sign in ]
```

The application should preserve a safe return destination where appropriate.

## Theme Behavior

Steward should support:

- Light mode
- Dark mode
- System preference

All wireframe patterns should work in both themes.

Theme differences should be handled through design tokens rather than separate layouts.

## Color Usage

The current brand direction uses purple as the primary accent.

Semantic colors may represent:

- Positive values
- Negative values
- Warnings
- Errors
- Informational states

A negative expense value is not automatically an application error.

Color must not be the only method of communicating meaning.

## Typography

Typography should establish a restrained hierarchy.

Recommended levels include:

- Page title
- Section heading
- Card heading
- Body text
- Label
- Supporting text
- Caption
- Financial value

Financial values may use tabular numerals for alignment.

## Spacing

Spacing should be consistent across:

- Page sections
- Cards
- Forms
- Tables
- Dialogs
- Navigation
- Mobile layouts

Implementation should use the Tailwind spacing scale and shared layout components rather than unrelated values.

## Responsive Behavior

### Small screens

- Use one-column layouts.
- Move sidebar navigation into a sheet.
- Stack page-header actions.
- Replace wide tables with cards where appropriate.
- Use full-width form controls.
- Keep primary actions easy to reach.

### Medium screens

- Use reduced dashboard columns.
- Allow collapsible navigation.
- Keep filters compact.
- Preserve readable card widths.

### Large screens

- Use persistent sidebar navigation.
- Use multi-column dashboard layouts.
- Display full data tables.
- Keep content width controlled for readability.

## Accessibility Requirements

All implemented screens should support:

- Keyboard navigation
- Visible focus states
- Semantic headings
- Associated labels
- Accessible validation messages
- Screen-reader-friendly status updates
- Sufficient contrast
- Reduced-motion preferences
- Logical focus movement
- Touch-friendly targets

shadcn/ui provides accessible primitives, but completed Steward workflows must still be tested.

## Keyboard Behavior

Examples of expected behavior:

- Tab moves through controls in a logical order.
- Enter submits forms when appropriate.
- Escape closes dismissible dialogs and sheets.
- Arrow keys operate supported menus and select controls.
- Focus returns to the trigger after closing overlays.
- Destructive actions do not activate accidentally.

## Content Guidelines

Interface text should be:

- Direct
- Specific
- Calm
- Non-technical
- Consistent

Prefer:

```text
Add transaction
```

Avoid:

```text
Create new transactional record
```

Prefer:

```text
We couldn't save this transaction.
```

Avoid:

```text
Mutation failed with status 500.
```

## Reusable Steward Components

Likely shared or feature components include:

```text
AppShell
AppSidebar
MobileNavigation
PageHeader
DashboardWidget
SummaryCard
AccountCard
TransactionTable
TransactionListItem
TransactionForm
BudgetSummary
BudgetProgress
BudgetCategoryRow
CurrencyDisplay
DateDisplay
EmptyState
ErrorState
LoadingState
ConfirmationDialog
FilterBar
PaginationControls
ThemeToggle
UserMenu
```

These components should compose shadcn/ui primitives.

## Non-Goals

These wireframes do not define:

- Final colors
- Final typography
- Final spacing values
- Final icons
- Final chart library
- Final animation details
- Pixel-perfect visual design
- Every possible edge case
- Every future feature

They define the intended structure and interaction model for the MVP.

## Success Criteria

The wireframes are successful when:

- Each primary workflow has a clear page structure.
- Navigation remains consistent.
- Common actions are easy to find.
- Mobile layouts remain usable.
- Loading, empty, and error states are defined.
- Forms provide clear validation feedback.
- Financial information is easy to scan.
- shadcn/ui components can be mapped naturally to the designs.
- Tailwind CSS can implement the layouts without unrelated styling systems.
- New screens can reuse established patterns.
