# Sitemap and Navigation

**Status:** Accepted
**Last verified:** 2026-08-06

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

## Layout Hierarchy

The root layout owns document-level concerns and the global not-found boundary.
Its public authentication layout contains `/login` and `/register`. Its protected
application layout contains every authenticated route and owns the persistent
primary navigation, user menu, responsive shell, and session boundary.

The current route family determines the active primary-navigation item:

| Route family    | Active primary item |
| --------------- | ------------------- |
| `/dashboard`    | Dashboard           |
| `/accounts...`  | Accounts            |
| `/transactions` | Transactions        |
| `/budgets...`   | Budgets             |
| `/settings`     | None                |

Settings remains available from the user menu rather than the primary
navigation. Its user-menu link exposes the current state when the Settings page
is open.

`/accounts/:accountId` replaces the account-list page content while retaining
the protected application layout and the active Accounts navigation item. The
detail page provides a visible `Accounts` link directly to `/accounts`; it does
not rely on browser Back as the only way to return to the collection.

`/budgets/:year/:month` similarly retains the protected layout and the active
Budgets navigation item. Transaction search parameters do not change the active
Transactions item.

## Route-Free Workflows

The following MVP interactions do not create routes or browser-history entries:

- Add and edit an account in a dialog on desktop or a sheet on small screens.
- Confirm account archival in a destructive-action dialog.
- Add and edit a transaction in a dialog on desktop or a sheet on small screens.
- Confirm transaction deletion in a destructive-action dialog.
- Edit allocations and add a category within the selected monthly budget page.
- Confirm demo-data reset in a destructive-action dialog.

Opening one of these interactions leaves the underlying page URL unchanged.
Refreshing restores that page and its URL-owned state, but it closes the
interaction and discards its temporary unsaved draft. Opening or closing an
interaction does not affect Back or Forward history. Attempting to dismiss a
dirty editor or leave its page follows the shared unsaved-change protection.

## Root Route

- An unauthenticated visitor is redirected to `/login`.
- An authenticated user is redirected to `/dashboard`.
- A safe validated `returnTo` value restores the originally requested protected route after sign-in.

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

## Authentication and Protected Routes

`/login` and `/register` are public routes. Dashboard, account, transaction,
budget, and settings routes are protected by their shared application layout.
The protected layout resolves the authentication session before rendering a
protected child route. While the session is unresolved, it shows a neutral
loading state rather than protected content.

When an unauthenticated visitor requests a protected route, Steward redirects
to `/login` and stores the requested application-relative pathname and search
parameters in `returnTo`. The redirect replaces the current browser-history
entry. After successful authentication, Steward replaces the login entry with
the validated `returnTo` destination or `/dashboard` when no valid destination
exists.

A valid `returnTo` value must resolve to the current Steward origin, match a
known protected frontend route, and must not resolve to `/login` or `/register`.
External, protocol-relative, malformed, unknown, and public destinations are
discarded. Frontend route protection improves navigation behavior but does not
replace API authentication or server-side record authorization.

An authenticated user who opens `/login` or `/register` is redirected to
`/dashboard`. Signing out clears private client state and replaces the current
history entry with `/login`; using Back cannot render protected content without
a newly valid session.

## Unknown and Invalid Routes

An unrecognized top-level URL shows the global not-found page. Its safe primary
action leads to `/dashboard` for an authenticated user and `/login` for an
unauthenticated visitor. An unrecognized or invalid URL beneath a protected
route family resolves the session first and then shows a not-found state within
the protected application layout.

An unauthenticated request for a recognized protected detail route redirects to
login before Steward attempts to load the requested resource. After
authentication, a malformed account ID, a missing account, and an account owned
by another user produce the same account not-found presentation. The protected
shell keeps Accounts active and provides a safe link to `/accounts`.

The API likewise treats another user's resource as not found. The frontend must
not use route matching, error wording, timing-dependent UI, or cached data to
reveal whether an inaccessible resource exists. Invalid search parameters are
handled by the canonicalization rules for their collection rather than by the
route-level not-found page.

## Budget URL State

`/budgets` redirects to `/budgets/:year/:month` for the current month in the
authenticated user's persisted timezone. The redirect replaces the current
browser-history entry so Back does not return to the redirecting URL.

The `year` segment is exactly four digits from `0001` through `9999`, and the
`month` segment is exactly two digits from `01` through `12`. A path that does
not follow this canonical form shows the protected not-found state. A valid
month without a saved budget is not an error; it displays the empty editable
budget described in the budget workflow.

Previous- and next-month navigation creates normal browser-history entries.
Consequently, Back and Forward restore the previously viewed month, and refresh
or a direct link loads the month named by the URL rather than recalculating the
current month.

## Account URL State

`/accounts` displays active financial accounts by default. The explicit
archived view uses `/accounts?status=archived` and displays archived accounts
without mixing them into the active collection. The default `status=active`
value is omitted from the canonical URL.

Changing between active and archived views creates a normal browser-history
entry so Back and Forward restore the prior collection. Any unsupported or
empty `status` value resolves to the active default and is removed from the
canonical URL without adding a history entry.

## Transaction URL State

The transaction collection uses `/transactions` with these optional search
parameters:

| Parameter   | Meaning                          | Accepted values                                      | Default        |
| ----------- | -------------------------------- | ---------------------------------------------------- | -------------- |
| `q`         | Search text                      | Non-empty trimmed text                               | No search      |
| `accountId` | Financial-account filter         | One financial-account ID                             | All accounts   |
| `category`  | Category scope                   | One category ID or `uncategorized`                   | All categories |
| `type`      | Transaction-type filter          | `income`, `expense`, or `refund`                     | All types      |
| `from`      | Inclusive transaction-date start | A valid `YYYY-MM-DD` date                            | No lower bound |
| `to`        | Inclusive transaction-date end   | A valid `YYYY-MM-DD` date                            | No upper bound |
| `sort`      | Transaction ordering             | `date-desc`, `date-asc`, `amount-desc`, `amount-asc` | `date-desc`    |
| `page`      | Results page                     | A positive integer                                   | `1`            |

Defaults and empty values are omitted from the canonical URL. The page size is
fixed by the application and is not URL-owned in the MVP. Changing `q`, a
filter, or `sort` resets `page` to `1` and therefore removes it from the URL.

Invalid search parameters resolve to their documented defaults and the URL is
replaced with its canonical form without adding a browser-history entry. When
both dates are valid but `from` is later than `to`, both date filters are
discarded. A valid filter that matches no accessible records shows the filtered
empty state; it does not make the route invalid.

A malformed or non-positive `page` value resolves to page `1`. When a positive
page value exceeds the last available page, Steward replaces it with the last
available page while preserving the active filters and sort. When no records
match, page `1` remains canonical and the page parameter is omitted. The same
rules apply when a mutation removes the final record from the current page.

Omitting `category` includes every category assignment and uncategorized
transactions. A category ID selects that category, while
`category=uncategorized` selects only transactions without a category. This
allows dashboard attention items to link directly to the relevant transaction
collection.

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
