# Frontend

## Decision

Steward will use React and TypeScript for the frontend.

Vite will provide the local development server and production build tooling.

TanStack Router will provide client-side routing.

Zod will provide runtime validation.

Tailwind CSS will provide utility-based styling.

shadcn/ui will provide customizable UI component implementations.

Vercel will host production and preview frontend deployments.

Vitest, React Testing Library, `@testing-library/user-event`, `@testing-library/jest-dom`, jsdom, and Playwright will provide frontend testing.

## Selected Technologies

The confirmed frontend technologies are:

- React
- TypeScript
- Vite
- TanStack Router
- Zod
- Tailwind CSS
- shadcn/ui
- Vitest
- React Testing Library
- `@testing-library/user-event`
- `@testing-library/jest-dom`
- jsdom
- Playwright
- Vercel

Still undecided:

- Server-state management
- Form management
- Charting library
- Primary icon library
- Error monitoring
- Automated accessibility scanner
- Visual regression testing

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
- Managing light, dark, and system themes
- Providing accessible interactions
- Running client-side presentation calculations
- Supporting Vercel preview and production deployments
- Providing component and browser-level automated tests

The frontend must not:

- Connect directly to PostgreSQL
- Import the Drizzle database client
- Treat route-level checks as authorization
- Trust client-provided user identifiers
- Treat frontend validation as a security boundary
- Store authentication state as an unverified custom flag
- Expose server secrets
- Replace authoritative backend financial rules
- Store raw database credentials
- Depend on production data during tests

The frontend may perform calculations needed for:

- Display formatting
- Temporary previews
- Progress bars
- Chart rendering
- Visible subtotals based on loaded data

The backend remains authoritative for persisted values and business decisions.

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

The architecture may be revisited if Steward later introduces public search-indexed pages or other requirements that benefit from server rendering.

## Deployment Model

The frontend will be built with Vite and deployed to Vercel.

```text
Git repository
→ Required CI checks
→ Vercel build
→ Vite production build
→ Static frontend deployment
```

Vercel may create preview deployments for pull requests and eligible branches.

Because Steward uses client-side routing, direct requests to application routes must resolve to the frontend entry document.

Examples include:

```text
/dashboard
/accounts
/accounts/:accountId
/transactions
/budgets/:year/:month
/settings
```

The final Vercel rewrite configuration should preserve static assets and platform-managed paths.

## Proposed Source Structure

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
├── layouts/
├── lib/
│   ├── api/
│   ├── auth/
│   ├── environment/
│   ├── testing/
│   ├── validation/
│   └── utilities/
├── routes/
├── styles/
├── main.tsx
├── router.tsx
└── routeTree.gen.ts
```

The generated route-tree file is expected only if TanStack Router file-based routing is selected.

If code-based routing is selected, it may not exist.

Feature implementation should remain grouped by business domain even when route definitions follow URL hierarchy.

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
→ Validate environment
→ Create API client
→ Initialize server-state provider
→ Initialize authentication integration
→ Initialize theme behavior
→ Render TanStack Router provider
```

The exact provider structure depends on remaining server-state and form decisions.

## UI Architecture

The frontend should build UI in layers:

```text
Tailwind CSS and design tokens
                ↓
shadcn/ui primitives
                ↓
Shared application components
                ↓
Feature components
                ↓
Routes and pages
```

### Primitive UI components

Examples include:

- Button
- Card
- Input
- Label
- Select
- Checkbox
- Radio Group
- Dialog
- Alert Dialog
- Sheet
- Table
- Tabs
- Badge
- Tooltip
- Popover
- Skeleton
- Toast or notification component

These should generally live in:

```text
src/components/ui/
```

### Shared application components

Examples include:

- AppShell
- AppSidebar
- MobileNavigation
- PageHeader
- EmptyState
- ErrorState
- LoadingState
- ConfirmationDialog
- SearchField
- FilterBar
- PaginationControls
- ThemeToggle
- CurrencyDisplay
- DateDisplay
- UserMenu

### Feature components

Examples include:

- AccountCard
- AccountForm
- TransactionTable
- TransactionListItem
- TransactionForm
- BudgetProgress
- BudgetCategoryRow
- BudgetEditor
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
- Utility-based component styling

