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
| Backend testing         | Undecided                   | Open     |

## Database

| Area                   | Selection                   | Status   |
| ---------------------- | --------------------------- | -------- |
| Database               | PostgreSQL                  | Selected |
| ORM and query layer    | Drizzle ORM                 | Selected |
| Migration tooling      | Drizzle Kit                 | Selected |
| Authentication adapter | Better Auth Drizzle adapter | Selected |
| PostgreSQL driver      | Undecided                   | Open     |

## Infrastructure

| Area                         | Selection | Status |
| ---------------------------- | --------- | ------ |
| Package manager              | Undecided | Open   |
| Repository structure         | Undecided | Open   |
| Local PostgreSQL environment | Undecided | Open   |
| Frontend deployment          | Undecided | Open   |
| Backend deployment           | Undecided | Open   |
| Database hosting             | Undecided | Open   |
| CI/CD                        | Undecided | Open   |

## Confirmed Architecture

```text
React + TypeScript + Vite
            |
            | TanStack Router
            | Zod
            |
            | Credentialed HTTP requests
            v
Fastify + TypeScript
            |
            | Zod request and response schemas
            | Better Auth
            | Drizzle ORM
            v
PostgreSQL
```

## Frontend Decisions

### React

React provides Steward’s component and rendering model.

### Vite

Vite provides the frontend development server and production build process.

### TanStack Router

TanStack Router provides type-safe client-side routes, nested layouts, route parameters, and validated search parameters.

### Zod

Zod provides runtime validation for:

- Forms
- Route search parameters
- Frontend environment configuration
- Stored browser values
- Selected API boundaries

## Backend Decisions

### Fastify

Fastify hosts Steward’s API and Better Auth endpoints.

### Zod

Zod defines and validates:

- Request bodies
- Route parameters
- Query parameters
- Response payloads
- Backend environment configuration

### `fastify-type-provider-zod`

`fastify-type-provider-zod` connects Zod schemas to Fastify’s route validation, serialization, and inferred TypeScript types.

### Better Auth

Better Auth manages registration, credentials, cookie-based sessions, and authenticated identity.

## Database Decisions

### PostgreSQL

PostgreSQL stores authentication records and relational financial data.

### Drizzle ORM

Drizzle defines the PostgreSQL schema in TypeScript and provides typed database queries.

### Drizzle Kit

Drizzle Kit generates and applies version-controlled SQL migrations.

### Better Auth Drizzle Adapter

Better Auth uses the official Drizzle adapter configured with the PostgreSQL provider.

## Validation Flow

```text
User input
→ React form
→ Zod frontend validation
→ Fastify request
→ Zod server validation
→ Application service
→ Drizzle query
→ PostgreSQL constraints
```

Each layer serves a different purpose:

- Frontend validation improves usability.
- Backend validation protects the API boundary.
- Application services enforce business rules.
- PostgreSQL constraints protect stored-data integrity.

## API Response Flow

```text
PostgreSQL record
→ Drizzle query result
→ Application response mapping
→ Zod response schema
→ Fastify serialization
→ React client
```

Drizzle table types are not treated as public API contracts.

## Authentication Flow

```text
React authentication form
→ Zod form validation
→ Fastify Better Auth endpoint
→ Better Auth
→ Drizzle adapter
→ PostgreSQL auth tables
→ Session cookie returned
```

Better Auth remains responsible for its internal authentication validation.

## Database Workflow

```text
Edit Drizzle TypeScript schema
→ Generate SQL migration with Drizzle Kit
→ Review migration
→ Commit migration
→ Apply migration to PostgreSQL
```

## Schema Ownership

### Zod schemas

Own runtime application boundaries:

- API input
- API output
- Forms
- Environment configuration
- URL state

### Drizzle schemas

Own persistent PostgreSQL structure:

- Tables
- Columns
- Foreign keys
- Indexes
- Database constraints

Zod and Drizzle schemas may describe related data but serve different purposes.

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
- A custom authentication system

These tools should not be introduced without revisiting the corresponding technology decision.

## Next Decisions

The next technology evaluations should cover:

1. Server-state management
2. Form management
3. Styling and component library
4. Testing
5. PostgreSQL driver
6. Package management and repository structure
7. Local development infrastructure
8. Deployment
