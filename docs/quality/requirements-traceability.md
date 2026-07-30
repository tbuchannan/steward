# Requirements Traceability

**Status:** Draft until implementation
**Last verified:** 2026-07-30

The [MVP requirements](../product/mvp-requirements.md) are authoritative. This table identifies the intended UX and minimum verification. Implementation links are added when code exists.

| Requirements | UX or design | Minimum verification |
|---|---|---|
| `AUTH-01`–`AUTH-03` | [Authentication](../ux/workflows/authentication.md) | Component, API integration, Playwright |
| `AUTH-04`–`AUTH-06` | [Authentication](../ux/workflows/authentication.md) | Multi-user API integration, Playwright |
| `DEMO-01`–`DEMO-05` | [Demo experience](../product/demo-experience.md) | Transactional integration, concurrent Playwright |
| `SHELL-01` | [Sitemap](../ux/sitemap.md) | Router component test, Playwright |
| `SHELL-02` | [Screen designs](../ux/design/screens.md) | Mobile and desktop Playwright viewports |
| `SHELL-03` | [Settings](../ux/workflows/settings.md) | Component and Playwright |
| `SHELL-04` | [Patterns](../ux/design/patterns.md) | Component tests by representative state |
| `DASH-01`–`DASH-03` | [Dashboard screen](../ux/design/screens.md#dashboard) | Domain unit and API integration |
| `DASH-04`–`DASH-05` | [Dashboard screen](../ux/design/screens.md#dashboard) | Router/component and Playwright |
| `ACCT-01`–`ACCT-04` | [Accounts](../ux/workflows/accounts.md) | Component, API integration, Playwright |
| `ACCT-05`–`ACCT-06` | [Accounts](../ux/workflows/accounts.md) | Database/API integration, Playwright |
| `TXN-01` | [Transactions](../ux/workflows/transactions.md) | Query ordering and pagination integration |
| `TXN-02`–`TXN-05` | [Transactions](../ux/workflows/transactions.md) | Form component, API integration, Playwright |
| `TXN-06`–`TXN-07` | [Transactions](../ux/workflows/transactions.md) | Search-schema, router, and query integration |
| `TXN-08` | [Financial rules](../domain/financial-rules.md) | Domain/database integration, Playwright |
| `BUD-01`–`BUD-03` | [Budgets](../ux/workflows/budgets.md) | Component, API integration, Playwright |
| `BUD-04` | [Financial rules](../domain/financial-rules.md#budget-spending) | Table-driven domain and query tests |
| `BUD-05`–`BUD-06` | [Budgets](../ux/workflows/budgets.md) | Component, transactional integration, Playwright |
| `SET-01`–`SET-04` | [Settings](../ux/workflows/settings.md) | Component, API integration, Playwright |
| `QUAL-01` | [Backend architecture](../architecture/backend.md) | Multi-user authorization suite |
| `QUAL-02` | [Patterns](../ux/design/patterns.md#errors) | Contract and component tests |
| `QUAL-03` | [Accessibility](accessibility.md) | Automated and manual accessibility checks |
| `QUAL-04` | [Testing strategy](testing-strategy.md) | Required CI gates |
| `QUAL-05` | [Deployment](../operations/deployment.md) | Post-deployment smoke workflow |
| `QUAL-06` | [Operations](../operations/local-development.md) | Documentation review against clean setup |

## Implementation Columns

When code exists, add:

- Primary implementation module
- Primary test file
- Current status
- Tracking issue where incomplete

Do not copy requirement wording into this table.