shadcn/ui provides source-controlled component implementations that Steward can customize.

The frontend should use shared tokens and reusable component variants rather than unrelated one-off values.

The complete styling decision is documented in:

```text
docs/technology/styling.md
```

## Tailwind Integration

The React and Vite application should use the current Tailwind Vite integration.

Conceptually:

```ts
import tailwindcss from "@tailwindcss/vite";
```

The main stylesheet should import Tailwind:

```css
@import "tailwindcss";
```

The exact setup should match the installed Tailwind version.

Legacy configuration patterns should not be introduced unless required by a specific plugin or project constraint.

## shadcn/ui Integration

shadcn/ui should be initialized for the React and Vite application.

The setup should define:

- Component style
- Base color
- CSS-variable usage
- Icon library
- Import aliases
- Component output directory
- Repository structure

The application should maintain the generated:

```text
components.json
```

A likely component directory is:

```text
src/components/ui/
```

If the project becomes a monorepo with a shared UI package, the location may later change.

Components added through shadcn/ui become Steward source code and may be modified as needed.

## Component Ownership

Steward owns the source code of added shadcn/ui components.

This means Steward may:

- Modify markup
- Change styles
- Add variants
- Remove unused behavior
- Fix accessibility issues
- Update supporting dependencies
- Add application-specific behavior

Generated components should be reviewed like any other application code.

Customized components should not be overwritten blindly when rerunning CLI commands.

## Routing

TanStack Router provides:

- Type-safe route definitions
- Nested layouts
- Route parameters
- Search-parameter validation
- Route lifecycle hooks
- Route-level data coordination
- Lazy route loading
- Error boundaries
- Not-found handling

Authentication-aware navigation may use route lifecycle features such as:

```text
beforeLoad
```

Frontend authentication checks improve navigation behavior.

They do not replace backend authorization.

## Initial Route Structure

A likely route structure is:

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
    │   └── $year
    │       └── $month
    └── settings
```

The final public URLs may omit the `/app` segment.

The selected routes should align with:

```text
docs/ux/sitemap.md
```

## Route Layouts

Likely route layouts include:

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

The authenticated application layout may provide:

- Sidebar navigation
- Mobile navigation
- Header
- User menu
- Main content region
- Authentication-loading state
- Route error boundaries

Shared navigation and session behavior should not be duplicated across every page.

## Authentication Checks

Protected routes should verify that the frontend has a valid Better Auth session.

Expected behavior:

```text
Protected route requested
→ Session state loads
→ Missing session redirects to login
→ Valid session renders the protected layout
```

This behavior is for usability and navigation.

The Fastify backend must independently validate the session for every protected API operation.

## Return Navigation

When an unauthenticated user is redirected to login, Steward may preserve a safe return destination.

Example:

```text
User opens /transactions
→ Redirect to /login
→ User logs in
→ Return to /transactions
```

Return destinations must be restricted to safe internal routes.

Arbitrary external redirect URLs must not be accepted.

## Search Parameters

URL search state should be used for values that should be:

- Shareable
- Bookmarkable
- Restorable
- Preserved through navigation
- Compatible with browser history

Examples include:

- Transaction search
- Account filter
- Category filter
- Transaction type
- Date range
- Amount range
- Sort order
- Page number
- Page size
- Selected budget month

Zod should validate raw search values before route components use them.

Invalid values should resolve to:

- Documented defaults
- A safe fallback
- A clear route-level validation state

## Transaction Search Schema

A transaction search schema may validate:

```ts
const transactionSearchSchema = z.object({
  search: z.string().catch(""),
  accountId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  type: z.enum(["income", "expense", "transfer"]).optional(),
  page: z.coerce.number().int().min(1).catch(1),
  pageSize: z.coerce.number().int().min(1).max(100).catch(25),
});
```

The exact schema depends on approved filtering requirements.

## Runtime Validation

Zod should validate frontend trust boundaries.

Examples include:

- Form input
- Route search parameters
- Public environment variables
- Browser-storage values
- Selected API responses
- Imported data when implemented

Types should generally be inferred from Zod schemas.

Frontend validation improves usability.

It does not protect the backend.

## Form Architecture

The form library remains undecided.

Regardless of the selected library:

- Zod should define form validation.
- Form values should remain type-safe.
- Field and form-level errors should be supported.
- Server validation errors should be mapped into the interface.
- Duplicate submission should be prevented.
- Valid input should be preserved after recoverable errors.
- Accessible labels and error associations should be maintained.
- Submission state should be visible.

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

## Form Input and Output Types

When Zod schemas transform values, form input types and submission types should be treated separately.

Conceptually:

```ts
const transactionFormSchema = z.object({
  description: z.string().trim().min(1),
  amount: z.string().min(1),
  date: z.string(),
});

