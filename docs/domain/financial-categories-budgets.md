# Financial Categories and Budgets

**Status:** Accepted
**Last verified:** 2026-08-03

This document is the source of truth for the category, budget, and budget
allocation entity model. Financial calculations remain defined in
[financial rules](financial-rules.md), while archival and deletion behavior
remains defined in [data lifecycle](data-lifecycle.md).

## Category Groups and Applicability

Category groups are a fixed presentation taxonomy in the MVP. The supported
group values are:

- `income`
- `housing`
- `food`
- `transportation`
- `health`
- `personal`
- `entertainment`
- `savings_debt`
- `other`

Users may create categories within these groups but cannot create, rename, or
reorder the groups themselves. A later taxonomy change requires an explicit
migration because group values are persisted.

Applicability is independent of the presentation group and has one of three
values:

| Value     | May classify income | May classify expense | May classify refund | May receive allocation |
| --------- | ------------------- | -------------------- | ------------------- | ---------------------- |
| `income`  | Yes                 | No                   | No                  | No                     |
| `expense` | No                  | Yes                  | Yes                 | Yes                    |
| `both`    | Yes                 | Yes                  | Yes                 | Yes                    |

A refund uses an expense-capable category. The server validates applicability
when a category is assigned to a transaction or budget allocation; changing a
category's applicability is rejected when it would invalidate an existing
transaction or allocation.

## Category

`category` is a reusable user-owned aggregate root:

| Field           | Required | Meaning                                      |
| --------------- | -------- | -------------------------------------------- |
| `id`            | Yes      | Steward-generated UUID                       |
| `userId`        | Yes      | Owning Better Auth user identifier           |
| `name`          | Yes      | Trimmed, non-empty user-visible name         |
| `group`         | Yes      | One predefined category-group value          |
| `applicability` | Yes      | `income`, `expense`, or `both`               |
| `archivedAt`    | No       | UTC timestamp; null means active             |
| `createdAt`     | Yes      | UTC creation timestamp                       |
| `updatedAt`     | Yes      | UTC timestamp of the latest persisted change |

The server derives `userId` from the authenticated session. Clients never
supply ownership. Categories are reusable: one category may be referenced by
many transactions and by allocations in many monthly budgets owned by the same
user.

Category names are case-insensitively unique within `(userId, group)`. The
database enforces this with a unique expression index on
`(userId, group, lower(name))`; the application applies the same comparison for
useful validation feedback. Display casing is preserved. Archived categories
remain inside this namespace, avoiding ambiguous history and restore conflicts.
The same name may be used in a different group or by a different user.

Each new regular or demo identity receives cloned, user-owned starter
categories. Seed definitions are templates, not shared mutable category rows.

## Category Archive and History

Archiving sets `archivedAt` and preserves the category and all references.
Archived categories:

- remain visible on historical transactions and saved budget allocations;
- continue contributing to spending and budget calculations;
- are excluded from selectors for new transactions and allocations; and
- may be renamed or restored subject to the same uniqueness rule.

Archiving does not remove an allocation, uncategorize a transaction, or change
financial results. A category referenced by a transaction or allocation cannot
be permanently deleted. Permanent category deletion is not an MVP workflow.

## Budget Month

`budget` is a user-owned aggregate root representing one saved calendar month:

| Field       | Required | Meaning                                              |
| ----------- | -------- | ---------------------------------------------------- |
| `id`        | Yes      | Steward-generated UUID                               |
| `userId`    | Yes      | Owning Better Auth user identifier                   |
| `month`     | Yes      | First calendar date of the represented month         |
| `createdAt` | Yes      | UTC creation timestamp                               |
| `updatedAt` | Yes      | UTC timestamp of the latest persisted allocation set |

The public representation is `YYYY-MM`. PostgreSQL stores `month` as a `date`
whose day is constrained to `1`; it is not a timestamp and is never converted
through a timezone. For example, `2026-08` is stored as `2026-08-01` and exposed
as `2026-08`.

The database enforces uniqueness on `(userId, month)`, so a user has at most one
budget for a calendar month. Different users never share a budget row.

## Budget Allocation

`budget_allocation` is a child entity inside one budget aggregate:

| Field         | Required | Meaning                                      |
| ------------- | -------- | -------------------------------------------- |
| `id`          | Yes      | Steward-generated UUID                       |
| `budgetId`    | Yes      | Owning monthly-budget UUID                   |
| `categoryId`  | Yes      | Reusable expense-capable category UUID       |
| `amountMinor` | Yes      | Non-negative 64-bit integer USD allocation   |
| `createdAt`   | Yes      | UTC creation timestamp                       |
| `updatedAt`   | Yes      | UTC timestamp of the latest persisted change |

The allocation inherits ownership from its budget and has no independent
lifecycle. Its category must belong to the same user as the budget and be
expense-capable. The service proves both relationships in the authenticated
operation; another user's budget or category behaves as not found.

The database enforces uniqueness on `(budgetId, categoryId)`, allowing at most
one allocation for a category in a monthly budget. The amount is an allocation,
not spending, and uses integer minor units. Zero is valid and remains an
explicit allocation; removing a category from the budget deletes the allocation
row rather than setting a removal flag.

## Save and Empty-Month Behavior

A month with no stored budget is presented as an empty editable budget but does
not cause a row to be created. The first successful save containing at least one
allocation atomically creates the budget and its allocations.

Subsequent saves atomically insert, update, and remove allocations for the
budget. Removing the final allocation preserves the already-created budget with
zero child allocations. This distinguishes a never-saved month from an
intentionally emptied month without changing their empty presentation. Saving
an untouched, never-created empty month remains a no-op.

Allocation removal never mutates its category or any transaction. Entire-budget
deletion is not an MVP workflow.

## Derived Spending Relationships

Transactions do not reference a budget or allocation. Budget spending is joined
at query time using:

```text
transaction owner = budget owner
transaction date month = budget month
transaction category = allocation category, when an allocation exists
```

Expense and refund aggregation, clamping, and totals use the canonical formulas
in [financial rules](financial-rules.md). Archived categories and empty saved
budgets do not change those formulas.

Two states remain derivable without sentinel records:

- **Unbudgeted spending** is categorized expense/refund activity in the selected
  month for which no allocation with the same category exists in that month's
  budget. It remains derivable even when no budget row exists.
- **Uncategorized spending** is expense/refund activity whose nullable
  `categoryId` is null. It is not joined to a category or allocation and remains
  separate from budget spending until categorized. An uncategorized income
  transaction is still an attention item but is not spending.

Steward does not create an `Uncategorized` category, an `Unbudgeted` allocation,
or an allocation automatically from spending. These are query and presentation
states, not persisted financial entities.

## Required Constraints

- `category.id`, `budget.id`, and `budget_allocation.id` are primary keys.
- Category and budget `userId` values are non-null and reference the
  authoritative authentication user.
- Category group and applicability are restricted to their supported enums.
- `(userId, group, lower(name))` is unique for categories, including archived
  categories.
- Budget `month` uses PostgreSQL `date`, is constrained to the first day, and is
  unique within `(userId, month)`.
- Allocation foreign keys reference the owning budget and reusable category
  with history-preserving delete behavior.
- `(budgetId, categoryId)` is unique for allocations.
- Allocation amounts are non-negative signed 64-bit integers.
- The service restricts allocations to expense-capable categories owned by the
  budget owner.
- Protected reads and writes use the session-derived owner; another user's
  category, budget, or allocation behaves as not found.
