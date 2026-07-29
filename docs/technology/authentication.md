# Authentication

## Purpose

Steward uses Better Auth with a Fastify backend to manage registration, sign-in, sign-out, authenticated sessions, and access to protected financial data.

Better Auth owns authentication behavior, while Fastify hosts the authentication endpoints and enforces authentication and authorization for the Steward API.

## Selected Technologies

Authentication uses:

- Better Auth
- Fastify
- TypeScript
- Cookie-based sessions
- The application database

Steward should not create a separate custom authentication system alongside Better Auth.

## Responsibility Boundaries

### Better Auth

Better Auth is responsible for:

- Creating users
- Authenticating credentials
- Creating and validating sessions
- Ending sessions
- Managing authentication-related database records
- Exposing authentication endpoints
- Returning authenticated session information

### Fastify

Fastify is responsible for:

- Hosting the Better Auth handler
- Receiving authentication requests
- Forwarding requests to Better Auth
- Returning Better Auth responses and cookies
- Retrieving sessions for protected API requests
- Rejecting unauthenticated requests
- Enforcing authorization for Steward resources
- Configuring CORS and trusted origins
- Logging authentication failures safely

### Steward Application Logic

Steward is responsible for:

- Associating financial records with Better Auth users
- Enforcing resource ownership
- Providing demo-account behavior
- Resetting demo financial data
- Presenting authentication forms and errors
- Redirecting users based on authentication state

## MVP Authentication Scope

The initial version supports:

- Email and password registration
- Email and password sign-in
- Persistent authenticated sessions
- Protected application routes
- Protected Fastify API routes
- Sign out
- A predefined demo account
- User-specific financial data

The initial version does not require:

- Email verification
- Password recovery
- Social authentication
- Multi-factor authentication
- Passkeys
- Magic links
- Account linking
- Multiple-session management

These capabilities may be added later through Better Auth when supported by a clear product requirement.

## Authentication Endpoints

Better Auth endpoints are mounted through Fastify under:

```text
/api/auth/*
```

The Fastify application should register a catch-all authentication route that accepts the HTTP methods required by Better Auth.

The handler must:

1. Construct a web-standard request from the Fastify request.
2. Forward the request to the Better Auth handler.
3. Preserve the HTTP method, headers, body, and URL.
4. Apply the returned response status.
5. Forward response headers and cookies.
6. Return the Better Auth response body.
7. Log unexpected failures without exposing sensitive details.

Feature routes should not recreate Better Auth endpoint behavior.

## Fastify Registration Order

The application should register authentication-related infrastructure in a predictable order.

```text
Environment configuration
→ CORS
→ Database
→ Better Auth
→ Authentication handler
→ Protected feature routes
→ Error handling
```

The final order may vary based on plugin encapsulation, but feature routes must not depend on plugins that have not been registered in their context.

## Better Auth Instance

The application should maintain one configured server-side Better Auth instance.

That instance should define:

- Database integration
- Email and password authentication
- Secret configuration
- Base URL
- Trusted origins
- Session behavior
- Demo-user compatibility where required

The Better Auth instance should be imported by the Fastify integration rather than recreated per request.

## Registration Flow

```text
Registration page
→ Enter name, email, password, and password confirmation
→ Frontend validates form
→ Request is sent to /api/auth/*
→ Fastify forwards request to Better Auth
→ Better Auth creates the user and credential account
→ Better Auth creates a session
→ Fastify forwards the session cookie
→ Redirect to dashboard
```

### Registration Fields

- Name
- Email address
- Password
- Password confirmation

Password confirmation is a frontend validation field and should not be stored.

### Registration Validation

The interface should identify:

- Missing required fields
- Invalid email address
- Password that does not meet requirements
- Password confirmation mismatch
- Registration failure

Fastify and Better Auth remain responsible for server-side validation regardless of frontend validation.

## Sign-In Flow

```text
Login page
→ Enter email and password
→ Submit credentials to Better Auth endpoint
→ Fastify forwards the request
→ Better Auth validates credentials
→ Better Auth creates or restores the session
→ Fastify forwards the session cookie
→ Redirect to dashboard or intended protected page
```

