# Steward

Steward is a responsive personal-finance web application for managing financial accounts, transactions, monthly budgets, and summary information.

> **Status:** Discovery and architecture. The product and technical decisions are documented; application scaffolding has not started.

## MVP

The first release will let an individual:

- Register or sign in with email and password
- Explore an isolated, seeded demo
- Manage financial accounts
- Create, edit, categorize, search, filter, and delete transactions
- Create and update monthly budgets
- See saved changes reflected in dashboard summaries
- Select a light, dark, or system theme

Real bank connections, account-to-account transfers, investment holdings, multi-currency behavior, and household collaboration are deferred.

## Architecture

Steward will use:

- React, TypeScript, Vite, and TanStack Router
- TanStack Query, React Hook Form, and Zod
- Tailwind CSS and shadcn/ui
- Fastify, Better Auth, Drizzle ORM, and PostgreSQL
- Vitest, React Testing Library, Testcontainers, and Playwright
- Vercel for the frontend and Railway for the API and database

The production frontend will proxy `/api/*` requests to Railway so browser authentication remains same-origin.

## Documentation

Start with the [documentation index](docs/README.md). It identifies the source of truth for product scope, financial rules, UX behavior, architecture, testing, and operations.

## Getting Started

Setup instructions will be added to [local development](docs/operations/local-development.md) when the repository contains runnable application code.

## License

MIT
