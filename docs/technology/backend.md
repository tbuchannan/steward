# Backend

## Decision

Steward will use Fastify as its backend framework.

The backend will be written in TypeScript and run on Node.js.

Zod will provide runtime validation through `fastify-type-provider-zod`.

Better Auth will provide authentication.

Drizzle ORM will provide typed PostgreSQL access.

Drizzle Kit will manage database migrations.

Railway will host the production backend.

Vitest, Fastify `inject()`, Testcontainers for Node.js, real PostgreSQL, and Playwright will provide backend and full-application testing.

## Selected Technologies

The confirmed backend technologies are:

- Node.js
- TypeScript
- Fastify
- Zod
- `fastify-type-provider-zod`
- Better Auth
- Drizzle ORM
- Drizzle Kit
- PostgreSQL
- Vitest
- Fastify `inject()`
- Testcontainers for Node.js
- PostgreSQL Testcontainer
- Playwright
- Railway

Still undecided:

- PostgreSQL driver
- Error-monitoring provider
- Continuous-integration provider
- Production logging destination
- Rate-limiting strategy
- API-documentation tooling

## Responsibilities

The backend is responsible for:

- Serving Steward's HTTP JSON API
- Hosting Better Auth endpoints
- Validating request data
- Validating and serializing response data
- Reading authenticated sessions
- Enforcing authorization
- Enforcing resource ownership
- Executing financial business logic
- Querying PostgreSQL through Drizzle
- Managing database transactions
- Mapping database records into API responses
- Translating expected errors
- Logging requests and unexpected failures
- Validating backend environment configuration
- Providing health checks
- Shutting down gracefully
- Supporting integration and end-to-end testing

The backend must not:

- Trust user IDs supplied by the frontend
- Depend on frontend validation
- Return raw PostgreSQL errors
- Return raw Drizzle errors
- Return raw Zod issue objects as the permanent API contract
- Expose Better Auth internals unnecessarily
- Log passwords, cookies, tokens, or database credentials
- Connect to the production database during automated tests
- Run uncontrolled schema synchronization during normal startup

## Backend Architecture

The backend should be organized around business domains.

A likely structure is:

```text
src/
├── app.ts
├── server.ts
├── config/
│   ├── environment.ts
│   └── constants.ts
├── database/
│   ├── client.ts
│   ├── schema/
│   │   ├── auth.ts
│   │   ├── accounts.ts
│   │   ├── categories.ts
│   │   ├── transactions.ts
│   │   ├── budgets.ts
│   │   ├── preferences.ts
│   │   └── index.ts
│   ├── relations.ts
│   ├── migrations/
│   ├── seed/
│   └── utilities/
├── plugins/
│   ├── auth.ts
│   ├── cors.ts
│   ├── database.ts
│   ├── errors.ts
│   ├── logging.ts
│   └── validation.ts
├── modules/
│   ├── accounts/
│   ├── authentication/
│   ├── budgets/
│   ├── categories/
│   ├── dashboard/
│   ├── demo/
│   ├── settings/
│   └── transactions/
├── shared/
│   ├── errors/
│   ├── schemas/
│   ├── types/
│   └── utilities/
└── types/
    └── fastify.d.ts
```

A feature module may contain:

```text
modules/transactions/
├── transaction.routes.ts
├── transaction.schemas.ts
├── transaction.service.ts
├── transaction.queries.ts
├── transaction.mappers.ts
├── transaction.errors.ts
├── transaction.types.ts
└── transaction.test.ts
```

## Application Factory

Application construction must remain separate from process startup.

### `app.ts`

The application factory should:

1. Create the Fastify instance.
2. Configure logging.
3. Register Zod validation and serialization.
4. Register CORS.
5. Register the database plugin.
6. Configure Better Auth.
7. Register authentication helpers.
8. Register feature routes.
9. Register health checks.
10. Register centralized error handling.
11. Return the configured application.

Conceptually:

```text
buildApp()
→ Configure Fastify
→ Register plugins
→ Register routes
→ Return app
```

### `server.ts`

The server entry point should:

1. Load and validate environment variables.
2. Build the application.
3. Listen on the configured host and port.
4. Register shutdown-signal handlers.
5. Log startup failures safely.
6. Exit unsuccessfully when startup fails.

