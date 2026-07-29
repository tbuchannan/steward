# Selected Technology Stack

## Status

This document records the confirmed technology decisions for Steward.

Items marked as open have not yet been selected.

## Architecture Summary

Steward is a client-rendered full-stack personal-finance web application.

```text
User browser
      |
      | HTTPS
      v
Vercel
React + TypeScript + Vite
TanStack Router
TanStack Query
React Hook Form
Zod
Tailwind CSS
shadcn/ui
Lucide React
      |
      | Credentialed HTTPS requests
      v
Railway
Fastify + TypeScript
Zod
Better Auth
Drizzle ORM
pg
      |
      | PostgreSQL connection
      v
Railway PostgreSQL
```

## Repository Summary

```text
pnpm monorepo
├── apps/web
├── apps/api
├── packages/contracts
├── e2e
└── docs
```

pnpm workspaces will manage internal packages.

Turborepo will not be used initially.

Docker Compose is not required for normal local development.

Kubernetes will not be used.

## Testing Summary

```text
Vitest
├── Frontend unit tests
├── React component tests
├── Backend unit tests
├── Fastify integration tests
├── Drizzle integration tests
└── Coverage

React Testing Library
├── User-visible component behavior
├── Forms
├── Dialogs
├── Tables
└── Error and loading states

Fastify inject()
└── HTTP lifecycle without a network port

Testcontainers
└── Disposable real PostgreSQL databases

Playwright
└── Critical complete browser workflows
```

## Frontend

| Area                            | Selection                     | Status   |
| ------------------------------- | ----------------------------- | -------- |
| UI library                      | React                         | Selected |
| Language                        | TypeScript                    | Selected |
| Build tool                      | Vite                          | Selected |
| Routing                         | TanStack Router               | Selected |
| Server-state management         | TanStack Query                | Selected |
| Form management                 | React Hook Form               | Selected |
| Form validation                 | Zod + `@hookform/resolvers`   | Selected |
| Runtime validation              | Zod                           | Selected |
| Styling                         | Tailwind CSS                  | Selected |
| Component system                | shadcn/ui                     | Selected |
| Primary icon library            | Lucide React                  | Selected |
| Unit test runner                | Vitest                        | Selected |
| Component testing               | React Testing Library         | Selected |
| User interaction testing        | `@testing-library/user-event` | Selected |
| DOM assertions                  | `@testing-library/jest-dom`   | Selected |
| Test DOM environment            | jsdom                         | Selected |
| End-to-end testing              | Playwright                    | Selected |
| Coverage                        | `@vitest/coverage-v8`         | Selected |
| Frontend hosting                | Vercel                        | Selected |
| Charting                        | Undecided                     | Open     |
| Error monitoring                | Undecided                     | Open     |
| Automated accessibility scanner | Undecided                     | Open     |
| Visual regression testing       | Undecided                     | Open     |

## Backend

| Area                             | Selection                   | Status   |
| -------------------------------- | --------------------------- | -------- |
| Runtime                          | Node.js                     | Selected |
| Language                         | TypeScript                  | Selected |
| Web framework                    | Fastify                     | Selected |
| Runtime validation               | Zod                         | Selected |
| Fastify Zod integration          | `fastify-type-provider-zod` | Selected |
| Authentication                   | Better Auth                 | Selected |
| API style                        | HTTP JSON API               | Selected |
| PostgreSQL driver                | `pg` / node-postgres        | Selected |
| Drizzle PostgreSQL adapter       | `drizzle-orm/node-postgres` | Selected |
| Connection pooling               | `pg.Pool`                   | Selected |
| Unit and integration runner      | Vitest                      | Selected |
| HTTP route testing               | Fastify `inject()`          | Selected |
| Database integration environment | Testcontainers for Node.js  | Selected |
| Backend hosting                  | Railway                     | Selected |
| API documentation                | Undecided                   | Open     |
| Error monitoring                 | Undecided                   | Open     |
| Rate limiting                    | Undecided                   | Open     |

## Database

