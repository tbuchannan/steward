# Frontend

## Decision

Steward will use React and TypeScript for the frontend.

Vite will provide the local development server and production build tooling.

TanStack Router will provide client-side routing.

Zod will provide runtime validation.

Tailwind CSS will provide utility-based styling.

shadcn/ui will provide customizable UI component implementations.

Vercel will host the production frontend and preview deployments.

## Selected Technologies

The confirmed frontend technologies are:

- React
- TypeScript
- Vite
- TanStack Router
- Zod
- Tailwind CSS
- shadcn/ui
- Vercel

Still undecided:

- Server-state management
- Form management
- Charting library
- Frontend testing tools
- Primary icon library
- Client-side error monitoring

## Responsibilities

The frontend is responsible for:

- Rendering the Steward interface
- Managing client-side navigation
- Presenting authentication state
- Communicating with the Fastify API
- Managing forms and user input
- Validating user input for usability
- Parsing URL search state
- Displaying financial information
- Managing loading, empty, success, and error states
- Supporting responsive layouts
- Managing light and dark themes
- Providing accessible interactions

The frontend must not:

- Connect directly to PostgreSQL
- Import the Drizzle database client
- Treat route-level checks as authorization
- Trust client-provided user identifiers
- Treat client validation as a security boundary
- Store authentication state as an unverified custom flag
- expose server secrets
- Replace authoritative backend financial rules

The frontend may perform calculations needed for presentation, previews, and immediate feedback.

The backend remains authoritative for persisted financial values and business decisions.

## Rendering Model

The initial frontend will be a client-rendered single-page application.

```text
Browser
→ Load React application
→ TanStack Router resolves the route
→ Route search state is validated
→ Authentication state is resolved
→ Data is requested from Fastify
→ React renders the page
```

Server-side rendering is not required for the MVP.

The architecture may be revisited later if Steward develops public, search-indexed pages or other requirements that benefit from server rendering.

## Deployment Model

The frontend will be built with Vite and deployed to Vercel.

```text
Git repository
→ Vercel build
→ Vite production build
→ Static frontend deployment
```

Vercel may also provide preview deployments for pull requests and eligible branches.

Because Steward uses client-side routing, Vercel must rewrite application routes to the frontend entry document.

Conceptually:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

The final configuration should account for any static files or platform paths that require different handling.

## Proposed Source Structure

The exact source structure depends on the repository and routing decisions.

A likely frontend structure is:

```text
src/
├── assets/
├── components/
│   ├── ui/
│   └── shared/
├── features/
│   ├── accounts/
│   ├── authentication/
│   ├── budgets/
│   ├── dashboard/
│   ├── settings/
│   └── transactions/
├── hooks/
├── lib/
│   ├── api/
│   ├── auth/
│   ├── environment/
│   ├── validation/
│   └── utilities/
├── routes/
├── styles/
├── main.tsx
├── router.tsx
└── routeTree.gen.ts
```

The generated route-tree file is expected only if TanStack Router's file-based routing is selected.

If code-based routing is selected instead, that file may not exist.

Feature code should remain grouped by domain even when route definitions follow URL hierarchy.

## Application Entry Point

The application entry point should:

1. Load validated public environment configuration.
2. Create or import the router.
3. Initialize application-level providers.
4. Render the React application.
5. Register global error handling where appropriate.

Conceptually:

```text
main.tsx
→ Environment configuration
→ API or query provider
→ Authentication provider where required
→ Router provider
→ React render
```

The exact provider structure depends on the remaining server-state and form decisions.

## UI Architecture

The frontend should build UI in layers:

```text
Tailwind CSS and design tokens
                ↓
shadcn/ui components
                ↓
Shared application components
                ↓
Feature components
                ↓
Routes and pages
```

### UI primitives

Examples include:

- Button
- Input
- Card
- Dialog
- Sheet
- Table
- Tabs
- Badge
- Select
- Tooltip

These should generally live in:

```text
components/ui/
```

