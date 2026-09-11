# Steward

Steward is a responsive personal-finance record-keeping application for manually managing accounts, transactions, monthly budgets, and financial summaries. It never initiates payments, transfers funds, or communicates with financial institutions.

> **Status:** Early implementation. The web, API, and public-contract packages
> include a deployable API health path and a styled frontend account-access
> shell.
> Authentication, persistence, and MVP financial workflows are not yet
> implemented.

**Live deployment:** [steward.tjbuchannan.com](https://steward.tjbuchannan.com)

## MVP

The first release will let an individual:

- Register or sign in with email and password
- Explore an isolated, seeded demo
- Manage financial accounts
- Create, edit, categorize, search, filter, and delete transactions
- Create and update monthly budgets
- See saved changes reflected in dashboard summaries
- Select a light, dark, or system theme

Account-to-account transfer records, investment holdings, multi-currency behavior, and household collaboration are deferred. Real bank connections and payment execution are product non-goals.

## Architecture

Steward will use:

- React, TypeScript, Vite, and TanStack Router
- TanStack Query, React Hook Form, and Zod
- Tailwind CSS and shadcn/ui
- Fastify, Better Auth, Drizzle ORM, and PostgreSQL
- Vitest, React Testing Library, Testcontainers, and Playwright
- Vercel for the frontend and Railway for the API and database

The production frontend proxies `/api/*` requests to Railway so browser
authentication remains same-origin. The API health response is successful only
after PostgreSQL answers a readiness query.

## Documentation

Start with the [documentation index](docs/README.md). It identifies the source of truth for product scope, financial rules, UX behavior, architecture, testing, and operations.

## Getting Started

Install dependencies and start the current scaffold from the repository root:

```text
pnpm install
pnpm dev
```

The current scaffold does not yet require PostgreSQL. Database setup
instructions will be added when persistence is implemented. See
[local development](docs/operations/local-development.md) for current checks and
planned setup steps.

## License

MIT
