# Validation

## Decision

Steward will use Zod as its runtime-validation and schema-definition library.

Zod will be used across the React frontend and Fastify backend for:

- Request validation
- Response validation and serialization
- Form validation
- Search-parameter validation
- Environment-variable validation
- Shared API contracts where appropriate
- Runtime parsing of untrusted data
- TypeScript type inference

## Selected Technologies

Validation uses:

- Zod
- TypeScript
- Fastify
- `fastify-type-provider-zod`
- React
- TanStack Router

## Why Zod

Zod was selected because it provides:

- Runtime validation
- TypeScript type inference
- Composable schemas
- Custom refinements
- Transformations
- Reusable validation primitives
- Support in both browser and server environments
- Integration with Fastify
- Integration with frontend form libraries
- A consistent validation model across the application

Zod reduces the need to maintain separate runtime validators and TypeScript interfaces for the same data shape.

## Validation Boundaries

Zod should be used whenever data crosses a trust boundary.

Examples include:

- HTTP request bodies
- Route parameters
- Query parameters
- HTTP responses
- Form submissions
- URL search parameters
- Environment variables
- Imported transaction data
- Local-storage values
- External service responses
- Seed configuration
- Command-line input

Internal values that have already been validated do not need to be repeatedly parsed at every function boundary.

## Source of Truth

A Zod schema should be the source of truth for data shapes that require runtime validation.

TypeScript types should generally be inferred from schemas.

Conceptually:

```ts
const accountSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
});

type Account = z.infer<typeof accountSchema>;
```

The application should avoid defining a Zod schema and an unrelated handwritten TypeScript interface for the same object.

## Schema Categories

Steward will use several types of Zod schemas.

### Input schemas

Validate data entering the application.

Examples:

- Create-account body
- Update-transaction body
- Transaction filters
- Budget allocation input
- Login form input
- Environment variables

### Output schemas

Define data returned from the Fastify API.

Examples:

- Account response
- Transaction list response
- Dashboard summary response
- Error response

### Form schemas

Validate frontend form state.

Examples:

- Registration
- Login
- Account creation
- Transaction creation
- Budget editing
- Settings

### Domain schemas

Represent reusable validated values.

Examples:

- Currency code
- Monetary amount
- Account type
- Transaction type
- Budget month
- Pagination values

## Proposed Schema Organization

A possible shared structure is:

```text
packages/
└── contracts/
    └── src/
        ├── accounts/
        ├── authentication/
        ├── budgets/
        ├── dashboard/
        ├── transactions/
        ├── common/
        └── index.ts
```

If Steward does not use a monorepo or shared package, backend and frontend schemas may remain within their respective applications.

A possible backend structure is:

```text
src/
├── modules/
│   ├── accounts/
│   │   └── account.schemas.ts
│   ├── transactions/
│   │   └── transaction.schemas.ts
│   └── budgets/
│       └── budget.schemas.ts
└── shared/
    └── schemas/
```

A possible frontend structure is:

```text
src/
├── features/
│   ├── accounts/
│   │   └── schemas/
│   ├── transactions/
│   │   └── schemas/
│   └── budgets/
│       └── schemas/
└── lib/
    └── validation/
```

The final organization will be determined during the Application Architecture epic.

## Shared Contracts

Schemas may be shared between the frontend and backend when they represent stable API contracts.

Good candidates include:

- Request payloads
- Response payloads
- Pagination
- Filter values
- Common error responses
- Supported enums

Shared schemas should not expose:

- Drizzle table definitions
- Better Auth internals
- Database-only fields
- Server configuration
- Secret values
- Backend service types

The frontend should depend on public API contracts rather than backend implementation details.

## Fastify Integration

Fastify should use `fastify-type-provider-zod`.

The Fastify application should register:

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

The exact setup should match the installed versions.

## Fastify Route Schemas

Each route should define Zod schemas for the relevant HTTP boundaries.

Possible route schema fields include:

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

Fastify should validate input before the handler runs.

Handlers should receive typed, validated values.

## Request Validation

Fastify routes should validate:

- Path parameters
- Query parameters
- Request bodies
- Required headers where applicable

Examples include:

```text
POST /api/accounts
→ Validate request body

GET /api/accounts/:accountId
→ Validate accountId route parameter

GET /api/transactions
→ Validate filters, sorting, and pagination

PATCH /api/budgets/:budgetId
→ Validate route parameter and update body
```

Invalid input should not reach application services.

## Response Validation

Fastify response schemas should be defined where practical.