type TransactionFormValues = z.input<typeof transactionFormSchema>;
type TransactionSubmission = z.output<typeof transactionFormSchema>;
```

This avoids treating a text-input value as though it were already a canonical backend value.

## Form Error Presentation

Validation errors should:

- Appear near the affected field
- Use clear language
- Preserve valid input
- Identify cross-field issues
- Be accessible to assistive technology
- Avoid exposing internal schema details

The first invalid field may receive focus after submission when appropriate.

Server-side field errors should be mapped into the same form experience.

## API Client

The frontend should communicate with Fastify through a shared API-client layer.

The API client should be responsible for:

- Resolving the API base URL
- Sending JSON requests
- Including authentication credentials
- Parsing successful responses
- Parsing Steward's standard API error shape
- Handling network failures
- Supporting request cancellation where useful
- Applying consistent headers
- Integrating with the selected server-state library

Feature components should not repeatedly implement raw request behavior.

Conceptually:

```ts
fetch(`${apiUrl}/api/accounts`, {
  credentials: "include",
});
```

## Cross-Origin Requests

The frontend will be hosted on Vercel while the API will be hosted on Railway.

Unless custom domains make them the same origin, browser requests will be cross-origin.

Credentialed requests require coordinated configuration across:

- Frontend request credentials
- Fastify CORS
- Better Auth trusted origins
- Authentication cookie attributes
- Production domains
- Preview domains

The frontend should not assume cookies are included automatically.

The shared API client should explicitly configure credentials.

## API Error Shape

The frontend should understand Steward's standard API error contract.

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The submitted data is invalid.",
    "details": {
      "fields": {
        "amount": ["Enter a valid amount."]
      }
    }
  }
}
```

The frontend should distinguish:

- Validation errors
- Authentication failures
- Authorization failures
- Missing resources
- Conflicts
- Network failures
- Unexpected server errors

Unknown errors should fall back to a safe user-facing message.

## API Response Parsing

The frontend may parse selected API responses with Zod.

This is most valuable when:

- The response originates outside Steward
- Runtime contract verification is important
- Data is cached for a long period
- Contract drift would otherwise fail silently
- The data is security or finance sensitive

Parsing every internal response twice may be unnecessary.

The final API-client strategy should balance runtime confidence and overhead.

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
- Demo-login interface

The frontend must not:

- Validate passwords against stored credentials
- Determine authorization
- Build a parallel token system
- Store secrets in local storage
- Trust a locally stored `isAuthenticated` flag
- Create custom session records

## Authentication Session State

Authentication state should reflect the current Better Auth session.

The frontend should support:

- Initial session loading
- Authenticated session
- Unauthenticated session
- Session expiration
- Logout
- Failed session requests
- Session refresh where supported

The application should avoid briefly rendering protected content before the session is resolved.

## Server State

The server-state library remains undecided.

Server state includes:

- Accounts
- Transactions
- Categories
- Budgets
- Budget allocations
- Dashboard summaries
- Backend-stored user settings
- Authentication session data where appropriate

The selected server-state approach should support:

- Loading state
- Error state
- Caching
- Invalidation
- Mutation state
- Request deduplication
- Background refresh where useful
- Cancellation
- Pagination
- Optimistic updates where safe

Server data should not be copied into unrelated global client state without a specific need.

## Client State

Local client state should remain close to the component or route that owns it.

Examples include:

- Dialog visibility
- Temporary form UI
- Selected table rows
- Sidebar state
- Menu state
- Unsubmitted filters
- Expanded dashboard widgets

URL state should be used for shareable navigation and filter state.

Server state should be managed by the selected server-state solution.

A global state library should not be added without a concrete cross-application requirement.

