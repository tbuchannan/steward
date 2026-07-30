# MVP Requirements

**Status:** Accepted
**Last verified:** 2026-07-30

This document is the authoritative source for MVP scope. Other documents reference these IDs instead of redefining scope.

## Authentication

- **AUTH-01 — Register:** A visitor can register with name, email address, password, and password confirmation.
- **AUTH-02 — Sign in:** A registered user can sign in with email address and password.
- **AUTH-03 — Session persistence:** A valid session survives a normal page reload.
- **AUTH-04 — Protected access:** Unauthenticated requests cannot access protected pages or financial data.
- **AUTH-05 — Sign out:** Signing out invalidates the session and returns the user to login.
- **AUTH-06 — Ownership:** A user cannot read or mutate another user's financial records.

## Demo

- **DEMO-01 — Demo entry:** A visitor can enter an authenticated demo without providing personal information.
- **DEMO-02 — Isolation:** Each demo visitor receives a distinct identity and financial dataset.
- **DEMO-03 — Seed data:** The demo contains internally consistent accounts, transactions, categories, a current budget, history, and at least one defined attention item.
- **DEMO-04 — Reset:** A demo visitor can restore only their dataset to the canonical seed state without ending the session.
- **DEMO-05 — Cleanup:** Expired demo identities and their financial records can be removed safely.

## Application Shell

- **SHELL-01 — Navigation:** An authenticated user can navigate among Dashboard, Accounts, Transactions, Budgets, and Settings.
- **SHELL-02 — Responsive layout:** Primary workflows remain usable on supported mobile and desktop layouts.
- **SHELL-03 — Theme:** A user can select light, dark, or system theme, and the preference survives navigation and reload.
- **SHELL-04 — Async states:** Protected pages provide understandable loading, empty, validation, authentication, and error states.

## Dashboard

- **DASH-01 — Summary:** The dashboard displays available cash, credit debt, monthly income, monthly spending, and budget progress using the formulas in [financial rules](../domain/financial-rules.md).
- **DASH-02 — Activity:** The dashboard displays recent transactions and spending by category.
- **DASH-03 — Attention:** The dashboard displays deterministic attention items defined in [financial rules](../domain/financial-rules.md).
- **DASH-04 — Navigation:** Dashboard summaries link to the related account, transaction, or budget view.
- **DASH-05 — Consistency:** Saved account, transaction, and budget changes appear in relevant summaries without a manual browser reload.

## Accounts

- **ACCT-01 — List:** A user can view active financial accounts grouped by type.
- **ACCT-02 — Details:** A user can view an account and its related transactions.
- **ACCT-03 — Create:** A user can create a checking, savings, credit-card, cash, loan, or manually valued investment account.
- **ACCT-04 — Edit:** A user can edit an account they own.
- **ACCT-05 — Archive:** A user can archive an account without losing its transaction history.
- **ACCT-06 — Archived access:** Archived accounts are absent from default active views but remain available in historical records and an explicit archived view.

Investment holdings, pricing, performance, and dedicated investment analytics are not included.

## Transactions

- **TXN-01 — List:** A user can view their transactions with deterministic ordering and pagination.
- **TXN-02 — Create:** A user can create an income, expense, or refund transaction for an account they own.
- **TXN-03 — Edit:** A user can edit a transaction they own.
- **TXN-04 — Delete:** A user can delete a transaction they own after confirmation.
- **TXN-05 — Categorize:** A user can assign or change a transaction category.
- **TXN-06 — Search and filter:** A user can search and filter transactions by supported account, category, type, and date criteria.
- **TXN-07 — Sort:** A user can sort transactions by an approved date or amount ordering.
- **TXN-08 — Recalculation:** Transaction mutations update related balances, budgets, and summaries consistently.

Account-to-account transfers are not included.

## Budgets

- **BUD-01 — Monthly view:** A user can view a budget for a selected calendar month and navigate between months.
- **BUD-02 — Category organization:** Budget categories are displayed in groups.
- **BUD-03 — Manage allocations:** A user can add a category to a budget and edit or remove its monthly allocation.
- **BUD-04 — Progress:** The budget shows allocated, spent, remaining, and overspent values using [financial rules](../domain/financial-rules.md).
- **BUD-05 — Save or cancel:** A user can save a valid set of edits or cancel all unsaved edits.
- **BUD-06 — Dashboard consistency:** Saved budget changes appear in dashboard summaries without a manual reload.

Copying a prior month's budget is not included.

## Settings

- **SET-01 — Identity:** A user can view their authenticated name and email address.
- **SET-02 — Appearance:** A user can select light, dark, or system theme.
- **SET-03 — Sign out:** A user can sign out from Settings or the authenticated user menu.
- **SET-04 — Demo controls:** A demo user can see a demo indicator and reset their demo data.

Profile editing, display density, currency selection, date-format selection, password management, and session management are not included.

## Quality and Delivery

- **QUAL-01 — Authorization:** Protected data is authorized on the server, not only hidden in the UI.
- **QUAL-02 — Validation:** Invalid input receives useful field-level or request-level feedback.
- **QUAL-03 — Accessibility:** Core workflows meet the requirements in [accessibility](../quality/accessibility.md).
- **QUAL-04 — Verification:** High-risk financial, authentication, authorization, and demo behaviors have automated tests.
- **QUAL-05 — Deployment:** A publicly accessible production deployment can complete the primary demo workflow.
- **QUAL-06 — Documentation:** Local setup, configuration, migration, deployment, and recovery instructions match the implemented system.

## MVP Completion

The MVP is complete only when every requirement above is implemented or explicitly removed through an accepted scope decision, its critical traceability entries pass, and the primary demo workflow succeeds on supported desktop and mobile viewports.