Tests should call the application factory without opening a network port.

## Fastify Instance

Fastify should be configured with:

- Structured logging
- Request IDs
- Zod validator compiler
- Zod serializer compiler
- Typed route support
- Centralized error handling
- Graceful shutdown hooks

The exact logger configuration may vary by environment.

Production logs should be machine-readable.

Local development may use a readable pretty-printer.

## Fastify Plugins

Cross-cutting behavior should be registered through Fastify plugins.

Likely plugins include:

### Validation plugin

Responsible for:

- Zod validator compiler
- Zod serializer compiler
- Zod type provider

### Database plugin

Responsible for:

- PostgreSQL connection pool
- Drizzle client
- Database lifecycle
- Graceful pool shutdown

### Authentication plugin

Responsible for:

- Better Auth integration
- Session-reading helper
- Authenticated-user decorator
- Protected-route hook

### CORS plugin

Responsible for:

- Local frontend origin
- Production Vercel origin
- Approved preview origins
- Credentialed requests

### Error plugin

Responsible for:

- Standard API errors
- Validation-error translation
- Known database-error translation
- Unexpected-error fallback

Plugins should declare dependencies explicitly where Fastify's plugin system requires them.

## Validation Integration

Fastify should use Zod through `fastify-type-provider-zod`.

Conceptually:

```ts
import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";

const app = Fastify();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

const typedApp = app.withTypeProvider<ZodTypeProvider>();
```

The exact setup should match the installed versions.

## Route Schemas

Routes that accept or return structured data should define Zod schemas.

Possible schema fields include:

```ts
schema: {
  params: paramsSchema,
  querystring: querySchema,
  body: bodySchema,
  response: {
    200: responseSchema,
  },
}
```

Route schemas may validate:

- Route parameters
- Query parameters
- Request bodies
- Required headers
- Success responses
- Standard error responses where practical

Handlers should receive parsed and typed request data.

## Request Validation

Request validation must occur before business logic.

Examples include:

```text
POST /api/accounts
→ Validate account-creation body

GET /api/accounts/:accountId
→ Validate account ID

GET /api/transactions
→ Validate search, filters, sorting, and pagination

PATCH /api/transactions/:transactionId
→ Validate ID and update body

GET /api/budgets/:year/:month
→ Validate year and month
```

Invalid data should not reach application services or Drizzle query functions.

## Structural Validation

Zod should validate:

- Required values
- Types
- String lengths
- Supported enum values
- UUID formats
- Date formats
- Monetary-input formats
- Numeric limits
- Pagination bounds
- Search filters
- Cross-field input relationships

Examples include:

- Transfer accounts must differ.
- Password confirmation must match.
- Start date must not be after end date.
- Page size must not exceed the maximum.

## Business Validation

Application services should validate rules requiring application or database knowledge.

Examples include:

- Whether a resource exists
- Whether a resource belongs to the authenticated user
- Whether an account is archived
- Whether a category is available
- Whether a budget already exists for a month
- Whether a transaction can be edited
- Whether demo reset is allowed
- Whether an account may be deleted

Database queries should not be performed inside initial Zod request parsing.

## Response Validation

Routes should define response schemas where practical.

Response schemas help:

- Stabilize public API contracts
- Prevent internal fields from leaking
- Detect incorrect handler output
- Keep runtime output aligned with TypeScript types
- Exclude database-only values
- Exclude authentication internals

Drizzle results should generally be mapped into deliberate API response objects.

## Response Mapping

Database records and API responses should remain separate concepts.

For example, a Drizzle account record may contain:

- Database column names
- User ownership ID
- Internal timestamps
- Archive metadata

The public account response may contain:

- Public ID
- Name
- Type
- Display balance
- Archived state
- Created timestamp

Response mapping should occur in:

- A mapper function
- An application service
- A query projection

Large amounts of mapping logic should not be embedded directly inside route handlers.

## Route Handlers

Route handlers should generally:

1. Read validated request values.
2. Read the authenticated user.
3. Call an application service.
4. Return a response matching the declared schema.

Handlers should not:

- Revalidate already parsed request data
- Contain large SQL queries
- Own complicated transaction boundaries
- Reimplement authentication
- Trust user IDs from the request
- Contain extensive financial logic
- Return raw database rows without review

## Application Services

Services should coordinate application workflows.

