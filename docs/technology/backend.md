# Backend

## Decision

Steward will use Fastify as its backend web framework.

The backend will be implemented with TypeScript and will expose the application API, authentication endpoints, and server-side financial operations.

## Responsibilities

The Fastify application is responsible for:

- Serving the Steward API
- Integrating Better Auth
- Validating requests
- Serializing responses
- Enforcing authentication and authorization
- Running financial business logic
- Accessing the database
- Logging requests and application errors
- Returning consistent API errors
- Supporting automated integration testing

The frontend should not communicate directly with the database.

## Why Fastify

Fastify was selected because it provides:

- Strong TypeScript support
- A structured plugin system
- Route encapsulation
- Request lifecycle hooks
- Schema-based validation
- Response serialization
- Built-in structured logging
- A relatively small framework surface
- A good fit for a modular API

Fastify provides more structure than a minimal HTTP framework without requiring the application conventions of a larger framework.

## Application Structure

The backend should be organized around application modules rather than one large routes directory.

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
│   └── users/
└── shared/
    ├── errors/
    ├── schemas/
    └── utilities/
```

This structure is provisional and may change during the Application Architecture epic.

## Application Factory

The backend should separate application construction from process startup.

```text
app.ts
→ Creates and configures the Fastify application
→ Registers plugins and routes
→ Returns the configured application