| Area                         | Selection                    | Status   |
| ---------------------------- | ---------------------------- | -------- |
| Database                     | PostgreSQL                   | Selected |
| ORM and query layer          | Drizzle ORM                  | Selected |
| Migration tooling            | Drizzle Kit                  | Selected |
| Authentication adapter       | Better Auth Drizzle adapter  | Selected |
| PostgreSQL driver            | `pg` / node-postgres         | Selected |
| Drizzle PostgreSQL adapter   | `drizzle-orm/node-postgres`  | Selected |
| Connection pooling           | `pg.Pool`                    | Selected |
| Integration-test database    | PostgreSQL Testcontainer     | Selected |
| Production database hosting  | Railway PostgreSQL           | Selected |
| Monetary representation      | Undecided                    | Open     |
| Account balance strategy     | Undecided                    | Open     |
| Local PostgreSQL environment | Locally installed PostgreSQL | Selected |
| Backup schedule              | Undecided                    | Open     |

## Repository and Tooling

| Area                       | Selection            | Status   |
| -------------------------- | -------------------- | -------- |
| Package manager            | pnpm                 | Selected |
| Repository structure       | Monorepo             | Selected |
| Workspace tooling          | pnpm workspaces      | Selected |
| Frontend workspace         | `apps/web`           | Selected |
| Backend workspace          | `apps/api`           | Selected |
| Shared contracts workspace | `packages/contracts` | Selected |
| End-to-end workspace       | `e2e`                | Selected |
| Additional task runner     | None initially       | Selected |
| Turborepo                  | Not selected         | Selected |
| Docker Compose             | Not required         | Selected |
| Kubernetes                 | Not used             | Selected |
| Node.js version            | Undecided            | Open     |
| pnpm version               | Undecided            | Open     |

## Testing

| Area                            | Selection                     | Status   |
| ------------------------------- | ----------------------------- | -------- |
| Primary test runner             | Vitest                        | Selected |
| Frontend unit testing           | Vitest                        | Selected |
| Backend unit testing            | Vitest                        | Selected |
| React component testing         | React Testing Library         | Selected |
| Browser-like test DOM           | jsdom                         | Selected |
| User interaction simulation     | `@testing-library/user-event` | Selected |
| DOM matchers                    | `@testing-library/jest-dom`   | Selected |
| Fastify route testing           | Fastify `inject()`            | Selected |
| Database integration testing    | Testcontainers for Node.js    | Selected |
| Integration database engine     | Real PostgreSQL               | Selected |
| End-to-end testing              | Playwright                    | Selected |
| Coverage provider               | V8                            | Selected |
| Coverage package                | `@vitest/coverage-v8`         | Selected |
| Visual regression testing       | Undecided                     | Open     |
| Automated accessibility scanner | Undecided                     | Open     |
| Cross-browser CI cadence        | Undecided                     | Open     |

## Deployment

| Area                           | Selection            | Status   |
| ------------------------------ | -------------------- | -------- |
| Frontend deployment            | Vercel               | Selected |
| Backend deployment             | Railway              | Selected |
| Database deployment            | Railway PostgreSQL   | Selected |
| Preview frontend deployments   | Vercel               | Selected |
| Backend health checks          | Railway + `/health`  | Selected |
| Production migration tooling   | Drizzle Kit          | Selected |
| Required automated test layers | Defined              | Selected |
| CI provider                    | GitHub Actions       | Selected |
| Package manager                | pnpm                 | Selected |
| Repository structure           | Monorepo             | Selected |
| Workspace tooling              | pnpm workspaces      | Selected |
| Custom domains                 | Undecided            | Open     |
| Production monitoring          | Undecided            | Open     |
| Local database                 | Installed PostgreSQL | Selected |
| Docker Compose                 | Not required         | Selected |
| Kubernetes                     | Not used             | Selected |

## Confirmed Production Architecture

```text
Vercel
└── React frontend
    ├── TypeScript
    ├── Vite
    ├── TanStack Router
    ├── TanStack Query
    ├── React Hook Form
    ├── Zod
    ├── Tailwind CSS
    ├── shadcn/ui
    └── Lucide React

Railway
├── Fastify backend
│   ├── Node.js
│   ├── TypeScript
│   ├── Zod
│   ├── Better Auth
│   ├── Drizzle ORM
│   └── pg
└── PostgreSQL
    ├── Steward financial tables
    └── Better Auth tables
```