## Financial Presentation

The frontend may calculate and format presentation values such as:

- Currency strings
- Percentages
- Progress-bar widths
- Chart coordinates
- Temporary form previews
- Visible subtotals based on loaded data

The backend remains authoritative for:

- Persisted balances
- Transaction effects
- Budget rules
- Ownership
- Transfer behavior
- Data integrity
- Values used for saved financial decisions

Duplicated calculations should be documented and tested to avoid disagreement between frontend and backend behavior.

## Monetary Values

Form values may begin as strings because they originate from text inputs.

The frontend should validate monetary strings before submission.

Authoritative values should use the application's canonical representation.

The implementation should avoid unsafe floating-point arithmetic for persisted financial values.

Examples of client-side behavior include:

```text
Input:
"72.18"

Validated submission:
7218 minor units
```

The exact conversion responsibility should be defined in shared utilities and contracts.

## Currency Formatting

Currency should be formatted through a shared utility.

For U.S. English and U.S. dollars:

```ts
new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
```

The application should not assume every future account uses USD unless Steward explicitly limits the product to a single currency.

## Date Handling

The frontend should distinguish:

- Date-only transaction values
- Full timestamps
- Budget months
- Display-formatted dates
- Date-range filter values

Display-formatted values should not be reused as API values.

Time-zone behavior should be documented for timestamps that may cross calendar-day boundaries.

## Dashboard

The dashboard should provide a concise view of the user's finances.

Likely dashboard data includes:

- Net worth
- Available cash
- Credit debt
- Monthly income
- Monthly expenses
- Budget progress
- Spending by category
- Recent transactions
- Items requiring attention

Dashboard widgets should support:

- Loading state
- Empty state
- Error state
- Optional action
- Optional expanded view

Complex dashboard detail should use a dedicated route rather than an oversized modal when appropriate.

## Accounts

The accounts feature should support:

- Account list
- Account grouping
- Account totals
- Account detail
- Account creation
- Account editing
- Account archival
- Archived-account visibility
- Recent activity

Account UI should not expose internal ownership fields.

Account type choices must remain aligned with backend validation and database constraints.

## Transactions

The transactions feature should support:

- Search
- Filtering
- Sorting
- Pagination
- Creation
- Editing
- Deletion
- Income
- Expenses
- Transfers
- Account selection
- Category selection
- Date selection
- Notes where approved

Transaction filters should be represented in URL search state where appropriate.

Desktop may use a table.

Mobile may use a card or compact-list representation.

## Budgets

The budgets feature should support:

- Month navigation
- Budget creation
- Copying a previous budget where approved
- Category allocation
- Spending totals
- Remaining amount
- Overspending state
- Budget editing
- Empty state

Frontend budget calculations may provide immediate previews.

The backend remains authoritative when saving.

## Settings

The settings feature may include:

- Profile
- Appearance
- Financial preferences
- Demo data
- Authentication-related account management

Sensitive authentication changes should use Better Auth-supported workflows.

Theme changes may apply immediately.

Server-stored settings should use the selected server-state approach.

## Theme

Steward should support:

- Light mode
- Dark mode
- System preference

The user's explicit theme choice should persist between sessions.

Theme state may be stored locally because it is a presentation preference.

Stored theme values should be validated before use.

Theme behavior should use shared design tokens rather than separate component implementations.

## Responsive Design

All major workflows should support:

- Mobile
- Tablet
- Desktop
- Large desktop

Responsive behavior should be based on workflow needs.

Examples include:

- Sidebar navigation becoming a sheet
- Dashboard grids reducing columns
- Tables becoming horizontally scrollable or switching to cards
- Form actions becoming easier to reach on mobile
- Dialogs becoming full-height sheets where appropriate
- Filters moving into a mobile sheet

The project should avoid completely separate mobile and desktop implementations unless the interaction model genuinely requires them.

## Accessibility

The frontend should support:

- Keyboard navigation
- Screen readers
- Visible focus states
- Semantic HTML
- Sufficient color contrast
- Accessible form errors
- Reduced-motion preferences
- Logical focus management
- Touch-friendly controls
- Accessible names for icon-only controls

shadcn/ui provides accessible foundations.

Accessibility must still be verified after primitives are composed into Steward workflows.

