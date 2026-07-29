# Authentication

## Decision

Steward will use Better Auth with Fastify and PostgreSQL.

Better Auth will manage authentication behavior and authentication-related database records.

Fastify will host the authentication endpoints and protect the Steward API.

PostgreSQL will persist users, credential accounts, sessions, and Steward financial data.

## Selected Technologies

Authentication uses:

- Better Auth
- Fastify
- PostgreSQL
- TypeScript
- Cookie-based sessions

The ORM or Better Auth database adapter beyond PostgreSQL support remains dependent on the final query-layer decision.

## Responsibility Boundaries

### Better Auth

Better Auth is responsible for:

- Creating users
- Authenticating email and password credentials
- Creating sessions
- Validating sessions
- Ending sessions
- Managing authentication accounts
- Managing authentication-related database records
- Exposing authentication endpoints

### Fastify

Fastify is responsible for:

- Hosting the Better Auth handler
- Receiving authentication requests
- Forwarding supported requests to Better Auth
- Forwarding authentication response headers and cookies
- Retrieving sessions for protected requests
- Rejecting unauthenticated API requests
- Enforcing authorization
- Configuring CORS and approved origins
- Logging failures safely

### PostgreSQL

PostgreSQL is responsible for persisting:

- Better Auth users
- Credential accounts
- Sessions
- Verification records where required
- Steward financial records
- Relationships between authenticated users and financial data

### Steward

Steward application logic is responsible for:

- Associating financial records with Better Auth users
- Enforcing ownership
- Providing authentication forms
- Redirecting based on authentication state
- Creating and resetting demo data
- Presenting client-safe authentication errors

## MVP Authentication Scope

The MVP supports:

- Email and password registration
- Email and password sign-in
- Persistent sessions
- Protected frontend routes
- Protected Fastify routes
- Sign out
- Predefined demo account
- User-specific PostgreSQL data

The MVP does not require:

- Email verification
- Password recovery
- Social authentication
- Multi-factor authentication
- Passkeys
- Magic links
- Account linking
- Management of multiple active sessions

## Authentication Endpoints

Better Auth endpoints are mounted through Fastify under:

```text
/api/auth/*
```

The Fastify integration must:

1. Receive the incoming request.
2. Convert it into the request format expected by Better Auth.
3. Forward the URL, method, headers, and body.
4. Apply the Better Auth response status.
5. Forward response headers.
6. Forward session cookies.
7. Return the response body.
8. Handle unexpected failures safely.

Feature modules should not recreate authentication endpoint behavior.

## PostgreSQL Integration

Better Auth will use PostgreSQL to store authentication data.

The initial Better Auth schema includes records representing:

- Users
- Authentication accounts
- Sessions
- Verification data

The exact generated columns and constraints should come from the Better Auth schema and migration workflow rather than an independently invented schema.

Authentication migrations should be coordinated with Steward's broader PostgreSQL migrations.

## User Identity

The Better Auth user identifier is the canonical identity used throughout Steward.

Financial tables should reference that identity.

Examples include:

```text
financial_account.user_id
transaction.user_id
category.user_id
budget.user_id
user_preference.user_id
```

Some tables may resolve ownership through a parent relationship instead of storing `user_id` directly.

Regardless of the physical schema, every protected query must be able to prove ownership.

## Authentication Account Naming

Better Auth uses the term `account` for authentication-provider or credential records.

Steward also uses the term `account` for financial accounts.

Code and database naming should distinguish these clearly.

Recommended conceptual names include:

```text
auth account
financial account
```

Possible table names include:

```text
auth_account
financial_account
```

The final naming convention should be documented before schema creation.

## Better Auth Configuration

The server-side Better Auth instance should define:

- PostgreSQL connection or database adapter
- Email and password authentication
- Better Auth secret
- Base URL
- Trusted origins
- Session configuration
- Database schema behavior
- Demo-user compatibility where necessary

The Better Auth instance should be created once and reused.

It must not be recreated independently for every Fastify request.

## Database Adapter Strategy

Better Auth can connect directly to PostgreSQL.

The final setup may use:

- A PostgreSQL connection pool supported directly by Better Auth
- An adapter associated with the selected ORM
- A shared database package exposing the selected database client

This choice should be finalized after the ORM or query layer is selected.

The selected approach must support:

