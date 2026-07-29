# Backend

## Decision

Steward will use Fastify as its backend framework, PostgreSQL as its relational database, Drizzle ORM as its query layer, and Zod for runtime validation.

Better Auth will provide authentication through its Drizzle PostgreSQL adapter.

The backend will be implemented in TypeScript.

## Selected Backend Technologies

The confirmed backend technologies are:

- Node.js
- TypeScript
- Fastify
- Zod
- `fastify-type-provider-zod`
- PostgreSQL
- Drizzle ORM
- Drizzle Kit
- Better Auth

Still undecided:

- API documentation tooling
- Backend test runner
- Deployment provider

## Responsibilities

The Fastify backend is responsible for:

- Serving the Steward HTTP API
- Hosting Better Auth endpoints
- Validating requests with Zod
- Serializing and validating responses
- Enforcing authentication
- Enforcing authorization
- Running financial business logic
- Querying PostgreSQL through Drizzle
- Managing Drizzle transactions
- Translating validation and database errors
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
│   └── environment.ts
├── database/
│   ├── client.ts
│   ├── schema/
│   ├── relations.ts
│   └── seed/
├── plugins/
│   ├── auth.ts
│   ├── database.ts
│   ├── validation.ts
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
→ Register Zod validation compilers
→ Register Drizzle database plugin
→ Register Better Auth
→ Register authentication hooks
→ Register feature routes
→ Register error handling
→ Return configured application

server.ts
→ Load environment
→ Create application
→ Start listening
→ Handle graceful shutdown
```

Tests should be able to create the Fastify application without opening a network port.

## Validation Integration

Fastify should use Zod through `fastify-type-provider-zod`.

The application should register:

- Zod validator compiler
- Zod serializer compiler
- Zod type provider

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

The exact implementation should match the installed package versions.

## Route Schemas

Every route that accepts or returns structured data should define Zod schemas.

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

Schemas should validate:

- Path parameters
- Query parameters
- Request bodies
- Required headers where applicable
- Successful responses
- Standard error responses where practical

## Request Validation

Zod request validation should occur before route business logic.

Examples include:

```text
POST /api/accounts
→ Validate account creation body

GET /api/accounts/:accountId
→ Validate account ID

GET /api/transactions
→ Validate filters, sort, page, and page size

PATCH /api/transactions/:transactionId
→ Validate ID and update body

GET /api/budgets/:year/:month
→ Validate year and month
```

Invalid request data should not reach application services or Drizzle.

## Validation Responsibility

Zod handles structural validation.

Examples include:

- Required fields
- Types
- Formats
- String lengths
- Enum values
- Numeric boundaries
- Date parsing
- Pagination limits
- Cross-field input relationships

Application services handle business validation.

Examples include:

- Record ownership
- Resource existence
- Duplicate monthly budgets
- Account archival rules
- Category availability
- Demo-user authorization

Database queries should not run inside Zod validation.

## Response Serialization

Routes should define Zod response schemas where practical.

Response schemas should:

- Define the public API shape
- Validate handler output
- Prevent accidental database-field exposure
- Exclude authentication internals
- Keep route return types aligned with runtime behavior

Drizzle records should be mapped into deliberate response objects before being returned.

## Validation Errors

Fastify validation failures should be translated into Steward’s standard error shape.

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

The API should not expose Zod’s raw issue objects as its permanent public contract.

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

## Environment Validation

Backend environment variables should be validated with Zod before the server starts.

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

Invalid or missing required configuration should stop startup with a clear error.

Secrets must not appear in validation error output or logs.

## Drizzle Access Boundary

Fastify route handlers should not contain large inline Drizzle queries.

The expected flow is:

```text
Fastify route
→ Zod validates request
→ Authentication hook reads user
→ Application service runs
→ Service calls Drizzle query function
→ PostgreSQL operation executes
→ Result is mapped to response schema
→ Fastify serializes response
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
- Zod schemas define HTTP contracts.
- Services coordinate workflows.
- Query files contain Drizzle operations.
- Errors represent expected failures.
- Tests verify behavior.

## Route Handlers

Route handlers should generally:

1. Read validated parameters, query values, or body data.
2. Obtain the authenticated user.
3. Call the application service.
4. Return a value matching the response schema.

