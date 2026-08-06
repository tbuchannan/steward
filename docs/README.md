# Steward Documentation

## Status

Steward is in early implementation. The web, API, and public-contract packages
are scaffolded, while most MVP behavior remains unimplemented. Documents marked
**Accepted** define current decisions. Documents marked **Draft** require
implementation validation.

## Reading Order

1. [Product brief](product/product-brief.md)
2. [MVP requirements](product/mvp-requirements.md)
3. [Financial domain model](domain/financial-model.md)
4. [Financial rules](domain/financial-rules.md)
5. [Demo experience](product/demo-experience.md)
6. [UX sitemap](ux/sitemap.md) and [screen designs](ux/design/screens.md)
7. [Architecture overview](architecture/overview.md)
8. [Initial API surface and frontend workflow mapping](architecture/api-surface.md)
9. [Testing strategy](quality/testing-strategy.md)
10. [Requirements traceability](quality/requirements-traceability.md)

## Sources of Truth

| Subject                                | Canonical document                                                         |
| -------------------------------------- | -------------------------------------------------------------------------- |
| Product purpose and users              | [Product brief](product/product-brief.md)                                  |
| MVP scope and acceptance criteria      | [MVP requirements](product/mvp-requirements.md)                            |
| Deferred and excluded scope            | [Post-MVP](product/post-mvp.md)                                            |
| Financial entities and boundaries      | [Financial domain model](domain/financial-model.md)                        |
| Initial physical entity relationships  | [Initial financial ERD](architecture/financial-erd.md)                     |
| Financial calculations and terminology | [Financial rules](domain/financial-rules.md)                               |
| Financial transaction model            | [Financial transactions](domain/financial-transactions.md)                 |
| Financial account model                | [Financial accounts](domain/financial-accounts.md)                         |
| Archival, deletion, and reset behavior | [Data lifecycle](domain/data-lifecycle.md)                                 |
| Category and budget model              | [Financial categories and budgets](domain/financial-categories-budgets.md) |
| Observable user behavior               | [UX documentation](ux/sitemap.md)                                          |
| Current system design                  | [Architecture overview](architecture/overview.md)                          |
| Authentication and authorization       | [Authentication architecture](architecture/authentication.md)              |
| Initial HTTP API surface               | [Initial API surface](architecture/api-surface.md)                         |
| Public API contract conventions        | [Public API contracts](architecture/api-contracts.md)                      |
| API collection-query conventions       | [API collection queries](architecture/api-collections.md)                  |
| Public API errors and status mappings  | [Public API errors](architecture/api-errors.md)                            |
| Reasons for architecture choices       | [Architecture decisions](architecture/decisions/README.md)                 |
| Verification approach                  | [Testing strategy](quality/testing-strategy.md)                            |
| Deployment and recovery                | [Operations documentation](operations/deployment.md)                       |

If two documents disagree, the canonical document in this table wins.

## Documentation Rules

- Requirements use stable IDs such as `AUTH-01` and `TXN-03`.
- Architecture documents link to requirements instead of restating feature lists.
- Financial formulas are defined only in `domain/financial-rules.md`.
- UX documents describe user-visible behavior, not implementation internals.
- Architecture Decision Records (ADRs) record why major choices were made.
- Implementation-sensitive documents include a status and last-verified date.
- Links use repository-relative paths so they work on GitHub.

## Document Map

```text
docs/
├── product/       Product purpose, scope, exclusions, and demo
├── domain/        Financial rules and record lifecycle
├── ux/            Navigation, workflows, designs, and reusable patterns
├── architecture/  System boundaries, component design, and ADRs
├── quality/       Testing, accessibility, and requirement coverage
└── operations/    Local setup, configuration, deployment, and recovery
```

## Terminology

Use the [glossary](glossary.md). In particular, distinguish an **authentication account** from a **financial account**.
