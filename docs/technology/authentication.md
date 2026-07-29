# Authentication

## Decision

Steward will use Better Auth with Fastify, PostgreSQL, and Drizzle ORM.

Better Auth will use its official Drizzle adapter configured for PostgreSQL.

Fastify will host the Better Auth endpoints and protect Steward’s API.

Drizzle will provide authentication schema definitions, queries, and migrations.

## Selected Technologies

Authentication uses:

- Better Auth
- Better Auth Drizzle adapter
- Fastify
- PostgreSQL
- Drizzle ORM
- Drizzle Kit
- TypeScript
- Cookie-based sessions

## Responsibility Boundaries

### Better Auth

Better Auth is responsible for:

- User registration
- Email and password authentication
- Authentication accounts
- Session creation
- Session validation
- Sign out
- Authentication endpoint behavior

### Better Auth Drizzle Adapter

The Drizzle adapter is responsible for:

- Connecting Better Auth to the Drizzle database client
- Mapping Better Auth entities to Drizzle tables
- Reading and writing authentication records through Drizzle
- Supporting PostgreSQL as the database provider

### Drizzle ORM

Drizzle is responsible for:

- Defining authentication tables in TypeScript
- Providing typed database access
- Exporting the schema used by Better Auth
- Participating in authentication migrations
- Defining authentication relationships where required

### Fastify

Fastify is responsible for:

- Hosting Better Auth endpoints
- Forwarding authentication requests
- Returning Better Auth headers and cookies
- Reading sessions for protected requests
- Rejecting unauthenticated requests
- Enforcing authorization for financial resources
- Configuring CORS and approved origins
- Logging failures safely

### PostgreSQL

PostgreSQL persists:

- Users
- Authentication accounts
- Sessions
- Verification records
- Steward financial records
- Relationships between users and financial data

### Steward Application Logic

Steward is responsible for:

- Authentication forms
- Auth-aware routing
- Financial-data ownership
- Demo-user behavior
- Demo-data reset
- Client-safe authentication errors

## Better Auth Adapter

Steward should install and use:

```text
@better-auth/drizzle-adapter
```

The adapter should be configured using the shared Drizzle client.

Conceptually:

```ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
});
```

The final code may differ based on the installed versions and schema organization.

## Schema Mapping

The Drizzle schema passed to Better Auth must contain the authentication tables expected by the adapter.

If Steward renames Better Auth tables or exports them under custom names, the adapter configuration must map the expected entities explicitly.

The configured schema, Drizzle table names, and PostgreSQL table names must remain consistent.

## Better Auth Schema Generation

The Better Auth CLI should generate the initial Drizzle authentication schema.

The expected workflow is:

```text
Configure Better Auth
→ Generate Drizzle authentication schema
→ Review generated TypeScript
→ Export schema through database package
→ Generate Drizzle SQL migration
→ Review migration
→ Apply migration
```

Better Auth schema generation should feed into Steward’s Drizzle migration history.

It should not create an unrelated migration process.

## Drizzle Migration Workflow

Authentication schema changes should follow the same workflow as financial schema changes:

```text
Update Drizzle schema
→ Run Drizzle Kit generate
→ Review SQL migration
→ Commit migration
→ Apply migration
```

Authentication schema migrations must be applied before deploying code that requires them.

## Authentication Tables

The authentication schema is expected to include records representing:

- User
- Authentication account
- Session
- Verification

The exact names and fields should be derived from Better Auth’s generated schema.

Steward should not duplicate these records in a separate custom authentication schema.

## User Identity

The Better Auth user ID is Steward’s canonical user identity.

Financial tables should reference this ID.

Examples include:

```text
financial_account.user_id
transaction.user_id
category.user_id
budget.user_id
user_preference.user_id
```

Some entities may resolve ownership through parent relationships.

Every protected query must still prove ownership.

## Authentication Account Naming

Better Auth uses `account` to describe authentication-provider or credential records.

Steward uses `financial account` to describe checking, savings, credit-card, and similar financial records.