- Better Auth schema generation or migrations
- Fastify lifecycle management
- Integration testing
- Production connection pooling
- Consistent PostgreSQL configuration

## Registration Flow

```text
Registration page
→ Enter name, email, password, and password confirmation
→ Validate input
→ Send request to the Better Auth endpoint
→ Fastify forwards the request
→ Better Auth creates PostgreSQL user and credential records
→ Better Auth creates a PostgreSQL session record
→ Session cookie is returned
→ Redirect to dashboard
```

### Registration Fields

- Name
- Email address
- Password
- Password confirmation

Password confirmation is used for form validation and should not be stored.

### Registration Validation

The interface should identify:

- Missing required fields
- Invalid email address
- Password that does not meet requirements
- Password confirmation mismatch
- Registration failure

PostgreSQL uniqueness constraints and Better Auth behavior remain the server-side source of truth for duplicate identities.

## Sign-In Flow

```text
Login page
→ Enter email and password
→ Submit to Better Auth endpoint
→ Fastify forwards the request
→ Better Auth validates PostgreSQL credential records
→ Better Auth creates or restores the session
→ Session cookie is returned
→ Redirect to dashboard or intended page
```

Authentication errors should not expose:

- Password hashes
- PostgreSQL errors
- Whether an internal record exists
- Session internals
- Database structure

## Demo Account Flow

```text
Login page
→ Continue with Demo Account
→ Submit supported demo credentials
→ Fastify forwards request to Better Auth
→ Better Auth authenticates the PostgreSQL demo user
→ Better Auth creates or restores the session
→ Redirect to dashboard
```

The demo account must:

- Exist as a valid Better Auth user in PostgreSQL
- Have supported email and password credentials
- Receive a normal session
- Own its seeded financial data
- Use normal authorization checks
- Remain isolated from regular users

The demo flow must not bypass Better Auth or Fastify authorization.

## Session Storage

Better Auth sessions will be persisted in PostgreSQL.

The session cookie identifies the active session to Better Auth.

The server validates the session before returning protected financial data.

The application must not substitute this with:

- A local-storage authentication flag
- A manually created client token
- A user ID sent by the browser
- Frontend route visibility
- Hidden interface controls

## Session Retrieval in Fastify

Protected Fastify routes should retrieve the session through the Better Auth server API.

The conceptual flow is:

```text
Fastify request
→ Convert incoming headers
→ Request session from Better Auth
→ Better Auth checks PostgreSQL session data
→ Valid session returned
→ Attach user and session to Fastify request
```

When the session is missing or invalid:

```text
No valid session
→ Return 401 Unauthorized
→ Do not run protected handler
```

## Authentication Plugin

A reusable Fastify authentication plugin should:

- Retrieve the Better Auth session
- Reject invalid sessions
- Decorate the request with typed authentication data
- Avoid duplicate session queries during one request
- Keep authentication logic out of feature handlers

A possible conceptual shape is:

```text
request.auth
├── user
└── session
```

The final property name should be documented and included in Fastify's TypeScript declarations.

## Protected Data Flow

```text
Authenticated request
→ Validate Better Auth session
→ Derive Better Auth user ID
→ Pass user ID to application service
→ Query PostgreSQL with ownership condition
→ Return authorized data
```

The authenticated user ID must not come from client input.

## Authorization

Authentication confirms identity.

Authorization controls access to PostgreSQL records.

Every user-owned operation must verify ownership.

Examples include:

- Viewing a financial account
- Editing a financial account
- Archiving an account
- Viewing transactions
- Editing transactions
- Deleting transactions
- Viewing budgets
- Updating allocations
- Resetting demo data

A valid record ID does not grant access by itself.

## Resource-Hiding Behavior

When an authenticated user requests a financial record owned by someone else, Steward may return:

```text
404 Not Found
```

This avoids confirming the existence of another user's financial data.

The behavior should remain consistent across protected resources.

## Public Routes

Public backend routes include:

- Better Auth endpoints
- Non-sensitive health checks
- Other endpoints explicitly approved as public

Financial endpoints should be protected by default.

## Cookies and Origins

Authentication uses Better Auth session cookies.

The implementation should:

