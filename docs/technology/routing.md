# Routing

## Decision

Steward will use TanStack Router for client-side routing.

The router will run inside the React and Vite frontend.

Steward will use TanStack Router’s file-based routing approach unless implementation experience reveals a concrete reason to switch to code-based routing.

## Selected Technologies

Routing uses:

- TanStack Router
- React
- TypeScript
- Vite
- TanStack Router’s Vite plugin

## Why TanStack Router

TanStack Router was selected because it provides:

- Type-safe routes
- Type-safe route parameters
- Type-safe search parameters
- Nested layouts
- Route-level context
- Route loaders
- Navigation APIs
- File-based and code-based configuration
- Vite integration
- Support for code splitting

These capabilities fit Steward’s dashboard structure and URL-driven transaction and budget workflows.

## Routing Strategy

The initial implementation should use file-based routing.

TanStack Router’s Vite plugin generates the route tree from files inside:

```text
src/routes/
```

The generated route tree should not be edited manually.

A conceptual structure is:

```text
src/
├── router.tsx
├── routeTree.gen.ts
└── routes/
    ├── __root.tsx
    ├── index.tsx
    ├── login.tsx
    ├── register.tsx
    ├── _authenticated.tsx
    └── _authenticated/
        ├── dashboard.tsx
        ├── accounts/
        │   ├── index.tsx
        │   ├── new.tsx
        │   └── $accountId/
        │       ├── index.tsx
        │       └── edit.tsx
        ├── transactions/
        │   ├── index.tsx
        │   ├── new.tsx
        │   └── $transactionId.edit.tsx
        ├── budgets/
        │   ├── index.tsx
        │   └── $year.$month.tsx
        └── settings/
            ├── index.tsx
            ├── profile.tsx
            └── security.tsx
```

The final filenames should follow the version of TanStack Router installed when the project is scaffolded.

## Root Route

The root route owns application-wide concerns.

It may provide:

- Router context
- Error boundaries
- Not-found handling
- Development tools
- Global providers
- Application metadata where appropriate

The root route should not contain feature-specific business logic.

## Public Routes

Public routes include:

```text
/login
/register
```

The root path should redirect based on authentication state:

```text
/
├── Authenticated → /dashboard
└── Unauthenticated → /login
```

Authenticated users visiting login or registration should be redirected to the dashboard.

## Authenticated Layout Route

Protected pages should live under a pathless authenticated layout route.

The authenticated route boundary should:

- Check authentication state
- Prevent protected child routes from rendering without a valid session
- Redirect unauthenticated users to login
- Render the application shell
- Provide authenticated route context where useful

Conceptually:

```text
_authenticated
├── Dashboard
├── Accounts
├── Transactions
├── Budgets
└── Settings
```

The frontend route guard improves user experience.

Fastify still independently enforces authentication and authorization for API requests.

## Application Routes

The initial application route map is:

```text
/
├── /login
├── /register
├── /dashboard
├── /accounts
│   ├── /accounts/new
│   ├── /accounts/:accountId
│   └── /accounts/:accountId/edit
├── /transactions
│   ├── /transactions/new
│   └── /transactions/:transactionId/edit
├── /budgets
│   └── /budgets/:year/:month
└── /settings
    ├── /settings/profile
    └── /settings/security
```

Some creation and editing workflows may later use dialogs or drawers instead of dedicated pages.

If they do, routes may still be used when deep linking and browser navigation provide value.

## Route Parameters

Route parameters should identify specific resources or time periods.

Examples:

```text
/accounts/:accountId
/transactions/:transactionId/edit
/budgets/:year/:month
```

Route parameters should be validated before use.

A valid parameter format does not prove that the authenticated user owns the requested record.

Ownership remains a Fastify and PostgreSQL responsibility.

## Search Parameters

TanStack Router search parameters should represent shareable page state.

The transactions page may use:

```text
/transactions
  ?search=grocery
  &account=account-id
  &category=category-id
  &type=expense
  &from=2026-07-01
  &to=2026-07-31
  &page=2
  &sort=date-desc
```

The budget page may use search parameters for secondary display state when necessary, while the selected year and month remain path parameters.

## URL State Rules

State should be stored in the URL when it should be:

- Shareable
- Bookmarkable
- Restorable after reload
- Preserved with browser back and forward navigation
- Meaningful to the page being viewed

Examples include:

- Search queries
- Filters
- Pagination
- Sort order
- Selected account tabs
- Selected budget month

Temporary state should generally remain local.

Examples include:

- Whether a tooltip is open
- Temporary form values
- Hover state
- Unsaved modal input

