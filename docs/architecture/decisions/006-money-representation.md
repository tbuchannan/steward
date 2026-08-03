# ADR 006: Monetary Representation

**Status:** Accepted
**Date:** 2026-07-30

## Context

Binary floating-point values can introduce rounding errors, while the MVP supports only USD with two fractional digits.

## Decision

Store money as signed 64-bit integer minor units and expose minor-unit JSON
integers in API contracts. Because JSON and browser code use JavaScript numbers,
all public and application-level monetary values and calculated results are
restricted to the inclusive safe-integer range of
`-9,007,199,254,740,991` through `9,007,199,254,740,991`. Parse user input
exactly and format output with `Intl.NumberFormat`.

## Consequences

Calculations remain integer-based and deterministic. PostgreSQL retains a 64-bit
storage type, while boundary and result validation prevents precision loss when
values cross JSON or JavaScript. This range is narrower than the database type
but still supports values of roughly 90 trillion USD in magnitude. Multi-currency
support will require a separate product and schema decision.

## Alternatives

Floating-point storage and arbitrary formatted strings were rejected. Serializing
minor units as decimal strings or using a tagged `bigint` representation would
preserve the entire signed 64-bit range, but would complicate every public
contract and browser calculation without an MVP need. PostgreSQL `numeric` may be
reconsidered if future currency or precision requirements demand it.
