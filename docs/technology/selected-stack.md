# Selected Technology Stack

## Status

This document records confirmed technology decisions for Steward.

Items marked as open have not yet been selected.

## Frontend

| Area                    | Selection       | Status   |
| ----------------------- | --------------- | -------- |
| UI library              | React           | Selected |
| Language                | TypeScript      | Selected |
| Build tool              | Vite            | Selected |
| Routing                 | TanStack Router | Selected |
| Runtime validation      | Zod             | Selected |
| Deployment              | Vercel          | Selected |
| Server-state management | Undecided       | Open     |
| Form management         | Undecided       | Open     |
| Styling                 | Undecided       | Open     |
| Component library       | Undecided       | Open     |
| Charting                | Undecided       | Open     |
| Frontend testing        | Undecided       | Open     |

## Backend

| Area                    | Selection                   | Status   |
| ----------------------- | --------------------------- | -------- |
| Runtime                 | Node.js                     | Selected |
| Language                | TypeScript                  | Selected |
| Web framework           | Fastify                     | Selected |
| Runtime validation      | Zod                         | Selected |
| Fastify Zod integration | `fastify-type-provider-zod` | Selected |
| Authentication          | Better Auth                 | Selected |
| API style               | HTTP JSON API               | Selected |
| Deployment              | Railway                     | Selected |
| Backend testing         | Undecided                   | Open     |

## Database

| Area                   | Selection                   | Status   |
| ---------------------- | --------------------------- | -------- |
| Database               | PostgreSQL                  | Selected |
| ORM and query layer    | Drizzle ORM                 | Selected |
| Migration tooling      | Drizzle Kit                 | Selected |
| Authentication adapter | Better Auth Drizzle adapter | Selected |
| Database hosting       | Railway PostgreSQL          | Selected |
| PostgreSQL driver      | Undecided                   | Open     |

## Infrastructure

| Area                         | Selection                                                       | Status   |
| ---------------------------- | --------------------------------------------------------------- | -------- |
| Frontend hosting             | Vercel                                                          | Selected |
| Backend hosting              | Railway                                                         | Selected |
| Database hosting             | Railway                                                         | Selected |
| Package manager              | Undecided                                                       | Open     |
| Repository structure         | Undecided                                                       | Open     |
| Local PostgreSQL environment | Undecided                                                       | Open     |
| CI/CD                        | Vercel and Railway Git deployments with additional CI undecided | Partial  |
| Custom domains               | Undecided                                                       | Open     |
| Error monitoring             | Undecided                                                       | Open     |

## Confirmed Architecture