## Confirmed Test Architecture

```text
Vitest unit tests
├── Zod schemas
├── Financial utilities
├── Date utilities
├── Service logic
├── Environment validation
└── Response mapping

React component tests
├── React Testing Library
├── user-event
├── jest-dom
├── jsdom
├── TanStack Query
└── React Hook Form

Backend integration tests
├── Vitest
├── Fastify inject()
├── Better Auth
├── Drizzle ORM
├── pg
└── PostgreSQL Testcontainer

End-to-end tests
├── Playwright
├── React frontend
├── Fastify API
└── Disposable PostgreSQL database
```

## Frontend Decisions

### React

React provides Steward's component and rendering model.

React is responsible for:

- Interface composition
- Interactive workflows
- Local component state
- Integration with routing
- Integration with forms
- Integration with server state
- Accessible user experiences

The MVP will use client-side rendering.

### TypeScript

TypeScript is used across:

- Frontend
- Backend
- Shared contracts
- Database schema
- Migrations
- Tests
- Configuration

TypeScript provides static checks but does not replace runtime validation.

### Vite

Vite provides:

- Local development server
- React development tooling
- Production frontend build
- Environment-variable integration
- Tailwind integration

The Vite build is deployed to Vercel.

### TanStack Router

TanStack Router provides:

- Typed routes
- Nested layouts
- Route parameters
- Search-parameter validation
- Route lifecycle hooks
- Lazy loading
- Error boundaries
- Not-found handling

Frontend authentication checks do not replace backend authorization.

### TanStack Query

TanStack Query manages server state.

It provides:

- Request caching
- Request deduplication
- Loading and error states
- Mutation state
- Cache invalidation
- Pagination support
- Background refetching where useful
- Request cancellation

Server data should not be copied into unrelated global client state without a specific need.

### React Hook Form

React Hook Form manages:

- Field registration
- Form values
- Dirty state
- Touched state
- Submission state
- Field errors
- Form reset
- Controlled component integration

### `@hookform/resolvers`

`@hookform/resolvers` connects Zod schemas to React Hook Form through `zodResolver`.

### Zod

Zod provides runtime validation for:

- Forms
- Route parameters
- Search parameters
- API requests
- API responses where appropriate
- Environment variables
- Browser storage
- Imported data

Types should generally be inferred from Zod schemas.

### Tailwind CSS

Tailwind CSS provides:

- Layout
- Spacing
- Typography
- Responsive behavior
- Visual states
- Theme variants
- Utility-based styling

The project should use shared tokens rather than unrelated arbitrary values.

### shadcn/ui

shadcn/ui provides source-controlled component implementations.

Likely components include:

- Button
- Card
- Input
- Label
- Select
- Checkbox
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
- Notification components

Steward owns and may customize the added component code.

### Lucide React

Lucide React provides Steward's primary icon system.

It offers:

- React components
- TypeScript support
- Individual icon imports
- Compatibility with Tailwind CSS
- Compatibility with shadcn/ui

Icon-only controls must include accessible names.

### Vercel

Vercel provides:

- Production frontend hosting
- Preview deployments
- HTTPS
- Git integration
- Frontend environment variables
- Deployment history
- Frontend rollback

Vercel must be configured for Vite single-page application routing.

## Backend Decisions

### Node.js

Node.js provides the Fastify runtime.

The supported Node.js version should eventually be pinned.

### Fastify

Fastify hosts:

- Steward's API
- Better Auth endpoints
- Health check
- Protected financial operations

Fastify provides:

- Routing
- Plugin lifecycle
- Validation integration
- Serialization
- Logging
- Request injection for tests
- Graceful shutdown

### Zod Backend Validation

Zod validates:

- Request bodies
- Query parameters
- Route parameters
- Response payloads
- Environment configuration

Database-backed rules remain in services and queries.

### `fastify-type-provider-zod`

`fastify-type-provider-zod` connects Zod with:

- Fastify validation
- Fastify serialization
- Route schema definitions
- Type inference

### Better Auth

Better Auth manages:

- Registration
- Email and password authentication
- Session creation
- Session validation
- Cookie-based authentication
- Logout
- Authentication records

