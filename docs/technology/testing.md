# Testing

## Decision

Steward will use a layered testing strategy built around Vitest, React Testing Library, Fastify request injection, PostgreSQL Testcontainers, and Playwright.

The selected testing technologies are:

- Vitest
- React Testing Library
- `@testing-library/user-event`
- `@testing-library/jest-dom`
- jsdom
- Fastify `inject()`
- Testcontainers for Node.js
- PostgreSQL Testcontainer
- Playwright
- `@vitest/coverage-v8`

Vitest will be the primary test runner for:

- Frontend unit tests
- React component tests
- Backend unit tests
- Fastify integration tests
- Drizzle integration tests
- Shared-contract tests
- Zod schema tests
- Coverage reporting

Playwright will provide browser-based end-to-end testing.

## Goals

The testing strategy should provide confidence that:

- Financial calculations are correct.
- Monetary values are handled safely.
- Date and budget logic behaves predictably.
- Zod schemas accept and reject the correct values.
- React interfaces behave as users expect.
- shadcn/ui components are composed accessibly.
- TanStack Router behavior is predictable.
- Fastify routes validate requests and responses.
- Better Auth protects authenticated operations.
- Authorization and ownership rules are enforced.
- Drizzle queries work against PostgreSQL.
- PostgreSQL constraints protect stored data.
- Database migrations produce a valid schema.
- Critical workflows work in a real browser.
- The Vercel frontend communicates correctly with the Railway API.
- Production deployments are blocked when required tests fail.

## Testing Principles

Steward tests should:

- Focus on observable behavior.
- Use the appropriate testing layer.
- Avoid unnecessary mocking.
- Remain deterministic.
- Remain independent.
- Use clear test data.
- Produce useful failure messages.
- Exercise real integration boundaries where practical.
- Avoid testing implementation details without a clear reason.
- Protect high-risk financial, authentication, and ownership logic.

The goal is not to maximize the number of tests.

The goal is to maintain confidence that important behavior works correctly.

## Testing Layers

Steward will use four primary testing layers:

```text
Unit tests
        ↓
Component tests
        ↓
Backend and database integration tests
        ↓
End-to-end tests
```

Each layer has a separate responsibility.

## Unit Tests

Unit tests verify isolated deterministic logic.

Examples include:

- Zod schemas
- Currency conversion
- Monetary parsing
- Budget calculations
- Date parsing
- Pagination parsing
- Sort allowlists
- Response mapping
- Financial formatting
- Environment validation
- Error translation
- Authorization-policy helpers
- Theme-value parsing

Unit tests should be:

- Fast
- Focused
- Easy to understand
- Independent from infrastructure
- Free from unnecessary framework setup

## Component Tests

Component tests verify React behavior in a simulated browser DOM.

Examples include:

- Forms
- Dialogs
- Tables
- Filters
- Search controls
- Error states
- Loading states
- Empty states
- Theme controls
- Responsive navigation behavior
- shadcn/ui component composition
- TanStack Router integrations

Component tests should verify what a user can:

- See
- Read
- Select
- Enter
- Submit
- Navigate
- Dismiss
- Confirm

They should avoid testing private React state or component implementation details.

## Integration Tests

Integration tests verify that multiple application layers work together.

Examples include:

- Fastify request lifecycle
- Zod request validation
- Zod response serialization
- Better Auth session validation
- Authentication hooks
- Authorization rules
- Application services
- Drizzle queries
- PostgreSQL constraints
- Transaction boundaries
- Error mapping
- Database migrations

Integration tests should exercise real infrastructure where that behavior is important.

Steward database integration tests will use real PostgreSQL rather than SQLite or a database mock.

## End-to-End Tests

End-to-end tests verify complete workflows in a real browser.

Examples include:

- Registration
- Login
- Logout
- Session persistence
- Protected-route navigation
- Account creation
- Transaction creation
- Transaction editing
- Transaction deletion
- Budget creation
- Budget editing
- Demo-data reset
- Direct navigation to nested routes
- Cross-origin frontend-to-backend communication

End-to-end tests should remain focused on critical workflows.

They should not be used to test every validation rule or minor component state.

## Test Distribution

Steward should generally use:

```text
Many unit tests
Moderate component tests
Moderate backend integration tests
A smaller number of end-to-end tests
```

A likely distribution is:

```text
Vitest unit tests
├── Zod schemas
├── Financial utilities
├── Date utilities
├── Service logic
├── Environment parsing
└── Response mapping

React component tests
├── Forms
├── Dialogs
├── Filters
├── Tables
├── Empty states
├── Loading states
└── Error states

Backend integration tests
├── Fastify routes
├── Better Auth
├── Authorization
├── Drizzle queries
├── PostgreSQL constraints
└── Transactions

Playwright tests
└── Critical complete user journeys
```

## Primary Test Runner

Vitest will be Steward's primary test runner.

Vitest will be used for:

- Frontend unit tests
- React component tests
- Backend unit tests
- Fastify integration tests
- Database integration tests
- Shared-contract tests
- Zod schema tests
- Coverage reporting

Using one primary runner reduces:

- Duplicated configuration
- Conflicting assertion behavior
- Different test conventions
- Unnecessary dependencies
- Maintenance overhead

## Vitest Environments

Tests should use the environment appropriate to the code under test.

### Node environment

Use the Node environment for:

- Fastify
- Drizzle
- PostgreSQL integration
- Better Auth integration
- Application services
- Shared utilities
- Zod schemas
- Environment parsing
- Migration helpers
- Server error mapping

### jsdom environment

Use jsdom for:

- React components
- Form interactions
- Browser-storage utilities
- Theme controls
- Client-side routing behavior
- DOM accessibility assertions
- Components that depend on browser APIs

The repository may use:

- Separate Vitest configuration files
- Vitest workspace projects
- File-level environment annotations

The final configuration depends on the selected repository structure.

## Suggested Repository Organization

A likely monorepo structure is:

```text
steward/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   ├── tests/
│   │   └── vitest.config.ts
│   └── api/
│       ├── src/
│       ├── tests/
│       └── vitest.config.ts
├── packages/
│   └── contracts/
│       ├── src/
│       ├── tests/
│       └── vitest.config.ts
├── e2e/
│   ├── fixtures/
│   ├── pages/
│   ├── tests/
│   └── playwright.config.ts
└── package.json
```

Tests may also be colocated with source files.

Example:

```text
transaction.service.ts
transaction.service.test.ts
```

Both approaches are acceptable.

The project should use one consistent convention within each application or package.

## Test File Naming

Vitest tests should generally use:

```text
*.test.ts
*.test.tsx
```

Playwright tests should generally use:

```text
*.spec.ts
```

Examples include:

```text
transaction.schema.test.ts
budget.service.test.ts
transaction-form.test.tsx
authentication.spec.ts
budget-workflow.spec.ts
```

## Test Naming

Test names should describe behavior and expected results.

Prefer:

```text
rejects a transfer when both accounts are the same
```

Avoid:

```text
test transfer
```

Prefer:

```text
returns 401 when the session cookie is missing
```

Avoid:

```text
auth test 1
```

A test name should make a failure understandable before the test body is inspected.

## Arrange, Act, Assert

Tests should generally follow a clear structure:

```text
Arrange
→ Create required state

Act
→ Perform the behavior

Assert
→ Verify the result
```

The test does not need explicit comments for each stage when the structure is already obvious.

## Financial Logic Testing

Financial logic requires strong test coverage.

Tests should cover:

- Positive amounts
- Negative amounts
- Zero
- Large values
- Decimal input
- Rounding
- Transfers
- Budget remaining
- Overspending
- Income totals
- Expense totals
- Account balances
- Credit balances
- Archived accounts
- Empty datasets

Example cases:

```text
Budget: $500.00
Spent: $372.18
Remaining: $127.82
```

```text
Budget: $200.00
Spent: $245.00
Remaining: -$45.00
```

Tests should verify that authoritative financial calculations do not lose precision through unsafe floating-point arithmetic.

## Monetary Parsing Tests

Monetary-input tests should cover:

- Whole dollar values
- Decimal values
- Two decimal places
- Leading and trailing whitespace
- Negative values where supported
- Positive values
- Zero
- Large values
- Invalid characters
- Too many decimal places
- Empty strings
- Currency symbols where accepted
- Thousands separators where accepted

Examples include:

```text
"10"
→ 1000 minor units
```

```text
"10.25"
→ 1025 minor units
```

```text
"10.999"
→ rejected
```

The exact accepted input behavior must match the approved validation schemas.

## Date Testing

Date tests should distinguish between:

- Date-only transaction values
- Full timestamps
- Budget months
- Display-formatted dates
- Time-zone-aware values

Tests should avoid depending on the real current date.

Use:

- Explicit dates
- Controlled clocks
- Seeded timestamps
- Stable time zones

Important cases include:

- Month boundaries
- Year boundaries
- Leap years
- Daylight-saving transitions where timestamps matter
- UTC conversion
- Local-date display
- Date-only persistence

## Budget Testing

Budget logic tests should cover:

- Empty budgets
- Budget creation
- Category allocation
- Total assigned amount
- Unassigned amount
- Spending totals
- Remaining amount
- Overspending
- Zero-dollar categories
- Deleted categories
- Archived categories
- Month changes
- Copied budgets
- Invalid allocations

Preview calculations in the frontend and authoritative calculations in the backend should be tested against the same expected outcomes.

## Transfer Testing

Transfer behavior should be tested carefully.

Tests should verify:

- Source and destination accounts differ.
- Both accounts belong to the user.
- Both sides of the transfer are created where applicable.
- Related records remain linked.
- Partial failure rolls back the complete operation.
- Editing a transfer preserves consistency.
- Deleting a transfer handles both sides correctly.
- Transfers do not count as income or expense unless explicitly intended.

## Zod Schema Testing

Critical Zod schemas should have direct unit tests.

Tests should cover:

- Valid input
- Missing required values
- Invalid types
- Invalid formats
- Minimum values
- Maximum values
- Unknown fields
- Defaults
- Coercion
- Transformations
- Cross-field validation
- Empty-string normalization
- Input and output differences

Important schemas include:

- Registration
- Login
- Account creation
- Account update
- Transaction creation
- Transaction update
- Budget creation
- Budget update
- Pagination
- Filters
- Route parameters
- Environment variables
- Standard API errors

## Environment Validation Testing

Frontend and backend environment schemas should be tested.

### Frontend environment

Possible values include:

```text
VITE_API_URL
VITE_APP_ENV
```

Tests should cover:

- Valid API URL
- Missing API URL
- Invalid URL
- Supported environment values
- Unsupported environment values

### Backend environment

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

Tests should verify that:

- Required values are enforced.
- Invalid values prevent startup.
- Secrets are not printed in error messages.
- Port coercion behaves correctly.
- Origin lists are parsed predictably.

## React Component Testing Stack

React component tests will use:

- Vitest
- React Testing Library
- `@testing-library/user-event`
- `@testing-library/jest-dom`
- jsdom

## React Testing Library Principles

React Testing Library tests should resemble how users interact with the interface.

Prefer queries such as:

- `getByRole`
- `getByLabelText`
- `getByText`
- `findByRole`
- `findByText`

Avoid selecting elements primarily through:

- CSS classes
- Tailwind utility classes
- DOM structure
- Component names
- Private implementation state
- Generated identifiers

