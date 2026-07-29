# Frontend

## Decision

Steward will use React with TypeScript for the frontend.

Vite will provide the development server, build tooling, and frontend application setup.

TanStack Router will provide client-side routing.

## Selected Technologies

The confirmed frontend technologies are:

- React
- TypeScript
- Vite
- TanStack Router

Still undecided:

- Server-state management
- Form management
- Styling solution
- Component library
- Client-state management
- Charting library
- Frontend testing tools
- Deployment provider

## Responsibilities

The frontend is responsible for:

- Rendering the Steward user interface
- Managing client-side navigation
- Displaying authenticated and unauthenticated application states
- Communicating with the Fastify API
- Displaying financial data returned by the backend
- Managing forms and user input
- Presenting loading, empty, validation, and error states
- Supporting responsive desktop and mobile layouts
- Applying user appearance preferences
- Preserving URL-driven application state where appropriate

The frontend must not:

- Connect directly to PostgreSQL
- Treat client-side route guards as authorization
- Trust client-provided user identifiers
- Reimplement financial business rules owned by the backend
- Store raw authentication credentials
- Use local storage as the authentication source of truth

## Why React

React was selected because:

- It provides a component-based UI model.
- It supports the interactive workflows Steward requires.
- It has strong TypeScript support.
- It works well with TanStack Router and the broader frontend ecosystem.
- It allows the frontend to remain independent from the Fastify backend.
- It aligns with the project’s learning and implementation goals.

React components should remain focused on rendering and interaction.

Backend-owned financial rules should not be duplicated inside components.

## Why Vite

Vite was selected as Steward’s frontend build tool.

Vite provides:

- A fast local development server
- React and TypeScript support
- Hot module replacement
- Production builds
- Environment-variable support
- Plugin integration
- A straightforward setup for a standalone frontend application

The frontend will be built as a separate application from the Fastify API.

Vite’s official React TypeScript template should be used as the starting point when the Foundation milestone begins.

## Rendering Model

The initial Steward frontend will be a client-rendered single-page application.

```text
Browser
→ Load React application
→ TanStack Router resolves route
→ Frontend checks authentication state
→ Frontend requests data from Fastify
→ React renders the page
```

Server-side rendering is not required for the MVP.

The application is primarily an authenticated dashboard rather than a public content site requiring search-engine indexing.

## Application Boundary

The frontend and backend should remain clearly separated.

```text
React and Vite frontend
→ HTTP requests
→ Fastify API
→ PostgreSQL
```

The frontend should receive defined API responses rather than database-shaped records.

Shared contracts may eventually be used to coordinate request and response types, but the browser should not import backend implementation modules.

## Proposed Source Structure

A possible frontend structure is:

```text
src/
├── main.tsx
├── router.tsx
├── routeTree.gen.ts
├── routes/
├── features/
│   ├── accounts/
│   ├── authentication/
│   ├── budgets/
│   ├── dashboard/
│   ├── settings/
│   └── transactions/
├── components/
│   ├── layout/
│   ├── navigation/
│   └── shared/
├── hooks/
├── lib/
├── styles/
└── types/
```

This structure is provisional and should be finalized during the Application Architecture epic.

## Feature Organization

Feature-specific code should live near the feature that owns it.

A feature directory may contain:

```text
features/transactions/
├── api/
├── components/
├── hooks/
├── schemas/
├── types/
└── utilities/
```

Feature modules should avoid exposing unnecessary implementation details.

Shared components should only move into global shared directories when they are genuinely reused.

## React Component Boundaries

Components should generally fall into these categories:

### Route components

Responsible for:

- Reading route parameters
- Reading search parameters
- Coordinating page-level data requirements
- Rendering the page layout
- Connecting route state to feature components

### Feature components

Responsible for:

- Implementing a specific product workflow
- Displaying domain-specific content
- Handling feature interactions
- Composing reusable UI elements

### Shared UI components

Responsible for:

- Buttons
- Inputs
- Dialogs
- Drawers
- Tables
- Empty states
- Loading states
- General layout primitives

Route components should not become large collections of business logic and markup.

## State Ownership

State should remain as close as possible to the code that owns it.

Possible state categories include:

### URL state

Use TanStack Router search parameters for state that should be:

- Shareable
- Restorable
- Deep-linkable
- Preserved during browser navigation

Examples:

- Transaction search
- Filters
- Sort order
- Pagination
- Selected budget month

### Server state

Server data includes:

- Accounts
- Transactions
- Categories
- Budgets
- Dashboard summaries
- Authenticated-user data

The final server-state library remains undecided.

### Form state

Form state includes:

- Field values
- Validation messages
- Dirty state
- Submission state

The final form library remains undecided.

### Local UI state

Local component state may be used for:

- Dialog visibility
- Drawer visibility
- Expanded sections
- Temporary interface state

Global client state should only be introduced for state that genuinely spans unrelated features.

## API Communication

The frontend should communicate with the Fastify API through a centralized API layer.

The API layer should handle:

- Base URL configuration
- Credentialed requests
- JSON parsing
- Standard API errors
- Authentication failure behavior
- Request cancellation where appropriate

Feature components should not repeat raw request configuration throughout the application.

A conceptual structure is:

```text
src/lib/api-client.ts
```

or feature-owned API functions such as:

```text
src/features/accounts/api/
src/features/transactions/api/
```

