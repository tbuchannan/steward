# Sitemap and Navigation

**Status:** Accepted
**Last verified:** 2026-07-30

## Route Map

```text
/
├── /login
├── /register
└── authenticated
    ├── /dashboard
    ├── /accounts
    │   └── /accounts/:accountId
    ├── /transactions
    ├── /budgets
    │   └── /budgets/:year/:month
    └── /settings
```

Account and transaction creation and editing use dialogs on desktop and sheets on small screens. They do not require dedicated routes for the MVP. A later implementation may add routes when deep links or browser history materially improve the workflow.

## Root Route

- An unauthenticated visitor is redirected to `/login`.
- An authenticated user is redirected to `/dashboard`.
- A safe validated `returnTo` value may restore the originally requested protected route after sign-in.

## Primary Navigation

Authenticated primary navigation contains:

- Dashboard
- Accounts
- Transactions
- Budgets

Settings and Sign out are available from the user menu. On small screens, the primary destinations use a compact navigation pattern that remains keyboard and screen-reader accessible.

## Navigation Rules

- The current primary destination has a visible and programmatically exposed active state.
- Browser Back and Forward preserve meaningful filters, page number, and budget month.
- Filters and pagination that users may share or revisit belong in URL search parameters.
- Successful mutations return focus to a sensible control and refresh affected visible data.
- Unauthenticated access to protected routes returns to login without rendering protected content.
- Unknown routes show a not-found page with a safe navigation action.

## Deferred Routes

The following are not part of the MVP:

```text
/insights
/investments
/goals
/import
/settings/security
```

See [MVP requirements](../product/mvp-requirements.md) for authoritative scope and [frontend architecture](../architecture/frontend.md) for route implementation.