When practical, users redirected from protected routes should return to their original destination after signing in.

## Demo Account Flow

```text
Login page
→ Continue with Demo Account
→ Submit the supported demo-authentication request
→ Fastify forwards request to Better Auth
→ Better Auth authenticates the demo user
→ Better Auth creates or restores the session
→ Redirect to dashboard
```

The demo user must be a valid Better Auth user.

The demo experience must not bypass:

- Better Auth
- Session validation
- Fastify authentication hooks
- API authorization
- Resource ownership checks

Demo credentials should not be embedded directly into publicly shipped frontend source code when avoidable.

## Session Retrieval in Fastify

Protected Fastify routes should retrieve the session through the Better Auth server API using the incoming request headers.

The request headers must be converted into the format expected by Better Auth.

The result should be treated as either:

```text
Valid session
→ Attach authenticated identity
→ Continue request

No valid session
→ Return 401 Unauthorized
```

Session parsing should be implemented once through a reusable Fastify plugin or hook.

## Authentication Plugin

A Fastify authentication plugin should provide reusable protected-route behavior.

It may decorate the request with authenticated information such as:

```text
request.auth
├── user
└── session
```

The exact property name should be documented and strongly typed.

The plugin should:

- Read the request headers
- Retrieve the Better Auth session
- Reject missing or invalid sessions
- Attach the validated session and user
- Avoid querying the session repeatedly within the same request
- Keep authentication logic out of feature handlers

## Protected Route Flow

```text
Client requests protected endpoint
→ Fastify authentication hook runs
→ Hook asks Better Auth for the session
→ Session is valid
→ Authenticated user is attached to request
→ Route handler runs
```

When no valid session exists:

```text
Client requests protected endpoint
→ Session lookup fails
→ Fastify returns 401 Unauthorized
→ Route handler does not run
```

## Protected Data Flow

```text
Authenticated request
→ Fastify validates Better Auth session
→ User ID is derived from session
→ Service receives authenticated user ID
→ Database query includes user ownership condition
→ Authorized data is returned
```

The authenticated user ID must never be accepted from client input as proof of identity.

## Authorization

Better Auth confirms who the user is.

Fastify route hooks and Steward services enforce what that user may access.

Every operation involving user-owned data must verify ownership.

Examples include:

- Viewing an account
- Editing an account
- Archiving an account
- Viewing transactions
- Editing transactions
- Deleting transactions
- Viewing budgets
- Updating budget allocations
- Resetting demo data

A valid resource identifier does not grant access by itself.

## Resource-Hiding Behavior

When a user requests a resource they do not own, the API may return `404 Not Found` rather than confirming that another user’s resource exists.

This behavior should remain consistent across user-owned financial resources.

## Public Routes

Public routes include:

- Better Auth endpoints
- Application health checks that expose no sensitive information
- Other explicitly public endpoints approved later

Financial API routes are protected by default.

## Client and API Origins

During development, the frontend and Fastify API may run on different origins.

When they do:

- Fastify must allow the frontend origin explicitly.
- Credentialed requests must be enabled.
- The frontend must send authentication credentials.
- Better Auth must trust the frontend origin.
- Wildcard origins must not be used with credentialed requests.

Production should prefer a simple same-origin or clearly controlled cross-origin deployment where practical.

## Cookies

Better Auth session cookies are the authentication mechanism.

The implementation should:

- Forward `Set-Cookie` headers from Better Auth
- Allow cookies on approved credentialed requests
- Use secure cookie settings appropriate to the environment
- Avoid exposing session tokens to application JavaScript unnecessarily
- Avoid replacing the session with a custom local-storage token

Cookie configuration should account for:

- Development HTTP behavior
- Production HTTPS
- Same-site policy
- Frontend and API domain structure
- Session expiration

## Authenticated Route Behavior

Authenticated users visiting authentication pages should be redirected:

```text
/login
/register
→ /dashboard
```

Unauthenticated users visiting protected frontend routes should be redirected:

```text
Protected page
→ /login
```

The frontend redirect improves UX, but Fastify authorization remains required for every protected API request.

## Sign-Out Flow