## Search Parameter Validation

Search parameters should be parsed and validated through TanStack Router.

Invalid or unsupported values should fall back to safe defaults.

Examples:

```text
page < 1
→ page 1

unsupported sort
→ default sort

invalid date
→ ignored or rejected with a clear state
```

Feature components should receive typed search values rather than repeatedly parsing raw strings.

## Route Loaders

Route loaders may be used to:

- Check required authentication state
- Preload critical page data
- Validate route-dependent prerequisites
- Coordinate navigation-level error handling

Loaders should not become a second unstructured data layer.

The final server-state solution should determine whether data fetching primarily occurs through:

- Route loaders
- Feature hooks
- A combination of loaders and cached queries

## Authentication Redirects

When an unauthenticated user requests a protected route:

```text
Protected route requested
→ Redirect to /login
→ Preserve intended destination
→ User signs in
→ Return to intended destination
```

The intended destination should be validated before redirecting to avoid unsafe arbitrary redirects.

## Navigation

Internal navigation should use TanStack Router APIs.

The frontend should avoid:

- Hard-coded full-page reloads
- Manual URL string construction when typed route APIs are available
- Direct history manipulation
- Duplicate route constants disconnected from the router

Standard anchor behavior may still be appropriate for external links.

## Route Context

Router context may expose frontend-wide dependencies such as:

- Authentication client or session access
- Server-state client
- API client
- Feature flags where eventually needed

Route context should not become a container for arbitrary mutable global state.

## Pending States

Navigation that requires data should provide clear pending feedback.

Pending UI may include:

- Page-level skeletons
- Section placeholders
- Loading indicators
- Disabled repeated actions

The application shell should generally remain visible during authenticated page transitions.

## Error Boundaries

Routes should provide useful error boundaries for unexpected rendering or loader failures.

Error states should:

- Explain that the page could not load
- Preserve the application shell where practical
- Provide a retry action
- Provide navigation to a safe page
- Avoid exposing stack traces in production

Expected API failures should normally be handled as feature states rather than unhandled route errors.

## Not-Found Behavior

Unknown routes should display a not-found page.

A not-found page should provide:

- A clear message
- A link to the dashboard or login
- Navigation appropriate to authentication state

A missing financial resource may use a route-level not-found state after Fastify confirms that the record does not exist or is unavailable to the user.

## Unsaved Changes

Forms with meaningful unsaved changes should warn the user before navigation discards them.

Examples include:

- Editing a budget
- Editing an account
- Creating a transaction
- Editing a transaction

The warning should not appear when no changes have been made.

## Scroll Behavior

Navigation should use predictable scroll behavior.

Expected behavior includes:

- New pages generally begin at the top.
- Browser back navigation should restore position where practical.
- Dialog and drawer interactions should not unexpectedly change page position.

The router’s scroll restoration support may be used.

## Route-Level Code Splitting

Route-level code splitting should be enabled when supported by the chosen TanStack Router file-based setup.

This is especially useful for sections such as:

- Budgets
- Settings
- Future analytics
- Future investments

Code splitting should not create overly fragmented loading behavior for very small route modules.

## Development Tools

TanStack Router development tools may be enabled in local development.

They should not be included in production unless deliberately configured.

## Testing

Routing tests should cover:

### Public routes

- Login renders while unauthenticated
- Registration renders while unauthenticated
- Authenticated users redirect away from authentication routes

### Protected routes

- Unauthenticated users redirect to login
- Intended destinations are preserved
- Authenticated users can access protected routes

### Parameters

- Account IDs are parsed correctly
- Transaction IDs are parsed correctly
- Budget year and month are validated
- Invalid parameters produce safe states

### Search parameters

- Transaction filters are parsed
- Defaults are applied
- Invalid search values are handled
- Pagination and sorting survive navigation

### Navigation

- Dashboard widgets reach the expected pages
- Browser back and forward behavior works
- Unsaved-change warnings work
- Unknown paths render the not-found route

## Non-Goals

The initial routing implementation will not use:

- React Router
- Next.js App Router
- TanStack Start
- A custom router
- Server-side route rendering
- Multiple routing systems
- Manual route matching

## Success Criteria

The routing decision is successful when:

- Routes are type safe.
- Public and protected sections are clearly separated.
- Authentication redirects behave predictably.
- URL state supports transaction filters and pagination.
- Budget months are directly addressable.
- Nested layouts reduce duplication.
- Navigation preserves browser expectations.
- Route errors and not-found states are understandable.
- Feature code does not manually parse routing state throughout the application.