The final structure depends on the selected server-state solution.

## Authentication

The React frontend uses Better Auth’s client APIs for authentication interactions and session-aware UI.

The frontend is responsible for:

- Registration forms
- Login forms
- Demo-account entry
- Sign-out actions
- Reading client session state
- Redirecting based on authentication state
- Showing authentication loading and error states

Fastify and Better Auth remain responsible for validating sessions and protecting financial data.

## Authentication State

The frontend should treat authentication as three states:

```text
Loading
Authenticated
Unauthenticated
```

While authentication is loading:

- Do not render protected financial content.
- Do not prematurely redirect.
- Show a neutral loading state.

When authenticated:

- Public auth pages should redirect to the dashboard.
- Protected routes may render.
- API requests may proceed with credentials.

When unauthenticated:

- Protected pages should redirect to login.
- Public authentication pages may render.

## Credentialed Requests

When the frontend and Fastify API use different origins, API requests must include credentials.

The frontend configuration should use the approved Fastify API origin.

Vite environment variables may include:

```text
VITE_API_URL
```

Only values intended to be public in browser code should use Vite’s public environment-variable mechanism.

Secrets must never be placed in frontend environment variables.

## Error Handling

The frontend should convert API errors into useful user-facing states.

The interface should distinguish between:

- Validation errors
- Authentication errors
- Authorization failures
- Missing records
- Conflicts
- Network failures
- Unexpected server failures

Raw Fastify, PostgreSQL, or Better Auth errors should not be displayed directly.

## Loading States

Loading behavior should preserve layout stability.

The frontend may use:

- Skeletons
- Loading indicators
- Disabled submission controls
- Optimistic visual feedback where safe

The interface should not display misleading zero values before data is available.

## Empty States

Empty states should explain:

- What content is missing
- Why the page is empty
- What action the user can take

Examples:

- No accounts exist
- No transactions exist
- No transactions match the filters
- No budget exists for the selected month

## Forms

Forms should support:

- Accessible labels
- Field-level validation
- Submission state
- Server-error feedback
- Save and cancel behavior
- Dirty-state handling
- Keyboard navigation

Frontend validation improves the experience.

Fastify remains responsible for validating all submitted input.

## Styling

The styling solution remains undecided.

The selected solution should support:

- Responsive layouts
- Light and dark themes
- Accessible focus states
- Reusable design tokens
- Consistent spacing
- Maintainable component styling

The frontend should use a restrained visual system with purple as the primary accent and semantic colors for meaningful states.

## Accessibility

The frontend should:

- Use semantic HTML
- Support keyboard navigation
- Provide visible focus states
- Associate labels with controls
- Avoid color-only meaning
- Support accessible dialogs and drawers
- Announce important validation and status changes
- Maintain reasonable contrast in light and dark themes

Accessibility should be considered during implementation rather than postponed entirely to the final milestone.

## Responsive Design

Steward should support desktop and mobile layouts.

Desktop may use:

- Persistent sidebar navigation
- Multi-column dashboards
- Tables
- Side-by-side content

Mobile may use:

- Condensed navigation
- Stacked cards
- Simplified transaction rows
- Full-screen or drawer-based forms
- Touch-friendly controls

Responsive behavior should preserve the same workflows rather than merely shrinking the desktop interface.

## Environment Configuration

The frontend may use Vite environment variables for public runtime configuration.

Likely values include:

```text
VITE_API_URL
VITE_APP_ENV
```

Frontend environment variables must not contain:

- Better Auth secrets
- Database credentials
- Private API keys
- Session tokens
- Demo-user passwords

## Testing

The final testing tools remain undecided.

Frontend testing should eventually include:

### Unit tests

For:

- Formatters
- Validation helpers
- Pure utilities
- Financial display calculations that are intentionally frontend-owned

### Component tests

For:

- Forms
- Loading states
- Empty states
- Error states
- Navigation components
- Budget and transaction interactions

### Router tests

For:

- Route matching
- Search parameters
- Protected-route behavior
- Redirects
- Route loaders where used

### End-to-end tests

For:

- Registration
- Login
- Demo login
- Navigation
- Account management
- Transaction management
- Budget editing
- Theme changes
- Sign out

## Performance

The frontend should avoid premature optimization while following sensible practices.

Potential considerations include:

- Route-level code splitting
- Avoiding unnecessary rerenders
- Paginating large transaction lists
- Deferring noncritical content
- Loading dashboard sections independently
- Avoiding excessively large shared bundles

TanStack Router file-based routing may be configured to support route-level code splitting.

## Non-Goals

The initial frontend will not require:

- Next.js
- TanStack Start
- Server-side rendering
- React Server Components
- Static-site generation
- Native mobile applications
- Micro-frontends
- Multiple frontend frameworks
- Redux by default
- A custom routing system

These decisions may be reconsidered only if a concrete requirement appears.

## Success Criteria

The frontend decision is successful when:

- React supports the required interactive workflows.
- Vite provides a simple and reliable development and build setup.
- TanStack Router provides predictable type-safe navigation.
- Authentication states render correctly.
- API communication remains centralized.
- URL state supports search, filters, pagination, and selected months.
- Desktop and mobile workflows remain consistent.
- Feature boundaries remain understandable.
- The frontend stays independent from Fastify implementation details.
