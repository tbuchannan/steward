# Backend

## Decision

Steward will use Fastify as its backend framework and PostgreSQL as its relational database.

The backend will be implemented in TypeScript and will expose the application API, authentication endpoints, and server-side financial operations.

The ORM or query layer has not yet been selected.

## Selected Backend Technologies

The confirmed backend technologies are:

- TypeScript
- Fastify
- PostgreSQL
- Better Auth

Still undecided:

- ORM or query builder
- Migration tooling
- PostgreSQL client
- API schema library
- Deployment provider

## Responsibilities

The Fastify application is responsible for:

- Serving the Steward API
- Hosting Better Auth endpoints
- Validating requests
- Serializing responses
- Enforcing authentication
- Enforcing authorization
- Running financial business logic
- Reading and writing PostgreSQL data
- Managing database transactions
- Logging requests and unexpected errors
- Returning consistent API responses
- Supporting integration testing

The frontend must not connect directly to PostgreSQL.

## Application Structure

The backend should be organized around application domains rather than one large routes directory.

A possible structure is:

```text
src/
├── app.ts
├── server.ts
├── config/
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

This structure is provisional and may change during the Application Architecture epic.

## Application Factory

Application construction should remain separate from process startup.

```text
app.ts
→ Creates the Fastify application
→ Registers shared plugins
→ Registers authentication
→ Registers feature modules
→ Returns the configured application