Response schemas help ensure that:

- Handlers return the documented shape
- Internal database fields are not leaked
- API contracts remain stable
- Unexpected response values are detected
- Route types remain aligned with runtime behavior

Drizzle records should be mapped into response objects that satisfy the appropriate Zod schema.

## Response Serialization

Zod response schemas should be connected to Fastify’s serializer compiler.

The application should account for the difference between:

- Schema input values
- Schema output values
- Values transformed by Zod

When a schema transforms data, the response type should represent the transformed output.

## Validation and Business Rules

Zod should validate structure and local field rules.

Examples include:

- Required fields
- String lengths
- UUID formats
- Date formats
- Enum values
- Numeric limits
- Password confirmation
- Pagination bounds

Application services should validate business and database-backed rules.

Examples include:

- Whether an account belongs to the authenticated user
- Whether a category exists
- Whether an email is already registered
- Whether a budget already exists for a month
- Whether an account may be archived
- Whether a transaction can be deleted
- Whether a demo reset is allowed

Zod validation should not perform database queries.

## Asynchronous Validation

Database checks and other asynchronous operations should not run inside initial route validation.

The expected flow is:

```text
Zod validates request structure
→ Fastify authentication runs
→ Application service performs database-backed checks
→ Drizzle performs the operation
```

This keeps input parsing predictable and separates structural validation from business logic.

## Transformations

Zod transformations may be used when a value has one clear canonical representation.

Examples include:

- Trimming text input
- Normalizing optional empty strings
- Parsing validated date strings
- Converting pagination strings to numbers
- Normalizing currency codes
- Converting validated monetary input into minor units

Transformations should remain explicit.

Schemas should not hide substantial business behavior.

## Coercion

Coercion may be useful for URL and form values, which commonly arrive as strings.

Examples include:

```ts
z.coerce.number().int().positive();
z.coerce.boolean();
z.coerce.date();
```

Coercion should only occur when the accepted input behavior is deliberate.

Unexpected values should fail rather than being silently converted into misleading results.

## Monetary Validation

Frontend monetary inputs may be entered as formatted decimal strings.

The application should validate:

- Required value
- Valid decimal format
- Supported precision
- Allowed sign
- Minimum and maximum values

The value should be converted into the canonical database representation before persistence.

The conversion should be tested carefully to avoid floating-point rounding errors.

## Date Validation

Date schemas should distinguish between:

- Date-only business values
- Full timestamps
- Budget months
- Display-formatted dates

A transaction date should not automatically be treated as a timestamp when time-of-day is irrelevant.

Budget month input should require a valid year and month.

## Enum Validation

Supported values should be represented through reusable schemas.

Examples include:

```ts
const accountTypeSchema = z.enum([
  "checking",
  "savings",
  "credit_card",
  "cash",
  "loan",
  "investment",
]);
```

Enums should remain aligned with:

- PostgreSQL constraints
- Drizzle schema definitions
- API responses
- Frontend controls
- Documentation

## Pagination Schema

Pagination should use a reusable schema.

Conceptually:

```ts
const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});
```

The API should enforce a maximum page size.

## Sorting Schema

Sort fields and directions should use explicit allowlists.

Conceptually:

```ts
const transactionSortSchema = z.enum([
  "date-desc",
  "date-asc",
  "amount-desc",
  "amount-asc",
]);
```

Client-provided strings must not be inserted directly into database ordering expressions.

## Error Format

