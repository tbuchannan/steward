# Selected Technology Stack

## Status

This document records the confirmed technology decisions for Steward.

Items marked as open have not yet been selected.

## Architecture Summary

Steward is a client-rendered full-stack web application.

```text
User browser
      |
      | HTTPS
      v
Vercel
React + TypeScript + Vite
TanStack Router
Zod
Tailwind CSS
shadcn/ui
      |
      | Credentialed HTTPS requests
      v
Railway
Fastify + TypeScript
Zod
Better Auth
Drizzle ORM
      |
      | PostgreSQL connection
      v
Railway PostgreSQL
```

## Frontend

| Area                    | Selection       | Status   |
| ----------------------- | --------------- | -------- |
| UI library              | React           | Selected |
| Language                | TypeScript      | Selected |
| Build tool              | Vite            | Selected |
| Routing                 | TanStack Router | Selected |
| Runtime validation      | Zod             | Selected |
| Styling                 | Tailwind CSS    | Selected |
| Component system        | shadcn/ui       | Selected |
| Frontend hosting        | Vercel          | Selected |
| Server-state management | Undecided       | Open     |
| Form management         | Undecided       | Open     |
| Charting                | Undecided       | Open     |
| Frontend testing        | Undecided       | Open     |
| Primary icon library    | Undecided       | Open     |
| Error monitoring        | Undecided       | Open     |

## Backend

| Area                           | Selection                   | Status   |
| ------------------------------ | --------------------------- | -------- |
| Runtime                        | Node.js                     | Selected |
| Language                       | TypeScript                  | Selected |
| Web framework                  | Fastify                     | Selected |
| Runtime validation             | Zod                         | Selected |
| Fastify validation integration | `fastify-type-provider-zod` | Selected |
| Authentication                 | Better Auth                 | Selected |
| API style                      | HTTP JSON API               | Selected |
| Backend hosting                | Railway                     | Selected |
| Backend testing                | Undecided                   | Open     |
| Error monitoring               | Undecided                   | Open     |

## Database

| Area                         | Selection                   | Status   |
| ---------------------------- | --------------------------- | -------- |
| Database                     | PostgreSQL                  | Selected |
| ORM and query layer          | Drizzle ORM                 | Selected |
| Migration tooling            | Drizzle Kit                 | Selected |
| Authentication adapter       | Better Auth Drizzle adapter | Selected |
| Production database hosting  | Railway PostgreSQL          | Selected |
| PostgreSQL driver            | Undecided                   | Open     |
| Local PostgreSQL environment | Undecided                   | Open     |

## Infrastructure

| Area                   | Selection | Status   |
| ---------------------- | --------- | -------- |
| Frontend deployment    | Vercel    | Selected |
| Backend deployment     | Railway   | Selected |
| Database deployment    | Railway   | Selected |
| Package manager        | Undecided | Open     |
| Repository structure   | Undecided | Open     |
| Workspace tooling      | Undecided | Open     |
| Continuous integration | Undecided | Open     |
| Custom domains         | Undecided | Open     |
| Production monitoring  | Undecided | Open     |

## Frontend Decisions

### React

React provides Steward's component and rendering model.

React is responsible for:

- Rendering the user interface
- Composing reusable components
- Managing local interface state
- Supporting interactive financial workflows
- Integrating routing, forms, validation, and server state

The initial application will use client-side rendering.

Server-side rendering is not required for the MVP.

### TypeScript

TypeScript is used across the frontend and backend.

TypeScript provides:

- Static type checking
- Safer refactoring
- Typed component properties
- Typed API contracts
- Typed route definitions
- Typed database queries
- Shared language across the application

Runtime validation remains necessary because TypeScript types do not validate data at runtime.

### Vite

Vite provides:

- Local frontend development server
- Fast development builds
- Production bundling
- Environment-variable integration
- React development tooling
- Tailwind CSS integration

The production build output will be deployed to Vercel.

### TanStack Router

TanStack Router provides:

- Type-safe routing
- Nested layouts
- Route parameters
- Search-parameter validation
- Route lifecycle hooks
- Lazy route loading
- Not-found handling
- Route-level error boundaries

Authentication-aware navigation may use route lifecycle features such as `beforeLoad`.

