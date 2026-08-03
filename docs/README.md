# Steward Documentation

## Status

Steward is in discovery and architecture. Documents marked **Accepted** define current decisions. Documents marked **Draft** require implementation validation.

## Reading Order

1. [Product brief](product/product-brief.md)
2. [MVP requirements](product/mvp-requirements.md)
3. [Financial rules](domain/financial-rules.md)
4. [Demo experience](product/demo-experience.md)
5. [UX sitemap](ux/sitemap.md) and [screen designs](ux/design/screens.md)
6. [Architecture overview](architecture/overview.md)
7. [Testing strategy](quality/testing-strategy.md)
8. [Requirements traceability](quality/requirements-traceability.md)

## Sources of Truth

| Subject                                | Canonical document                                                         |
| -------------------------------------- | -------------------------------------------------------------------------- |
| Product purpose and users              | [Product brief](product/product-brief.md)                                  |
| MVP scope and acceptance criteria      | [MVP requirements](product/mvp-requirements.md)                            |
| Deferred and excluded scope            | [Post-MVP](product/post-mvp.md)                                            |
| Financial calculations and terminology | [Financial rules](domain/financial-rules.md)                               |
| Category and budget model              | [Financial categories and budgets](domain/financial-categories-budgets.md) |
| Archival, deletion, and reset behavior | [Data lifecycle](domain/data-lifecycle.md)                                 |
| Observable user behavior               | [UX documentation](ux/sitemap.md)                                          |
| Current system design                  | [Architecture overview](architecture/overview.md)                          |
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