### Shared components

Examples include:

- PageHeader
- EmptyState
- ErrorState
- ConfirmationDialog
- SearchField
- PaginationControls
- ThemeToggle
- CurrencyDisplay

### Feature components

Examples include:

- AccountCard
- TransactionTable
- BudgetProgress
- NetWorthSummary
- SpendingSummary
- RecentTransactions
- DashboardWidget

Feature components should live close to the domain that owns them.

## Styling

The frontend uses:

- Tailwind CSS
- shadcn/ui
- CSS custom properties

Tailwind CSS provides:

- Layout
- Spacing
- Typography
- Responsive variants
- Visual states
- Theme-aware utilities

shadcn/ui provides source-controlled component implementations that Steward can customize.

The frontend should use shared tokens and reusable component variants rather than unrelated one-off values.

The complete styling decision is documented in:

```text
docs/technology/styling.md
```

## Routing

TanStack Router provides:

- Type-safe route definitions
- Nested layouts
- Route parameters
- Search-parameter validation
- Route lifecycle hooks
- Route-level data coordination
- Lazy route loading
- Error and not-found boundaries

Authentication checks may use route lifecycle features such as `beforeLoad`.

These checks improve navigation behavior but do not replace backend authorization.

## Initial Route Structure

The initial route map may include:

```text
/
├── login
├── register
└── app
    ├── dashboard
    ├── accounts
    │   └── $accountId
    ├── transactions
    │   └── $transactionId
    ├── budgets
    │   └── $year/$month
    └── settings
```

The exact public paths may omit the `/app` segment.

The final structure should align with the approved sitemap and authentication flow.

## Route Layouts

Likely layouts include:

### Public layout

Used for:

- Login
- Registration
- Public error pages

### Authenticated application layout

Used for:

- Dashboard
- Accounts
- Transactions
- Budgets
- Settings

The authenticated layout may provide:

- Sidebar navigation
- Header
- Mobile navigation
- User menu
- Main content area

Route layouts should avoid duplicating navigation and authentication-loading behavior across pages.

## Authentication Checks

Protected routes should check whether the frontend has a valid Better Auth session.

The expected frontend behavior is:

```text
Protected route requested
→ Session state loads
→ Missing session redirects to login
→ Valid session renders the protected layout
```

This is a user-experience feature.

The Fastify backend must independently verify the session for every protected API operation.

## Search Parameters

URL search state should be used for values that should be:

- Shareable
- Bookmarkable
- Restorable
- Preserved through navigation
- Compatible with browser history

Examples include:

- Transaction search
- Account filters
- Category filters
- Transaction type
- Date range
- Sorting
- Page number
- Page size
- Selected budget month

Zod should validate raw search values before route components use them.

Invalid values should resolve to documented defaults or a clear route-level error state.

## Runtime Validation

Zod should validate data at frontend trust boundaries.

Examples include:

- Form input
- Route search parameters
- Frontend environment variables
- Browser-storage values
- Selected API responses
- Imported data when implemented

Types should generally be inferred from Zod schemas.

Client validation improves usability but does not protect the backend.

## Forms

The form library has not yet been selected.

Regardless of the selected library:

- Zod should define form validation.
- Form values should remain type-safe.
- Field and form-level errors should be supported.
- Server validation errors should be mapped into the interface.
- Duplicate submission should be prevented.
- Valid user input should be preserved after recoverable errors.
- Accessible labels and error associations should be maintained.

Likely forms include:

- Registration
- Login
- Account creation
- Account editing
- Transaction creation
- Transaction editing
- Budget creation
- Budget allocation editing
- Settings

## API Client

The frontend should access the Fastify API through a shared API-client layer.

The API client should be responsible for:

- Resolving the API base URL
- Sending JSON requests
- Including authentication credentials
- Parsing successful responses
- Parsing the standard API error shape
- Handling network failures
- Supporting request cancellation where useful

Feature components should not repeatedly implement raw fetch behavior.