## Loading States

The application should provide loading feedback for:

- Authentication initialization
- Dashboard summaries
- Accounts
- Account detail
- Transactions
- Budgets
- Settings
- Mutations

Loading behavior should:

- Minimize layout shift
- Prevent duplicate submissions
- Preserve navigation where possible
- Avoid displaying misleading values
- Use skeletons only when they improve comprehension

## Empty States

Empty states should explain:

1. What is missing
2. Why the page may be empty
3. What the user can do next

Examples include:

- No accounts
- No transactions
- No budget for the selected month
- No search results
- No dashboard activity

Filtered empty states should offer a way to clear filters.

Empty states should not be represented as errors.

## Error Handling

The frontend should distinguish:

- Field validation errors
- Form-level errors
- Authentication failures
- Authorization failures
- Missing resources
- Conflicts
- Network failures
- Unexpected server failures

Field-specific errors should appear near the relevant controls.

Page-level errors should provide a retry path where appropriate.

Unexpected failures should use a safe user-facing message while preserving diagnostic information for logs or monitoring.

## Error Boundaries

TanStack Router route error boundaries should handle route-level failures where appropriate.

React error boundaries may handle unexpected rendering failures.

Error boundaries should not hide ordinary recoverable request errors that belong in page state.

## Notifications

Brief notifications may be used for:

- Account created
- Transaction saved
- Budget updated
- Settings saved

Notifications should not be the only location for:

- Field validation errors
- Important financial warnings
- Authentication failures
- Errors requiring user action

The exact notification component will follow the selected shadcn/ui implementation.

## Environment Variables

Browser-safe environment variables may include:

```text
VITE_API_URL
VITE_APP_ENV
```

These values should be validated through Zod during startup.

Frontend variables must never include:

- Database credentials
- Better Auth secrets
- Private API keys
- Session tokens
- Railway private-network addresses
- Demo-user passwords

Vite-prefixed environment values are exposed to browser-delivered code.

## Vercel Preview Deployments

Vercel preview deployments may communicate with a non-production API environment.

Preview configuration must not automatically expose:

- Production-only secrets
- Database credentials
- Private backend variables
- Unrestricted production data

Preview authentication must account for temporary Vercel origins if login is supported in previews.

Allowed preview origins should be handled deliberately rather than through unrestricted CORS.

## Single-Page Application Routing

Direct browser navigation and refreshes must work for nested routes.

Examples include:

```text
/accounts/123
/transactions?page=2
/budgets/2026/07
/settings
```

Vercel should return the application entry point for application routes.

Static assets and platform-controlled paths should continue to resolve normally.

This behavior must be verified through automated tests.

## Code Splitting

Route-level code splitting should be used where it meaningfully reduces the initial bundle.

Likely candidates include:

- Dashboard
- Transactions
- Budgets
- Settings
- Chart-heavy views

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
- Appropriate image and asset loading

Memoization should be added in response to measured or clearly understood rendering costs rather than by default.

## Frontend Testing Decision

Frontend automated testing will use:

- Vitest
- React Testing Library
- `@testing-library/user-event`
- `@testing-library/jest-dom`
- jsdom
- Playwright
- `@vitest/coverage-v8`

Vitest will provide unit and component test execution.

React Testing Library will verify user-visible component behavior.

Playwright will verify complete browser workflows.

## Vitest Environment

Frontend component tests should run in jsdom.

Frontend utility and schema tests may also run in jsdom or Node depending on their dependencies.

The configuration should avoid providing browser globals to code that does not need them.

## React Testing Library

Component tests should interact with the rendered interface through accessible, user-facing queries.

Prefer:

- `getByRole`
- `getByLabelText`
- `getByText`
- `findByRole`
- `findByText`

Avoid selecting elements primarily through:

- CSS classes
- Tailwind classes
- DOM hierarchy
- Private component state
- Generated IDs

Test IDs should be used only when no meaningful accessible query is available.

## User Interaction Testing

`@testing-library/user-event` should be used for most component interactions.

Examples include:

- Typing
- Clicking
- Tabbing
- Selecting options
- Checking boxes
- Keyboard navigation

Conceptually:

```ts
const user = userEvent.setup();

render(<TransactionForm />);

await user.type(
  screen.getByLabelText("Description"),
  "Grocery Store",
);

await user.click(
  screen.getByRole("button", {
    name: "Save transaction",
  }),
);
```

`fireEvent` should be reserved for lower-level events that cannot reasonably be represented through `user-event`.

## DOM Assertions

`@testing-library/jest-dom` should provide readable DOM assertions.

Examples include:

```ts
expect(button).toBeDisabled();
expect(dialog).toBeVisible();
expect(input).toHaveAccessibleName("Amount");
expect(error).toHaveTextContent("Enter a valid amount.");
```

## Test Setup

The frontend should maintain a shared test setup file.

It may configure:

- `@testing-library/jest-dom`
- Automatic cleanup
- Browser API mocks
- Stable environment values
- Controlled console behavior
- Time-zone defaults

Global setup should remain minimal.

Individual test requirements should remain visible where possible.

## Custom Render Helper

A shared render helper may wrap required application providers.

Conceptually:

```text
renderWithProviders
├── TanStack Router
├── Server-state provider
├── Authentication context
├── Theme context
└── Application environment
```

The helper should allow tests to define:

- Initial route
- Session state
- API behavior
- Cached data
- Theme
- Search parameters

It should not hide important test behavior.

## Component Test Coverage

Component tests should cover:

- Forms
- Dialogs
- Alert dialogs
- Dropdown actions
- Tabs
- Select controls
- Tables
- Filters
- Pagination
- Loading states
- Empty states
- Error states
- Theme controls
- Mobile sheets
- Authentication redirects
- shadcn/ui composition

Steward does not need to duplicate all internal tests of unchanged shadcn/ui primitives.

It should test Steward's use and composition of those primitives.

## Form Tests

Important form tests should cover:

- Initial state
- Required fields
- Invalid values
- Boundary values
- Cross-field validation
- Successful submission
- Loading state
- Duplicate-submission prevention
- Server validation errors
- Authentication errors
- Conflict errors
- Preservation of valid input
- Accessible labels
- Accessible error associations
- Keyboard submission

## Router Tests

TanStack Router tests should cover:

- Public route access
- Protected-route redirects
- Authenticated access
- Search defaults
- Invalid search parameters
- Nested layouts
- Not-found behavior
- Route error states
- Navigation after mutations
- Safe return destinations
- Direct nested-route rendering

Frontend route tests do not replace backend authorization tests.

## Theme Tests

Theme tests should cover:

- Light selection
- Dark selection
- System selection
- Persisted preference
- Invalid stored value
- Keyboard operation
- Correct document state

It is not necessary to duplicate every component test in every theme.

## Responsive Tests

Representative component and Playwright tests should verify:

- Mobile navigation
- Desktop sidebar
- Transaction table or list behavior
- Budget layout
- Dialog and sheet behavior
- Reachable page actions
- Mobile filters
- Responsive dashboard cards

## API Mocking in Component Tests

Component tests should not depend on a live Railway backend.

API behavior may be controlled through:

- Test doubles at the API-client boundary
- Mock Service Worker if selected
- Server-state library utilities
- Dependency injection

The project should avoid mocking raw `fetch` independently in every component test.

Mocking should remain close to Steward's API abstraction.

## End-to-End Testing

Playwright will test the application in a real browser.

The test architecture should resemble production:

```text
Playwright browser
→ React and Vite frontend
→ Fastify API
→ PostgreSQL test database
```

The initial required CI browser should be Chromium.

Firefox and WebKit may later be used for a smaller cross-browser suite.

## Critical Playwright Workflows

The initial browser suite should cover:

- Registration
- Login
- Logout
- Protected-route access
- Account creation
- Account editing
- Account archival
- Expense creation
- Income creation
- Transfer creation
- Transaction editing
- Transaction deletion
- Budget creation
- Budget category editing
- Budget month navigation
- Demo-data reset
- Session persistence
- Direct nested-route refresh
- Unauthenticated redirection
- Vercel-style SPA routing

## Playwright Locators

Playwright tests should prefer:

- `getByRole`
- `getByLabel`
- `getByText`
- `getByPlaceholder`

Avoid:

- Long CSS selectors
- XPath
- Tailwind classes
- Generated class names
- Fragile DOM chains