Steward will not build a competing authentication system.

### `pg` / node-postgres

`pg` provides:

- PostgreSQL connectivity
- Explicit connection pooling through `pg.Pool`
- Drizzle compatibility
- Testcontainers compatibility
- Transaction support
- Graceful pool shutdown

Drizzle uses:

```ts
import { drizzle } from "drizzle-orm/node-postgres";
```

The backend should create one shared `pg.Pool` and close it with `pool.end()` during shutdown.

### Railway Backend

Railway provides:

- Backend deployment
- HTTPS API hosting
- Backend variables
- Service logs
- Health checks
- Deployment history
- Private connectivity to PostgreSQL
- Backend rollback

## Database Decisions

### PostgreSQL

PostgreSQL stores:

- Better Auth records
- Financial accounts
- Categories
- Transactions
- Budgets
- Budget allocations
- User preferences
- Demo data

PostgreSQL constraints protect persisted integrity.

### Drizzle ORM

Drizzle provides:

- TypeScript table definitions
- Typed queries
- Typed inserts
- Typed updates
- Typed deletes
- Joins
- Transactions
- PostgreSQL integration

Drizzle table types are not automatically public API types.

### Drizzle Kit

Drizzle Kit provides:

- SQL migration generation
- Migration metadata
- Migration execution
- Version-controlled schema evolution

### Better Auth Drizzle Adapter

Better Auth uses its Drizzle adapter configured for PostgreSQL.

Conceptually:

```ts
betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
});
```

### Local PostgreSQL

Normal development will use PostgreSQL installed locally.

The Fastify backend will connect through:

```text
DATABASE_URL
```

Docker Compose is not required for normal local development.

### Testcontainers

Integration tests will use disposable PostgreSQL Testcontainers.

The container connection URI will be passed to `pg.Pool`.

### Railway PostgreSQL

Railway hosts production PostgreSQL.

The backend should use private connectivity where available.

## Repository Decisions

### pnpm

pnpm provides dependency installation, one lockfile, and workspace support.

### Monorepo

Steward uses one repository for:

- Frontend
- Backend
- Shared contracts
- End-to-end tests
- Documentation

### pnpm workspaces

pnpm workspaces manage:

```text
apps/web
apps/api
packages/contracts
e2e
```

### No Turborepo initially

Turborepo will not be added until there is a demonstrated need for remote caching or more advanced task orchestration.

### No required Docker Compose

Normal local development uses PostgreSQL installed directly.

Testcontainers remain selected for automated integration tests.

### No Kubernetes

Kubernetes is not appropriate for Steward's initial scale or deployment model.

## Testing Decisions

### Vitest

Vitest is the primary runner for:

- Frontend unit tests
- React component tests
- Backend unit tests
- Fastify integration tests
- Drizzle integration tests
- Shared-contract tests
- Coverage

### React Testing Library

React Testing Library verifies user-visible behavior through accessible queries.

It is used for:

- Forms
- Dialogs
- Tables
- Filters
- Loading states
- Empty states
- Error states
- shadcn/ui compositions

### `@testing-library/user-event`

`user-event` simulates:

- Typing
- Clicking
- Tabbing
- Selecting
- Checking controls
- Keyboard interaction

### `@testing-library/jest-dom`

`jest-dom` provides readable DOM assertions for Vitest.

### jsdom

jsdom provides a simulated browser DOM for component tests.

### Fastify `inject()`

Fastify `inject()` tests:

- Routes
- Hooks
- Validation
- Serialization
- Authentication
- Authorization
- Errors
- Cookies
- Headers

without opening a network port.

### Testcontainers for Node.js

Testcontainers provides disposable real PostgreSQL instances.

Integration tests should:

```text
Start PostgreSQL
→ Apply Drizzle migrations
→ Seed test data
→ Run tests
→ Stop PostgreSQL
```

### Playwright

Playwright verifies critical browser workflows.

Initial workflows include:

- Registration
- Login
- Logout
- Account creation
- Transaction creation
- Transaction editing
- Transfer creation
- Budget creation
- Demo reset
- Session persistence
- Protected routes
- Direct route refresh

### V8 Coverage

Vitest uses:

```text
@vitest/coverage-v8
```

