# ADR 010: Demo Session Lifecycle

**Status:** Accepted; guest lifecycle implemented, seeded MVP pending
**Date:** 2026-11-11

## Context

ADR 007 requires isolated temporary demo identities and safe cleanup. Visitors
should retain progress while using a demo, while abandoned identities must
eventually expire. Expiration during a walkthrough should offer a deliberate
way to continue without allowing indefinite retention.

## Decision

Use a sliding 24-hour inactivity window capped at seven days from creation.
Deliberate use renews the window; background polling does not. If inactivity
expiry interrupts an open session, allow an explicit 24-hour extension within
one hour after expiry, always bounded by the original seven-day deadline.
Ordinary access stops during expiry, independently of scheduled deletion.

A daily idempotent job removes eligible expired identities and their data.
Renewal, extension, and cleanup serialize on application-owned lifecycle state
using the database clock. Better Auth continues to own authentication records.
The authoritative policy is in [data lifecycle](../../domain/data-lifecycle.md#demo-records).

The first delivery includes guest authentication and lifecycle management with
no seed data. Seeded datasets and reset remain MVP requirements. See
[demo experience](../../product/demo-experience.md) for user-visible behavior.

## Consequences

Protected access must check application expiry as well as the provider session.
An expired session eligible for extension retains limited status, extension,
and sign-out access. Cleanup must preserve the grace window and recheck its
claim atomically against concurrent renewal. Creation requires persistent rate
limiting. The initial empty demo does not complete the seeded MVP walkthrough.

## Alternatives

A fixed 24-hour lifetime from creation interrupts returning active visitors.
Unlimited sliding retention leaves identities alive indefinitely. Automatic
renewal after expiry removes the explicit choice requested for an interrupted
session. Deleting identities immediately on inactivity expiry prevents extension.
