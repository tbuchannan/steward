# Testing Strategy

**Status:** Accepted
**Last verified:** 2026-07-30

## Principle

Tests are selected by risk. Financial correctness, authorization, transactional consistency, authentication, demo isolation, and primary workflows receive the strongest coverage. Minor presentation details do not receive redundant tests at every layer.

## Layers

| Layer                | Purpose                                                   | Main tools                                  |
| -------------------- | --------------------------------------------------------- | ------------------------------------------- |
| Unit                 | Exact financial, parsing, formatting, and schema behavior | Vitest                                      |
| Component            | User-visible component and form behavior                  | Vitest, React Testing Library, `user-event` |
| API integration      | HTTP contracts, authentication, authorization, services   | Vitest, Fastify `inject()`                  |
| Database integration | Constraints, queries, migrations, transactions            | Vitest, Testcontainers, PostgreSQL          |
| End-to-end           | A small set of critical deployed-like workflows           | Playwright                                  |

## Risk Matrix

| Risk                                                  | Required verification                                          |
| ----------------------------------------------------- | -------------------------------------------------------------- |
| User accesses another user's records                  | API and database integration tests with at least two users     |
| Incorrect balance or budget math                      | Table-driven domain unit tests and database query tests        |
| Partial mutation corrupts data                        | Integration tests that force failure and assert rollback       |
| Authentication appears valid after sign out or expiry | API integration and browser workflow                           |
| Demo visitors share data                              | Concurrent isolated demo integration and browser tests         |
| Migration fails on a clean database                   | Apply all migrations to a fresh PostgreSQL container           |
| UI hides a server failure                             | Component tests for loading, error, retry, and preserved input |
| Primary workflow breaks across services               | Focused Playwright tests                                       |

## Critical Domain Cases

- Exact USD parsing and formatting
- Positive income, negative expense, and positive refund signs
- Asset-positive and liability-negative balances
- Positive UI amount-owed input normalized to a negative liability value
- Zero and excessive values rejected
- Opening balance plus posted transactions
- Latest dated investment snapshot
- Liability presentation
- Refunds reduce but do not make budget spending negative
- Unbudgeted spending reduces overall budget remaining and creates attention
- Timezone changes do not reinterpret date-only transactions
- Month boundaries use date-only values
- Deterministic transaction ordering
- Archived accounts excluded from active summaries

## Critical API Cases

- Missing or expired session returns `401`
- Another user's resource behaves as not found
- Client-provided user IDs do not change identity
- Invalid input uses the public error contract
- Response schemas omit internal fields
- Demo reset is restricted to the current demo identity
- Demo seed and reset roll back on forced failure

## Component Strategy

Prefer accessible queries by role, label, and name. Test user behavior rather than component internals, Tailwind classes, or large snapshots. Mock the HTTP boundary for isolated component tests; do not mock Drizzle for database integration tests.

## End-to-End Workflows

Keep the initial browser suite small:

1. Register, reload, sign out, and verify protected-route rejection.
2. Enter an isolated demo, edit a transaction, and observe updated summaries.
3. Edit and save a budget allocation.
4. Archive an account and verify active and historical behavior.
5. Reset demo data without ending the session.
6. Create two demo sessions and verify data isolation.
7. Change timezone and verify current-month behavior without changing transaction dates.

Transfers, investment holdings, password recovery, and copy-prior-budget tests are not part of the MVP.

## Determinism and Isolation

- Pin the PostgreSQL test image.
- Apply migrations to disposable databases.
- Use factories with explicit dates and values.
- Control the clock for month-boundary tests.
- Use one documented test timezone.
- Avoid production data and credentials.
- Preserve Playwright traces, screenshots, and videos only for failed tests according to CI retention settings.

## Coverage

Coverage is a diagnostic, not the completion definition. Initial thresholds are set after the application skeleton establishes a baseline. Critical domain and authorization branches require direct assertions regardless of aggregate percentage.

## CI Gates

Required pull-request checks:

1. Formatting and linting
2. Type checking
3. Unit and component tests
4. API and database integration tests
5. Production builds
6. Critical Playwright workflows

Flaky tests are fixed or quarantined with an owner and issue; retries do not make an unreliable test trustworthy.
