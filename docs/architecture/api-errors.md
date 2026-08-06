# Public API Errors

**Status:** Accepted  
**Last verified:** 2026-08-06

## Purpose

This document defines the public error contract for Steward-owned HTTP
endpoints. It owns the error envelope, stable machine-readable codes, HTTP
status mappings, validation details, concealment policy, and the boundary
between public errors and internal diagnostics.

[Public API contracts](api-contracts.md) defines the corresponding request and
successful-response conventions. Better Auth owns error bodies under
`/api/auth/*`; Steward does not partially redefine those responses. Protected
Steward routes still use this contract after the application validates the
Better Auth session.

## Envelope

Every non-success response from a Steward-owned endpoint has this JSON shape:

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

- `error` and its `code` and `message` properties are always present.
- `code` is one of the stable uppercase identifiers in the mapping below.
- `message` is safe user-facing text. Clients may display it, but application
  behavior and localization must branch on `code`, not message wording.
- `details` is optional and is present only where this document defines its
  schema. It never contains arbitrary framework or service metadata.
- No additional top-level or `error` properties are public. In particular,
  request IDs, timestamps, stack traces, causes, and debug data are not part of
  the JSON envelope.

## Codes and HTTP Statuses

| HTTP status | Stable code               | Use                                                                                                  | Public message                                           |
| ----------- | ------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `400`       | `VALIDATION_ERROR`        | The request cannot be parsed or does not satisfy its structural, field, cross-field, or domain rules | `The submitted data is invalid.`                         |
| `401`       | `AUTHENTICATION_REQUIRED` | A protected application route has no valid current session                                           | `Sign in to continue.`                                   |
| `404`       | `RESOURCE_NOT_FOUND`      | The route or resource does not exist, including a concealed inaccessible user-owned resource         | `The requested resource was not found.`                  |
| `409`       | `CONFLICT`                | A valid request conflicts with current state or a recognized uniqueness or concurrency condition     | `The request conflicts with the current resource state.` |
| `429`       | `RATE_LIMITED`            | A Steward-owned endpoint rate limit rejects the request                                              | `Too many requests. Try again later.`                    |
| `500`       | `INTERNAL_ERROR`          | An unexpected failure, including an unrecognized dependency or response-contract failure             | `An unexpected error occurred. Try again later.`         |

These codes are the complete initial code set. Adding, renaming, splitting, or
changing the HTTP status of a code is a public contract change. More specific
internal failure names do not become public codes merely to simplify handler
implementation.

Malformed JSON, unsupported JSON content types, missing required bodies,
invalid path or query values, unknown request properties, and Zod schema
failures all normalize to `VALIDATION_ERROR`. A recognized database constraint
may map to `CONFLICT` only when the service can identify the safe application
condition without exposing the constraint. Unrecognized database and
dependency failures map to `INTERNAL_ERROR`.

Steward has no general public `403` code in the MVP. A missing or invalid
session is `401`; an authenticated request for a user-owned resource outside
the session user's accessible dataset is the same `404` response as an absent
resource. An operation rejected by a documented business rule is a validation
error when changing submitted values can make it valid, or a conflict when the
current resource state prevents the operation.

For `429`, the API sets the standard `Retry-After` response header to a whole
number of seconds when the limiter can determine the retry interval. Clients
must still tolerate the header being absent. Retry information is not copied
into `details`.

## Validation Details

Only `VALIDATION_ERROR` may include `details`, with this shape:

```json
{
  "fields": {
    "allocations.0.valueMinor": ["Enter a valid amount."],
    "month": ["Enter a valid month."]
  }
}
```

`fields` maps a public request field path to a non-empty array of safe messages.
Paths use public `camelCase` names and dot-separated array indexes so the web
application can map them to form controls. They never use database column
names, internal model names, or raw Zod issue paths. Messages are ordered
deterministically, and duplicate messages for one path are removed.