Zod validation errors should be translated into Steward’s standard error response.

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The submitted data is invalid.",
    "details": {
      "fields": {
        "amount": ["Enter a valid amount."],
        "date": ["Enter a valid date."]
      }
    }
  }
}
```

The frontend should not depend on Zod’s raw internal issue representation.

Fastify should convert validation failures into the stable Steward error contract.

## Error Messages

User-facing validation messages should be:

- Clear
- Concise
- Specific
- Non-technical
- Attached to the relevant field where possible

Avoid messages such as:

```text
Expected string, received undefined
```

Prefer:

```text
Account name is required.
```

Internal logs may contain more technical context when it does not expose sensitive values.

## Frontend Form Validation

Frontend forms should use Zod schemas for:

- Field validation
- Form-level validation
- Cross-field validation
- Submission parsing
- Type inference

Examples of cross-field validation include:

- Password and confirmation must match
- Transfer accounts must differ
- Date range start must not be after end
- Budget allocation totals must satisfy defined rules

The final form library should integrate with Zod rather than introducing a separate validation model.

## Server Validation Remains Required

Frontend validation improves usability but is not trusted for security or data integrity.

Every request must still be validated by Fastify and Zod on the server.

The backend must assume that requests may come from:

- Modified frontend code
- Browser developer tools
- Scripts
- Direct HTTP clients
- Malicious clients

## TanStack Router Search Validation

TanStack Router search parameters should use Zod-backed validation where appropriate.

Examples include:

- Transaction filters
- Search text
- Page number
- Sort order
- Account filters
- Category filters
- Date ranges

Invalid URL values should resolve to safe defaults or a clear route-level validation state.

Feature components should receive parsed values rather than raw strings.

## Environment Validation

Backend environment variables should be parsed with a Zod schema during startup.

Possible values include:

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

The application should fail startup when required configuration is missing or invalid.

Frontend environment variables should also be validated.

Possible values include:

```text
VITE_API_URL
VITE_APP_ENV
```

Frontend environment schemas must never contain secret server values.

## API Response Parsing

The frontend may parse API responses with Zod at important boundaries.

This is most useful when:

- The response originates outside Steward
- Runtime contract verification is important
- Data is cached for long periods
- Contract drift would otherwise fail silently

Parsing every internal response twice may be unnecessary.

The final API-client strategy should balance confidence and runtime overhead.

## Imported Data

Future CSV or file imports should use Zod after raw parsing.

The import flow should distinguish between:

- File-format errors
- Missing required columns
- Invalid row values
- Unsupported account references
- Duplicate transactions
- Business-rule failures

Import schemas should not be added until the import feature is approved.

## Authentication Validation

Better Auth remains responsible for validating its own authentication endpoint payloads.

Steward may use Zod for:

- Login form state
- Registration form state
- Password confirmation
- Demo-login requests
- Authentication-related frontend input
- Application-owned authentication endpoints

Steward should not duplicate or override Better Auth’s internal credential validation unnecessarily.

## Schema Composition

Schemas should be composed from reusable primitives.

Conceptually:

```ts
const idSchema = z.string().uuid();
const nameSchema = z.string().trim().min(1).max(100);

const financialAccountSchema = z.object({
  id: idSchema,
  name: nameSchema,
});
```

Reusable schemas should represent actual shared concepts rather than being created for every repeated primitive.

## Partial Update Schemas

Update schemas should be defined intentionally.

Using `.partial()` may be appropriate, but the resulting schema must still enforce:

- At least one accepted field
- Fields that cannot be changed
- Cross-field invariants
- Empty-string normalization
- Business restrictions

Update input should not accept database-managed fields such as:

- ID
- User ID
- Created timestamp
- Updated timestamp
- Ownership fields

## Unknown Fields

Request schemas should define how unknown fields are handled.

For API input, unexpected fields should normally be rejected or stripped according to one consistent policy.

Sensitive operations should avoid silently accepting arbitrary properties.

The selected behavior should be tested and documented.

## Schema Naming

Schema names should describe their purpose.

Examples:

```text
createAccountBodySchema
updateAccountBodySchema
accountResponseSchema
transactionQuerySchema
transactionListResponseSchema
```

Avoid one ambiguous schema being reused for creation, persistence, and response when those shapes differ.

## Schema Versioning

The MVP does not require formal schema versions.

When an API contract changes:

1. Update the Zod schema.
2. Update the implementation.
3. Update affected frontend usage.
4. Update tests.
5. Update documentation.

Formal API versioning should only be introduced when external compatibility requires it.

## Testing

Validation tests should cover:

- Valid input
- Missing required values
- Invalid types
- Invalid formats
- Boundary values
- Unknown fields
- Transformations
- Coercion behavior
- Cross-field refinements
- Error formatting

Critical schemas should have direct unit tests.

Fastify integration tests should verify that invalid requests are rejected before handlers or database operations run.

## Non-Goals

The initial validation architecture will not use:

- Joi
- Yup
- Valibot
- TypeBox
- Multiple competing validation libraries
- Handwritten validation for every route
- TypeScript types as runtime validation
- Database queries inside Zod refinements
- Client-side validation as a security boundary

## Success Criteria

The validation architecture is successful when:

- Zod validates data at application boundaries.
- Fastify routes receive typed validated input.
- Response schemas prevent accidental data exposure.
- Frontend forms use the same validation model.
- TanStack Router search state is parsed predictably.
- Environment configuration fails safely when invalid.
- Validation errors use a consistent client-facing format.
- Business rules remain separate from structural parsing.
- Schema definitions do not duplicate unrelated TypeScript types.