Test IDs may be used when no meaningful accessible query exists.

## User Interaction Testing

`@testing-library/user-event` should be used for most interactions.

Examples include:

- Typing
- Clicking
- Selecting options
- Tabbing
- Keyboard navigation
- Checking checkboxes
- Choosing radio buttons
- Uploading files when imports are implemented

A typical test should create a user instance:

```ts
const user = userEvent.setup();
```

Interactions should generally be awaited:

```ts
await user.click(button);
await user.type(input, "Grocery Store");
```

`fireEvent` should be reserved for lower-level events that cannot reasonably be represented through `user-event`.

## DOM Assertions

`@testing-library/jest-dom` should provide readable DOM assertions.

Examples include:

```ts
expect(button).toBeDisabled();
expect(dialog).toBeVisible();
expect(input).toHaveAccessibleName("Amount");
expect(error).toHaveTextContent("Enter a valid amount.");
expect(form).toHaveFormValues({
  description: "Grocery Store",
});
```

The package name includes `jest`, but the matchers can be configured for Vitest.

## Component Test Setup

The frontend should have a shared test setup file.

It may configure:

- `@testing-library/jest-dom`
- Automatic cleanup
- Required browser API mocks
- Stable time-zone behavior
- Console-error handling
- Environment defaults

The setup should remain minimal.

Global mocks should not hide important behavior or make individual tests difficult to understand.

## Custom Render Utility

The frontend should provide a shared rendering helper when components require application providers.

Conceptually:

```text
renderWithProviders
├── TanStack Router
├── Server-state provider
├── Authentication state
├── Theme state
└── Application configuration
```

The helper should allow tests to customize:

- Initial route
- Authentication state
- Query data
- API behavior
- Theme
- Feature flags if later introduced

The helper should not silently include production services.

## shadcn/ui Testing

Steward does not need to retest the complete internal implementation of every unchanged shadcn/ui primitive.

Tests should verify how Steward composes those primitives.

Examples include:

- A dialog opens from the correct trigger.
- Focus moves into the dialog.
- Escape closes a dismissible dialog.
- A confirmation dialog performs the correct action.
- Select controls update form state.
- Tabs expose the correct content.
- Dropdown actions are keyboard accessible.
- Sheet navigation works on mobile.
- Error messages are associated with fields.
- Disabled controls cannot be activated.
- Destructive actions require confirmation.

Tests should not assert specific Tailwind class names unless those classes represent a requirement that cannot be verified through behavior.

## Form Testing

Important forms should test:

- Initial state
- Required fields
- Invalid values
- Boundary values
- Cross-field validation
- Successful submission
- Submission loading state
- Duplicate-submission prevention
- Server validation errors
- Authentication errors
- Conflict errors
- Preservation of valid input after failure
- Reset behavior
- Accessible labels
- Accessible error descriptions
- Keyboard submission

Forms include:

- Login
- Registration
- Account creation
- Account editing
- Transaction creation
- Transaction editing
- Budget creation
- Budget allocation
- Settings

## Login Form Tests

Login form tests should verify:

- Email is required.
- Password is required.
- Invalid email format is rejected.
- Submit is disabled or guarded during submission.
- Invalid credentials show a clear error.
- The password remains protected.
- Successful login navigates correctly.
- Demo login invokes the intended flow.
- Keyboard submission works.
- Errors are accessible.

## Registration Form Tests

Registration form tests should verify:

- Name is required where applicable.
- Email format is validated.
- Password rules are displayed and enforced.
- Password confirmation must match.
- Duplicate-email errors are shown.
- Successful registration establishes the intended session.
- Valid input remains after recoverable server errors.

## Account Form Tests

Account form tests should verify:

- Account name is required.
- Account type must be supported.
- Starting balance is parsed correctly.
- Credit and loan balances follow the selected sign convention.
- Submission loading state is shown.
- Server errors are displayed.
- Successful creation closes or navigates appropriately.
- Editing loads the current values.

## Transaction Form Tests

Transaction form tests should verify:

- Transaction type is required.
- Account is required.
- Amount is required.
- Invalid monetary input is rejected.
- Description rules are enforced.
- Date rules are enforced.
- Category behavior matches transaction type.
- Transfer accounts must differ.
- Server errors are displayed.
- Successful submission invalidates or refreshes the correct data.

## Budget Form Tests

Budget form tests should verify:

- Budget month is valid.
- Income input is parsed correctly.
- Category allocations are valid.
- Assigned and unassigned totals update.
- Overspending states are displayed.
- Duplicate monthly budgets are handled.
- Copy-from-previous behavior works where implemented.
- Save errors preserve entered values.

## Router Testing

TanStack Router tests should cover:

- Public route access
- Protected-route redirects
- Authenticated route access
- Search-parameter defaults
- Invalid search values
- Nested layouts
- Not-found behavior
- Route error states
- Navigation after mutations
- Return destinations after login
- Budget month routing
- Account detail routing
- Transaction detail routing

Frontend routing tests do not replace backend authorization tests.

## Search Parameter Tests

Transaction and budget search-state tests should cover:

- Search text
- Account filter
- Category filter
- Transaction type
- Date range
- Sort value
- Page
- Page size
- Budget year
- Budget month
- Invalid UUID values
- Invalid enum values
- Invalid numeric values
- Safe defaults

Tests should confirm that navigation and browser history preserve URL-backed state.

## Theme Testing

Theme tests should cover:

- Light theme
- Dark theme
- System preference
- Persisted selection
- Invalid stored values
- Theme-toggle keyboard behavior
- Initial render without incorrect flashing where practical

It is not necessary to duplicate every component test in every theme.

Representative visual or end-to-end tests may cover both themes later.

## Responsive Testing

Component tests should verify major responsive behavior where practical.