- Forward Better Auth `Set-Cookie` headers
- Use secure production cookie settings
- Allow credentials from approved frontend origins
- Configure Better Auth trusted origins
- Avoid wildcard CORS origins with credentials
- Avoid exposing session tokens to frontend JavaScript
- Avoid storing custom authentication tokens in local storage

The final cookie configuration depends on the frontend and API deployment domains.

## Authenticated Frontend Routes

Authenticated users visiting:

```text
/login
/register
```

should be redirected to:

```text
/dashboard
```

Unauthenticated users visiting protected pages should be redirected to:

```text
/login
```

Frontend redirects improve the user experience.

Fastify authorization remains required for all protected API requests.

## Sign-Out Flow

```text
Authenticated application
→ User selects Sign Out
→ Request reaches Better Auth through Fastify
→ Better Auth invalidates the PostgreSQL session
→ Cookie update is returned
→ Client clears cached authenticated data
→ Redirect to login
```

Signing out should not delete PostgreSQL financial data.

Signing out of the demo user should not reset demo data.

## Session Expiration

When a session expires:

- PostgreSQL session validation should fail.
- Protected Fastify routes should return `401 Unauthorized`.
- The frontend should clear stale authenticated state.
- Protected data should no longer be displayed.
- The user should return to login.
- The interface should explain that the session expired.

The frontend should avoid repeatedly retrying requests with an invalid session.

## Demo Data Reset

Demo-data reset should be implemented as a protected Fastify endpoint.

The endpoint must:

1. Validate the Better Auth session.
2. Derive the authenticated user from the session.
3. Verify that the user is the designated demo user.
4. Open a PostgreSQL transaction.
5. Restore only the demo user's financial records.
6. Preserve the Better Auth user and active identity.
7. Roll back if any reset step fails.

The reset must not affect regular users or authentication records unnecessarily.

## Authentication Errors

Authentication errors returned through Fastify should use client-safe messages.

Example:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "You must sign in to continue.",
    "details": null
  }
}
```

Raw Better Auth or PostgreSQL errors should not be exposed directly.

Unexpected failures should be logged without including:

- Passwords
- Cookies
- Session tokens
- Better Auth secrets
- Database credentials
- Raw authentication request bodies

## Database Migrations

Better Auth schema migrations and Steward financial migrations should be version controlled.

The final workflow depends on the selected database adapter.

The migration process should support:

- Local development
- Integration tests
- CI
- Deployed environments
- Better Auth schema changes
- Steward schema changes

Normal application requests should not silently modify the authentication schema.

## Security Expectations

The implementation should:

- Use Better Auth password handling
- Store authentication data in PostgreSQL
- Validate sessions on Fastify
- Use secure session cookies
- Keep secrets outside source control
- Derive identity from the session
- Restrict queries by authenticated user
- Use parameterized database queries
- Avoid logging sensitive authentication data
- Avoid custom password hashing
- Avoid raw password storage
- Avoid trusting client-provided user identifiers
- Avoid treating frontend route guards as authorization

## Testing Expectations

### Better Auth and PostgreSQL integration

Tests should verify:

- Registration creates the required database records
- Sign-in creates or restores a session
- Session cookies are returned
- Sign-out invalidates the session
- Expired sessions are rejected
- Authentication migrations apply successfully

### Protected Fastify routes

Tests should verify:

- Missing sessions return `401`
- Valid sessions reach handlers
- Authenticated user data is attached correctly
- Protected handlers do not run after authentication failure

### Authorization and ownership

Tests should verify:

- Users can access their own PostgreSQL records
- Users cannot access another user's records
- Client-provided user IDs cannot change ownership
- Financial-record identifiers do not bypass authorization
- Demo reset is limited to the designated demo user

### End-to-end authentication

Tests should cover:

- Registration
- Sign-in
- Demo sign-in
- Session restoration after reload
- Protected-route redirection
- Protected API rejection
- Sign-out
- Session expiration

## Success Criteria

The authentication architecture is successful when:

- Better Auth persists authentication data in PostgreSQL.
- Fastify hosts the Better Auth endpoints.
- Registration and sign-in create valid sessions.
- Session cookies work across the intended frontend and API origins.
- Fastify retrieves and validates sessions.
- Protected routes reject unauthenticated requests.
- Financial data is scoped to the Better Auth user.
- The demo account uses the normal authentication model.
- Demo reset runs safely within PostgreSQL.
- Authentication behavior is covered by integration tests.
