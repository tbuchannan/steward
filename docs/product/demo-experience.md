# Demo Experience

**Status:** Accepted
**Last verified:** 2026-08-03

## Goal

A visitor should understand Steward's purpose and complete its primary financial workflows without providing personal or financial information.

## Isolation Model

The demo must not use one shared mutable user. Each visitor receives:

1. A temporary Better Auth identity and normal authenticated session.
2. A new financial dataset cloned from immutable canonical seed definitions.
3. Authorization through the same protected routes and ownership checks as a regular user.
4. Application-owned demo metadata with creation and expiration timestamps used
   for reset eligibility and scheduled cleanup.

The canonical seed definitions are never mutated by visitors.

## Entry

The login page offers:

- Register
- Sign in
- Continue with Demo

`Continue with Demo` creates a temporary identity, seeds its data, creates a normal session, and redirects to the dashboard. Failures must roll back partial identity or financial records where practical.

## Seed Dataset

Each dataset includes:

- Checking, savings, credit-card, loan, and manually valued investment accounts
- Recent income, expense, and refund transactions
- User-owned categories
- Current and historical monthly budget data
- Summaries consistent with the domain formulas
- At least one uncategorized transaction
- At least one overspent budget category

Seed dates should be generated relative to a documented reference date so the current-month experience does not become stale.

The demo records activity only. Demo actions cannot initiate real financial activity.

## Primary Walkthrough

1. Enter the demo.
2. Review dashboard balances, monthly activity, budget progress, and attention items.
3. Review active accounts and one account's transaction history.
4. Create or edit a transaction and assign a category.
5. Confirm account, budget, and dashboard values update.
6. Edit a monthly budget allocation and save it.
7. Change the theme.
8. Reset the isolated demo dataset.
9. Sign out and confirm protected routes are no longer accessible.

## Reset

Reset is one protected database transaction:

1. Validate the session.
2. Confirm the identity is a demo identity.
3. Delete or replace only that identity's financial data.
4. Recreate the canonical dataset.
5. Preserve the current identity and session.
6. Roll back the entire reset on failure.

The reset boundary includes accounts, transactions, categories, budgets,
allocations, and investment balance snapshots. It preserves Better Auth records,
demo metadata and expiration, and user preferences such as theme and timezone.
The session-derived user ID is the only reset target; a client cannot choose an
identity.

## Cleanup

Expired demo identities must be removed by an idempotent scheduled job. Cleanup
rechecks expiration and deletes the expired identity's financial data, user
preferences, demo metadata, sessions, authentication account, and user record in
a safe dependency order. Authentication records are removed through
Better Auth-supported server behavior; Steward does not take ownership of their
schema or lifecycle.

Cleanup never targets regular identities, unexpired demo identities, canonical
seed definitions, or another visitor's dataset. A failed cleanup cannot commit
a partially removed identity, and retrying an already completed cleanup is a
successful no-op.

The retention period and cleanup schedule are deployment configuration, documented in [configuration](../operations/configuration.md).

## Success Criteria

The demo succeeds when requirements `DEMO-01` through `DEMO-05` pass, concurrent visitors cannot observe one another's changes, reset is reliable, and the walkthrough works on supported desktop and mobile viewports.
