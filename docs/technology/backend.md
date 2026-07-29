# Backend

## Decision

Steward will use Fastify as its backend framework, PostgreSQL as its relational database, and Drizzle ORM as its query layer.

Better Auth will provide authentication through its Drizzle PostgreSQL adapter.

The backend will be implemented in TypeScript.

## Selected Backend Technologies

The confirmed backend technologies are:

- Node.js
- TypeScript
- Fastify
- PostgreSQL
- Drizzle ORM
- Drizzle Kit
- Better Auth

Still undecided:

- Runtime validation library
- API documentation tooling
- Backend test runner
- Deployment provider

## Responsibilities

The Fastify backend is responsible for:

- Serving the Steward HTTP API
- Hosting Better Auth endpoints
- Validating requests
- Serializing responses
- Enforcing authentication
- Enforcing authorization
- Running financial business logic
- Querying PostgreSQL through Drizzle
- Managing Drizzle transactions
- Translating database errors
- Logging requests and unexpected errors
- Supporting integration tests

The React frontend must not connect directly to PostgreSQL or Drizzle.

## Application Architecture

The backend should be organized around application domains.

A possible structure is:

```text
src/
├── app.ts
├── server.ts
├── config/
├── database/
│   ├── client.ts
│   ├── schema/
│   ├── relations.ts
│   └── seed/
├── plugins/
│   ├── auth.ts
│   ├── database.ts
│   ├── cors.ts
│   └── errors.ts
├── modules/
│   ├── accounts/
│   ├── transactions/
│   ├── categories/
│   ├── budgets/
│   ├── dashboard/
│   ├── settings/
│   └── demo/
└── shared/
    ├── errors/
    ├── schemas/
    └── utilities/
```

The final repository structure will be confirmed during the Application Architecture epic.

## Application Factory

Application creation should remain separate from process startup.

```text
app.ts
→ Create Fastify instance
→ Register configuration
→ Register Drizzle database plugin
→ Register Better Auth
→ Register authentication hooks
→ Register feature routes
→ Return configured application

server.ts
→ Load environment
→ Create application
→ Start listening
→ Handle graceful shutdown
```

Tests should be able to create the Fastify application without opening a network port.

## Database Plugin

The Fastify database plugin should initialize:

- The PostgreSQL connection pool
- The Drizzle client
- Database lifecycle hooks

The plugin should expose the Drizzle client to dependent modules.

Conceptually:

```text
fastify.db
```

The plugin should:

- Create one shared client
- Reuse the PostgreSQL pool
- Validate configuration
- Close resources during shutdown
- Avoid logging credentials
- Avoid creating connections per request

## Drizzle Access Boundary

Fastify route handlers should not contain large inline Drizzle queries.

The expected flow is:

```text
Fastify route
→ Validate request
→ Read authenticated user
→ Call application service
→ Service calls Drizzle query function
→ Query PostgreSQL
→ Return serialized response
```

Drizzle query functions should live close to the domain module that owns them.

## Module Structure

A feature module may contain:

```text
modules/transactions/
├── transaction.routes.ts
├── transaction.schemas.ts
├── transaction.service.ts
├── transaction.queries.ts
├── transaction.errors.ts
├── transaction.types.ts
└── transaction.test.ts
```

Responsibilities should remain separated:

- Routes handle HTTP concerns.
- Schemas validate HTTP input and output.
- Services coordinate application workflows.
- Query files contain Drizzle database operations.
- Errors represent expected domain failures.
- Tests verify the module.

## Route Handlers

Route handlers should remain thin.

A handler should generally:

1. Read validated parameters, query, or body.
2. Obtain the authenticated user from the request.
3. Call the application service.
4. Return the result.

Handlers should not:

- Construct unrelated Drizzle queries
- Decide transaction boundaries
- Reimplement authentication
- Trust client-provided user IDs
- Contain complex financial calculations

## Drizzle Query Functions

Query functions should:

- Accept the authenticated user ID
- Use typed Drizzle queries
- Scope user-owned data correctly
- Return only required fields
- Use deterministic ordering
- Remain independently testable

