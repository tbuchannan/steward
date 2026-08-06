# Public API Contracts

**Status:** Accepted  
**Last verified:** 2026-08-06

## Purpose

This document defines the shared request, response, and runtime-validation
conventions for Steward-owned HTTP endpoints. The
[initial API surface](api-surface.md) owns which routes exist and their
high-level behavior; [API collection queries](api-collections.md) owns
pagination, filtering, search, and sorting; exported Zod schemas in
`packages/contracts` are the field-level specification as each route is
implemented.

Better Auth owns the contracts under `/api/auth/*`. Steward does not copy or
partially redefine those schemas, although application routes still validate
the resulting session and enforce their own authorization rules.

## Contract Ownership

- `packages/contracts` owns public Zod schemas and types derived from those
  schemas with `z.infer`. It may also own pure, environment-independent
  refinements needed by more than one consumer.
- `apps/api` imports those schemas for Fastify route validation and response
  serialization. It maps service and database values into public response
  objects before returning them.
- `apps/web` imports the same schemas and inferred types for request
  construction, response parsing, URL search validation, and forms. Browser
  validation improves feedback but never replaces server validation.
- Database tables, Drizzle models, authentication records, and service input
  types are not public contracts and are never exported from
  `packages/contracts`.

Each schema is the source of its TypeScript type. Do not maintain a handwritten
interface with the same shape, infer a public type from a database model, or use
a type assertion in place of parsing an untrusted value. Contract modules export
named schemas and their inferred types from the package's public `index.ts`;
consumers do not import internal source paths.

Shared primitive schemas may be composed into route-specific schemas, but
business rules that require authentication, database state, ownership, or more
than the submitted object remain API service validation. A Zod refinement may
enforce a self-contained relationship such as a valid date range; it must not
perform I/O.

## Request Boundaries

Every Steward route declares schemas for each request location it accepts:

| Location     | Responsibility                                                                                     |
| ------------ | -------------------------------------------------------------------------------------------------- |
| Path params  | Parse the complete named parameter object and validate identifiers, dates, or months before lookup |
| Query string | Parse only documented filters, sorting, and pagination; apply documented defaults and coercion     |
| JSON body    | Parse the complete command or mutation payload before the handler calls a service                  |

Path, query, and body values are separate schemas even when they reuse shared
primitives. A field is accepted only in its documented location. Parameters and
query values arrive from HTTP as strings; coercion is declared per field and is
never applied generically. In particular, pagination schemas may convert
base-10 digit strings to integers after rejecting fractional, exponent,
whitespace-only, and repeated ambiguous values.

Mutation bodies use `Content-Type: application/json`. Malformed JSON, an
unsupported content type, a missing required body, and any schema failure are
normalized to the public validation error rather than exposing Fastify or Zod
details. Authentication hooks run after structural route validation and before
the service operation; the server still derives identity exclusively from the
validated session.

Request object schemas are strict: any undeclared property is rejected,
including internal-looking fields such as `userId`, `createdAt`, or `isDemo`.
This applies recursively to nested public request objects. A `PATCH` schema
makes editable fields optional but rejects an empty object; omitted fields are
unchanged. `PUT` schemas contain the complete replaceable state of their
addressed aggregate, subject to the endpoint semantics.

Omission and `null` are distinct:

- required fields must be present;
- optional request fields may be omitted only when the operation defines an
  omission behavior;
- `null` is accepted only when the schema explicitly uses it to clear or
  represent an absent relationship, such as an uncategorized transaction;
- JSON `undefined` is never part of a public contract; and
- default values are applied only where the API documents a default, such as
  transaction pagination.

## Response Shapes

Steward does not add a generic `data` envelope. Successful representations use
these stable shapes:

- A single resource or composed read model is returned directly as a JSON
  object.
- A non-paginated collection is `{ "items": [...] }`.
- A paginated collection is
  `{ "items": [...], "page": 1, "pageSize": 25, "totalItems": 1, "totalPages": 1 }`.
- A command returns its documented result object or current resource
  representation.
- A successful deletion with status `204` has no body.

The metadata semantics, bounds, and empty-page behavior for paginated
collections are defined in [API collection queries](api-collections.md).

Response object schemas are allowlists. During serialization, undeclared
properties are stripped recursively rather than sent to the client. Declared
required properties may not be missing, and declared values must pass their
schemas. A response-contract failure is an unexpected server error: the API
logs safe diagnostic context, returns the generic public `500` error contract,
and never falls back to serializing the unvalidated value.

