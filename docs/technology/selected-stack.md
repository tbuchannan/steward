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
| Server-state management | Undecided       | Open     |
| Form management         | Undecided       | Open     |
| Styling                 | Undecided       | Open     |
| Component library       | Undecided       | Open     |
| Charting                | Undecided       | Open     |
| Frontend testing        | Undecided       | Open     |

## Backend

| Area            | Selection     | Status   |
| --------------- | ------------- | -------- |
| Runtime         | Node.js       | Selected |
| Language        | TypeScript    | Selected |
| Web framework   | Fastify       | Selected |
| Authentication  | Better Auth   | Selected |
| API style       | HTTP JSON API | Selected |
| Validation      | Undecided     | Open     |
| Backend testing | Undecided     | Open     |

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
            |
            | Credentialed HTTP requests
            v
Fastify + TypeScript
            |
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

## Backend Decisions

### Fastify

Fastify hosts Steward’s API and Better Auth endpoints.

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

## Data Flow

```text
React page
→ Feature API function
→ Fastify route
→ Authentication hook
→ Application service
→ Drizzle query
→ PostgreSQL
```

The response returns through the same layers in reverse.

## Authentication Flow

```text
React authentication form
→ Fastify Better Auth endpoint
→ Better Auth
→ Drizzle adapter
→ PostgreSQL auth tables
→ Session cookie returned
```

## Database Workflow

```text
Edit Drizzle TypeScript schema
→ Generate SQL migration with Drizzle Kit
→ Review migration
→ Commit migration
→ Apply migration to PostgreSQL
```

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
- A custom authentication system

These tools should not be introduced without revisiting the corresponding technology decision.

## Next Decisions

The next technology evaluations should cover:

1. Server-state management
2. Form management
3. Runtime validation
4. Styling and component library
5. Testing
6. PostgreSQL driver
7. Package management and repository structure
8. Local development infrastructure
9. Deployment