Conceptually:

```ts
fetch(`${apiUrl}/api/accounts`, {
  credentials: "include",
});
```

The exact implementation may be wrapped by the selected server-state library.

## Cross-Origin Requests

The frontend will be hosted on Vercel while the API will run on Railway.

Unless custom domains make them the same origin, browser requests will be cross-origin.

Credentialed requests require coordinated configuration across:

- Frontend request credentials
- Fastify CORS
- Better Auth trusted origins
- Cookie attributes
- Production domains
- Preview domains

The frontend should not assume cookies are included without explicitly configuring the API client.

## Authentication

Better Auth provides authentication.

Frontend responsibilities include:

- Registration interface
- Login interface
- Logout actions
- Session loading
- Session-aware navigation
- Protected-route redirects
- Authentication error presentation

The frontend must not:

- Validate passwords against stored credentials
- Determine whether access is authorized
- Build a parallel authentication token system
- Store secrets in local storage
- Trust a locally stored `isAuthenticated` flag

## Server State

The server-state library has not yet been selected.

Server state includes:

- Accounts
- Transactions
- Budgets
- Dashboard summaries
- User settings stored on the backend
- Authentication session data where appropriate

The selected approach should support:

- Loading states
- Error states
- Caching
- Invalidation
- Mutation state
- Request deduplication
- Background refresh where useful

Server data should not be copied into global client state without a specific need.

## Client State

Local client state should remain close to the component or route that owns it.

Examples include:

- Dialog visibility
- Temporary form UI
- Selected table rows
- Sidebar state
- Unsubmitted filters
- Menu state

URL state should be used for shareable filters and navigation state.

Server state should be managed by the selected server-state solution.

A global client-state library should not be added unless a concrete cross-application state problem requires it.

## Financial Presentation

The frontend may calculate and format presentation values such as:

- Currency strings
- Percentages
- Progress-bar widths
- Chart coordinates
- Temporary form previews
- Visible subtotals based on already returned data

The backend remains authoritative for:

- Persisted balances
- Transaction effects
- Budget rules
- Ownership
- Transfer behavior
- Data integrity
- Values used for saved financial decisions

Duplicated calculations should be documented and tested to avoid frontend and backend disagreement.

## Currency Formatting

Currency should be formatted through a shared utility.

For U.S. English, a typical display may use:

```ts
new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
```

The implementation should not assume that every future account uses USD unless Steward explicitly limits the product to one currency.

Raw floating-point arithmetic should not be used for authoritative financial calculations.

## Date Formatting

Dates should be formatted consistently.

The frontend should distinguish:

- Date-only transaction values
- Full timestamps
- Budget months
- User-facing formatted dates

Display-formatted dates should not be reused as API values.

Time-zone handling should be documented for any timestamp that may cross date boundaries.

## Theme

Steward should support:

- Light mode
- Dark mode
- System preference

The user's explicit choice should persist between sessions.

Theme state may be stored locally because it is a presentation preference rather than an authentication or financial source of truth.

Stored theme values should be validated before use.

## Responsive Design

All major workflows should support:

- Mobile
- Tablet
- Desktop
- Large desktop

Responsive layouts should be based on workflow needs.

Examples include:

- Sidebar navigation becoming a mobile sheet
- Dashboard grids reducing columns
- Tables becoming horizontally scrollable or switching to cards
- Form actions becoming easier to reach on mobile
- Dialogs becoming full-height sheets where appropriate

## Accessibility

The frontend should support:

- Keyboard navigation
- Screen readers
- Visible focus states
- Semantic HTML
- Sufficient contrast
- Accessible form errors
- Reduced-motion preferences
- Logical focus management
- Touch-friendly controls

shadcn/ui provides accessible foundations, but accessibility must be verified after components are composed into complete workflows.

## Loading States

The application should provide appropriate loading feedback for:

- Authentication initialization
- Dashboard summaries
- Accounts
- Transactions
- Budgets
- Settings
- Mutations