Example responsibilities include:

- Find accounts for a user
- Find one account owned by a user
- Insert a transaction
- Update a transaction owned by a user
- Calculate monthly category totals
- Load budget allocations
- Build dashboard summaries

## Better Auth Integration

Better Auth should use the same configured Drizzle client or a clearly shared database package.

The official Drizzle adapter should be configured for PostgreSQL.

Conceptually:

```ts
betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
});
```

The authentication schema must be included in the Drizzle schema exports.

## Authentication Endpoints

Better Auth endpoints are mounted under:

```text
/api/auth/*
```

Fastify should forward:

- Request URL
- HTTP method
- Headers
- Body
- Response status
- Response headers
- Cookies
- Response body

Feature routes should not recreate Better Auth behavior.

## Authentication Hook

Protected route groups should use a reusable Fastify authentication hook.

The hook should:

- Retrieve the Better Auth session
- Reject invalid or missing sessions
- Attach the authenticated user and session
- Avoid repeated session lookups within the same request
- Keep authentication logic out of feature handlers

## Authorization

Authentication determines identity.

Authorization controls access to PostgreSQL records.

Protected Drizzle queries must derive the user ID from the validated Better Auth session.

They must not trust a user ID supplied through:

- Request body
- Query parameter
- Route parameter
- Client-controlled header

## Ownership Queries

A protected resource query should include ownership in the database condition.

Conceptually:

```text
financial_account.id = requested account
AND financial_account.user_id = authenticated user
```

A separate lookup followed by an unchecked ownership assumption should be avoided where ownership can be included directly in the query.

## Resource-Hiding Behavior

Requests for missing resources and resources owned by another user may both return:

```text
404 Not Found
```

This avoids revealing whether another user’s financial record exists.

The behavior should remain consistent.

## Request Validation

Every input-bearing route should define validation for:

- Path parameters
- Query parameters
- Request body
- Headers where required

Validation should occur before Drizzle queries run.

Structural validation includes:

- Required fields
- Types
- Formats
- Enum values
- Numeric limits
- Pagination values

Database-backed validation belongs in application services.

## Response Serialization

Routes should define response schemas where practical.

Database rows should be mapped into deliberate API responses.

This prevents accidentally returning:

- Internal timestamps
- Better Auth records
- Authentication metadata
- Database-only flags
- Fields unrelated to the response
- Sensitive user information

## Drizzle Transactions

Application services should own transaction boundaries.

Examples include:

- Linked account transfers
- Demo-data reset
- Budget creation with allocations
- Batch transaction imports
- Multi-record updates

Conceptually:

```text
Fastify handler
→ Application service
→ db.transaction(...)
→ Multiple Drizzle operations
→ Commit or rollback
```

The HTTP layer should not coordinate partial database writes.

## Financial Business Logic

Business rules should remain separate from route and query syntax.

Examples include:

- Transfer rules
- Account archival
- Transaction effects
- Budget calculations
- Overspending status
- Dashboard summaries
- Demo reset behavior

Services may call multiple Drizzle query functions while keeping policy decisions in one place.

## Error Handling

The API should use a consistent error format.

```json
{
  "error": {
    "code": "TRANSACTION_NOT_FOUND",
    "message": "The requested transaction could not be found.",
    "details": null
  }
}
```

Expected errors include:

- Validation errors
- Authentication failures
- Authorization failures
- Missing resources
- Conflicts
- Database constraint violations
- Invalid financial operations

## Drizzle and PostgreSQL Errors

Raw Drizzle or PostgreSQL errors must not be returned directly.

Known database errors may be translated into application errors.

Examples include:

- Unique constraint violation
- Foreign-key violation
- Required-field violation
- Conflicting budget allocation

Unexpected errors should:

- Be logged
- Include useful server context
- Return a generic message
- Avoid exposing SQL, schema names, connection details, or stack traces

## HTTP Status Conventions

The API should generally use:

- `200 OK` for successful reads and updates
- `201 Created` for successful creation
- `204 No Content` for successful operations without a body
- `400 Bad Request` for invalid operations
- `401 Unauthorized` for missing or invalid sessions
- `403 Forbidden` for authenticated but disallowed operations
- `404 Not Found` for missing or concealed resources
- `409 Conflict` for conflicting state
- `500 Internal Server Error` for unexpected failures

## Search, Filtering, and Pagination

The transaction API should translate validated HTTP query parameters into typed Drizzle query conditions.

Supported state may include:

- Search
- Account
- Category
- Transaction type
- Date range
- Amount range
- Sort
- Page
- Page size

Query construction should remain centralized rather than duplicated across handlers.

## Migrations

Drizzle Kit will manage database migrations.

The backend project should include:

```text
drizzle.config.ts
drizzle/
```

The migration workflow is:

```text
Update Drizzle schema
→ Generate migration
→ Review SQL
→ Commit migration
→ Apply migration
```

The Fastify server should not perform uncontrolled schema changes during normal request handling.

## Schema and Migration Deployment

Database migrations should run as an explicit deployment step before application code that depends on them becomes active.

The migration process must support:

- Local development
- Integration tests
- CI
- Production deployment

Migration failure should stop deployment rather than leave the application partially upgraded.

## Seed Commands

Seed operations should be separate from normal Fastify startup.

They should support:

- Creating the demo Better Auth user
- Creating categories
- Creating financial accounts
- Creating transactions
- Creating budgets and allocations
- Restoring demo data

Seed operations should use Drizzle and PostgreSQL transactions where appropriate.

## Configuration

Backend configuration should be loaded from environment variables and validated at startup.

Likely variables include:

```text
NODE_ENV
HOST
PORT
DATABASE_URL
BETTER_AUTH_SECRET
BETTER_AUTH_URL
FRONTEND_ORIGIN
LOG_LEVEL
DEMO_USER_EMAIL
```

Drizzle Kit may also read:

```text
DATABASE_URL
```

Secrets must not be committed.

## Graceful Shutdown

The server should:

1. Stop accepting new requests.
2. Allow active requests to finish where practical.
3. Close Fastify.
4. Close the PostgreSQL pool.
5. Release Drizzle database resources.
6. Exit cleanly.

Tests must also close Fastify and database resources.

## Logging

Logs may include:

- Request ID
- HTTP method
- Route
- Response status
- Request duration
- General database failure category
- Unexpected error context

Logs must not include:

- Database credentials
- Better Auth secrets
- Session tokens
- Cookies
- Passwords
- Raw sensitive financial payloads
- Unredacted SQL parameters

## Testing

### Unit tests

Test:

- Financial calculations
- Validation helpers
- Service-level policy
- Transfer behavior
- Budget calculations

### Database integration tests

Test:

- Drizzle schema
- Migrations
- Constraints
- Queries
- Transactions
- Ownership conditions
- Better Auth schema integration
- Demo reset

### Fastify integration tests

Use Fastify request injection against an isolated PostgreSQL database.

Test:

- Route validation
- Authentication
- Authorization
- Query behavior
- Error mapping
- Response serialization

### End-to-end tests

Test critical workflows across:

```text
React
→ Fastify
→ Better Auth
→ Drizzle
→ PostgreSQL
```

## Non-Goals

The initial backend will not use:

- Prisma
- Sequelize
- TypeORM
- Multiple ORMs
- Express
- Hono
- NestJS
- GraphQL
- Microservices
- Event sourcing
- Message brokers
- Multiple database engines

These should only be reconsidered when a concrete requirement justifies the added complexity.

## Success Criteria

The backend architecture is successful when:

- Fastify exposes a modular API.
- Drizzle provides typed PostgreSQL access.
- Better Auth uses the Drizzle adapter.
- Route handlers remain thin.
- Services own business workflows.
- Query functions enforce ownership.
- Drizzle transactions protect multi-record operations.
- Migrations are generated, reviewed, and version controlled.
- Integration tests run against isolated PostgreSQL data.
- The architecture remains understandable for a solo developer.