These concepts must be distinguished in:

- Drizzle table names
- Schema exports
- Application types
- Services
- Documentation
- Tests

Recommended terminology:

```text
authAccount
financialAccount
```

## MVP Authentication Scope

The MVP supports:

- Email and password registration
- Email and password sign-in
- Persistent sessions
- Protected frontend routes
- Protected Fastify API routes
- Sign out
- Predefined demo account
- User-specific PostgreSQL records

The MVP does not require:

- Email verification
- Password recovery
- Social login
- Multi-factor authentication
- Passkeys
- Magic links
- Account linking
- Multiple-session management

## Authentication Endpoints

Better Auth endpoints are mounted through Fastify under:

```text
/api/auth/*
```

The Fastify integration must:

1. Receive the incoming request.
2. Convert it into the format expected by Better Auth.
3. Forward method, URL, headers, and body.
4. Apply Better Auth’s response status.
5. Forward response headers.
6. Forward session cookies.
7. Return the response body.
8. Log unexpected failures safely.

## Registration Flow

```text
Registration page
→ Validate name, email, password, and confirmation
→ Request reaches Better Auth through Fastify
→ Better Auth uses Drizzle to insert authentication records
→ PostgreSQL stores the user and auth account
→ Better Auth creates a session through Drizzle
→ Session cookie is returned
→ Redirect to dashboard
```

Password confirmation is a frontend validation concern and should not be stored.

## Sign-In Flow

```text
Login page
→ Enter email and password
→ Request reaches Better Auth through Fastify
→ Better Auth queries authentication records through Drizzle
→ Credentials are validated
→ Session is created or restored
→ Session cookie is returned
→ Redirect to dashboard or intended page
```

Raw Drizzle or PostgreSQL authentication errors must not be shown to the user.

## Demo Account Flow

```text
Login page
→ Continue with Demo Account
→ Submit supported demo authentication request
→ Better Auth queries demo credentials through Drizzle
→ Demo user is authenticated
→ Session is stored in PostgreSQL
→ Redirect to dashboard
```

The demo account must:

- Exist as a valid Better Auth user
- Have valid Better Auth credential records
- Receive a normal session
- Own its seeded financial records
- Use normal Fastify authorization
- Remain isolated from regular users

The demo flow must not bypass Better Auth or Drizzle.

## Session Storage

Better Auth sessions are persisted in PostgreSQL through Drizzle.

The browser receives the session cookie.

Fastify validates the session before returning protected data.

The application must not replace this with:

- A local-storage authentication flag
- A custom unsigned user ID
- A manually created browser token
- Frontend route visibility
- Hidden UI controls

## Session Retrieval

Protected Fastify routes should retrieve sessions through Better Auth.

Conceptually:

```text
Fastify request
→ Convert request headers
→ Ask Better Auth for session
→ Better Auth queries session through Drizzle
→ Valid session and user returned
→ Attach auth state to request
```

If no valid session exists:

```text
Return 401 Unauthorized
→ Do not execute protected handler
```

## Authentication Plugin

A Fastify authentication plugin should:

- Retrieve the Better Auth session
- Attach typed user and session data
- Reject invalid sessions
- Avoid repeated session retrieval during one request
- Keep authentication logic out of feature routes

Conceptually:

```text
request.auth
├── user
└── session
```

The final request decoration should be strongly typed.

## Protected Data Flow

```text
Authenticated request
→ Better Auth validates session through Drizzle
→ Fastify derives authenticated user ID
→ Service receives user ID
→ Drizzle query applies ownership condition
→ PostgreSQL returns authorized data
```

The browser must not provide the authoritative user ID.

## Authorization

Better Auth determines identity.

Steward services and Drizzle queries enforce ownership.

A valid record identifier is not sufficient authorization.

Protected operations include:

- Reading financial accounts
- Editing financial accounts
- Archiving accounts
- Reading transactions
- Editing transactions
- Deleting transactions
- Reading budgets
- Updating budget allocations
- Resetting demo data