The API includes field details only when it can identify a public field and
provide actionable feedback without disclosing internal information. Request-
wide failures, malformed JSON, unsupported content types, and unknown
properties omit `details`. Submitted values are never echoed in field messages.
An empty `fields` object is omitted along with `details`.

Cross-field and domain validation should attach to the most useful public field
when one exists. If no single field is responsible, the top-level safe message
is sufficient; the contract does not invent a synthetic form field.

## Ownership Concealment

Every lookup of a user-owned resource is scoped to the authenticated session
identity. A resource that exists for another user and a resource that does not
exist produce the same status, code, message, envelope shape, and header policy:
`404 RESOURCE_NOT_FOUND`.

The API does not perform an unscoped existence check to choose an error, and it
does not reveal ownership through `details`, alternate wording, redirect
targets, cached representations, or logs returned to the client. Tests assert
the same public response for absent and inaccessible identifiers. Normal
runtime variance is not a contract, but implementations must not intentionally
add a distinguishable ownership-dependent delay or secondary lookup.

## Safe Translation Boundary

The API uses one centralized error translation boundary. Expected application
failures carry an internal classification that is explicitly allowlisted to a
public status, code, message, and optional validation-field map. Everything
else becomes `500 INTERNAL_ERROR`.

Public response schemas serialize the allowlisted envelope rather than an
exception object. The translator never copies exception messages, names,
causes, codes, metadata, or enumerable properties into the response. This
prevents exposure of:

- PostgreSQL messages, SQL, table or column names, constraint names, connection
  details, and Drizzle query state;
- Zod issues, Fastify validation metadata, schema internals, and raw input;
- exception names, stack traces, source paths, dependency versions, and nested
  causes;
- cookies, authorization headers, session or verification tokens, passwords,
  credentials, secret values, and environment configuration; and
- internal user IDs, ownership keys, cleanup state, and logging metadata.

Known database constraints and authentication outcomes are translated by
explicit application logic, never by returning raw provider text. Response
schema or serialization failures are logged internally and return only the
generic `INTERNAL_ERROR` envelope.

## Correlation and Logging

Public error content and diagnostics are separate channels:

- The API assigns a server-controlled request ID at ingress and returns it in
  the `X-Request-Id` header on every Steward-owned response, successful or not.
  An untrusted client value is not used as the server request ID.
- The request ID is not placed in the error envelope and is not a stable error
  code. A client may provide the header value to support when reporting a
  problem.
- Structured logs correlate events with the request ID and may include the HTTP
  method, matched route template, status, stable public error code, duration,
  and an internal error classification.
- Logs do not record cookie or authorization headers, credentials, secrets, or
  complete request and response bodies. URL and validation values are omitted
  or redacted when they may contain user or financial data.
- Unexpected failures retain sufficient internal exception and stack context
  for diagnosis only after configured logger redaction. That context never
  changes the public `INTERNAL_ERROR` response.

Request IDs support correlation; they are not authentication credentials and
must not grant access to logs or resources.

## Verification Requirements

The shared contract schemas have focused tests for every code, required
property, optional validation detail, rejected unknown property, and omission
of internal fields. API tests use Fastify `inject()` to prove:

- each failure class maps to the documented status, code, and safe message;
- malformed and schema-invalid requests use normalized field details where
  appropriate without raw Zod or Fastify output;
- missing sessions return `401`, while absent and other-user resources return
  indistinguishable `404` responses;
- recognized conflicts and rate limits map to `409` and `429`, including
  `Retry-After` when known;
- thrown database, validation, authentication, and unexpected exceptions cannot
  add stack, cookie, credential, secret, query, or provider details; and
- unexpected response serialization failures return the generic `500` envelope
  and a request ID header while safe diagnostic context is logged.

Tests use synthetic secrets and financial data. They assert that sentinel
values are absent from the serialized response and captured public headers
rather than snapshotting internal exception structures.
