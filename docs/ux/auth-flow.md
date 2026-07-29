# Authentication Flow

## Purpose

Steward uses Better Auth to manage registration, sign-in, sign-out, authenticated sessions, and access to protected financial data.

The authentication experience should remain straightforward while supporting both regular users and a predefined demo account.

## MVP Authentication Scope

The initial version supports:

- Email and password registration
- Email and password sign-in
- Persistent authenticated sessions
- Protected application routes
- Sign out
- Predefined demo-account access

The initial version does not require:

- Email verification
- Password recovery
- Social authentication
- Multi-factor authentication
- Passkeys
- Account linking

These capabilities may be considered after the MVP.

## Registration Flow

```text
Registration page
→ Enter name, email, password, and password confirmation
→ Validate fields
→ Submit registration
→ Better Auth creates the user
→ Authenticated session is created
→ Redirect to dashboard
```

### Registration Fields

- Name
- Email address
- Password
- Password confirmation

### Registration Validation

The interface should identify:

- Missing required fields
- Invalid email address
- Password that does not meet requirements
- Password confirmation mismatch
- Email address already in use

Validation errors should appear near the affected fields.

## Sign-In Flow

```text
Login page
→ Enter email and password
→ Submit credentials
→ Better Auth validates credentials
→ Authenticated session is created
→ Redirect to dashboard
```

When practical, a user who was redirected to login from a protected route should return to the originally requested page after signing in.

## Demo Account Flow

```text
Login page
→ Continue with Demo Account
→ Authenticate as the predefined demo user
→ Load seeded financial data
→ Redirect to dashboard
```

The demo account should use a valid authenticated session rather than bypassing normal authorization checks.

Resetting demo data should restore the predefined dataset without changing the demo user’s identity.

## Protected Route Flow

```text
User requests a protected page
→ Application checks the Better Auth session
→ Valid session: render the requested page
→ Missing or invalid session: redirect to login
```

Protected financial data should not be displayed before the session has been validated.

Authorization must also be enforced when protected data is requested from the server.

## Authenticated Route Behavior

Authenticated users who visit `/login` or `/register` should be redirected to `/dashboard`.

Unauthenticated users who visit protected routes should be redirected to `/login`.

When practical, the application should preserve the originally requested destination.

## Sign-Out Flow

```text
Authenticated application
→ User selects Sign Out
→ Better Auth terminates the active session
→ Authenticated client state is cleared
→ Redirect to login
```

Signing out should not delete user data or reset demo data.

## Session Behavior

The application should:

- Restore valid sessions after normal page reloads.
- Avoid flashing protected content before authentication is resolved.
- Redirect the user when the session is no longer valid.
- Keep financial data isolated by authenticated user.
- Treat server-side authorization as the source of truth.
- Keep session state consistent across the application.

## Loading State

While authentication status is being determined:

- Show a neutral loading state.
- Avoid rendering protected financial content.
- Avoid briefly displaying the login page to an authenticated user.
- Preserve the intended destination when practical.

## Registration Error State

Possible registration errors include:

- Email address already in use
- Invalid email address
- Password does not meet requirements
- Registration temporarily unavailable

The user should be able to correct the affected fields and resubmit the form.

## Sign-In Error State

Possible sign-in errors include:

- Incorrect email or password
- Session could not be created
- Sign-in temporarily unavailable

Authentication errors should use clear, non-technical language.

The email field may remain populated after a failed attempt, but the password should not be preserved.

## Session-Expired State

When a session expires:

- Explain that the user must sign in again.
- Redirect to the login page.
- Preserve the intended destination when practical.
- Do not display protected data from the expired session.

## Success Criteria

The authentication flow is successful when:

- A new user can register and reach the dashboard.
- An existing user can sign in.
- A visitor can enter through the demo account.
- Protected routes cannot be accessed without a valid session.
- Valid sessions survive normal page reloads.
- User data remains isolated by authenticated user.
- Signing out reliably ends access to protected data.