server.ts
→ Loads environment configuration
→ Creates the application
→ Starts the HTTP server
→ Handles graceful shutdown
```

This separation allows tests to create the application without listening on a real network port.

## Plugin Registration

Shared infrastructure should be registered through Fastify plugins.

Initial plugins may include:

- Environment configuration
- PostgreSQL database access
- Better Auth
- Authentication hooks
- CORS
- Error handling
- Logging
- API documentation where useful

Plugin dependencies and registration order should be explicit.

## PostgreSQL Plugin

PostgreSQL access should be initialized through a dedicated Fastify plugin.

The plugin should:

- Read validated database configuration
- Create a shared connection pool or database client
- Verify startup connectivity where practical
- Expose database access to dependent modules
- Close the pool during graceful shutdown
- Avoid creating connections per request
- Avoid logging credentials

The exact decoration name and TypeScript declaration should be documented after the query layer is selected.

A possible conceptual interface is:

```text
fastify.db
```

Feature modules should not create independent PostgreSQL pools.

## Database Access Boundary

Route handlers should not contain large inline SQL queries or direct persistence logic.

The preferred flow is:

```text
Fastify route
→ Validate request
→ Retrieve authenticated user
→ Call service or use case
→ Query PostgreSQL through repository/query layer
→ Return serialized response
```

The final repository or query pattern will be selected after the ORM evaluation.

## Better Auth and PostgreSQL

Better Auth will persist its required authentication data in PostgreSQL.

Authentication records include:

- Users
- Credential accounts
- Sessions
- Verification records where required

The Better Auth user identifier is the canonical user identity for Steward.

Steward financial tables should reference that identity for ownership.

## Route Organization

Routes should be grouped by domain.

```text
/api/accounts
/api/transactions
/api/categories
/api/budgets
/api/dashboard
/api/settings
/api/demo
```

Better Auth endpoints are mounted under:

```text
/api/auth/*
```

Each domain module may contain:

- Routes
- Request schemas
- Response schemas
- Services or use cases
- Database query functions
- Domain errors
- Tests

## Authentication Hook

Protected route groups should use a reusable authentication hook.

The hook should:

1. Read the incoming request headers.
2. Retrieve the Better Auth session.
3. Reject requests without a valid session.
4. Attach the authenticated user and session to the request.
5. Allow the feature handler to continue.

Feature routes should not repeatedly parse sessions themselves.

## Authorization and PostgreSQL Queries

Protected handlers must derive the user identifier from the validated Better Auth session.

PostgreSQL queries involving user-owned resources must include that identifier.

For example, an account query should conceptually enforce:

```text
account.id = requested account
AND account.user_id = authenticated user
```

The backend must not trust a user identifier supplied through:

- Request bodies
- Query parameters
- Route parameters
- Client-controlled headers

## Request Validation

Routes accepting input should define schemas for:

- Path parameters
- Query parameters
- Request bodies
- Required headers where applicable

Validation should cover structural concerns before a database query runs.

Examples include:

- Required values
- Data types
- Date formats
- Supported account types
- Valid pagination values
- Valid transaction amounts
- Valid budget allocations

Database-backed checks should occur in the service or query layer.

## Response Serialization

Routes should define response schemas where practical.

Response schemas should:

- Keep API shapes stable
- Prevent accidental field exposure
- Support documentation
- Improve runtime serialization
- Make refactoring safer

Database rows should not automatically be returned directly to the client.

## PostgreSQL Transactions

Application services should use PostgreSQL transactions when an operation changes multiple related records atomically.

Examples include:

- Creating linked transfer transactions
- Resetting demo data
- Creating a budget and its allocations
- Importing transaction batches
- Updating dependent financial records

A failed operation should roll back all related changes.

Transaction boundaries should be owned by application services rather than spread across HTTP handlers.

## Financial Calculations

Financial business logic should not live directly inside Fastify routes.

Examples include:

- Account balances
- Monthly spending
- Budget progress
- Overspending calculations
- Transfers
- Net-worth calculations
- Dashboard summaries
- Demo-data reset behavior

These should be implemented in independently testable services or use cases.

## Error Handling

The API should return a consistent error shape.

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

- Invalid input
- Missing authentication
- Insufficient authorization
- Missing resources
- Conflicting state
- Database constraints
- Invalid financial operations

Unexpected PostgreSQL errors should:

- Be logged with useful server context
- Return a generic message to the client
- Avoid leaking table names, SQL, connection details, or stack traces

## Database Constraint Errors

Known PostgreSQL constraint failures may be translated into application errors.

Examples include:

- Duplicate records
- Invalid foreign keys
- Required values
- Conflicting budget allocations

The API should not expose raw PostgreSQL errors directly to users.

## HTTP Status Conventions

The API should generally use:

- `200 OK` for successful reads and updates
- `201 Created` for successful creation
- `204 No Content` when no response body is required
- `400 Bad Request` for invalid operations
- `401 Unauthorized` when a valid session is missing
- `403 Forbidden` when an authenticated user lacks permission
- `404 Not Found` when a resource does not exist or should not be revealed
- `409 Conflict` for conflicting state
- `500 Internal Server Error` for unexpected failures

## CORS and Cookies

If the frontend and Fastify API run on different origins:

- Approved frontend origins must be listed explicitly.
- Credentialed requests must be enabled.
- Better Auth trusted origins must match the intended frontend origins.
- Wildcard origins must not be used with authentication cookies.

A same-origin production deployment is preferred where practical.

## Logging

Fastify logging should include:

- Request identifier
- HTTP method
- Route
- Response status
- Request duration
- Unexpected error context

Logs must not include:

- Database passwords
- Connection strings containing credentials
- Raw SQL containing sensitive values
- Authentication cookies
- Session tokens
- User passwords
- Full financial payloads

## Configuration

Backend configuration should be loaded from environment variables and validated during startup.

Likely values include:

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

Required configuration should fail clearly during startup when missing or invalid.

## Graceful Shutdown

The server should handle shutdown signals.

Shutdown behavior should:

1. Stop accepting new requests.
2. Allow active requests to finish where practical.
3. Close the Fastify server.
4. Close the PostgreSQL connection pool.
5. Exit cleanly.

Tests should also close application and database resources.

## Migrations

Database migrations must run separately from normal HTTP request handling.

The final migration command will depend on the selected ORM or migration tool.

Migrations should be:

- Version controlled
- Repeatable
- Applied before incompatible application code
- Tested in development and CI
- Used for both Better Auth and Steward schema requirements

The Fastify server should not silently make uncontrolled schema changes during normal startup.

## Seed Data

Seed operations should be implemented separately from normal server startup.

Seeds should support:

- Creating the demo Better Auth user
- Creating financial accounts
- Creating categories
- Creating transactions
- Creating budgets and allocations
- Restoring the canonical demo dataset

Seed commands must be safe enough to avoid overwriting unrelated user data.

## Testing

### Unit tests

Test financial services and business rules independently from Fastify and PostgreSQL where practical.

### Integration tests

Use Fastify request injection with an isolated PostgreSQL test database.

Integration tests should cover:

- Route validation
- Better Auth integration
- Authentication hooks
- Authorization
- PostgreSQL constraints
- Database transactions
- Error translation
- User-data isolation
- Demo reset behavior

### End-to-end tests

Test critical browser workflows across:

```text
Frontend
→ Fastify
→ Better Auth
→ PostgreSQL
```

## Non-Goals

The initial backend will not require:

- Express
- Hono
- NestJS
- Multiple database engines
- Microservices
- GraphQL
- Event sourcing
- Message brokers
- Database sharding
- Read replicas
- Independently deployed domain services

These may be reconsidered only in response to concrete requirements.

## Success Criteria

The backend architecture is successful when:

- Fastify exposes a clear modular API.
- PostgreSQL access is centralized.
- Better Auth persists users and sessions in PostgreSQL.
- Protected requests derive identity from validated sessions.
- User-owned queries enforce ownership.
- Financial operations use transactions where required.
- Route handlers remain thin.
- Database resources close cleanly.
- Integration tests use an isolated PostgreSQL database.
- The architecture remains understandable for a solo developer.
