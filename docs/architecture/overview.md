# Architecture Overview

**Status:** Accepted
**Last verified:** 2026-08-03

## System

```text
Browser
  │ same-origin page and /api requests
  ▼
Vercel Next.js application
  ├── App Router pages and Route Handlers
  ├── Server-only authentication and application services
  └── Drizzle ORM + pg.Pool
          │ secure database connection
          ▼
      PostgreSQL
```

[ADR 008](decisions/008-nextjs-app-router.md) describes the consolidation.

## Selected Stack

| Area                   | Selection                                |
| ---------------------- | ---------------------------------------- |
| Language               | TypeScript                               |
| Frontend               | React and Next.js App Router             |
| Routing                | Next.js file-based routing               |
| Server state           | Server Components and route revalidation |
| Forms                  | React Hook Form                          |
| Runtime validation     | Zod                                      |
| Styling                | Tailwind CSS and shadcn/ui               |
| Icons                  | Lucide React                             |
| Backend                | Node.js and Next.js Route Handlers       |
| Authentication         | Better Auth                              |
| Database               | PostgreSQL                               |
| Database access        | Drizzle ORM, Drizzle Kit, and `pg`       |
| Unit/integration tests | Vitest                                   |
| Component tests        | React Testing Library and `user-event`   |
| Database tests         | Testcontainers for Node.js               |
| Browser tests          | Playwright                               |
| CI                     | GitHub Actions                           |
| Hosting                | Vercel app and Neon PostgreSQL           |
| Repository             | One pnpm project                         |

Versions are selected and recorded as each part of the architecture is
implemented. Runtime and package-manager constraints live in the root manifest;
installed dependency versions are reproducible through the shared lockfile. See
[configuration](../operations/configuration.md).

## Boundaries

### Browser

- Renders UX and validates form usability.
- Maintains URL, form, theme, and server-cache state.
- Does not authorize data or calculate authoritative ownership.
- Uses same-origin HTTP endpoints or server functions for server operations.

### Application Server

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

An HTTP request reaches a Route Handler, which validates the public input,
resolves a Better Auth session where required, calls an application service,
and serializes the result against the public contract. Server Components may
call the same services directly. Services apply owner-scoped queries and
coordinate PostgreSQL transactions.

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