Playwright should test representative viewport sizes.

Suggested viewports include:

- Mobile
- Desktop

Examples include:

- Sidebar becomes a sheet.
- Mobile navigation opens and closes.
- Transaction tables remain usable.
- Budget content remains understandable.
- Dialogs fit within the viewport.
- Primary actions remain reachable.
- Filters move into a mobile sheet.
- Page headers stack correctly.

## Frontend API Mocking

Component tests should not depend on a live Railway API.

API behavior may be controlled through:

- Test doubles at the API-client boundary
- Mock Service Worker if selected during implementation
- Server-state library test utilities
- Dependency injection where appropriate

The project should avoid mocking low-level `fetch` separately in every component test.

Mocking should remain close to the application's API abstraction.

## API Contract Tests

Shared API contracts should be tested independently.

Tests may verify:

- Request schemas
- Response schemas
- Error schemas
- Pagination schemas
- Filter schemas
- Public enums
- Transformations
- Backward-compatible changes where required

The frontend and backend should consume the same shared contract where appropriate rather than maintaining unrelated duplicate definitions.

## Backend Application Factory

The Fastify application must be created through an application factory.

Conceptually:

```text
app.ts
→ Build and configure Fastify
→ Return the application

server.ts
→ Build the application
→ Open the network listener
```

Tests should use the application factory without opening a port.

This allows integration tests to exercise the real application configuration with Fastify `inject()`.

## Fastify Integration Testing

Fastify integration tests will use:

```text
Vitest
+
Fastify inject()
```

Conceptually:

```ts
const app = await buildApp(testDependencies);

const response = await app.inject({
  method: "POST",
  url: "/api/accounts",
  payload: {
    name: "Everyday Checking",
    type: "checking",
  },
});

expect(response.statusCode).toBe(201);

await app.close();
```

## Why Fastify `inject()`

Fastify request injection exercises:

- Route registration
- Request validation
- Response serialization
- Hooks
- Decorators
- Authentication
- Error handling
- Status codes
- Headers
- Cookies
- Plugin lifecycle

It does not require listening on a TCP port.

This makes backend integration tests faster and more isolated than tests that start a real server for every case.

## Fastify Route Test Coverage

Route tests should verify:

- Correct HTTP status
- Correct response body
- Correct response headers
- Correct cookies where relevant
- Zod request rejection
- Response-schema compliance
- Authentication requirements
- Authorization behavior
- Ownership enforcement
- Conflict behavior
- Missing-resource behavior
- Database constraint translation
- Database side effects
- Stable error formatting

Examples include:

```text
Unauthenticated request
→ 401
```

```text
Invalid request body
→ 400 VALIDATION_ERROR
```

```text
Request for another user's account
→ 404 or 403 according to the selected policy
```

```text
Valid account creation
→ 201
```

## Authentication Test Helpers

Integration tests will need safe helpers for authentication.

Possible helpers include:

- Register a test user through Better Auth
- Create a valid session
- Extract the session cookie
- Build authenticated request headers
- Create an expired session
- Create multiple isolated users

Tests should prefer using Steward's configured Better Auth integration rather than manually inventing session records unless a lower-level test specifically requires it.

## Better Auth Testing

Authentication tests should cover:

- Registration
- Login
- Invalid credentials
- Session creation
- Session validation
- Protected endpoints
- Logout
- Expired sessions
- Invalid sessions
- Cookie handling
- User ownership
- Demo-user restrictions
- Trusted-origin behavior where practical

Steward should not recreate Better Auth's entire internal test suite.

Tests should verify Steward's configuration and integration.

## Authorization Testing

Every protected resource should have ownership tests.

Resources include:

- Accounts
- Transactions
- Categories
- Budgets
- Budget allocations
- User preferences
- Demo data

At minimum, test:

```text
Owner can read.
Owner can update.
Owner can delete where allowed.
Another user cannot read.
Another user cannot update.
Another user cannot delete.
```

Authorization tests should derive user identity from the authenticated session.

They should not trust user IDs supplied by the request.

## Resource Concealment Tests

Steward should choose a consistent policy for resources owned by another user.

Possible responses include:

- `404 Not Found`
- `403 Forbidden`

Once selected, tests should verify that policy consistently.

The response must not leak whether a resource belonging to another user exists unless the product explicitly requires that knowledge.

## Error Contract Testing

The API should return one stable error shape.

Conceptually:

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

Tests should cover:

- Validation errors
- Authentication errors
- Authorization errors
- Missing resources
- Conflicts
- Database constraint violations
- Unexpected errors

Raw Zod, Drizzle, PostgreSQL, and Better Auth internals should not become the public error contract.

## Database Integration Testing

Database integration tests must use PostgreSQL.

Steward should not substitute SQLite for PostgreSQL tests.

PostgreSQL-specific behavior includes:

- Foreign keys
- Unique constraints
- Transactions
- PostgreSQL data types
- Index behavior
- Drizzle PostgreSQL queries
- Better Auth tables
- Migration behavior
- Constraint errors
- Date and timestamp behavior

## Testcontainers

Testcontainers for Node.js will provide disposable PostgreSQL instances for integration tests.

Conceptually:

```text
Start PostgreSQL container
→ Obtain connection URL
→ Run Drizzle migrations
→ Seed minimum test data
→ Run tests
→ Stop container
```

The PostgreSQL Testcontainer should be used for:

- Drizzle query tests
- Fastify integration tests
- Migration tests
- Better Auth integration tests
- Transaction-boundary tests
- Constraint tests
- Ownership tests

## PostgreSQL Image Version

The PostgreSQL container image should use a pinned major and minor version where practical.

The selected test version should remain compatible with the Railway production PostgreSQL version.

When production PostgreSQL changes, the test image should be reviewed and updated.

