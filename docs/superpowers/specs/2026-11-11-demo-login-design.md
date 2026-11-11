# Demo guest login and lifecycle

**Status:** Proposed for written review; conversational design approved
**Date:** 2026-11-11

## Purpose and delivery boundary

Visitors can explore Steward without registering or providing personal data.
The first delivery implements isolated guest authentication and its complete
temporary-account lifecycle. It opens the existing `/accounts` placeholder.
Seed data and dataset reset remain future MVP work; this delivery does not
claim complete coverage of `DEMO-03` or `DEMO-04`.

The agreed scope supports `DEMO-01`, `DEMO-02`, `DEMO-05`, `AUTH-03` through
`AUTH-06`, and the demo indicator portion of `SET-04`. Each MVP visitor will
eventually receive a separate copy of the canonical seed dataset.

## Approach and boundaries

Use a normal Better Auth user, authentication account, and cookie session,
with separate application-owned demo metadata. All access goes through the
normal server authentication and owner-scoped authorization boundary. No
shared credentials, client-selected identity, or authorization bypass exists.

Application services own lifecycle policy; Route Handlers own HTTP validation,
origin checks, safe errors, cookies, and response serialization. Public Zod
schemas live in `src/lib/contracts`. Database access remains server-only.

An in-memory guest mode cannot provide server-enforced isolation. A shared
demo identity contradicts ADR 007. Extending the existing authentication flow
with database-backed lifecycle metadata preserves the accepted boundaries.

## Entry, return, and sign-out

- The existing demo button creates an isolated identity and authenticates it
  without showing or requesting credentials, then opens `/accounts`.
- Show pending feedback, prevent accidental duplicate submissions, and offer
  retry after a safe error. A failed entry must not leave a usable identity
  without lifecycle metadata; compensate partial creation when necessary.
- Display a visible Demo indicator on the protected screen.
- Tabs share the browser cookie session. Returning with an unexpired demo
  resumes that identity. Entry never silently replaces an authenticated
  regular identity or resets a live demo.
- Sign-out invalidates the current session. Subsequent guest entry creates a
  new identity; the signed-out identity remains eligible for scheduled expiry
  cleanup and cannot be recovered by supplying a user ID.
- Regular registration creates a separate account and does not transfer demo
  data. Conversion is outside scope.

## Time policy

The server is authoritative for time and deadlines. Use UTC instants for this
policy; it does not change transaction date-only semantics.

- `createdAt` establishes an immutable hard deadline seven days later.
- The initial inactivity deadline is 24 hours after creation.
- Opening a protected page or deliberately interacting with the active app
  renews the inactivity deadline to 24 hours after that activity, capped at
  the hard deadline. Merely leaving a tab open, session checks, timers, and
  background polling do not renew it.
- Once the inactivity deadline is reached, ordinary protected access stops.
  Activity requests cannot revive an already expired demo.
- If inactivity expiry interrupts an open authenticated session, present an
  explicit **Extend demo for 24 hours** button for one hour after that expiry.
  The extension preserves the identity and data, and renews the deadline to
  24 hours after the explicit click, capped at the original hard deadline.
- The grace period permits only status, extension, and sign-out operations;
  it does not permit ordinary application access. An authenticated status
  observation before expiry establishes eligibility for the open-session
  extension flow. Retain that eligibility server-side for the relevant
  session; client assertions alone cannot establish it.
- At the seven-day deadline, access and extension both stop. There is no
  grace period beyond that deadline. Show an expiration message and require
  an explicit click to start a fresh demo.
- An expired returning session without open-session extension eligibility
  receives the expiration message and fresh-demo action.

The Better Auth session must remain verifiable during an eligible extension
window. Application expiry is a separate access decision; do not destroy the
authentication session merely because the inactivity deadline was reached.

## Persistence and concurrency

Add a migration for application-owned demo metadata indexed for cleanup, with
identity, creation time, inactivity deadline, and the state required for
session-specific extension eligibility. Keep provider-owned schema unchanged.

Activity renewal, explicit extension, and cleanup lock or conditionally update
the same lifecycle record using authoritative database time. Recheck state
inside the transaction. A stale concurrent request cannot shorten a deadline,
resurrect a deleted identity, or extend past seven days. A cleanup racing a
valid extension must observe one serialized outcome.

## HTTP and abuse protection

Implement public rate-limited `POST /api/demo` and authenticated
`GET /api/demo`, plus authenticated activity and explicit-extension commands.
Lifecycle commands derive identity solely from the verified session and accept
no owner selector. A regular identity cannot extend a demo and receives the
concealed resource-not-found response.

Use same-origin mutation protection, private/no-store responses, and public
Zod contracts that omit internal IDs, tokens, credentials, and lifecycle
bookkeeping. Preserve Better Auth's provider-owned error contracts.
Document lifecycle states and any new public error code in the canonical API
documents; keep existing errors where they express the outcome adequately.

Creation limiting must work across application instances using persistent
state and concurrency-safe counters. Deployment configuration controls the
threshold and trusted client-address handling. Treat unknown client addresses
conservatively; never trust arbitrary forwarded headers outside the documented
deployment boundary. Rate-limit rejections return `429` with `Retry-After`.

## Scheduled cleanup and operations

Provide a daily, authenticated internal scheduled job. Expired demos become
eligible after the applicable one-hour extension grace period; the seven-day
deadline always ends retention eligibility immediately. Access denial does
not wait for cleanup.

Cleanup rechecks eligibility with database time and removes only demo-owned
records and their Better Auth identity through supported provider lifecycle
behavior. It is idempotent, bounded per invocation, and atomic per identity.
Failures must not commit a partial deletion. Do not target regular identities
or log credentials. Document scheduler authentication, required configuration,
migration ordering, and operational retry behavior. Repository changes prepare
the schedule; they do not deploy it or use production credentials.

## Documentation and verification

Update the canonical authentication, demo experience, lifecycle, API,
configuration, deployment, and traceability documents. Record the idle expiry,
hard cap, and explicit grace-window extension as an architecture decision.
Clearly distinguish this empty first slice from the seeded MVP experience.

Use deterministic Vitest cases for isolation, identity derivation, missing
sessions, regular-user concealment, cookie propagation, duplicate entry,
idle renewal, excluded background checks, grace boundaries, hard-cap
boundaries, extension/cleanup races, rollback, cleanup idempotence, rate
limiting, safe errors, and public schema omission of internal fields.
Test Route Handlers with Web Request/Response objects and the login and expiry
UI with the existing component test setup. Use a disposable synthetic database
for transaction/provider lifecycle integration checks when available; report
any unavailable integration coverage explicitly.

Before completion run `npm run format:check`, `npm run typecheck`,
`npm run lint`, `npm run test`, and `npm run build`. Preserve existing user
changes to package files and the login component.
