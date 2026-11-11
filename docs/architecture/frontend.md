# Frontend Architecture

**Status:** Accepted
**Last verified:** 2026-07-30

## Responsibilities

The React application owns rendering, navigation, accessible interaction, form state, server-state presentation, theme state, and client-safe error feedback. It does not own authorization or authoritative financial calculations.

## Organization

```text
src/
├── app/
│   ├── (auth)/      login and registration routes
│   ├── accounts/    protected accounts route
│   ├── api/         HTTP Route Handlers
│   ├── globals.css  Tailwind entry point and shared styles
│   ├── layout.tsx   root layout
│   └── page.tsx     home route
├── components/      shared React components, including shadcn/ui
├── lib/             shared helpers and public contracts
└── server/          server-only authentication and persistence
```

Keep route-specific screens and component tests beside their route in `app/`.
Use `components/` for reusable UI. Route groups such as `(auth)` organize
related pages without changing their public URLs.

## Routing

The Next.js App Router implements the route map in [sitemap](../ux/sitemap.md).

- Account, category, date, sort, and pagination filters use validated search parameters.
- Protected pages resolve the session on the server before rendering. Each
  protected operation still authenticates the caller and enforces ownership.
- Route-level pending, error, and not-found components follow shared UX patterns.

## State Ownership

| State                              | Owner                                                 |
| ---------------------------------- | ----------------------------------------------------- |
| API data and mutation state        | Server Components and route revalidation              |
| Form values and validation display | React Hook Form                                       |
| Shareable filters and pagination   | App Router search parameters                          |
| Theme                              | Small presentation preference store plus persistence  |
| User timezone                      | Persisted user preference with detected initial value |
| Authentication session             | Better Auth server session and interactive client     |
| Temporary local UI state           | Component state                                       |

Do not copy server data into a global client store without a demonstrated need.

## API Contracts

`src/lib/contracts` contains public Zod request, response, pagination, enum, and
error schemas. It does not expose Drizzle tables, Better Auth internals, or
server configuration. Schema ownership, inferred-type usage, strictness, and
public representations follow
[public API contracts](api-contracts.md).

The API client:

- Uses same-origin relative `/api` URLs.
- Includes credentials as required by the authenticated flow.
- Translates non-success responses into the stable error contract.
- Supports request cancellation where route changes make results obsolete.

## Forms

React Hook Form integrates with Zod for immediate, client-safe validation. The server validates every request again.

- Decimal money input is parsed through the shared exact minor-unit utility.
- Transaction forms state that saving records activity and does not execute a payment.
- Server field errors map to fields without depending on raw Zod internals.
- Successful mutations close the editor and refresh affected server data.
- Failed mutations preserve safe form values.

## Styling

Tailwind uses the PostCSS plugin and the stylesheet imports `tailwindcss`. shadcn/ui components are source-controlled, reviewed, and customized through semantic tokens.

UX rules live in [design foundations](../ux/design/foundations.md) and [patterns](../ux/design/patterns.md); this document does not duplicate them.

## Testing Boundary

Pure formatting and parsing receive unit tests. Components receive behavior-focused tests. Cross-feature critical workflows belong in Playwright. See [testing strategy](../quality/testing-strategy.md).