## Ownership Query Pattern

Queries should include ownership directly.

Conceptually:

```text
resource.id = requested ID
AND resource.user_id = authenticated user ID
```

Where ownership is inherited through a parent record, the Drizzle query should join or constrain through the owning relationship.

## Public Routes

Public backend routes include:

- Better Auth endpoints
- Non-sensitive health checks
- Explicitly approved public endpoints

Financial endpoints should be protected by default.

## Cookies and Origins

Authentication uses Better Auth session cookies.

The application must:

- Forward Better Auth cookies through Fastify
- Allow credentials from approved frontend origins
- Configure trusted origins
- Avoid wildcard credentialed CORS
- Use secure cookie settings in production
- Avoid exposing session values to application JavaScript unnecessarily
- Avoid custom local-storage auth tokens

## Sign-Out Flow

```text
Authenticated application
→ Sign Out
→ Request reaches Better Auth through Fastify
→ Better Auth updates session data through Drizzle
→ Session becomes invalid
→ Cookie update is returned
→ Client clears cached authenticated state
→ Redirect to login
```

Signing out should not delete financial data.

## Session Expiration

When a session expires:

- Better Auth should no longer return a valid session.
- Protected Fastify routes should return `401`.
- The frontend should clear cached user data.
- Protected content should no longer render.
- The user should return to login.
- The interface should explain that the session expired.

## Demo Reset

Demo-data reset should use a protected Fastify route and a Drizzle transaction.

The operation should:

1. Validate the Better Auth session.
2. Derive the authenticated user ID.
3. Confirm the user is the designated demo user.
4. Start a Drizzle transaction.
5. Restore only the demo user’s financial data.
6. Preserve Better Auth user and auth-account records.
7. Preserve the active identity where possible.
8. Roll back if any operation fails.

## Authentication Errors

Authentication errors should use client-safe responses.

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

The API must not expose:

- Raw Drizzle errors
- Raw PostgreSQL errors
- Password hashes
- Authentication-table structure
- Session values
- Better Auth secrets
- SQL queries

## Security Expectations

The authentication implementation should:

- Use Better Auth’s password handling
- Store auth records through Drizzle
- Persist records in PostgreSQL
- Validate sessions in Fastify
- Use secure cookies
- Derive identity from the session
- Scope Drizzle queries by authenticated user
- Keep secrets outside source control
- Avoid logging credentials or cookies
- Avoid custom password hashing
- Avoid storing raw passwords
- Avoid client-controlled ownership
- Avoid treating frontend route guards as authorization

## Testing

### Schema and migration tests

Verify:

- Better Auth Drizzle schema is included
- Authentication migrations apply
- Required constraints exist
- Schema changes remain compatible

### Better Auth adapter tests

Verify:

- Registration inserts expected records
- Sign-in creates or restores a session
- Session retrieval succeeds
- Sign-out invalidates the session
- Adapter schema mapping is correct

### Protected Fastify tests

Verify:

- Missing sessions return `401`
- Valid sessions reach handlers
- Auth data is attached correctly
- Expired sessions are rejected

### Ownership tests

Verify:

- Users access their own data
- Users cannot access another user’s data
- Client-provided user IDs are ignored for identity
- Resource IDs do not bypass ownership
- Demo reset is restricted correctly

### End-to-end tests

Verify:

- Registration
- Sign-in
- Demo sign-in
- Session restoration
- Protected routing
- Protected API rejection
- Sign-out
- Session expiration

## Success Criteria

The authentication architecture is successful when:

- Better Auth uses the Drizzle PostgreSQL adapter.
- Authentication tables are represented in the Drizzle schema.
- Drizzle Kit manages authentication migrations.
- Registration and sign-in create valid PostgreSQL records.
- Fastify retrieves and validates Better Auth sessions.
- Protected routes reject unauthenticated requests.
- Financial queries enforce ownership.
- The demo user uses the normal authentication system.
- Authentication behavior is covered by integration tests.