Handlers should not:

- Manually revalidate data already parsed by Zod
- Construct unrelated Drizzle queries
- Decide transaction boundaries
- Reimplement authentication
- Trust client-provided user IDs
- Contain complex financial calculations

## Schema Reuse

Schemas may be reused when they represent the same public concept.

Examples include:

- Resource identifiers
- Pagination
- Account types
- Transaction types
- Currency values
- Error responses

Creation, update, persistence, and response shapes should remain separate when their allowed fields differ.

## Drizzle Query Functions

Query functions should:

- Accept the authenticated user ID
- Use typed Drizzle queries
- Scope user-owned data correctly
- Return only required fields
- Use deterministic ordering
- Remain independently testable

## Better Auth Integration

Better Auth should use the configured Drizzle client or a shared database package.

Conceptually:

```ts
betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
});
```

Better Auth remains responsible for validating its own authentication endpoints.

Steward should not attempt to replace Better Auth’s internal request handling with custom Zod route schemas.

Application-owned authentication forms and endpoints may use Zod.

## Authentication Hook

Protected route groups should use a reusable Fastify authentication hook.

The hook should:

- Retrieve the Better Auth session
- Reject invalid or missing sessions
- Attach the authenticated user and session
- Avoid repeated session lookups
- Keep authentication logic out of feature handlers

## Authorization

Protected Drizzle queries must derive the user ID from the validated Better Auth session.

They must not trust a user ID supplied through:

- Request body
- Query parameter
- Route parameter
- Client-controlled header

Zod validation confirms that a user-supplied ID has a valid format.

It does not confirm ownership.

## Request and Response Contracts

API contracts should be based on Zod schemas rather than Drizzle table types.

Drizzle types describe database records.

Zod API schemas describe public HTTP data.

These shapes may differ because API responses may:

- Rename fields
- Exclude internal fields
- Combine records
- Format values
- Add derived summaries
- Represent timestamps differently

## Drizzle Transactions

Application services should own transaction boundaries.

Examples include:

- Linked account transfers
- Demo-data reset
- Budget creation with allocations
- Batch transaction imports
- Multi-record updates

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

- Zod validation failures
- Authentication failures
- Authorization failures
- Missing resources
- Conflicts
- Database constraint violations
- Invalid financial operations

## Drizzle and PostgreSQL Errors

Raw Drizzle or PostgreSQL errors must not be returned directly.

Known database errors may be translated into application errors.

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
- `400 Bad Request` for invalid operations or validation failures
- `401 Unauthorized` for missing or invalid sessions
- `403 Forbidden` for authenticated but disallowed operations
- `404 Not Found` for missing or concealed resources
- `409 Conflict` for conflicting state
- `500 Internal Server Error` for unexpected failures

## Search, Filtering, and Pagination

The transaction API should parse query parameters through Zod before building Drizzle conditions.

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

Sort fields must use an allowlist.

Client input must not be inserted directly into SQL expressions.

## Configuration

Backend configuration should be loaded from environment variables and validated by Zod at startup.

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

## Testing

### Schema tests

Test:

- Valid values
- Invalid values
- Boundary values
- Transformations
- Coercion
- Cross-field validation
- Error formatting

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

- Zod request validation
- Zod response serialization
- Authentication
- Authorization
- Invalid requests not reaching handlers
- Error mapping
- Response contracts

### End-to-end tests

Test critical workflows across:

```text
React
→ Zod form validation
→ Fastify
→ Zod request validation
→ Better Auth
→ Drizzle
→ PostgreSQL
```

## Non-Goals

The initial backend will not use:

- Joi
- Yup
- TypeBox
- Multiple validation libraries
- Prisma
- Sequelize
- TypeORM
- Express
- Hono
- NestJS
- GraphQL
- Microservices
- Database queries inside Zod refinements

## Success Criteria

The backend architecture is successful when:

- Fastify exposes a modular API.
- Zod validates requests and responses.
- Handlers receive typed parsed input.
- Drizzle provides typed PostgreSQL access.
- Better Auth uses the Drizzle adapter.
- Route handlers remain thin.
- Services own business workflows.
- Queries enforce ownership.
- Validation errors follow one stable format.
- Environment configuration is validated at startup.
- Integration tests verify validation before database access.