## Test Database Lifecycle

A test run may use one PostgreSQL container per:

- Integration-test project
- Vitest worker
- CI job
- Test suite

The initial implementation should prefer one isolated container per integration-test project rather than starting a new container for every individual test.

Each test must still begin with predictable data.

## Database Setup Flow

A typical integration setup is:

```text
Start Testcontainer
→ Create PostgreSQL connection pool
→ Create Drizzle client
→ Apply committed migrations
→ Initialize application
→ Run tests
→ Close Fastify
→ Close connection pool
→ Stop container
```

Cleanup must occur even when tests fail.

## Database Isolation

Tests must remain independent.

Isolation may be achieved through:

- Truncating application tables between tests
- Database transactions that roll back
- Creating unique users and records
- Recreating schemas between suites
- Separate databases per worker
- Separate schemas per worker

The selected strategy must work with:

- Drizzle
- Better Auth
- PostgreSQL connection pooling
- Parallel execution
- Transaction tests

Tests must not depend on execution order.

## Transaction Rollback Strategy

Wrapping each test in a database transaction can be useful, but it may conflict with:

- Application-created transactions
- Better Auth connection behavior
- Multiple database connections
- Tests that explicitly verify commits or rollbacks

The project should not adopt a transaction-per-test strategy until it is proven compatible with the application architecture.

Table cleanup or worker-specific schemas may be simpler.

## Migration Testing

Integration setup should apply committed Drizzle migrations.

Tests should verify that:

- A clean database can apply all migrations.
- Migrations apply in the correct order.
- The resulting schema supports current queries.
- Required constraints exist.
- Required indexes exist where important.
- Better Auth tables are available.
- Seed operations work after migration.
- The current application can start against the migrated schema.

Tests should not rely exclusively on direct schema synchronization.

Production deployment uses migrations, so integration tests should exercise migrations.

## Migration Failure Testing

Where practical, migration tooling tests should verify:

- Missing environment configuration fails clearly.
- Invalid database URLs fail clearly.
- Connection cleanup occurs after failure.
- A failed migration exits unsuccessfully.
- Migrations are not silently skipped.

Destructive migration testing should occur only in disposable test databases.

## Drizzle Query Testing

Drizzle query tests should verify:

- Inserts
- Reads
- Updates
- Deletes
- Joins
- Filtering
- Sorting
- Pagination
- Aggregation
- Ownership conditions
- Archived records
- Deterministic ordering
- Transaction behavior

Important ownership cases include:

```text
User A cannot read User B's account.
User A cannot update User B's transaction.
User A cannot delete User B's budget.
```

## Query Ordering Tests

Queries that return lists should use deterministic ordering.

Tests should verify:

- Primary sort
- Secondary sort where ties are possible
- Ascending behavior
- Descending behavior
- Unsupported sort values are rejected
- Pagination remains stable

Transaction lists may require a secondary order such as record ID or creation timestamp when multiple transactions share the same date.

## Pagination Testing

Pagination tests should cover:

- Default page
- Default page size
- Minimum page
- Maximum page size
- Empty pages
- Final partial page
- Invalid values
- Stable ordering
- Total count
- Filtered count

Tests should verify both API response metadata and returned records.

## Filtering Tests

Transaction filtering tests should cover:

- Search text
- Account
- Category
- Transaction type
- Start date
- End date
- Amount range
- Multiple combined filters
- No matches
- User ownership
- Archived accounts where relevant

Client-provided values must not be inserted directly into SQL expressions.

## Constraint Testing

PostgreSQL constraint tests should cover:

- Required fields
- Foreign keys
- Unique constraints
- Supported enum values
- Valid ownership relationships
- Delete behavior
- Monetary storage rules
- Date storage rules
- Better Auth relationships

Database constraints should be tested even when Zod validates the same rule.

Each layer protects a different boundary.

## Transaction Testing

Use real PostgreSQL transactions for multi-record workflows such as:

- Account transfers
- Budget creation with allocations
- Demo-data reset
- Batch imports when introduced
- Multi-record deletion
- Related transaction updates

Tests should deliberately trigger a failure after part of the workflow and verify that the complete operation rolls back.

## Seed Testing

Seed commands should be tested against disposable PostgreSQL instances.

Tests should verify:

- Seed execution succeeds.
- Required records are created.
- Repeated execution is safe where idempotence is expected.
- Regular user data is not overwritten.
- Demo data is scoped correctly.
- Secrets are not embedded in seed output.

Production startup should not automatically run broad seed operations.

## Demo Reset Testing

Demo reset tests should verify:

- Only the demo user can reset demo data.
- Normal users cannot invoke the reset.
- Existing demo records are removed or restored correctly.
- New demo records are recreated.
- The reset occurs inside a transaction.
- Partial failures roll back.
- Authentication records are preserved or reset according to the selected design.
- Other users remain unaffected.

## End-to-End Testing with Playwright

Playwright will provide browser-level end-to-end tests.

Playwright tests should exercise the deployed-style architecture:

```text
Browser
→ React and Vite frontend
→ Fastify API
→ PostgreSQL test database
```

The exact local startup process may use:

- Playwright `webServer`
- A dedicated end-to-end script
- Prebuilt frontend and backend processes
- Test-specific environment files

## Playwright Browser Strategy

The initial required CI suite should run primarily in Chromium.

A broader compatibility suite may later include:

- Firefox
- WebKit

Running every test against every browser during early development may unnecessarily slow CI.

A smaller cross-browser smoke suite may be added as the application approaches launch.

## Critical Playwright Flows

The initial Playwright suite should cover:

1. Register a user.
2. Log in.
3. Log out.
4. Access a protected route.
5. Create a financial account.
6. Edit a financial account.
7. Archive an account.
8. Create an expense transaction.
9. Create an income transaction.
10. Create a transfer.
11. Edit a transaction.
12. Delete a transaction.
13. Create a monthly budget.
14. Update a budget category.
15. Navigate between budget months.
16. Reset demo data.
17. Refresh a protected nested route.
18. Confirm session persistence.
19. Confirm unauthenticated redirection.
20. Confirm direct Vite SPA navigation works.

The suite should remain focused on high-value workflows.

## Playwright Locators

Playwright tests should prefer user-facing locators:

- `getByRole`
- `getByLabel`
- `getByText`
- `getByPlaceholder`
- `getByTitle`

Avoid:

- Long CSS selectors
- XPath
- Generated class names
- Tailwind utility classes
- Fragile DOM chains

Test IDs should be used only when a meaningful user-facing locator is unavailable.

## Playwright Test Isolation

Each end-to-end test should be independently executable.

Tests must not depend on:

- Another test creating a user
- Another test creating an account
- Test execution order
- Existing local data
- Existing preview data
- Production data

Fixtures should create the required state for each test or group.

## Playwright Authentication Fixtures

Playwright may use stored authentication state to avoid repeating login through the UI for every test.

At least one dedicated test must still verify the actual login flow.

Stored authentication state must:

- Be generated from test credentials
- Remain outside source control when sensitive
- Be refreshed predictably
- Never contain production credentials
- Be isolated between test users where necessary

## Page Objects and Test Helpers

Playwright page objects may be used for repeated workflows.

Examples include:

- Login page
- Navigation sidebar
- Transaction form
- Account form
- Budget editor

Page objects should:

- Wrap repeated interactions
- Avoid hiding important assertions
- Remain focused
- Use user-facing locators
- Avoid becoming large application abstractions

Simple tests should not be forced through a page-object layer when direct locators are clearer.

## End-to-End Test Data

End-to-end fixtures may create:

- Users
- Sessions
- Accounts
- Categories
- Transactions
- Budgets
- Budget allocations

Test data should be:

- Predictable
- Minimal
- Isolated
- Easy to understand
- Safe to delete
- Independent of production data

Factories should provide sensible defaults while allowing important fields to be overridden.

## API-Assisted Test Setup

Playwright tests may use API requests or test helpers to create prerequisite data when the UI flow itself is not under test.

For example:

```text
Test account-edit workflow
→ Create user through test helper
→ Create account through API
→ Open account page in browser
→ Test edit behavior through UI
```

At least one end-to-end test should still cover each critical creation workflow through the user interface.

## Time and Clock Control

Tests involving time should not depend on the actual current date.

Examples include:

- Monthly budgets
- Transaction filters
- Payment-due warnings
- Dashboard comparisons
- Session expiration
- Demo data

Use:

- Explicit dates
- Controlled clocks
- Seeded timestamps
- Stable time zones

## Test Time Zone

Automated tests should use a documented stable time zone.

A likely default is:

```text
UTC
```

Tests should explicitly cover local-date behavior when the user's time zone affects results.

The frontend, backend, PostgreSQL container, and Playwright processes should use compatible settings.

## Randomness

Tests should avoid uncontrolled random values.

When unique data is required:

- Use deterministic counters.
- Use seeded random generators.
- Include worker identifiers.
- Use generated UUIDs only when the exact value is not part of the assertion.

Failure output should make generated test data easy to identify.

## Coverage

Vitest will use:

```text
@vitest/coverage-v8
```

Coverage should include:

- Statements
- Branches
- Functions
- Lines

Coverage is a diagnostic tool.

It is not the sole measure of test quality.

## Initial Coverage Thresholds

Initial thresholds should remain achievable while the project foundation is being established.

A reasonable starting point is:

```text
Statements: 70%
Branches: 60%
Functions: 70%
Lines: 70%
```

Thresholds should increase as modules mature.

Higher expectations should apply to:

- Financial calculations
- Zod schemas
- Authorization logic
- Ownership queries
- Transaction workflows
- Migration utilities
- Error mapping
- Demo reset logic

The project should not add meaningless tests solely to increase percentages.

## Coverage Exclusions

Coverage may exclude:

- Generated TanStack Router route trees
- Generated Drizzle artifacts
- Type-only files
- Build outputs
- Test utilities
- Playwright fixtures
- Configuration files with no meaningful logic
- Unchanged generated shadcn/ui primitives

Customized shadcn/ui components should be included when they contain Steward-specific behavior.

## Snapshot Testing

Snapshot testing should be used sparingly.

Avoid full-page DOM snapshots because they produce:

- Noisy updates
- Weak behavioral confidence
- Difficult reviews
- False confidence

Small snapshots may be appropriate for:

- Stable serialized error structures
- Small generated configuration output
- Focused accessibility structures
- Narrow SQL-generation cases
- Stable response mapping

Behavioral assertions should remain the default.

## Mocking Policy

Mocks should be used at clear boundaries.

Reasonable mocks include:

- Browser APIs unavailable in jsdom
- API responses in frontend component tests
- External services
- Time
- Random values
- Email delivery when introduced
- Error-monitoring clients

Avoid mocking:

- Drizzle in important query tests
- PostgreSQL constraints
- Fastify route lifecycle
- Better Auth in every integration test
- Application services when testing full route behavior
- The entire API client in end-to-end tests

Use real PostgreSQL for database-backed behavior.

## External Service Testing

Future services may include:

- Email
- Bank synchronization
- Analytics
- Error monitoring

They should be wrapped behind application-owned interfaces.

Tests should substitute safe test implementations.

End-to-end tests must not:

- Send real emails
- Connect to real bank accounts
- Send production analytics
- Submit real financial data
- Use production monitoring credentials

## Accessibility Testing

