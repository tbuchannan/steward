# Authentication Architecture

**Status:** Accepted
**Last verified:** 2026-08-06

## Purpose

This document defines the authentication and authorization boundary for
Steward's browser and HTTP API. It covers `AUTH-01` through `AUTH-06`,
`DEMO-01`, `DEMO-02`, `DEMO-04`, `QUAL-01`, and the protected-access portion
of `SHELL-04`.

[Initial API surface](api-surface.md) remains authoritative for the complete
route inventory. [Public API errors](api-errors.md) owns Steward error bodies
and status mappings. Better Auth owns the request, response, credential, and
session contracts beneath `/api/auth/*`.

## Decision

Better Auth provides email/password identity and cookie-based sessions. Its official Drizzle adapter stores authentication records in the same PostgreSQL database used by Steward.

The generated Better Auth schema is incorporated into Steward's Drizzle migration history rather than maintained by a separate migration process.

## HTTP Ownership and Access

Steward separates provider-owned authentication endpoints from application
endpoints that consume the resulting identity:

| Endpoint group                                                                        | Access                  | Contract and authorization owner                                                                                   |
| ------------------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `GET /api/health`                                                                     | Public                  | Steward; returns readiness without user or configuration data                                                      |
| `POST /api/demo`                                                                      | Public and rate-limited | Steward; creates one isolated temporary identity and session                                                       |
| `POST /api/auth/sign-up/email` and `POST /api/auth/sign-in/email`                     | Public                  | Better Auth owns credential validation, responses, cookies, and rate limiting                                      |
| `GET /api/auth/get-session` and `POST /api/auth/sign-out`                             | Cookie-session aware    | Better Auth owns session inspection and invalidation behavior, including its no-session responses                  |
| `GET /api/demo`, `POST /api/demo/reset`, and every other Steward application endpoint | Protected               | The Route Handler validates the Better Auth session; Steward authorizes the operation against the session identity |

There is no public financial-data endpoint. Adding a Steward-owned endpoint is
an explicit access-control decision: unless the accepted API surface identifies
it as public, it is protected. Mounting a handler below `/api/auth/*` does not
make it a Steward application endpoint or make Steward's public Zod contracts
authoritative for it.

Better Auth proves who the caller is. It does not authorize access to financial
accounts, transactions, categories, budgets, preferences, demo metadata, or
other Steward-owned records. Steward server modules own that
authorization after session validation.

## Production Request Path

Browser requests to `/api/auth/*` go directly to the same-origin Next.js Route
Handler, which uses Better Auth's Next.js adapter. Better Auth uses Drizzle
and PostgreSQL to validate sessions. No separate application API is involved.

## Identity and Authorization

The Better Auth user ID from a validated current session is the canonical
request identity. The server resolves the session once at the protected request
boundary and makes only the validated server-side identity available to the
handler and application service.

Clients never choose the authoritative identity. Steward request schemas omit
ownership fields such as `userId`; an ID in a body, path, query string, header,
or cookie other than the validated Better Auth session cannot select an owner.
Create operations assign ownership from the session. Reads, updates, deletes,
commands, collection counts, filters, and derived summaries all apply that
same session-derived owner scope.

Every protected resource operation proves ownership as part of its data access:

- User-owned roots and singletons are queried by the requested key, when one
  exists, and the session-derived user ID.
- Collection queries apply the owner predicate before filtering, counting,
  sorting, or pagination.
- Child resources authorize through their owner-scoped parent. Relationship
  mutations also require every referenced account, category, budget, or other
  user-owned record to belong to that same owner.
- Services do not first fetch a record without owner scope and then compare its
  owner in application code. Database constraints provide defense in depth but
  do not replace request authorization.

These rules apply even when a route does not return an obvious resource, such
as dashboard composition, demo reset, account archival, or a budget upsert.
The detailed ownership paths and database constraints are defined in
[data lifecycle](../domain/data-lifecycle.md).

