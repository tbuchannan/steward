# Architecture Overview

**Status:** Accepted
**Last verified:** 2026-08-03

## System

```text
Browser
  │ same-origin /api/*
  ▼
Vercel
  ├── React + Vite static application
  └── /api/* rewrite
          │
          ▼
      Railway Fastify API
          ├── Better Auth
          ├── Application services
          └── Drizzle ORM + pg.Pool
                  │ private connection
                  ▼
              PostgreSQL
```

The Vercel rewrite makes production browser requests first-party. Railway remains the API runtime and is not replaced by a Vercel function.

## Selected Stack

| Area                   | Selection                              |
| ---------------------- | -------------------------------------- |
| Language               | TypeScript                             |
| Frontend               | React and Vite                         |
| Routing                | TanStack Router                        |
| Server state           | TanStack Query                         |
| Forms                  | React Hook Form                        |
| Runtime validation     | Zod                                    |
| Styling                | Tailwind CSS and shadcn/ui             |
| Icons                  | Lucide React                           |
| Backend                | Node.js and Fastify                    |
| Authentication         | Better Auth                            |
| Database               | PostgreSQL                             |
| Database access        | Drizzle ORM, Drizzle Kit, and `pg`     |
| Unit/integration tests | Vitest                                 |
| Component tests        | React Testing Library and `user-event` |
| Database tests         | Testcontainers for Node.js             |
| Browser tests          | Playwright                             |
| CI                     | GitHub Actions                         |
| Hosting                | Vercel and Railway                     |
| Repository             | pnpm workspaces                        |

Versions are selected and recorded as each part of the architecture is
implemented. Runtime and package-manager constraints live in the root manifest;
installed dependency versions are reproducible through the shared lockfile. See
[configuration](../operations/configuration.md).

## Boundaries

### Browser

- Renders UX and validates form usability.
- Maintains URL, form, theme, and server-cache state.
- Does not authorize data or calculate authoritative ownership.
- Communicates only through public API contracts.

### API

- Validates requests and serializes responses.
- Retrieves authenticated identity.
- Enforces ownership and business rules.
- Coordinates database transactions.
- Returns one stable public error shape.

### Database

- Persists authentication and financial records.
- Enforces relational constraints and user ownership relationships.
- Uses reviewed, version-controlled migrations.
- Does not expose credentials or direct access to the browser.

## Request Flow

```text
User action
→ validated frontend input
→ same-origin /api request
→ Vercel rewrite
→ Fastify request validation
→ Better Auth session validation
→ service business rules
→ ownership-scoped Drizzle query
→ PostgreSQL transaction
→ mapped API response
→ TanStack Query cache update/invalidation
→ refreshed UI
```

## Cross-Cutting Rules

- [MVP requirements](../product/mvp-requirements.md) own product scope.
- [Financial rules](../domain/financial-rules.md) own calculations.
- [Authentication architecture](authentication.md) owns the browser, session,
  and application authorization boundaries.
- Zod validates runtime boundaries; TypeScript alone is not validation.
- Better Auth determines identity; application queries enforce ownership.
- Secrets remain server-side.
- Tests use disposable data and never access production.
- Transactions are internal records only; no API path initiates payments or moves funds.

## Decisions

The rationale and consequences for major choices are recorded in [ADRs](decisions/README.md).