Loading behavior should:

- Minimize layout shift
- Avoid displaying stale values as current without indication
- Prevent duplicate submissions
- Preserve navigation where possible
- Use skeletons only when they improve comprehension

## Empty States

Empty states should explain:

- What is missing
- Why the page may be empty
- What the user can do next

Examples include:

- No accounts
- No transactions
- No budget for the selected month
- No search results
- No dashboard activity

Empty states should not be represented as generic errors.

## Error Handling

The frontend should distinguish between:

- Form validation errors
- Server validation errors
- Authentication failures
- Authorization failures
- Missing resources
- Conflicts
- Network failures
- Unexpected server failures

Field-specific errors should appear near the relevant controls.

Page-level failures should provide a retry path where appropriate.

Unexpected errors should use a safe user-facing message while preserving diagnostic information for logs or monitoring.

## Error Boundaries

TanStack Router route error boundaries should handle route-level failures where appropriate.

React error boundaries may be used for unexpected rendering failures.

Error boundaries should not hide recoverable request errors that belong in normal page state.

## Environment Variables

Browser-safe environment variables may include:

```text
VITE_API_URL
VITE_APP_ENV
```

These values should be validated through Zod during application startup.

Frontend environment variables must never include:

- Database credentials
- Better Auth secrets
- Private API keys
- Session tokens
- Railway private-network addresses
- Demo-user passwords

Vite-prefixed values are exposed to browser-delivered code.

## Vercel Preview Deployments

Vercel preview deployments may use a non-production API environment.

Preview configuration must not automatically expose:

- Production-only secrets
- Database credentials
- Private backend variables
- Unrestricted production data

Preview authentication must account for temporary Vercel origins if preview login is supported.

## Code Splitting

Route-level code splitting should be used where it meaningfully reduces the initial bundle.

Likely candidates include:

- Dashboard
- Transactions
- Budgets
- Settings
- Large charting features

Small shared components should not be split into excessive independent chunks.

## Performance

The frontend should prioritize:

- Fast initial loading
- Responsive interactions
- Reasonable bundle size
- Route-level lazy loading
- Efficient server-state caching
- Stable layouts
- Avoidance of unnecessary rerenders

Memoization should be added in response to measured or clearly understood rendering costs rather than by default.

## Testing

The frontend testing stack has not yet been selected.

Frontend tests should eventually cover:

### Unit tests

- Validation schemas
- Formatting utilities
- Financial presentation helpers
- Search-parameter parsing

### Component tests

- Forms
- Dialogs
- Tables
- Empty states
- Error states
- Loading states
- Theme behavior

### Router tests

- Protected-route redirects
- Search defaults
- Invalid search values
- Nested layout behavior
- Not-found handling

### End-to-end tests

- Registration
- Login
- Logout
- Account creation
- Transaction creation
- Budget creation
- Filter persistence
- Direct route refreshes
- Vercel SPA routing behavior

## Non-Goals

The initial frontend will not use:

- Next.js
- TanStack Start
- React Router
- CSS Modules
- Styled Components
- Emotion
- Material UI
- Chakra UI
- Bootstrap
- Direct database access
- Frontend-only authorization
- A custom authentication system
- Multiple competing component libraries

These decisions should not change without revisiting the corresponding technology evaluation.

## Success Criteria

The frontend architecture is successful when:

- React provides maintainable application components.
- Vite provides a fast local workflow and reliable production build.
- TanStack Router provides typed navigation and validated URL state.
- Zod validates frontend trust boundaries.
- Tailwind CSS provides a consistent styling model.
- shadcn/ui provides customizable component foundations.
- Vercel serves the application and supports direct route navigation.
- The frontend communicates reliably with the Railway API.
- Better Auth sessions work across the deployed frontend and backend.
- Responsive workflows remain usable across device sizes.
- Light and dark themes work consistently.
- Accessibility remains intact after component composition.
- New features can be added without creating unrelated architectural patterns.
