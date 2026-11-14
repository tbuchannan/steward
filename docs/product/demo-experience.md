# Demo Experience

**Status:** Accepted
**Last verified:** 2026-11-11 (guest login implemented; seeded MVP pending)

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

### Initial Delivery

The first implementation provides guest login without seed data or reset
controls and opens the existing `/accounts` page. Seeded financial workflows
and reset remain required for MVP (`DEMO-03` and `DEMO-04`). Demo authentication,
isolation, expiration, cleanup, and creation rate limiting belong in this first
delivery and are implemented in the current guest-login slice.

Entry requires no registration form or credentials. Show loading feedback,
prevent duplicate submissions, and offer retry on failure. Protected screens
display a visible Demo indicator (`SET-04`).

### Returning and Signing Out

Tabs in the same browser share the demo session. Returning visitors resume an
unexpired demo automatically. Demo entry must not replace an authenticated
regular identity or reset a live demo.

Sign-out ends access to that demo. The next demo login creates a fresh identity.
Regular registration creates a separate account without transferring demo data;
conversion is outside this delivery.

### Expiration and Extension

Active use renews a 24-hour inactivity window. Opening a protected page or
deliberately interacting with the app counts as activity; leaving a tab open,
background polling, and session checks do not. A demo always expires no later
than seven days after creation.

If inactivity expiry interrupts an open session, block normal use and offer
**Extend demo for 24 hours** for one hour after expiry. An explicit click
preserves the identity and data and grants up to 24 hours from that click,
capped at the original seven-day deadline. Activity alone cannot revive an
expired demo.

After the grace period or at the seven-day deadline, show an expiration message
and require an explicit click to start a fresh demo. An expired returning
session without eligibility for the open-session extension flow also starts
fresh. See [data lifecycle](../domain/data-lifecycle.md#demo-records) for
enforcement and cleanup eligibility.

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

Cleanup runs daily and preserves eligible demos during their extension grace
period. Access expiration is enforced immediately, independently of deletion.
Deployment controls are documented in [configuration](../operations/configuration.md).

## Success Criteria

The demo succeeds when requirements `DEMO-01` through `DEMO-05` pass, concurrent visitors cannot observe one another's changes, reset is reliable, and the walkthrough works on supported desktop and mobile viewports.