Component and end-to-end tests should verify accessible behavior.

Examples include:

- Controls have accessible names.
- Labels are connected to inputs.
- Dialogs have titles.
- Focus moves correctly.
- Keyboard navigation works.
- Form errors are associated with fields.
- Status updates are announced where appropriate.
- Color is not the only indication of overspending.
- Icon-only controls have accessible names.
- Destructive actions are clearly identified.

An automated accessibility scanner may be added later.

Automated scanning does not replace keyboard and screen-reader-oriented test design.

## Visual Regression Testing

Visual regression testing is not selected for the initial stack.

It may be introduced later for representative screens such as:

- Login
- Dashboard
- Transactions
- Budget
- Settings
- Light theme
- Dark theme
- Mobile navigation

Visual tests should be added only when the team is prepared to review and maintain visual baselines.

## Performance Testing

Dedicated performance testing is not required for the initial MVP.

The project should still observe:

- Slow API routes
- Large database queries
- Slow component rendering
- Large frontend bundles
- Slow Playwright workflows
- Excessive test-suite duration

Performance benchmarks may be added for:

- Dashboard aggregation
- Transaction pagination
- Budget calculations
- Large transaction lists
- Imports when implemented

## Security Testing

Automated security testing should cover application-level behavior such as:

- Protected routes reject missing sessions.
- Another user cannot access owned resources.
- User-controlled IDs do not override session identity.
- Invalid input is rejected.
- Secrets are not included in frontend bundles.
- Raw database errors are not exposed.
- CORS rejects unrelated origins.
- Cookie behavior is correct.
- Demo reset is restricted.
- Environment validation prevents unsafe startup.

Specialized security scanning may be added separately.

## CORS Testing

Backend integration tests should verify relevant CORS behavior.

Cases include:

- Approved local frontend origin
- Approved production origin
- Approved preview origin where supported
- Unrelated origin
- Credentialed request
- Preflight request
- Missing origin where appropriate

Wildcard origins must not be used with credentialed authentication.

## Cookie Testing

Authentication-cookie tests should verify:

- Session cookie is set after login.
- Cookie is sent to protected requests.
- Logout invalidates the session.
- Secure attributes are enabled in production.
- Development configuration works locally.
- SameSite behavior matches the deployment architecture.
- Cookie contents are not exposed to frontend JavaScript when HttpOnly is expected.

Exact assertions may vary between local and production-like test environments.

## Logging Tests

Logging tests should be limited to important behavior.

Possible cases include:

- Unexpected server errors are logged.
- Sensitive values are redacted.
- Validation failures do not log passwords.
- Database URLs are not printed.
- Session tokens are not printed.
- Request IDs are included where configured.

Tests should not assert entire formatted log lines unless the format itself is a public requirement.

## Test Secrets

Test credentials and secrets must:

- Be isolated from production
- Be safe to rotate
- Remain outside committed environment files
- Use test-only values
- Avoid appearing in screenshots and traces where practical

No automated test should require production credentials.

## Test Data Privacy

Automated tests must not use real user financial data.

Fixtures should use clearly synthetic values.

Examples include:

```text
Everyday Checking
Grocery Store
Example Bank
demo@example.test
```

Avoid copying real account numbers, personal emails, or financial histories into the test suite.

## Continuous Integration

Continuous integration should eventually run:

```text
Formatting
        ↓
Linting
        ↓
Type checking
        ↓
Unit and component tests
        ↓
Backend and PostgreSQL integration tests
        ↓
Frontend and backend builds
        ↓
Critical Playwright tests
```

Independent jobs may run in parallel when safe.

## CI Test Groups

A likely CI workflow includes:

### Static checks

- Formatting
- Linting
- Type checking

### Unit and component tests

- Zod schemas
- Utilities
- Services
- React components
- Router behavior

### Integration tests

- Fastify `inject()`
- Better Auth
- Drizzle
- PostgreSQL Testcontainer
- Migration verification

### Build checks

- Vite production build
- Fastify TypeScript build

### End-to-end tests

- Playwright Chromium suite
- Critical user workflows

## Local Test Commands

Exact commands depend on the selected package manager.

Recommended script responsibilities include:

```text
test
→ Run Vitest in watch mode

test:run
→ Run Vitest once

test:unit
→ Run unit tests

test:component
→ Run React component tests

test:integration
→ Run Fastify and PostgreSQL integration tests

test:e2e
→ Run Playwright

test:e2e:ui
→ Run Playwright UI mode

test:e2e:debug
→ Run Playwright in debug mode

test:coverage
→ Run Vitest with V8 coverage

test:all
→ Run the complete local test suite
```

## CI Commands

CI should use non-interactive commands.

Conceptually:

```text
test:run
test:integration
test:coverage
test:e2e
```

Watch mode must not be used in CI.

## Testcontainers in CI

The CI provider must support:

- Docker or a compatible container runtime
- Pulling the pinned PostgreSQL image
- Starting disposable containers
- Exposing temporary ports
- Cleaning up containers
- Sufficient memory and disk space

If the selected CI provider cannot reliably support Testcontainers, the database test environment decision must be revisited.

## Playwright in CI

CI should install:

- The required Playwright browser
- Required operating-system dependencies

The initial required browser should be Chromium.

Failure artifacts should be preserved where useful.

## Failure Artifacts

Playwright failure artifacts may include:

- Trace
- Screenshot
- Video where enabled
- HTML report
- Browser console output
- Network failure details

Artifacts must not contain:

- Production credentials
- Production sessions
- Real financial data
- Database passwords
- Better Auth secrets

## Flaky Test Policy

Flaky tests should be treated as defects.

A test that fails intermittently should not be ignored indefinitely.

The response should be:

1. Investigate the failure.
2. Identify timing or isolation problems.
3. Fix the test or product behavior.
4. Quarantine only when necessary.
5. Track quarantined tests explicitly.
6. Restore them promptly.

Repeated retries should not be used to hide unstable tests.

## Parallel Test Execution

Parallel execution may be enabled when tests are proven isolated.

The project should consider:

- PostgreSQL schemas
- Test users
- Port allocation
- Shared files
- Browser storage
- Environment variables
- Container startup cost

Correctness and determinism are more important than maximum concurrency.

## Test Timeouts

Timeouts should be appropriate for the testing layer.

- Unit tests should remain fast.
- Component tests should not rely on long arbitrary waits.
- Integration tests may allow container startup time.
- End-to-end tests may require additional browser time.

Increasing timeouts should not replace fixing synchronization problems.

Tests should wait for meaningful application state rather than sleeping for a fixed duration.

## Test Cleanup

Tests should clean up:

- React renders
- Fastify applications
- PostgreSQL pools
- Testcontainers
- Temporary files
- Browser contexts
- Mock handlers
- Controlled clocks

Cleanup should occur even when assertions fail.

## Test Factories

Factories may create:

- Users
- Sessions
- Accounts
- Categories
- Transactions
- Budgets
- Budget allocations
- User preferences

Factories should:

- Provide sensible defaults
- Allow overrides
- Produce valid records
- Avoid hidden side effects
- Remain easy to read
- Avoid coupling tests to irrelevant fields

## Fixtures

Fixtures should be used for stable shared scenarios.

Examples include:

- Authenticated user
- User with no accounts
- User with multiple accounts
- User with transactions
- User with an active budget
- Demo user
- Another user for ownership testing

Fixtures should not become a large opaque database that every test depends on.

## Test Documentation

The repository should document:

- How to run each test layer
- Required local software
- Testcontainers requirements
- Playwright installation
- Test environment variables
- How database cleanup works
- How authentication fixtures work
- How to inspect Playwright traces
- How to update coverage thresholds
- How to troubleshoot container failures

## Test Review Guidelines

Tests should be reviewed for:

- Clear behavior
- Stable setup
- Useful assertions
- Independence
- Appropriate testing layer
- Accessible selectors
- Minimal unnecessary mocking
- Readable test data
- Helpful failure output
- Proper cleanup
- Security and privacy

Tests are production code and should meet the same maintainability standards.

## Deployment Gates

Before a production deployment, CI should eventually verify:

- Formatting
- Linting
- Type checking
- Unit tests
- Component tests
- Fastify integration tests
- PostgreSQL integration tests
- Migration validity
- Frontend build
- Backend build
- Critical Playwright tests

A failed required check should block deployment.

## Recommended Initial Implementation Order

The testing stack should be introduced incrementally.

### Foundation

1. Configure Vitest.
2. Add separate Node and jsdom environments.
3. Add React Testing Library.
4. Add `user-event`.
5. Add `jest-dom`.
6. Add V8 coverage.

### Backend integration

1. Create a test application factory.
2. Add Fastify `inject()` tests.
3. Add PostgreSQL Testcontainers.
4. Apply Drizzle migrations in test setup.
5. Add authentication helpers.
6. Add ownership tests.

### End-to-end

1. Configure Playwright.
2. Add local frontend and backend startup.
3. Add isolated test database setup.
4. Add login and registration tests.
5. Add critical financial workflows.
6. Add CI artifacts.

## Initial High-Priority Tests

The first tests should focus on the highest-risk behavior.

Recommended starting set:

### Validation

- Transaction amount schema
- Account schema
- Budget schema
- Pagination schema
- Environment schemas

### Financial logic

- Monetary parsing
- Budget remaining
- Overspending
- Income and expense totals
- Transfer behavior

### Backend

- Missing-session rejection
- Account ownership
- Transaction ownership
- Account creation
- Transaction creation
- Budget creation
- Transaction rollback
- Validation-error mapping

### Frontend

- Login form
- Registration form
- Account form
- Transaction form
- Budget editor
- Protected-route redirect

### End-to-end

- Register and log in
- Create account
- Create transaction
- Create budget
- Log out
- Refresh protected route

## Explicitly Not Selected

The initial testing stack will not use:

- Jest
- Cypress
- Enzyme
- Sinon
- Mocha
- Chai as a separate assertion dependency
- SQLite as a PostgreSQL substitute
- Heavy Drizzle mocking
- Full-page snapshot testing
- Production data in automated tests
- Multiple competing primary test runners
- Browser tests for every minor component state

These tools should not be introduced without revisiting the testing decision.

## Open Testing Decisions

The following testing details remain open until implementation:

- Exact Vitest workspace structure
- Test colocation versus separate directories
- Mock Service Worker usage
- Database cleanup strategy
- Testcontainer-per-worker strategy
- CI provider
- Visual regression testing
- Automated accessibility scanner
- Cross-browser Playwright cadence
- Production smoke-test strategy
- Final coverage thresholds
- Test-retry policy
- Test-reporting integration

## Success Criteria

The testing architecture is successful when:

- Vitest provides one primary test runner.
- React components are tested through user-visible behavior.
- `user-event` simulates realistic interactions.
- shadcn/ui compositions remain accessible.
- TanStack Router behavior is tested predictably.
- Fastify routes are tested through `inject()`.
- PostgreSQL behavior is tested against real PostgreSQL.
- Testcontainers provides isolated database environments.
- Drizzle migrations are exercised during integration tests.
- Better Auth configuration is verified through integration tests.
- Ownership rules are proven with multiple users.
- Transaction rollbacks are verified.
- Playwright covers critical user workflows.
- Tests remain independent and deterministic.
- Coverage highlights meaningful risk.
- Required test failures block production deployments.
- Automated tests never depend on production data or credentials.
