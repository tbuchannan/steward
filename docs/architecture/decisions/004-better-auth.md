# ADR 004: Better Auth

**Status:** Accepted
**Date:** 2026-07-30

## Context

The MVP needs email/password authentication, persisted sessions, protected API access, and temporary demo identities without building custom credential security.

## Decision

Use Better Auth with its official Drizzle adapter and PostgreSQL-backed cookie sessions.

## Consequences

Better Auth owns credential and session behavior; Steward owns financial authorization and demo lifecycle. Authentication schema generation feeds the normal Drizzle migration workflow. Installed versions and upgrade notes must be reviewed together.

## Alternatives

A custom authentication system and frontend-only authentication flags were rejected.