```text
Authenticated application
→ User selects Sign Out
→ Request reaches Better Auth through Fastify
→ Better Auth terminates the session
→ Fastify forwards the cookie update
→ Client clears cached authenticated state
→ Redirect to login
```

Signing out should not delete financial data.

Signing out of the demo account should not reset demo data.

## Session Expiration

When a session expires:

- Fastify protected routes should return `401 Unauthorized`.
- The client should clear stale authenticated state.
- Protected financial content should no longer be displayed.
- The user should be redirected to login.
- The interface should explain that the session expired.
- The intended destination should be preserved when practical.

The client should not repeatedly retry protected requests with an invalid session.

## Authentication Errors

Fastify should return consistent client-safe authentication errors.

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

Unexpected Better Auth integration failures should:

- Be logged by Fastify
- Return a generic server error
- Avoid exposing credentials, cookies, stack traces, or internal configuration

## Authentication Loading State

While authentication status is being determined:

- Show a neutral loading state.
- Avoid displaying protected financial information.
- Avoid flashing the login page for authenticated users.
- Avoid flashing protected pages for unauthenticated users.
- Preserve the requested destination when practical.

## Security Expectations

The implementation should:

- Use Better Auth’s built-in credential handling
- Validate sessions on the Fastify server
- Use secure cookies
- Keep authentication secrets outside source control
- Derive identity from the Better Auth session
- Restrict database queries by authenticated user
- Use explicit trusted origins
- Configure credential-aware CORS
- Avoid logging passwords, cookies, or session tokens
- Avoid storing raw passwords
- Avoid building custom password hashing
- Avoid treating local storage as authentication
- Avoid trusting frontend route guards as authorization

## Database Integration

Better Auth requires authentication-related records such as:

- Users
- Accounts
- Sessions

Steward financial tables should reference the Better Auth user identity.

The backend should not maintain a separate unrelated user identity for financial ownership.

The database design should account for:

- Better Auth schema requirements
- Foreign-key relationships to financial records
- Demo-user seeding
- User deletion behavior
- Session cleanup
- Ownership indexes

## Demo User Requirements

The predefined demo user should:

- Exist as a valid Better Auth user
- Authenticate through the Fastify-hosted Better Auth endpoints
- Receive a normal session cookie
- Own its seeded financial records
- Be isolated from regular-user records
- Support resetting its dataset
- Have no administrative privileges

The Fastify reset endpoint must verify:

1. A valid Better Auth session exists.
2. The authenticated user is the designated demo user.
3. The reset affects only that user’s financial data.

## Logging

Authentication logs may include:

- Request identifier
- Endpoint
- Response status
- General failure category
- Unexpected error context

Authentication logs must not include:

- Passwords
- Password hashes
- Session tokens
- Cookies
- Better Auth secrets
- Full authentication request bodies

## Testing Expectations

### Better Auth integration tests

- Registration reaches Better Auth through Fastify
- Sign-in returns the expected session cookie
- Sign-out invalidates the session
- Better Auth headers and cookies are forwarded correctly
- Trusted origins and CORS behave correctly

### Protected route tests

- Missing sessions return `401`
- Valid sessions reach handlers
- Authenticated user information is attached correctly
- Expired sessions are rejected
- Protected handlers do not run when authentication fails

### Authorization tests

- Users can access their own resources
- Users cannot access another user’s resources
- Client-provided user IDs cannot change request ownership
- Demo reset is restricted to the designated demo user

### End-to-end tests

- Regular-user registration
- Regular-user sign-in
- Demo-account sign-in
- Session restoration after reload
- Protected frontend-route redirection
- Protected Fastify-route rejection
- Sign-out
- Expired-session behavior

## Success Criteria

The Better Auth and Fastify integration is successful when:

- Better Auth endpoints operate through Fastify.
- Registration and sign-in create valid sessions.
- Cookies are forwarded correctly.
- Fastify can retrieve the current Better Auth session.
- Protected routes reject unauthenticated requests.
- Feature handlers receive a validated authenticated identity.
- Financial records are scoped to their owners.
- The demo user follows the same authentication path as regular users.
- CORS and trusted-origin settings are explicit and safe.
- Authentication behavior is covered by integration tests.