Frontend route checks improve user experience but do not replace backend authorization.

### Zod

Zod provides runtime validation for:

- Form values
- Route parameters
- Search parameters
- API request contracts
- API response contracts where appropriate
- Environment variables
- Browser-storage values
- Imported data when implemented

Types should generally be inferred from Zod schemas rather than manually duplicated.

### Tailwind CSS

Tailwind CSS provides Steward's utility-based styling system.

Tailwind is responsible for:

- Layout
- Spacing
- Typography
- Responsive behavior
- Color usage
- Visual states
- Theme variants
- Component styling

Shared design tokens should be preferred over unrelated arbitrary values.

### shadcn/ui

shadcn/ui provides customizable component implementations that are added directly to Steward's source code.

Likely components include:

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

Steward owns and may customize the generated component source.

shadcn/ui components may depend on supporting runtime packages such as primitive libraries, class-name utilities, animation utilities, and icons.

### Vercel

Vercel hosts the React and Vite frontend.

Vercel provides:

- Production frontend deployments
- Preview deployments
- HTTPS
- Git-based deployment workflows
- Frontend environment configuration
- Static asset hosting

Because Steward uses client-side routing, application routes must resolve to the frontend entry document when directly loaded or refreshed.

## Backend Decisions

### Node.js

Node.js provides the backend JavaScript runtime.

The exact supported Node.js version should be pinned once repository tooling is finalized.

Local development, CI, Railway, and Vercel should use compatible versions.

### Fastify

Fastify hosts Steward's backend API.

Fastify is responsible for:

- HTTP routing
- Request lifecycle
- Request validation integration
- Response serialization
- Authentication hooks
- Error handling
- Structured logging
- Health checks
- Graceful shutdown

The backend should be organized into domain-focused modules.

Likely modules include:

- Authentication
- Accounts
- Transactions
- Categories
- Budgets
- Dashboard
- Settings
- Demo data

### Zod Backend Validation

Zod validates backend trust boundaries.

Backend schemas may validate:

- Route parameters
- Query parameters
- Request bodies
- Response payloads
- Environment configuration

Structural validation should occur before business logic.

Database-backed business rules should remain in application services rather than Zod refinements.

### `fastify-type-provider-zod`

`fastify-type-provider-zod` connects Zod with Fastify.

It provides integration for:

- Request validation
- Response serialization
- Route schema definitions
- Inferred TypeScript route types

The exact configuration should match the installed package versions.

### Better Auth

Better Auth manages authentication.

Better Auth is responsible for:

- User registration
- Email and password authentication
- Session creation
- Session validation
- Cookie-based authentication
- Sign out
- Authentication database records

Steward should not create a competing custom authentication system.

### Railway Backend Hosting

Railway hosts the Fastify backend as a persistent service.

Railway is responsible for:

- Building the backend
- Running the Fastify production process
- Providing server environment variables
- Hosting the public API
- Service logs
- Health checks
- Deployment history
- Connectivity to Railway PostgreSQL

Fastify must listen on Railway's provided port and bind to an externally reachable host.

## Database Decisions

### PostgreSQL

PostgreSQL stores Steward's relational data.

Likely data includes:

- Better Auth users
- Better Auth sessions
- Financial accounts
- Transactions
- Categories
- Budgets
- Budget allocations
- User preferences
- Demo-user data

PostgreSQL constraints should protect stored-data integrity.

### Drizzle ORM

Drizzle ORM provides:

- TypeScript database schemas
- Typed SQL queries
- Typed inserts
- Typed updates
- Typed deletes
- Joins
- Transactions
- PostgreSQL integration

Drizzle table types describe database records.

They should not automatically be treated as public API contracts.

### Drizzle Kit

Drizzle Kit manages database migrations.

The expected workflow is:

```text
Edit Drizzle schema
→ Generate SQL migration
→ Review migration
→ Commit migration
→ Apply migration
```

Production migrations must be version controlled and reviewed.

### Better Auth Drizzle Adapter

Better Auth uses its Drizzle adapter with PostgreSQL.

Conceptually:

```ts
betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
});
```

The exact configuration should match the installed Better Auth version.

### Railway PostgreSQL

Railway hosts the production PostgreSQL database.

