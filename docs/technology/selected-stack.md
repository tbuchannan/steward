# Selected Technology Stack

## Status

This document records technology decisions that have been confirmed for Steward.

Items marked as undecided should not be treated as finalized.

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

| Area               | Selection  | Status   |
| ------------------ | ---------- | -------- |
| Database           | PostgreSQL | Selected |
| ORM or query layer | Undecided  | Open     |
| Migration tooling  | Undecided  | Open     |
| PostgreSQL client  | Undecided  | Open     |

## Infrastructure

| Area                       | Selection | Status |
| -------------------------- | --------- | ------ |
| Package manager            | Undecided | Open   |
| Repository structure       | Undecided | Open   |
| Local database environment | Undecided | Open   |
| Frontend deployment        | Undecided | Open   |
| Backend deployment         | Undecided | Open   |
| Database hosting           | Undecided | Open   |
| CI/CD                      | Undecided | Open   |

## Confirmed Architecture

The currently selected high-level architecture is:

```text
React + TypeScript
        |
        | TanStack Router
        |
        | HTTP requests
        v
Fastify + TypeScript
        |
        | Better Auth
        |
        | PostgreSQL
        v
User authentication and financial data
```

## Frontend Decisions

### React

React provides the component model for Steward’s interactive user interface.

### Vite

Vite provides the development server and production build tooling.

### TanStack Router

TanStack Router provides type-safe client-side routing, nested layouts, route parameters, and validated search parameters.

The initial implementation will use file-based routing with the TanStack Router Vite plugin.

## Backend Decisions

### Fastify

Fastify hosts the Steward API and Better Auth endpoints.

### Better Auth

Better Auth manages registration, credentials, cookie-based sessions, and authenticated identity.

### PostgreSQL

PostgreSQL stores Better Auth records and Steward’s relational financial data.

## Explicitly Not Selected

The current plan does not use:

- Next.js
- TanStack Start
- React Router
- Express
- Hono
- SQLite
- A custom authentication system

These tools should not be introduced without revisiting the relevant decision documentation.

## Next Decisions

The next technology evaluations should cover:

1. Server-state management
2. Form management
3. Styling and component library
4. ORM or query layer
5. Runtime validation
6. Testing
7. Package management and repository structure
8. Deployment