## Authentication and Authorization Responses

For Steward-owned endpoints, the error contract distinguishes authentication
from concealed resource authorization:

- A protected request with no session, an invalid session, or an expired
  session returns `401 AUTHENTICATION_REQUIRED`.
- After authentication, an absent user-owned resource and a resource belonging
  to another identity both return the identical
  `404 RESOURCE_NOT_FOUND` response. The API does not perform an unscoped
  existence check to distinguish them.
- Steward has no general public `403` response in the MVP. Business-rule and
  state conflicts use the mappings in [public API errors](api-errors.md), but
  they are evaluated only after authentication and owner-scoped lookup.
- Better Auth endpoints retain Better Auth's own status codes and response
  bodies. Steward does not wrap them in the application error envelope.

Authentication failure must stop request processing before resource lookup or
mutation. Authorization failures must not reveal another identity's existence
through response wording, fields, headers, redirect targets, or deliberately
different lookup behavior.

## Supported Scope

- Registration with name, email, and password
- Email/password sign-in
- Persistent sessions
- Sign out
- Protected frontend and API routes
- Isolated temporary demo identities

Password recovery, email verification, social authentication, MFA, passkeys, and session management are deferred.

## Demo Authentication

Demo entry creates a normal Better Auth user, authentication account, and session. The identity is marked as temporary in application-owned metadata; no public request can choose another user's demo identity.

A demo identity crosses the same protected server session boundary and uses
the same owner-scoped services and queries as a regular identity. It is not a
shared account, privileged role, bypass header, hard-coded user ID, or
frontend-only mode. The presence of demo metadata for the current session user
enables demo-specific status, reset, expiration, and cleanup behavior; it does
not weaken authorization or grant access to another dataset.

`GET /api/demo` reports demo status only for the current authenticated identity.
`POST /api/demo/reset` first requires a valid session and that same identity's
demo metadata, then replaces only its financial dataset. For this command, a
regular identity or an identity without accessible demo metadata receives the
same `404 RESOURCE_NOT_FOUND` response as absent demo metadata. It cannot use
reset to discover or target a demo user. The route never accepts an owner ID.

Rate limiting and cleanup prevent unbounded identity creation. Reset preserves the active user and session while replacing only that user's financial dataset.

The application-owned metadata records `createdAt` and `expiresAt`; Steward does
not add demo flags or financial fields to Better Auth tables. Reset eligibility
comes from the current session user's metadata row. Expired cleanup removes the
Steward-owned dependency graph first and removes the user, authentication
account, and sessions through Better Auth-supported server behavior. Better Auth
remains authoritative for the authentication schema, relationships, and
ordinary record lifecycle.

## Cookies and Origins

The browser sends cookies to relative `/api/*` URLs on the Next.js origin.
Better Auth session cookies are Secure and HttpOnly in production, with narrow
SameSite, path, and domain scope. Authentication and personalized responses
must never be publicly cached.

Set the application's public HTTPS origin explicitly. Trusted origins are
environment-specific and explicitly allowed, including any preview hosts.
Keep Better Auth's origin and CSRF checks enabled.

## Frontend Session Boundary

The landing page at `/` renders the shared login/registration form. Its selected
mode determines whether submission calls Better Auth's sign-in or sign-up email
endpoint. Successful authentication opens `/accounts`. `/?mode=signup` opens
registration directly. There are no separate login or registration routes.

The accounts page checks the Better Auth session on the server before
rendering and redirects unauthenticated visitors to `/`. The interactive
client observes session changes and invalidates the server session on sign-out
before returning to the public page. Every protected operation authenticates
the caller independently and enforces owner-scoped access.

## Schema Updates

When the pinned Better Auth version changes:

1. Review its upgrade notes.
2. Regenerate the Drizzle authentication schema.
3. Review the diff and resulting SQL migration.
4. Run authentication and migration integration tests.
5. Deploy the schema before code that requires it.