Coverage should prioritize high-risk behavior rather than percentage alone.

## Production Request Flow

```text
User action
→ React component
→ React Hook Form
→ Zod frontend validation
→ TanStack Query mutation
→ Credentialed HTTPS request
→ Fastify route
→ Zod backend validation
→ Better Auth session validation
→ Application service
→ Drizzle query
→ pg Pool
→ Railway PostgreSQL
```

## Data Loading Flow

```text
Route or component
→ TanStack Query
→ Shared API client
→ Fastify
→ Drizzle
→ pg Pool
→ PostgreSQL
→ API response
→ Query cache
→ React render
```

## Authentication Flow

```text
Vercel login form
→ React Hook Form
→ Zod validation
→ Railway Better Auth endpoint
→ Better Auth
→ Drizzle adapter
→ Railway PostgreSQL
→ Session cookie
→ Browser
```

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

Each layer serves a separate purpose:

- Frontend validation improves usability.
- Backend validation protects the API boundary.
- Services enforce business rules.
- PostgreSQL constraints protect stored data.

## API Response Flow

```text
PostgreSQL record
→ Drizzle query
→ Response mapping
→ Zod response schema
→ Fastify serialization
→ React frontend
```

Database records should not be exposed without deliberate mapping.

## Integration-Test Flow

```text
Vitest
→ Fastify inject()
→ Zod validation
→ Better Auth test session
→ Service
→ Drizzle
→ PostgreSQL Testcontainer
```

## End-to-End Test Flow

```text
Playwright browser
→ Vite frontend
→ Fastify API
→ Disposable PostgreSQL
```

## Styling Architecture

```text
Tailwind CSS and design tokens
                ↓
shadcn/ui primitives
                ↓
Shared Steward components
                ↓
Feature components
                ↓
Routes and pages
```

## Schema Ownership

### Zod schemas

Own runtime boundaries:

- API input
- API output
- Forms
- Environment configuration
- URL state
- Browser storage

### Drizzle schemas

Own persistent structure:

- Tables
- Columns
- Foreign keys
- Indexes
- Constraints
- Relations

### TypeScript types

Provide compile-time safety.

TypeScript does not replace runtime validation or database constraints.

## Environment Configuration

### Vercel frontend

Likely public variables:

```text
VITE_API_URL
VITE_APP_ENV
```

### Railway backend

Likely server variables:

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

Exact secret values must not be committed.

## Cross-Origin Authentication

Vercel and Railway will normally use different origins.

The application must coordinate:

- Frontend `credentials` behavior
- Fastify CORS
- Better Auth trusted origins
- Secure cookie settings
- SameSite behavior
- Production domains
- Preview domains

Wildcard CORS must not be used with credentialed authentication.

## Database Workflow

```text
Edit Drizzle schema
→ Generate migration
→ Review SQL
→ Run integration tests
→ Commit migration
→ Apply during Railway release
```

## Deployment Workflow

```text
Commit or pull request
→ GitHub Actions checks
→ Tests
→ Builds
→ Preview or production deployment
```

Production release:

```text
Required GitHub Actions checks pass
→ Apply Drizzle migrations
→ Deploy Fastify
→ Pass Railway health check
→ Deploy or promote Vercel frontend
→ Run smoke checks
```

The final order may vary based on backward compatibility.

## Required CI Stages

Required checks should eventually include:

1. Formatting
2. Linting
3. Type checking
4. Unit tests
5. React component tests
6. Fastify integration tests
7. PostgreSQL integration tests
8. Migration verification
9. Frontend build
10. Backend build
11. Critical Playwright tests

A failed required check should block production deployment.

## Local Development Architecture

```text
apps/web
React + Vite
→ apps/api
Fastify + Node.js
→ Locally installed PostgreSQL
```

Docker Compose is not required.

The frontend and backend run directly during normal local development.

## Security Boundaries

### Frontend

The frontend is not trusted for:

- Authentication
- Authorization
- Ownership
- Financial integrity
- Secret storage

### Backend

The backend is responsible for:

- Session validation
- Authorization
- Ownership
- Business rules
- Request validation
- Safe response mapping
- Database access

### Database

PostgreSQL is responsible for:

- Required values
- Foreign keys
- Unique constraints
- Check constraints
- Transactional integrity

### Testing

Automated tests must use:

- Test credentials
- Disposable PostgreSQL
- Synthetic financial data
- Non-production secrets

## Service Ownership

| Concern                     | Technology                    |
| --------------------------- | ----------------------------- |
| Interface rendering         | React                         |
| Frontend language           | TypeScript                    |
| Frontend build              | Vite                          |
| Routing                     | TanStack Router               |
| Server state                | TanStack Query                |
| Form state                  | React Hook Form               |
| Runtime validation          | Zod                           |
| Styling                     | Tailwind CSS                  |
| UI components               | shadcn/ui                     |
| Icons                       | Lucide React                  |
| Frontend hosting            | Vercel                        |
| HTTP API                    | Fastify                       |
| Backend runtime             | Node.js                       |
| Authentication              | Better Auth                   |
| Database schema and queries | Drizzle ORM                   |
| PostgreSQL driver           | `pg` / node-postgres          |
| Database migrations         | Drizzle Kit                   |
| Relational persistence      | PostgreSQL                    |
| Backend hosting             | Railway                       |
| Production database hosting | Railway PostgreSQL            |
| Package manager             | pnpm                          |
| Workspace management        | pnpm workspaces               |
| Continuous integration      | GitHub Actions                |
| Primary test runner         | Vitest                        |
| React component testing     | React Testing Library         |
| User interaction tests      | `@testing-library/user-event` |
| DOM assertions              | `@testing-library/jest-dom`   |
| Simulated DOM               | jsdom                         |
| Backend route testing       | Fastify `inject()`            |
| Integration database        | PostgreSQL Testcontainer      |
| End-to-end testing          | Playwright                    |
| Coverage                    | Vitest V8 coverage            |

## Explicitly Not Selected

The current architecture does not use:

- Next.js
- TanStack Start
- React Router
- Redux for server state
- Formik
- Express
- Hono
- NestJS
- GraphQL
- Prisma
- Sequelize
- TypeORM
- SQLite
- MongoDB
- MySQL
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
- Neon database hosting
- Vercel Functions as the primary backend
- A custom authentication system
- Jest
- Cypress
- Enzyme
- Sinon
- Heavy Drizzle mocking
- Production data in automated tests
- Full-page snapshot testing
- Turborepo initially
- Docker Compose as a requirement
- Kubernetes
- Multiple icon libraries

These choices should not be introduced without revisiting the relevant technology decision.

## Remaining Decisions

The remaining major technology decisions are:

1. Charting
2. Monetary database representation
3. Account balance strategy
4. Transaction sign convention
5. Exact Node.js version
6. Exact pnpm version
7. Error monitoring
8. Custom domains
9. Backup schedule
10. Automated accessibility scanner
11. Visual regression testing
12. Production log aggregation

## Success Criteria

The selected stack is successful when:

- React and Vite provide a maintainable frontend workflow.
- TanStack Router provides typed navigation and validated URL state.
- TanStack Query manages server state predictably.
- React Hook Form manages form state and submission behavior.
- Zod validates frontend and backend trust boundaries.
- Tailwind CSS provides consistent utility-based styling.
- shadcn/ui provides accessible customizable component foundations.
- Lucide React provides a consistent icon system.
- Fastify provides a modular backend API.
- Better Auth provides reliable session-based authentication.
- Drizzle and `pg` provide typed PostgreSQL access.
- Drizzle Kit provides controlled schema migrations.
- PostgreSQL protects relational and financial integrity.
- Vercel reliably hosts the frontend.
- Railway reliably hosts the backend and database.
- pnpm workspaces keep the monorepo manageable.
- GitHub Actions blocks invalid deployments.
- Locally installed PostgreSQL supports normal development without requiring Docker Compose.
- Authentication works across Vercel and Railway origins.
- Database access remains isolated to the backend.
- Vitest provides one primary automated test runner.
- React Testing Library verifies user-visible component behavior.
- Fastify routes are tested through request injection.
- Testcontainers verify real PostgreSQL behavior.
- Playwright verifies critical browser workflows.
- Required checks block invalid production deployments.
- New features can be added without replacing the core architecture.