A service may:

- Perform business-rule checks
- Call multiple query functions
- Start database transactions
- Map expected failures
- Coordinate related updates
- Return application results

Examples include:

```text
createAccount
updateAccount
archiveAccount
createTransaction
createTransfer
updateTransaction
deleteTransaction
createBudget
updateBudget
resetDemoData
```

Services should not know about:

- HTTP response objects
- Fastify reply methods
- Browser-specific behavior
- Vercel configuration

## Drizzle Query Functions

Query functions should:

- Accept explicit inputs
- Accept authenticated user ID where ownership applies
- Use typed Drizzle queries
- Scope user-owned data
- Return only required columns
- Use deterministic ordering
- Avoid returning secrets
- Remain testable against PostgreSQL

Examples include:

```text
findAccountsByUserId
findAccountByIdForUser
insertAccount
updateAccountForUser
findTransactionsForUser
findBudgetForMonth
```

## Ownership Enforcement

User-owned queries must derive the user ID from the authenticated Better Auth session.

They must not trust user IDs supplied through:

- Request bodies
- Query parameters
- Route parameters
- Custom headers
- Browser storage

A safe read may conceptually include:

```text
WHERE account.id = requestedAccountId
AND account.userId = authenticatedUserId
```

Ownership checks should occur as close to the query as practical.

## Authorization Policy

The backend should distinguish:

- Authentication: who the user is
- Authorization: whether the user may perform the action
- Ownership: whether the record belongs to the user

Protected routes must reject missing or invalid sessions.

Resource operations must enforce ownership independently.

## Resource Concealment

Steward should use a consistent policy for resources belonging to another user.

A common policy is:

```text
Return 404 when a resource is absent or not owned by the user.
```

This avoids revealing that another user's record exists.

The final policy should be applied consistently and covered by integration tests.

## Authentication

Better Auth will provide:

- User registration
- Email and password authentication
- Session creation
- Session validation
- Cookie-based authentication
- Logout
- Authentication tables

The backend should not implement a second custom authentication system.

## Better Auth Integration

Better Auth should use the shared Drizzle database client.

Conceptually:

```ts
betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
});
```

The exact configuration should match the installed Better Auth version.

Better Auth remains responsible for its own internal endpoint validation.

Steward may use Zod for application-owned authentication forms and endpoints.

## Authentication Hook

Protected route groups should use a reusable authentication hook.

The hook should:

- Read the Better Auth session
- Reject missing sessions
- Reject invalid sessions
- Attach authenticated identity to the request
- Avoid unnecessary duplicate session lookups
- Keep authentication logic out of feature handlers

Conceptually:

```text
request.user
request.session
```

The exact decorator names may differ.

## Authentication Errors

Authentication failures should use one stable API error shape.

Example:

```json
{
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "You must sign in to continue.",
    "details": null
  }
}
```

The response must not reveal unnecessary credential details.

## CORS

Because the frontend is hosted on Vercel and the backend on Railway, CORS must be configured deliberately.

The API should allow:

- Local frontend origin
- Production frontend origin
- Approved Vercel preview origins where required

The API should reject unrelated origins.

Credentialed requests require:

- A specific allowed origin
- `credentials: true`
- Correct frontend request configuration
- Compatible authentication cookies

Wildcard origins must not be used with credentialed requests.

## Trusted Origins

Better Auth trusted origins and Fastify CORS origins should remain aligned.

Potential origins include:

```text
http://localhost:5173
https://steward.example.com
Approved Vercel preview origins
```

Preview-origin support should not become unrestricted origin acceptance.

## Authentication Cookies

Production cookie behavior must account for:

- HTTPS
- Secure cookies
- HttpOnly protection
- SameSite behavior
- Frontend and API domain structure
- Credentialed browser requests
- Preview environments

A custom-domain arrangement such as:

```text
app.example.com
api.example.com
```

may simplify production cookie behavior.

The final settings should be tested in a production-like environment.

## API Style

Steward will expose an HTTP JSON API.

The MVP does not require:

- GraphQL
- gRPC
- Microservices
- Event streaming
- Multiple public API versions

Routes should use predictable resource-oriented naming.

## Initial API Areas

Likely route groups include:

```text
/api/auth/*
/api/accounts
/api/accounts/:accountId
/api/transactions
/api/transactions/:transactionId
/api/categories
/api/budgets/:year/:month
/api/dashboard
/api/settings
/api/demo/reset
/health
```

The exact Better Auth endpoint prefix depends on its configuration.

## HTTP Method Conventions

Use:

- `GET` for reads
- `POST` for creation or commands
- `PATCH` for partial updates
- `DELETE` for deletion
- `PUT` only when full replacement semantics are appropriate

## HTTP Status Conventions

The API should generally use:

- `200 OK` for successful reads and updates
- `201 Created` for successful creation
- `204 No Content` for successful operations without a response body
- `400 Bad Request` for malformed or invalid operations
- `401 Unauthorized` for missing or invalid authentication
- `403 Forbidden` for authenticated but disallowed actions
- `404 Not Found` for absent or concealed resources
- `409 Conflict` for conflicting state
- `422 Unprocessable Content` only if the project explicitly adopts it for validation
- `500 Internal Server Error` for unexpected failures

The validation status policy should remain consistent across routes.

## Standard Error Contract

The API should use a stable error shape.

```json
{
  "error": {
    "code": "TRANSACTION_NOT_FOUND",
    "message": "The requested transaction could not be found.",
    "details": null
  }
}
```

Validation example:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The submitted data is invalid.",
    "details": {
      "fields": {
        "amount": ["Enter a valid amount."]
      }
    }
  }
}
```

The frontend should not depend on raw library error formats.

## Application Errors

Expected application errors may include:

- Validation error
- Unauthenticated
- Forbidden
- Resource not found
- Conflict
- Unsupported operation
- Archived account
- Duplicate budget
- Invalid transfer
- Demo reset unavailable

Application errors should contain:

- Stable code
- Safe message
- Appropriate HTTP status
- Optional structured details

## Validation-Error Translation

Zod validation failures should be converted into Steward's stable field-error format.

Raw Zod issue objects should not become the permanent API response contract.

The translation should:

- Group field errors
- Use user-facing messages
- Exclude sensitive values
- Preserve form-useful details

## Database-Error Translation

Known PostgreSQL errors may be translated into application errors.

Examples include:

- Unique constraint violation
- Foreign-key violation
- Check-constraint violation
- Serialization failure
- Connection failure

Raw details such as:

- SQL text
- Table names
- Connection strings
- Stack traces
- Database credentials

must not be returned to clients.

## Unexpected Errors

Unexpected errors should:

- Be logged
- Include a request ID
- Preserve useful server-side context
- Return a generic response
- Avoid leaking implementation details

Example response:

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Something went wrong.",
    "details": null
  }
}
```

## Database Plugin

The database plugin should initialize:

- PostgreSQL connection pool
- Drizzle database client
- Fastify decoration
- Shutdown lifecycle

Conceptually:

```text
fastify.db
```

The plugin should:

- Create one shared pool
- Reuse connections
- Validate configuration
- Avoid connecting once per request
- Close the pool during shutdown
- Avoid logging database credentials

## PostgreSQL Driver

The PostgreSQL driver remains undecided.

The selected driver must:

- Work with Drizzle ORM
- Support connection pooling
- Work reliably on Railway
- Work with Testcontainers
- Support transactions
- Have active maintenance
- Fit the deployment model

The final choice should be documented in:

```text
docs/technology/database.md
```

## Database Transactions

Application services should own transaction boundaries.

Examples include:

- Transfers
- Budget creation with allocations
- Demo-data reset
- Multi-record imports
- Related transaction updates
- Batch deletion

Conceptually:

```ts
await db.transaction(async (tx) => {
  // related operations
});
```

If one step fails, the complete workflow should roll back.

## Transfer Workflow

A transfer may require:

1. Validate source and destination accounts.
2. Confirm both accounts belong to the user.
3. Confirm the accounts differ.
4. Create related transfer records.
5. Link those records.
6. Commit as one transaction.

Transfers should not be partially persisted.

## Budget Workflow

Creating a budget may require:

1. Validate month and income.
2. Confirm no conflicting budget exists.
3. Insert budget record.
4. Insert category allocations.
5. Calculate or validate totals.
6. Commit as one transaction.

## Demo Reset Workflow

Demo reset should:

- Require authentication
- Verify the authenticated user is the demo user
- Delete or replace demo-owned financial data
- Recreate canonical demo records
- Preserve unrelated users
- Run inside a database transaction
- Avoid exposing demo credentials

The reset must not depend on a deployment or database reseed.

## Accounts Module

The accounts module should support:

- List accounts
- Read account detail
- Create account
- Update account
- Archive account
- Restore account where approved
- Account totals
- Recent account activity

Account operations must enforce ownership.

## Transactions Module

The transactions module should support:

- List transactions
- Search transactions
- Filter transactions
- Sort transactions
- Paginate transactions
- Read transaction detail
- Create income
- Create expense
- Create transfer
- Update transaction
- Delete transaction

List queries should use deterministic ordering.

## Transaction Filtering

Supported filters may include:

- Search text
- Account
- Category
- Transaction type
- Start date
- End date
- Minimum amount
- Maximum amount

Filter values must be validated before building Drizzle conditions.

## Transaction Sorting

Supported sort options should use an allowlist.

Examples include:

```text
date-desc
date-asc
amount-desc
amount-asc
description-asc
description-desc
```

Client-provided strings must not be inserted directly into SQL expressions.

## Pagination

The API should use a documented pagination strategy.

A page-based response may include:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 25,
    "total": 184,
    "totalPages": 8
  }
}
```

The API should enforce a maximum page size.

Queries should use deterministic ordering to prevent unstable pages.

## Budgets Module

The budgets module should support:

- Read budget by month
- Create budget
- Update budget
- Create allocations
- Update allocations
- Copy previous budget where approved
- Calculate spending by category
- Calculate remaining amounts
- Identify overspending

Budget calculations should use safe monetary representations.

## Dashboard Module

The dashboard module may aggregate:

- Net worth
- Available cash
- Credit debt
- Monthly income
- Monthly expenses
- Budget progress
- Spending by category
- Recent transactions
- Attention items

Dashboard queries should avoid unnecessary repeated database requests.

Aggregation behavior should be covered by integration tests.

## Settings Module

The settings module may support:

- Profile values owned by Steward
- Appearance preferences
- Financial preferences
- Demo-data operations

Authentication-sensitive changes should use Better Auth-supported workflows.

## Monetary Values

Authoritative monetary calculations should avoid unsafe floating-point arithmetic.

The chosen PostgreSQL representation should be documented in the database decision.

API values should use one consistent representation, such as:

- Integer minor units
- Validated decimal strings

The frontend and backend contract must not alternate unpredictably between representations.

## Dates and Timestamps

The backend should distinguish:

- Transaction dates
- Budget months
- Creation timestamps
- Update timestamps
- Session timestamps

Date-only business values should not automatically be stored as timestamps.

Time-zone conversion should not unintentionally shift a transaction to another date.

## Environment Configuration

Backend environment variables should be validated with Zod before startup.

Possible values include:

```text
NODE_ENV
HOST
PORT
DATABASE_URL
BETTER_AUTH_SECRET
BETTER_AUTH_URL
FRONTEND_ORIGIN
TRUSTED_ORIGINS
LOG_LEVEL
DEMO_USER_EMAIL
```

The exact set may grow as features are added.

## Environment Failure

Missing or invalid required configuration should stop startup.

Errors should:

- Name the invalid variable where safe
- Explain the expected form
- Avoid printing secret values
- Exit unsuccessfully

## Host and Port

Railway provides a port through:

```text
PORT
```

Fastify should listen on that port.

The production host should be externally reachable:

```text
0.0.0.0
```

The backend must not assume production always uses port `3000`.

## Logging

Fastify structured logging should be used.

Logs may include:

- Request ID
- Method
- Path
- Status code
- Response duration
- User ID where safe and useful
- Error code
- Deployment environment

Logs must not include:

- Passwords
- Session cookies
- Access tokens
- Better Auth secrets
- Database passwords
- Full database URLs
- Sensitive financial request bodies
- Personal data without a clear operational need

## Request IDs

Each request should have an identifier.

Request IDs help correlate:

- Incoming requests
- Server errors
- Database failures
- Test failures
- Production logs

The client may receive a safe request ID in unexpected error responses where useful.

## Health Check

The backend should expose:

```text
GET /health
```

A successful response may be:

```json
{
  "status": "ok"
}
```

The route should not expose:

- Secrets
- Database credentials
- Environment variables
- Detailed internal topology
- User data

## Readiness

The health check should report success only after required startup work completes.

Startup work includes:

- Environment validation
- Plugin registration
- Database initialization
- Better Auth configuration
- Route registration

An expensive database query should not run on every health request unless a separate readiness design requires it.

## Graceful Shutdown

The backend should handle termination signals.

Shutdown should:

1. Stop accepting new requests.
2. Allow active requests to finish where practical.
3. Close Fastify.
4. Close PostgreSQL connections.
5. Release other resources.
6. Exit cleanly.

This behavior is important for Railway redeployments and automated tests.

## Backend Testing Decision

Backend testing will use:

- Vitest
- Fastify `inject()`
- Testcontainers for Node.js
- Real PostgreSQL
- Drizzle migrations
- Better Auth test integration
- Playwright for complete browser workflows
- `@vitest/coverage-v8`

## Unit Tests

Backend unit tests should cover:

- Zod schemas
- Financial calculations
- Date utilities
- Error translation
- Response mapping
- Authorization helpers
- Environment parsing
- Pure service logic

Unit tests should not require Fastify or PostgreSQL when those dependencies are irrelevant to the behavior.

## Fastify Integration Tests

Fastify integration tests should use the application factory and `app.inject()`.

Conceptually:

```ts
const app = await buildApp({
  databaseUrl: testDatabaseUrl,
});

