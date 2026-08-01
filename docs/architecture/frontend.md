# Frontend Architecture

**Status:** Accepted
**Last verified:** 2026-07-30

## Responsibilities

The React application owns rendering, navigation, accessible interaction, form state, server-state presentation, theme state, and client-safe error feedback. It does not own authorization or authoritative financial calculations.

## Organization

```text
apps/web/src/
├── app/             providers, router, query client
├── routes/          route entry points
├── features/        accounts, auth, budgets, dashboard, settings, transactions
├── components/      application-shared components
├── components/ui/   reviewed shadcn/ui source
├── lib/             API client, formatting, validation helpers
└── styles/          Tailwind entry point and semantic tokens
```

Feature code may import shared UI and public contracts. Shared code must not import feature internals.

## Routing

TanStack Router implements the route map in [sitemap](../ux/sitemap.md).

- File-based routing is preferred if supported cleanly by the pinned version.
- Account, category, date, sort, and pagination filters use validated search parameters.
- Protected layout loading resolves the session before protected content renders.
- Frontend guards improve UX; Fastify independently authorizes requests.
- Route-level pending, error, and not-found components follow shared UX patterns.

## State Ownership

| State                              | Owner                                                 |
| ---------------------------------- | ----------------------------------------------------- |
| API data and mutation state        | TanStack Query                                        |
| Form values and validation display | React Hook Form                                       |
| Shareable filters and pagination   | TanStack Router URL state                             |
| Theme                              | Small presentation preference store plus persistence  |
| User timezone                      | Persisted user preference with detected initial value |
| Authentication session             | Better Auth client integrated with query/router state |
| Temporary local UI state           | Component state                                       |

Do not copy server data into a global client store without a demonstrated need.

## API Contracts

`packages/contracts` contains public Zod request, response, pagination, enum, and error schemas. It does not expose Drizzle tables, Better Auth internals, or server configuration.

The API client:

- Uses relative `/api` URLs in production and configurable local routing in development.
- Includes credentials as required by the authenticated flow.
- Translates non-success responses into the stable error contract.
- Supports request cancellation where route changes make results obsolete.

## Forms

React Hook Form integrates with Zod for immediate, client-safe validation. The server validates every request again.

- Decimal money input is parsed through the shared exact minor-unit utility.
- Transaction forms state that saving records activity and does not execute a payment.
- Server field errors map to fields without depending on raw Zod internals.
- Successful mutations close the editor and invalidate or update affected queries.
- Failed mutations preserve safe form values.

## Styling

Tailwind uses the Vite plugin and the stylesheet imports `tailwindcss`. shadcn/ui components are source-controlled, reviewed, and customized through semantic tokens.

UX rules live in [design foundations](../ux/design/foundations.md) and [patterns](../ux/design/patterns.md); this document does not duplicate them.

## Testing Boundary

Pure formatting and parsing receive unit tests. Components receive behavior-focused tests. Cross-feature critical workflows belong in Playwright. See [testing strategy](../quality/testing-strategy.md).
