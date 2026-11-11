# Steward

Steward is a responsive personal-finance record-keeping application for manually managing accounts, transactions, monthly budgets, and financial summaries. It never initiates payments, transfers funds, or communicates with financial institutions.

> **Status:** Early implementation. The Next.js app includes PostgreSQL
> readiness, email/password authentication, and a protected accounts shell.
> MVP financial workflows are not yet implemented.

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

- Next.js App Router, React, and TypeScript
- React Hook Form and Zod
- Tailwind CSS and shadcn/ui
- Better Auth, Drizzle ORM, and PostgreSQL
- Vitest, React Testing Library, Testcontainers, and Playwright
- Vercel for the Next.js application; Neon for PostgreSQL

Next.js serves pages and `/api/*` on the same origin. The health endpoint
reports success only after PostgreSQL answers a readiness query.

## Documentation

Start with the [documentation index](docs/README.md). It identifies the source of truth for product scope, financial rules, UX behavior, architecture, testing, and operations.

## Getting Started

Create a local PostgreSQL database, then run from the repository root:

```text
pnpm install
Copy-Item .env.example .env.local
pnpm db:migrate
pnpm dev
```

Set a unique authentication secret and your local database URL in
`.env.local` before starting. Open `http://localhost:3000`.
See [local development](docs/operations/local-development.md) for details.

## License

MIT