const response = await app.inject({
  method: "POST",
  url: "/api/accounts",
  payload: {
    name: "Everyday Checking",
    type: "checking",
    startingBalance: "5430.20",
  },
});

expect(response.statusCode).toBe(201);

await app.close();
```

Request injection exercises:

- Route registration
- Validation
- Serialization
- Hooks
- Decorators
- Authentication
- Error handling
- Cookies
- Headers
- Status codes

It avoids opening a real network port for ordinary integration tests.

## Integration Test Database

Backend integration tests will use a PostgreSQL Testcontainer.

The test flow should be:

```text
Start PostgreSQL container
→ Obtain connection URL
→ Apply Drizzle migrations
→ Configure Better Auth
→ Build Fastify app
→ Run injected requests
→ Close Fastify
→ Close database pool
→ Stop container
```

Cleanup must occur even when tests fail.

## Route Test Coverage

Route integration tests should verify:

- Valid requests
- Invalid requests
- Authentication requirements
- Ownership
- Authorization
- Missing resources
- Conflicts
- Database side effects
- Response schemas
- Error contracts
- Cookies
- CORS where practical

## Authentication Tests

Authentication integration tests should cover:

- Registration
- Login
- Invalid credentials
- Session creation
- Session validation
- Logout
- Expired session
- Invalid session
- Protected routes
- Cookie handling
- User ownership
- Demo-user restrictions

The tests should verify Steward's Better Auth configuration rather than recreating every Better Auth internal test.

## Ownership Tests

Every user-owned module should include tests proving:

```text
User A can access User A's data.
User A cannot access User B's data.
User A cannot modify User B's data.
User A cannot delete User B's data.
```

Modules include:

- Accounts
- Transactions
- Budgets
- Allocations
- Preferences
- Demo data

## Transaction Tests

Database-backed tests should deliberately trigger partial failure for:

- Transfers
- Budget creation
- Demo reset
- Related transaction updates

The tests must confirm complete rollback.

## Migration Tests

The integration suite should apply committed Drizzle migrations to a clean PostgreSQL database.

Tests should confirm:

- All migrations apply
- Better Auth tables exist
- Steward tables exist
- Required constraints exist
- Queries work after migration
- Seed operations work
- The application starts successfully

A schema push should not replace migration testing.

## Database Error Tests

Integration tests should verify translation of known database failures.

Examples include:

- Duplicate monthly budget
- Invalid foreign key
- Missing owned resource
- Unique constraint conflict
- Check-constraint violation

Clients must receive Steward's error contract rather than raw database output.

## CORS Tests

Integration tests should verify:

- Local frontend origin is accepted
- Production frontend origin is accepted
- Approved preview origin is accepted where configured
- Unrelated origin is rejected
- Credentialed preflight behavior works
- Wildcard origin is not used

## Cookie Tests

Authentication-cookie tests should verify:

- Login sets the expected cookie
- Protected requests accept the cookie
- Logout invalidates the session
- Production settings use secure attributes
- HttpOnly is used where expected
- SameSite behavior matches deployment needs

Production-specific cookie behavior may require a production-like end-to-end environment.

## End-to-End Testing

Playwright will verify complete workflows across:

```text
React frontend
→ Railway-style Fastify API
→ PostgreSQL test database
```

Backend-relevant Playwright flows include:

- Registration
- Login
- Session persistence
- Account creation
- Transaction creation
- Transfer creation
- Budget creation
- Demo reset
- Ownership protection
- Logout

## Coverage

Vitest will use V8 coverage.

Backend coverage should prioritize:

- Financial logic
- Validation
- Authorization
- Ownership
- Transactions
- Error mapping
- Environment parsing
- Demo reset
- Migration utilities

Coverage may exclude:

- Generated artifacts
- Type-only files
- Build output
- Test fixtures
- Thin configuration wrappers with no behavior

## Continuous Integration

Before Railway production deployment, CI should eventually verify:

- Formatting
- Linting
- Type checking
- Backend unit tests
- Fastify integration tests
- PostgreSQL integration tests
- Migration validity
- Backend build
- Critical Playwright tests

A failed required check should block deployment.

## Railway Deployment

The backend should deploy to Railway as a persistent Node.js service.

A likely deployment sequence is:

```text
Install dependencies
→ Run required checks
→ Build TypeScript
→ Apply production migrations
→ Start Fastify
→ Pass health check
```

The exact migration mechanism is defined in:

```text
docs/technology/deployment.md
```

## Build

The production build should compile TypeScript into JavaScript.

A likely output structure is:

```text
dist/
├── app.js
├── server.js
└── ...
```

Production should run compiled output rather than a development-only TypeScript runner unless explicitly reviewed.

## Start Command

A likely production command is:

```text
node dist/server.js
```

The final command depends on repository structure and package-manager scripts.

## Migrations During Deployment

Production migrations must:

- Be version controlled
- Be reviewed
- Run once per release
- Complete before incompatible code activates
- Fail the release when unsuccessful
- Avoid concurrent execution from multiple replicas

Normal API requests must not trigger migrations.

## Security Boundaries

### Frontend boundary

All frontend input is untrusted.

### Authentication boundary

Better Auth establishes user identity.

### Authorization boundary

Application services and queries determine allowed actions.

### Database boundary

PostgreSQL constraints protect persisted integrity.

### Logging boundary

Sensitive information must be redacted.

### Testing boundary

Automated tests must use test-only credentials and databases.

## Non-Goals

The initial backend will not use:

- Express
- Hono
- NestJS
- GraphQL
- Microservices
- Prisma
- Sequelize
- TypeORM
- SQLite
- MongoDB
- Joi
- Yup
- A custom authentication system
- Jest
- Cypress for backend tests
- Direct handler calls as the only route test
- Heavy Drizzle mocking
- Production databases during tests
- Uncontrolled schema synchronization
- Per-request database connections

These choices should not change without revisiting the corresponding technology decision.

## Open Decisions

The following backend decisions remain open:

- PostgreSQL driver
- Error-monitoring provider
- API-documentation tooling
- Rate limiting
- Production log destination
- CI provider
- Exact resource-concealment policy
- Exact validation HTTP status
- Exact CORS preview-origin strategy
- Final coverage thresholds
- Test-database cleanup strategy

## Success Criteria

The backend architecture is successful when:

- Fastify exposes a modular HTTP API.
- Application startup is separate from network listening.
- Zod validates request and response boundaries.
- Route handlers remain thin.
- Services own business workflows.
- Drizzle provides typed PostgreSQL access.
- Better Auth provides reliable session-based identity.
- Queries enforce user ownership.
- PostgreSQL transactions protect multi-record operations.
- Errors use one stable public contract.
- Secrets remain out of responses and logs.
- Railway can build and run the backend reliably.
- Health checks and graceful shutdown work.
- Vitest provides backend unit tests.
- Fastify routes are tested through `inject()`.
- PostgreSQL behavior is tested against a real Testcontainer.
- Drizzle migrations are verified on clean databases.
- Playwright verifies critical full-stack workflows.
- Required test failures block invalid deployments.