The Fastify service connects using Railway-provided database variables.

The backend should use private service connectivity where available.

The database should not be exposed publicly without an explicit operational requirement.

## Deployment Decisions

### Frontend Deployment

```text
Git repository
→ Vercel build
→ Vite production build
→ Vercel deployment
```

The frontend deployment must include:

- Correct frontend root directory
- Build command
- Output directory
- Public environment variables
- SPA routing configuration

### Backend Deployment

```text
Git repository
→ Railway build
→ Database migration step
→ Fastify production process
→ Railway health check
```

The backend deployment must include:

- Backend root directory
- Install command where needed
- Build command
- Start command
- Migration command
- Environment variables
- Health-check path

### Database Deployment

```text
Drizzle TypeScript schema
→ Drizzle Kit migration
→ Railway PostgreSQL
```

Application startup should not perform uncontrolled schema synchronization.

## Production Request Flow

```text
User interaction
→ React component
→ Zod frontend validation
→ TanStack Router or API client
→ Credentialed HTTPS request
→ Fastify route
→ Zod backend validation
→ Better Auth session validation
→ Application service
→ Drizzle query
→ Railway PostgreSQL
```

The response returns through the layers in reverse.

## Authentication Flow

```text
Vercel frontend
→ Login or registration form
→ Zod frontend validation
→ Railway Better Auth endpoint
→ Better Auth
→ Drizzle adapter
→ Railway PostgreSQL
→ Session cookie
→ Browser
```

The browser must send authentication credentials with cross-origin API requests when the frontend and backend use different origins.

## Validation Flow

```text
User input
→ Frontend Zod schema
→ Fastify request
→ Backend Zod schema
→ Application business rules
→ Drizzle query
→ PostgreSQL constraints
```

Each layer has a separate role:

- Frontend validation improves usability.
- Backend validation protects the API boundary.
- Application services enforce business rules.
- PostgreSQL constraints protect stored data.

## API Contract Flow

```text
Zod request schema
→ Typed Fastify route input
→ Application service
→ Drizzle query
→ Response mapping
→ Zod response schema
→ React frontend
```

Public contracts should not expose:

- Database-only fields
- Better Auth internals
- Secrets
- Internal ownership fields
- Raw PostgreSQL errors
- Raw Drizzle errors

## Styling Architecture

```text
Tailwind CSS and design tokens
                ↓
shadcn/ui primitives
                ↓
Shared application components
                ↓
Feature components
                ↓
Pages and route layouts
```

Examples of shared application components include:

- PageHeader
- EmptyState
- ErrorState
- ConfirmationDialog
- SearchField
- PaginationControls
- ThemeToggle
- CurrencyDisplay

Examples of feature components include:

- AccountCard
- TransactionTable
- BudgetProgress
- BudgetCategoryRow
- NetWorthSummary
- SpendingSummary
- RecentTransactions
- DashboardWidget

## Environment Configuration

### Vercel Frontend

Expected public variables may include:

```text
VITE_API_URL
VITE_APP_ENV
```

These values are included in browser-delivered code and must not contain secrets.

### Railway Backend

Expected server variables may include:

```text
NODE_ENV
HOST
PORT
DATABASE_URL
BETTER_AUTH_SECRET
BETTER_AUTH_URL
FRONTEND_ORIGIN
TRUSTED_ORIGINS
LOG_LEVEL
DEMO_USER_EMAIL
```

The exact set may change as the application is implemented.

Backend environment configuration should be validated with Zod before the server starts.

## Cross-Origin Authentication

Vercel and Railway will normally use different origins.

The application must coordinate:

- Frontend `credentials` configuration
- Fastify CORS
- Better Auth trusted origins
- Secure cookie settings
- SameSite cookie behavior
- Production domains
- Preview domains

Wildcard CORS origins must not be used with credentialed authentication requests.

## Local Development

A likely local setup is:

```text
Frontend:
http://localhost:5173

Backend:
http://localhost:3000

Database:
Local PostgreSQL
```

The exact ports and local database tooling remain open decisions.

Local development should reflect production boundaries where practical.

## Repository Structure

The repository structure has not yet been finalized.

A likely monorepo structure is:

```text
steward/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   └── contracts/
├── docs/
├── package.json
└── workspace configuration
```

Possible responsibilities:

```text
apps/web
→ React, Vite, TanStack Router, Tailwind, shadcn/ui

apps/api
→ Fastify, Better Auth, Drizzle, Zod

packages/contracts
→ Shared public Zod schemas and types
```

The final structure should be documented separately.

## Shared Contracts

Shared Zod contracts may include:

- API request schemas
- API response schemas
- Pagination schemas
- Filter schemas
- Public enums
- Standard API error schemas

Shared contracts must not import:

- Fastify plugins
- Drizzle database clients
- PostgreSQL connections
- Better Auth secrets
- Server-only environment configuration

## Service Ownership

| Concern                        | Technology         |
| ------------------------------ | ------------------ |
| Interface rendering            | React              |
| Frontend language              | TypeScript         |
| Frontend development and build | Vite               |
| Client-side routing            | TanStack Router    |
| Runtime validation             | Zod                |
| Styling                        | Tailwind CSS       |
| UI component implementations   | shadcn/ui          |
| Frontend hosting               | Vercel             |
| HTTP API                       | Fastify            |
| Backend runtime                | Node.js            |
| Authentication                 | Better Auth        |
| Database queries               | Drizzle ORM        |
| Database migrations            | Drizzle Kit        |
| Relational storage             | PostgreSQL         |
| Backend hosting                | Railway            |
| Production database hosting    | Railway PostgreSQL |

## Security Boundaries

### Frontend

The frontend is not trusted for:

- Authentication
- Authorization
- Ownership
- Financial data integrity
- Business-rule enforcement
- Secret storage

### Backend

The backend is responsible for:

- Session validation
- Ownership enforcement
- Request validation
- Business rules
- Safe response mapping
- Database access

### Database

PostgreSQL is responsible for:

- Foreign keys
- Unique constraints
- Required values
- Supported value constraints
- Transactional integrity

## Testing Responsibilities

The testing stack remains undecided.

The eventual testing strategy should cover:

### Frontend

- Components
- Forms
- Route behavior
- Search-parameter validation
- Authentication redirects
- Responsive workflows
- Accessibility

### Backend

- Zod schemas
- Fastify routes
- Authentication hooks
- Authorization
- Services
- Drizzle queries
- Error mapping

### Database

- Migrations
- Constraints
- Transactions
- Ownership queries
- Better Auth schema integration

### End-to-End

- Registration
- Login
- Logout
- Account creation
- Transaction creation
- Budget creation
- Session persistence
- Direct route refreshes
- Deployed frontend-to-backend communication

## Explicitly Not Selected

The current architecture does not use:

- Next.js
- TanStack Start
- React Router
- Express
- Hono
- NestJS
- Prisma
- Sequelize
- TypeORM
- SQLite
- MongoDB
- Joi
- Yup
- Valibot
- CSS Modules
- Styled Components
- Emotion
- Material UI
- Chakra UI
- Bootstrap
- Netlify
- Render
- Supabase database hosting
- Vercel Functions as the primary backend
- A custom authentication system

These tools should not be introduced without revisiting the corresponding technology decision.

## Remaining Decisions

The remaining major technology decisions are:

1. Server-state management
2. Form management
3. Charting
4. Frontend testing
5. Backend testing
6. PostgreSQL driver
7. Package manager
8. Repository and workspace structure
9. Local PostgreSQL environment
10. Continuous integration
11. Error monitoring
12. Primary icon library
13. Custom domains

## Success Criteria

The selected stack is successful when:

- React and Vite provide a maintainable frontend workflow.
- TanStack Router provides typed routes and validated URL state.
- Zod validates frontend and backend trust boundaries.
- Tailwind CSS provides consistent utility-based styling.
- shadcn/ui provides customizable component foundations.
- Fastify provides a modular backend API.
- Better Auth provides secure session-based authentication.
- Drizzle provides typed PostgreSQL access.
- Drizzle Kit provides controlled migrations.
- Vercel reliably hosts the frontend.
- Railway reliably hosts the backend and PostgreSQL.
- Authentication works across the deployed frontend and backend.
- Database access remains isolated to the backend.
- New features can be added without replacing the core architecture.
