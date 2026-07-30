# ADR 006: Monetary Representation

**Status:** Accepted
**Date:** 2026-07-30

## Context

Binary floating-point values can introduce rounding errors, while the MVP supports only USD with two fractional digits.

## Decision

Store money as signed 64-bit integer minor units and expose minor-unit integers in API contracts. Parse user input exactly and format output with `Intl.NumberFormat`.

## Consequences

Calculations remain integer-based and deterministic. Database and JavaScript range boundaries require validation. Multi-currency support will require a separate product and schema decision.

## Alternatives

Floating-point storage and arbitrary formatted strings were rejected. PostgreSQL `numeric` may be reconsidered if future currency or precision requirements demand it.
