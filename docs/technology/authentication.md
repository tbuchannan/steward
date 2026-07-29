# Authentication

## Purpose

Steward uses Better Auth to manage user registration, sign-in, sign-out, authenticated sessions, and access to protected financial data.

Authentication should remain simple enough for the MVP while still using real server-validated sessions and user-specific data access.

## Authentication Provider

Steward uses Better Auth as its authentication framework.

Better Auth is responsible for:

- Creating users
- Authenticating credentials
- Creating and validating sessions
- Ending sessions
- Exposing authenticated-user information
- Supporting protected server requests
- Storing authentication-related user, account, and session records

Steward should use Better Auth directly rather than creating a separate custom authentication system.

## MVP Authentication Scope

The initial version supports:

- Email and password registration
- Email and password sign-in
- Persistent authenticated sessions
- Protected application routes
- Protected API and server operations
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
- Multiple active-session management

These capabilities may be added later through Better Auth if they support a clear product need.

## Better Auth Configuration

Email and password authentication must be explicitly enabled in the Better Auth configuration.

The application should maintain a single server-side Better Auth instance as the source of truth for authentication behavior.

A client-side Better Auth client may be used for actions such as:

- Registration
- Sign-in
- Sign-out
- Accessing the current session
- Reactively responding to authentication changes

Authentication configuration should remain separate from page components and feature-specific business logic.

## Registration Flow

```text
Registration page
→ Enter name, email, password, and password confirmation
→ Validate form input
→ Submit registration through Better Auth
→ Better Auth creates the user and credential account
→ Better Auth creates an authenticated session
→ Redirect to dashboard
```

### Registration Fields

- Name
- Email address
- Password
- Password confirmation

Password confirmation is a Steward form-validation concern and does not need to be stored or sent beyond what is required to verify that both password fields match.

### Registration Validation

The interface should identify:

- Missing required fields
- Invalid email address
- Password that does not meet requirements
- Password confirmation mismatch
- Registration failure

Validation errors should appear near the affected fields.

The interface should avoid exposing unnecessary information about whether a specific email address belongs to an existing user.

## Sign-In Flow

```text
Login page
→ Enter email and password
→ Submit credentials through Better Auth
→ Better Auth validates the credentials
→ Better Auth creates or restores the authenticated session
→ Redirect to dashboard or intended protected page
```

When practical, a user redirected from a protected route should return to the originally requested page after signing in.

The login form may include a remember-session option if that behavior is supported by the final session configuration.

## Demo Account Flow

```text
Login page
→ Continue with Demo Account
→ Steward submits the predefined demo credentials securely
→ Better Auth authenticates the demo user
→ Better Auth creates or restores the demo session
→ Redirect to dashboard
```

The demo account should use the same Better Auth session and authorization behavior as a regular user.

The demo experience must not bypass:

- Session validation
- Route protection
- API authorization
- User ownership checks

Demo credentials should not be exposed directly in client-visible source code when avoidable.

Resetting demo data should restore the predefined financial dataset without changing the demo user’s Better Auth identity.

## Session Model

Better Auth uses cookie-based session management.

The session is sent with authenticated requests and validated by the server before protected user information or financial data is returned. :contentReference[oaicite:0]{index=0}

Steward should treat the Better Auth session as the source of truth for the current authenticated user.

The application should not rely solely on:

- Client-side state
- Local storage authentication flags
- Route visibility
- Hidden UI controls

Client-side session state is useful for rendering the interface, but server-side validation must control access to protected data.

## Session Access

The application may access the session:

- On the client for responsive authenticated UI
- On the server for protected routes and data operations
- In API handlers before accessing user-owned resources

Better Auth supports retrieving session information from both client-side and server-side contexts. :contentReference[oaicite:1]{index=1}

The authenticated user ID should be derived from the validated Better Auth session rather than accepted from client input.

## Protected Route Flow

```text
User requests protected page
→ Application checks the Better Auth session
→ Valid session: render the requested page
→ Missing or invalid session: redirect to login
```

Protected pages include:

- Dashboard
- Accounts
- Account details
- Transactions
- Budgets
- Settings

Protected financial content should not be rendered before session validation is complete.

## Protected Data Flow

```text
Authenticated client requests financial data
→ Server validates Better Auth session
→ Server derives user ID from session
→ Query is restricted to resources owned by that user
→ Authorized data is returned
```

Every protected data operation should validate ownership.

A user-provided account ID, transaction ID, budget ID, or category ID must not be treated as sufficient authorization.

