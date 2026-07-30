# ADR 007: Isolated Demo Data

**Status:** Accepted
**Date:** 2026-07-30

## Context

One shared mutable demo user lets concurrent visitors observe and overwrite one another's changes and makes the public walkthrough unreliable.

## Decision

Create a temporary Better Auth identity and cloned financial dataset for each demo visitor. Reset affects only that identity. An idempotent job removes expired demo identities.

## Consequences

The demo exercises normal authorization and remains reliable under concurrency. Identity creation must be rate-limited, seeded transactionally, assigned an expiration, and cleaned up.

## Alternatives

A shared mutable demo user was rejected. A read-only demo was rejected because the primary walkthrough requires mutations.
