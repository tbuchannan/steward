# ADR 003: PostgreSQL and Drizzle

**Status:** Accepted
**Date:** 2026-07-30

## Context

Financial ownership, budgets, categories, authentication records, and transactional resets require relational constraints and multi-record transactions.

## Decision

Use PostgreSQL, Drizzle ORM, Drizzle Kit, and `pg.Pool`. Use PostgreSQL in local development, disposable Testcontainers for integration tests, and Railway PostgreSQL in production.

## Consequences

Schema changes require reviewed migrations. Integration tests use real PostgreSQL. SQLite substitutes and client-side database access are not supported.

## Alternatives

SQLite, MongoDB, Prisma, and direct untyped SQL as the primary access layer were rejected.