## Authenticated Route Behavior

Authenticated users visiting public authentication routes should be redirected:

```text
/login
/register
→ /dashboard
```

Unauthenticated users visiting protected routes should be redirected:

```text
Protected route
→ /login
```

When practical, the original destination should be preserved so the user can continue after signing in.

## Sign-Out Flow

```text
Authenticated application
→ User selects Sign Out
→ Better Auth terminates the active session
→ Client authentication state is cleared
→ Redirect to login
```

Signing out should not delete user data.

Signing out of the demo account should not reset demo financial data.

## Session Expiration

When a session expires or becomes invalid:

- Protected requests should be rejected.
- The user should be redirected to the login page.
- The interface should explain that the session expired.
- Protected financial data should no longer be displayed.
- The intended destination should be preserved when practical.

The application should not continue displaying stale protected data after session invalidation.

Better Auth’s session duration and refresh behavior should be configured centrally rather than duplicated throughout the application.

## Authentication Loading State

While authentication status is being determined:

- Show a neutral loading state.
- Avoid rendering protected financial data.
- Avoid briefly displaying the login page to an authenticated user.
- Avoid briefly displaying the authenticated application to an unauthenticated user.
- Preserve the intended destination when practical.

## Registration Error State

Possible registration errors include:

- Invalid form values
- Password does not meet requirements
- Registration could not be completed
- Authentication service temporarily unavailable

The user should be able to correct the affected fields and submit again.

The password fields should be cleared when preserving them would create a security concern.

## Sign-In Error State

Possible sign-in errors include:

- Incorrect email or password
- Session could not be created
- Sign-in temporarily unavailable

Authentication errors should use clear, non-technical language.

The email field may remain populated after a failed sign-in attempt.

The password field should not remain populated after submission.

## Security Expectations

The authentication implementation should:

- Use Better Auth’s built-in password handling
- Use secure session cookies
- Keep authentication secrets outside source control
- Validate sessions on the server
- Derive user identity from the session
- Restrict financial queries by authenticated user
- Avoid exposing detailed authentication failures
- Avoid storing raw passwords
- Avoid building custom password hashing
- Avoid using local storage as the authentication source of truth

Better Auth stores credential passwords through its account model and handles password hashing as part of email-and-password authentication. :contentReference[oaicite:2]{index=2}

## Data Ownership

Authentication identifies the user, while application authorization determines which Steward records that user may access.

User-owned entities should include or resolve to an authenticated user ID.

Examples include:

- Accounts
- Transactions
- Categories
- Budgets
- Budget allocations
- User preferences

Every read and write operation involving user-owned financial data should be scoped to the authenticated user.

## Database Considerations

Better Auth requires authentication-related database records such as users, accounts, and sessions.

Steward’s financial tables should reference the Better Auth user identity rather than maintaining a separate unrelated application-user identity.

The final database design should account for:

- Better Auth user records
- Credential account records
- Session records
- Relationships between the authenticated user and Steward financial data
- Deletion and archival behavior
- Demo-user seeding

Better Auth’s schema and migration strategy should be incorporated into the broader Steward database plan rather than managed as a disconnected system.

## Demo User Requirements

The predefined demo user should:

- Exist as a valid Better Auth user
- Have a valid credential account or supported demo-authentication mechanism
- Receive a normal authenticated session
- Own the seeded demo financial data
- Be isolated from regular-user data
- Support resetting its financial dataset
- Avoid exposing privileged administration capabilities

The reset operation should verify that the authenticated user is the designated demo user before replacing demo data.

## Testing Expectations

Authentication tests should cover:

- Successful registration
- Registration validation failure
- Successful sign-in
- Invalid sign-in credentials
- Demo-account sign-in
- Protected-route redirection
- Authenticated access to protected routes
- Sign-out
- Session restoration after page reload
- Expired or invalid session behavior
- User-data isolation
- Rejection of access to another user’s financial records

End-to-end tests should verify at least one complete authentication flow through the browser.

## Success Criteria

The authentication implementation is successful when:

- A new user can register.
- An existing user can sign in.
- A visitor can enter through the demo account.
- Better Auth creates and validates sessions.
- Valid sessions survive normal page reloads.
- Public and protected routes behave correctly.
- Protected API operations reject unauthenticated requests.
- Financial data is restricted to its authenticated owner.
- Signing out reliably ends access to protected data.
- Session expiration returns the user to login safely.
- The demo account uses the same authorization model as regular users.