server.ts
→ Loads environment configuration
→ Calls the application factory
→ Starts listening
→ Handles startup and shutdown
```

This separation allows integration tests to create the application without opening a network port.

## Plugin Architecture

Shared infrastructure should be registered as Fastify plugins.

Initial plugins may include:

- Environment configuration
- Database connection
- Better Auth integration
- CORS
- Error handling
- Request logging
- API documentation where useful

Feature modules should register their routes through isolated plugins.

Plugins should not become generic containers for unrelated application logic.

## Route Organization

Routes should be grouped by domain.

Examples:

```text
/api/accounts
/api/transactions
/api/categories
/api/budgets
/api/dashboard
/api/settings
```

Authentication endpoints are handled by Better Auth:

```text
/api/auth/*
```

Each domain module may contain:

- Routes
- Request and response schemas
- Services or use cases
- Repository or query functions
- Domain-specific errors
- Tests

Route handlers should remain thin.

They should primarily:

1. Read validated request data.
2. Obtain the authenticated user.
3. Call the relevant application service.
4. Translate the result into an HTTP response.

## Authentication Integration

Better Auth will be mounted inside the Fastify application.

Authentication requests will be handled under:

```text
/api/auth/*
```

Fastify must forward compatible requests to the Better Auth handler and return the resulting status, headers, cookies, and response body.

Protected routes should retrieve the Better Auth session from the incoming request headers.

Authentication should be registered before feature routes that depend on it.

## Authentication Hook

Protected route groups should use a reusable authentication hook or plugin.

The hook should:

1. Read the incoming request headers.
2. Ask Better Auth for the current session.
3. Reject requests without a valid session.
4. Make the authenticated user and session available to the route handler.

A protected handler should not repeatedly implement session parsing.

Public routes should not register the protected-route hook.

## Authorization

Authentication confirms who the user is.

Authorization determines which Steward records the user may access.

Protected handlers must derive the user ID from the validated Better Auth session.

They must not trust a user ID supplied through:

- Request bodies
- Query parameters
- Route parameters
- Custom client headers

Every query for user-owned data must be scoped to the authenticated user.

Examples include:

- Accounts
- Transactions
- Categories
- Budgets
- Budget allocations
- Preferences

## Request Validation

Every route that accepts input should define schemas for the relevant request components:

- Path parameters
- Query parameters
- Request body
- Headers where necessary

Invalid requests should be rejected before business logic runs.

Validation should cover structural concerns such as:

- Required fields
- Data types
- String formats
- Enum values
- Numeric boundaries
- Pagination parameters

Database queries and other asynchronous business checks should occur after structural validation.

## Response Serialization

Routes should define response schemas where practical.

Response schemas should:

- Document the expected API shape
- Prevent accidental exposure of internal fields
- Keep response formats consistent
- Improve confidence when refactoring handlers

Authentication secrets, password data, internal database metadata, and unrelated user fields must never be returned by financial endpoints.

## Error Handling

The API should use a consistent error structure.

```json
{
  "error": {
    "code": "TRANSACTION_NOT_FOUND",
    "message": "The requested transaction could not be found.",
    "details": null
  }
}
```

Expected application errors may include:

- Validation errors
- Authentication errors
- Authorization errors
- Missing resources
- Conflicts
- Invalid financial operations

Unexpected errors should:

- Be logged with useful server context
- Return a generic client-safe message
- Avoid leaking stack traces or internal implementation details

## HTTP Status Conventions

The API should generally use:

- `200 OK` for successful reads and updates
- `201 Created` for successful creation
- `204 No Content` for successful operations without a response body
- `400 Bad Request` for invalid operations
- `401 Unauthorized` when no valid session exists
- `403 Forbidden` when the user is authenticated but not permitted
- `404 Not Found` when a resource does not exist or should not be revealed
- `409 Conflict` for conflicting state
- `500 Internal Server Error` for unexpected failures

Exact behavior should remain consistent across modules.

## CORS and Cookies

If the frontend and API run on different origins, Fastify must configure CORS explicitly.

The configuration should:

- Allow only approved frontend origins
- Allow credentials
- Support Better Auth cookies
- Avoid wildcard origins when credentials are enabled
- Use environment-specific trusted origins

Better Auth trusted origins and Fastify CORS origins must remain consistent.

A same-origin deployment may reduce the amount of CORS configuration required.

## Logging

Fastify’s logger should be enabled for the server.

Logs should include useful operational context such as:

- HTTP method
- Route
- Response status
- Request duration
- Request identifier
- Unexpected error information

Logs should not include:

- Passwords
- Session tokens
- Authentication cookies
- Full sensitive financial payloads
- Secrets
- Database connection strings

## Configuration

Runtime configuration should be provided through environment variables and validated during startup.

Configuration may include:

- Application environment
- API host and port
- Database connection
- Better Auth secret
- Better Auth base URL
- Frontend origin
- Trusted origins
- Logging level
- Demo-user configuration

The application should fail during startup when required configuration is missing or invalid.

## API Versioning

The initial API may use the following prefix:

```text
/api
```

Explicit versioning such as `/api/v1` is not required for the initial MVP unless there is a concrete compatibility need.

Versioning should not be introduced solely for hypothetical future consumers.

## Business Logic

Financial business rules should not live directly inside route handlers.

Examples include:

- Balance calculations
- Transaction ownership
- Transfer behavior
- Budget progress
- Overspending calculations
- Demo-data resets
- Dashboard summaries

These rules should be implemented in services or use-case functions that can be tested independently from HTTP routing.

## Database Access

Database access should be isolated from route handlers.

Routes should not build arbitrary database queries directly.

The exact repository or query-layer pattern will be decided after the database and ORM selections are complete.

All user-owned queries must include authenticated-user scoping.

## Testing

Backend tests should include:

### Unit tests

For isolated financial rules and service behavior.

### Integration tests

For Fastify routes, plugins, validation, authentication, authorization, and database behavior.

The application factory should support Fastify’s request-injection testing without starting a real HTTP listener.

### End-to-end tests

For critical workflows that cross the frontend, Fastify API, Better Auth, and database.

Important backend scenarios include:

- Registration and sign-in
- Rejection of unauthenticated requests
- User-data isolation
- Account creation
- Transaction creation and editing
- Budget updates
- Validation errors
- Demo-data reset
- Consistent error responses

## Initial Dependencies

The backend is expected to use:

- Fastify
- TypeScript
- Better Auth
- A supported database driver
- The selected ORM or query layer
- Official Fastify plugins where appropriate

Likely Fastify plugins include:

- `@fastify/cors`
- `fastify-plugin`

Additional plugins should be added only when required.

## Non-Goals

The initial backend will not use:

- Express
- Hono
- NestJS
- Microservices
- GraphQL
- Event sourcing
- A message broker
- Serverless functions split across unrelated deployments
- Multiple independently deployed backend services

These decisions may be revisited only if the application develops a concrete requirement that Fastify cannot reasonably satisfy.

## Success Criteria

The Fastify backend decision is successful when:

- The API is organized around clear domain modules.
- Better Auth operates through Fastify.
- Requests and responses use defined schemas.
- Protected routes validate sessions on the server.
- Financial data is scoped to the authenticated user.
- Route handlers remain thin.
- Business logic can be tested independently.
- Integration tests can run without opening a network port.
- Errors and logs are consistent and safe.
- The architecture remains manageable for a solo developer.
