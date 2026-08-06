# API Collection Queries

**Status:** Accepted  
**Last verified:** 2026-08-06

## Purpose

This document defines pagination, filtering, search, and sorting for
Steward-owned collection endpoints. It is the canonical collection-query
contract for the MVP. [Public API contracts](api-contracts.md) defines the
shared parsing and response-validation rules, while the
[initial API surface](api-surface.md) defines which collections exist.

Only the transaction collection is paginated in the MVP. A later paginated
collection follows these conventions unless its accepted route contract
explicitly defines different query fields or ordering.

## Pagination

Paginated endpoints use one-based, offset pagination:

| Query parameter | Accepted value                           | Default | Maximum |
| --------------- | ---------------------------------------- | ------- | ------- |
| `page`          | Base-10 positive integer string          | `1`     | None    |
| `pageSize`      | Base-10 integer string from `1` to `100` | `25`    | `100`   |

The schemas accept digits only. Signs, fractions, exponents, whitespace,
empty values, and repeated values are invalid. Values that cannot be
represented as JavaScript-safe integers are invalid. The API rejects an
invalid value rather than rounding, clamping, or applying its default.

Every paginated success response has this shape:

```json
{
  "items": [],
  "page": 1,
  "pageSize": 25,
  "totalItems": 0,
  "totalPages": 0
}
```

- `page` and `pageSize` are the effective values used for the returned items.
- `totalItems` is the number of accessible records after all search and
  filters are applied and before pagination.
- `totalPages` is `ceil(totalItems / pageSize)`, or `0` when `totalItems` is
  zero.
- `items` contains at most `pageSize` records and is always an array.
- All four metadata values are non-negative JavaScript-safe integers;
  `page` and `pageSize` are always positive.

A requested positive page beyond the available range is valid. When results
exist, the API clamps it to `totalPages` and returns that last page. When no
records match, the effective page is `1`, `totalPages` is `0`, and `items` is
empty. This also handles a deletion that removes the last item from a page.
The web client replaces an out-of-range URL with the effective page reported
by the response.

The count and page query must observe one consistent database snapshot so the
metadata and items in a single response agree. Offset pagination does not
promise a stable snapshot across separate requests while records are being
created, edited, or deleted. The complete allowlisted ordering and unique
tie-breaker prevent nondeterministic row order within each request.

## Transaction Collection

`GET /api/transactions` accepts exactly these optional query parameters:

| Parameter   | Meaning                          | Accepted values                                      | Default        |
| ----------- | -------------------------------- | ---------------------------------------------------- | -------------- |
| `q`         | Literal text search              | Trimmed text from 1 through 100 characters           | No search      |
| `accountId` | Financial-account filter         | One canonical lowercase UUID                         | All accounts   |
| `category`  | Category scope                   | One canonical lowercase UUID or `uncategorized`      | All categories |
| `type`      | Transaction-type filter          | `income`, `expense`, or `refund`                     | All types      |
| `from`      | Inclusive transaction-date start | A valid `YYYY-MM-DD` date                            | No lower bound |
| `to`        | Inclusive transaction-date end   | A valid `YYYY-MM-DD` date                            | No upper bound |
| `sort`      | Transaction ordering             | `date-desc`, `date-asc`, `amount-desc`, `amount-asc` | `date-desc`    |
| `page`      | Results page                     | Pagination rules above                               | `1`            |
| `pageSize`  | Results per page                 | Pagination rules above                               | `25`           |

The query object is strict. Unknown parameters, repeated parameters, empty
values, malformed values, and unsupported enum values return
`400 VALIDATION_ERROR`. If both dates are present, `from` must be less than or
equal to `to`; an inverted range is also a validation error. Omitted fields
alone receive defaults.

All filters combine with logical AND and are applied after restricting the
query to the session-derived user ID:

- `q` performs a case-insensitive literal substring search over `description`
  and `notes`. It does not interpret `%`, `_`, regular-expression syntax, or
  full-text operators as patterns. Account and category names are not searched
  because they have dedicated filters.
- `accountId` includes transactions for that account, whether the owned
  account is active or archived.
- An omitted `category` includes categorized and uncategorized transactions. A
  UUID includes that category; `uncategorized` includes only rows whose
  category is absent. Archived owned categories remain valid historical
  filters.
- `type` matches the stored transaction type.
- `from` and `to` compare the date-only `transactionDate` value inclusively and
  never convert it through a timezone.

A well-formed account or category ID that is absent or belongs to another user
returns an empty collection, indistinguishable from an owned filter with no
matching transactions. Collection filters never perform an unscoped lookup or
reveal whether another user's resource exists.

## Transaction Sorting

Sort values expand to these complete database orderings:

| `sort` value  | Complete ordering                                                 |
| ------------- | ----------------------------------------------------------------- |
| `date-desc`   | `transactionDate DESC, createdAt DESC, id DESC`                   |
| `date-asc`    | `transactionDate ASC, createdAt ASC, id ASC`                      |
| `amount-desc` | `amountMinor DESC, transactionDate DESC, createdAt DESC, id DESC` |
| `amount-asc`  | `amountMinor ASC, transactionDate DESC, createdAt DESC, id DESC`  |

Amount sorts use the canonical signed stored amount, not its absolute display
magnitude. Every sort is an allowlisted expression, and `id` is its final
unique tie-breaker. Clients cannot submit field names or an independent sort
direction.

## Frontend URL Mapping

The transaction page owns the shareable URL state documented in the
[UX sitemap](../ux/sitemap.md#transaction-url-state). It uses the same names
and values as the API, with one deliberate omission:

| Frontend URL parameter | API query parameter | Client behavior                                |
| ---------------------- | ------------------- | ---------------------------------------------- |
| `q`                    | `q`                 | Forward the validated, trimmed value           |
| `accountId`            | `accountId`         | Forward the validated UUID                     |
| `category`             | `category`          | Forward the validated UUID or `uncategorized`  |
| `type`                 | `type`              | Forward the validated enum value               |
| `from`                 | `from`              | Forward the validated date                     |
| `to`                   | `to`                | Forward the validated date                     |
| `sort`                 | `sort`              | Forward when non-default                       |
| `page`                 | `page`              | Forward when greater than `1`                  |
| Not URL-owned          | `pageSize`          | Omit; the API default fixes the MVP UI at `25` |

The browser validates and canonicalizes URL state before building an API
request. It removes invalid URL values and defaults rather than forwarding
them; this user-friendly route behavior does not weaken the API's strict
validation contract. Changing search, a filter, or sorting resets `page` to
`1`. The API response's effective `page` is authoritative for correcting an
out-of-range URL after the result count is known.

## Verification Requirements

Contract and API integration tests for a paginated collection cover:

- pagination defaults, the page-size boundaries, an out-of-range page, and an
  empty result;
- metadata and items from one consistent filtered result set;
- accepted search and each filter independently and in combination;
- every sort's complete ordering with records tied on its visible fields;
- literal search metacharacters and inclusive date boundaries;
- malformed, empty, repeated, unknown, unsupported, and inverted-range query
  values returning the public validation error; and
- absent and other-user filter IDs returning indistinguishable empty results.

Router and component tests cover URL canonicalization, reset-to-page-one
behavior, direct links and browser history, and correction to the effective
page after an empty-page mutation.