```text
User browser
      |
      | HTTPS
      v
Vercel
React + TypeScript + Vite
TanStack Router
Zod
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

## Frontend Decisions

### React

React provides Steward’s component and rendering model.

### Vite

Vite provides the frontend development server and production build process.

### TanStack Router

TanStack Router provides:

- Type-safe client-side routes
- Nested layouts
- Route parameters
- Validated search parameters
- Authentication-aware navigation
- Route-level code splitting where appropriate

### Zod

Zod provides runtime validation for:

- Forms
- Route search parameters
- Frontend environment configuration
- Browser storage
- Selected API boundaries

### Vercel

Vercel builds and hosts the React and Vite frontend.

Vercel provides:

- Production frontend deployments
- Preview deployments
- HTTPS hosting
- Frontend environment configuration
- Git-based deployments

## Backend Decisions

### Fastify

Fastify hosts:

- Steward’s HTTP API
- Better Auth endpoints
- Protected financial operations
- Health-check endpoints

### Zod

Zod validates:

- Request bodies
- Route parameters
- Query parameters
- Response payloads
- Backend environment configuration

### `fastify-type-provider-zod`

`fastify-type-provider-zod` connects Zod schemas to Fastify’s validation, serialization, and TypeScript inference.

### Better Auth

Better Auth manages:

- Registration
- Email and password authentication
- Cookie-based sessions
- Authenticated user identity
- Sign out

### Railway

Railway builds and runs the Fastify backend.

Railway provides:

- Backend service hosting
- Server environment variables
- Service networking
- Health checks
- Deployment logs
- Rollback capabilities
- Connectivity to Railway PostgreSQL

## Database Decisions

### PostgreSQL

PostgreSQL stores:

- Better Auth records
- Financial accounts
- Transactions
- Categories
- Budgets
- Budget allocations
- User preferences
- Demo-user data

### Drizzle ORM

Drizzle defines PostgreSQL schemas in TypeScript and provides typed database queries.

### Drizzle Kit

Drizzle Kit generates and applies version-controlled SQL migrations.

### Better Auth Drizzle Adapter

Better Auth uses the official Drizzle adapter configured for PostgreSQL.

### Railway PostgreSQL

Railway hosts the production PostgreSQL service.

The Fastify backend connects using Railway-managed database variables.

## Deployment Decisions

### Frontend deployment

```text
Git repository
→ Vercel build
→ Vite production build
→ Vercel frontend deployment
```

### Backend deployment

```text
Git repository
→ Railway build
→ Drizzle migration step
→ Fastify production process
→ Railway health check
```

### Database deployment

```text
Drizzle TypeScript schema
→ Drizzle Kit SQL migration
→ Railway PostgreSQL
```

## Production Data Flow

```text
React page
→ Zod frontend validation
→ TanStack Router navigation
→ Credentialed request to Railway
→ Fastify route
→ Zod server validation
→ Better Auth session validation
→ Application service
→ Drizzle query
→ Railway PostgreSQL
```

The response returns through the layers in reverse.

## Authentication Flow

```text
Vercel React authentication form
→ Zod form validation
→ Railway Fastify Better Auth endpoint
→ Better Auth
→ Drizzle adapter
→ Railway PostgreSQL authentication tables
→ Session cookie returned to browser
```

## Validation Flow

```text
User input
→ React form
→ Zod frontend validation
→ Fastify request
→ Zod backend validation
→ Application business rules
→ Drizzle query
→ PostgreSQL constraints
```

Each layer has a separate responsibility:

- Frontend validation improves usability.
- Backend validation protects the API boundary.
- Application services enforce business rules.
- PostgreSQL constraints protect stored data.

## API Response Flow

```text
Railway PostgreSQL record
→ Drizzle query result
→ Application response mapping
→ Zod response schema
→ Fastify serialization
→ Vercel React frontend
```

Drizzle database types are not public API contracts.

## Database Workflow

```text
Edit Drizzle TypeScript schema
→ Generate migration with Drizzle Kit
→ Review SQL
→ Commit migration
→ Apply migration to Railway PostgreSQL
```

## Environment Configuration

### Vercel frontend

Expected browser-safe values include:

```text
VITE_API_URL
VITE_APP_ENV
```

### Railway backend

Expected server-side values include:

```text
NODE_ENV
PORT
DATABASE_URL
BETTER_AUTH_SECRET
BETTER_AUTH_URL
FRONTEND_ORIGIN
TRUSTED_ORIGINS
LOG_LEVEL
DEMO_USER_EMAIL
```

Exact values must not be committed to source control.

## Deployment Domains

The initial implementation may use platform-provided domains.

A later custom-domain structure may use:

```text
Frontend:
steward.example.com

Backend:
api.steward.example.com
```

The final domains must remain consistent across:

- Vercel configuration
- Railway networking
- `VITE_API_URL`
- Better Auth configuration
- Trusted origins
- Fastify CORS
- Authentication-cookie configuration

## Confirmed Service Ownership

| Concern                     | Owner           |
| --------------------------- | --------------- |
| Frontend rendering          | React           |
| Frontend build              | Vite            |
| Frontend routing            | TanStack Router |
| Frontend hosting            | Vercel          |
| HTTP API                    | Fastify         |
| Backend hosting             | Railway         |
| Runtime validation          | Zod             |
| Authentication              | Better Auth     |
| Database queries            | Drizzle ORM     |
| Database migrations         | Drizzle Kit     |
| Relational persistence      | PostgreSQL      |
| Production database hosting | Railway         |

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
- Netlify
- Render
- Fly.io
- Supabase database hosting
- Vercel Functions for the primary backend
- A custom authentication system

These tools should not be introduced without revisiting the corresponding technology decision.

## Remaining Decisions

The next technology evaluations should cover:

1. Server-state management
2. Form management
3. Styling and component library
4. Frontend and backend testing
5. PostgreSQL driver
6. Package manager
7. Repository and workspace structure
8. Local PostgreSQL environment
9. CI validation
10. Error monitoring
11. Custom domains