Optional response properties are omitted when absent. Use `null` only when the
absence itself is meaningful and clients need a stable property, such as a
nullable relationship. Arrays are returned as empty arrays rather than omitted
or `null`. Successful JSON responses do not contain properties whose value is
`undefined`.

Expected non-success responses use the envelope and status mappings defined in
[public API errors](api-errors.md):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The submitted data is invalid.",
    "details": {
      "fields": {
        "amountMinor": ["Enter a valid amount."]
      }
    }
  }
}
```

`error.code` is a stable machine-readable uppercase identifier and `message`
is safe user-facing text. Validation field keys use public request paths, never
database column names or raw Zod issue paths. The error contract owns the
allowed codes, optional details schema, safe translation rules, concealment
policy, and separation of request correlation from public content.

## Canonical Public Values

Public field names use `camelCase`. Values follow the canonical domain rules:

| Concept            | Public representation                                                                                                 |
| ------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Money              | A JSON number that is a JavaScript-safe integer in signed USD minor units; related currency fields use literal `USD`  |
| Business date      | A real proleptic Gregorian date string `YYYY-MM-DD`, with year `0001` through `9999`                                  |
| Budget month       | A string `YYYY-MM`, with year `0001` through `9999` and month `01` through `12`                                       |
| Closed value set   | The exact lowercase string literals defined in [financial rules](../domain/financial-rules.md); unknown values reject |
| Steward identifier | A canonical lowercase UUID string; route and relationship identifiers use the same schema                             |
| Audit timestamp    | A server-generated RFC 3339 instant normalized to UTC with a `Z` suffix                                               |

Money fields use the domain names established by the owning model, such as
`amountMinor`, `openingBalanceMinor`, and `valueMinor`. They never use decimal
JSON numbers, numeric strings, formatted currency text, `bigint`, `NaN`, or
infinity. The API range-checks every monetary request, stored value, and derived
response before serialization. Currency is not client-selectable in the MVP.

Business dates and months remain strings and are validated as calendar values,
not only by regular-expression shape. They are never parsed through JavaScript
`Date`. Audit timestamps are instants and must include the normalized UTC `Z`;
clients cannot submit server-owned audit fields.

Enums use dedicated `z.enum` schemas or literals rather than unconstrained
strings. Unknown values are rejected and are never silently mapped to a default.
Steward-generated UUIDs are validated at public boundaries and normalized to
lowercase when created; authentication-provider identifiers remain inside the
Better Auth-owned session contract unless a Steward contract explicitly needs a
public reference.

## Field Exposure

Public response schemas are purpose-built DTOs, not database-row selections.
They may expose public resource IDs, documented relationship IDs, user-visible
lifecycle state, and useful audit timestamps. They exclude:

- ownership keys such as `userId` and copied owner columns;
- password, credential, verification, account-provider, session, cookie, token,
  and demo-cleanup fields;
- database-only foreign keys and surrogate IDs that are not part of the public
  resource relationship;
- migration, constraint, lock, version, soft-delete, and internal scheduling
  fields; and
- private configuration, logs, and implementation metadata.

A client-supplied ownership or server-managed field is rejected as unknown; it
is never trusted, ignored into persistence, or echoed. When a public response
needs authentication identity data, it uses the Better Auth session response or
an explicitly reviewed application projection instead of exposing an
authentication row.

## Verification Requirements

Every new or changed contract has focused Vitest coverage in
`packages/contracts` for:

- one representative accepted value and each important boundary;
- missing required fields and invalid primitive formats;
- undeclared request fields being rejected;
- omitted optional fields and explicitly nullable fields;
- invalid enum members, unsafe or fractional money, impossible dates, invalid
  months, malformed identifiers, and non-UTC timestamps where applicable; and
- response parsing or serialization omitting undeclared internal fields.

API route tests use Fastify `inject()` to prove each request location is wired
to its public schema, invalid requests use the public error envelope, successful
responses match the documented schema, and intentionally returned internal
properties cannot cross serialization. Protected-resource tests separately
prove session-derived ownership and the `401`/concealed-`404` policy.

Error schema and route coverage follows the matrix in
[public API errors](api-errors.md#verification-requirements).

For each documented success or expected error status, the Fastify route declares
the corresponding response schema. A route is not complete if only its
TypeScript return type describes the response.