Test IDs should be used only when a clear user-facing locator is unavailable.

## Playwright Isolation

Each browser test should be independently executable.

Tests must not depend on:

- Another test creating a user
- Another test creating an account
- Test execution order
- Existing local data
- Preview data
- Production data

Fixtures should create the required state for each test or group.

## Authentication Fixtures

Playwright may use stored authentication state to reduce repeated UI logins.

At least one test must verify the real login flow.

Stored authentication state must:

- Use test credentials
- Remain outside source control when sensitive
- Be generated predictably
- Never contain production credentials
- Remain isolated between users

## Test Data

Frontend and end-to-end test data should be:

- Synthetic
- Predictable
- Minimal
- Isolated
- Safe to delete
- Easy to identify

Examples include:

```text
Everyday Checking
Example Bank
Grocery Store
demo@example.test
```

Automated tests must not use real financial histories or personal account data.

## Coverage

Vitest will use:

```text
@vitest/coverage-v8
```

Frontend coverage should include:

- Validation schemas
- Feature utilities
- Financial presentation helpers
- API error handling
- Router utilities
- Components with business behavior
- Authentication behavior

Coverage may exclude:

- Generated route trees
- Type-only files
- Build output
- Test utilities
- Unchanged generated shadcn/ui primitives

Customized shadcn/ui components should be included when they contain Steward-specific behavior.

## Snapshot Testing

Full-page snapshot tests should be avoided.

Small snapshots may be appropriate for:

- Stable serialized errors
- Small generated structures
- Focused accessible markup
- Narrow configuration output

Behavioral assertions should remain the default.

## Accessibility Testing

Component and browser tests should verify:

- Accessible names
- Connected labels
- Dialog titles
- Focus movement
- Keyboard navigation
- Form error associations
- Visible focus states
- Accessible status messages
- Icon-button labels
- Non-color indicators for financial state

An automated accessibility scanner remains an open decision.

Automated scanning would supplement rather than replace manual accessibility-oriented tests.

## Continuous Integration

Before production deployment, frontend CI should eventually verify:

- Formatting
- Linting
- Type checking
- Unit tests
- Component tests
- Coverage requirements
- Vite production build
- Critical Playwright tests

A failed required check should block production deployment.

## Vercel Deployment Gates

Vercel production deployments should occur only after required frontend checks pass.

Preview deployments may be created earlier depending on the final workflow.

Preview deployments should not receive production-only secrets or unrestricted production access.

## Suggested Frontend Scripts

Exact commands depend on the package manager.

The frontend should provide scripts equivalent to:

```text
dev
build
preview
typecheck
lint
test
test:run
test:component
test:coverage
test:e2e
test:e2e:ui
```

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
- Multiple component libraries
- Jest
- Cypress
- Enzyme
- Full-page snapshot testing
- Tailwind classes as primary test selectors
- Production data in automated tests

These decisions should not change without revisiting the corresponding technology evaluation.

## Open Decisions

The following frontend decisions remain open:

- Server-state management
- Form management
- Charting library
- Primary icon library
- Error monitoring
- Automated accessibility scanner
- Visual regression testing
- Mock Service Worker usage
- Exact TanStack Router organization
- Exact Vercel SPA rewrite configuration
- Exact component-test provider setup
- Final frontend coverage thresholds

## Success Criteria

The frontend architecture is successful when:

- React provides maintainable application components.
- TypeScript supports safe frontend development.
- Vite provides a fast local workflow and reliable production build.
- TanStack Router provides typed navigation and validated URL state.
- Zod validates frontend trust boundaries.
- Tailwind CSS provides a consistent styling model.
- shadcn/ui provides customizable component foundations.
- Vercel reliably serves production and preview builds.
- Direct navigation to nested routes works.
- The frontend communicates reliably with the Railway API.
- Better Auth sessions work across deployed frontend and backend origins.
- Responsive workflows remain usable across device sizes.
- Light, dark, and system themes work consistently.
- Accessibility remains intact after component composition.
- Vitest provides reliable unit and component tests.
- React Testing Library verifies user-visible behavior.
- Playwright verifies critical complete workflows.
- Frontend test failures block invalid production deployments.
- New features can be added without introducing unrelated architectural patterns.
