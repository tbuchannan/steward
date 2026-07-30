# Authentication Workflow

**Requirements:** `AUTH-01`–`AUTH-06`, `DEMO-01`
**Status:** Accepted

## Registration

```text
Open Register
→ Enter name, email, password, and confirmation
→ Correct field-level validation errors
→ Submit
→ Receive an authenticated session
→ Open Dashboard
```

Passwords are never repopulated after a failed server request. Duplicate-email and unexpected errors use safe, non-technical messages.

## Sign In

```text
Open Login
→ Enter email and password
→ Submit
→ Receive an authenticated session
→ Open the intended protected route or Dashboard
```

Authentication errors do not reveal whether a specific email address exists.

## Demo Entry

```text
Open Login
→ Continue with Demo
→ Create isolated demo identity and seed data
→ Receive a normal authenticated session
→ Open Dashboard
```

The control shows pending state and prevents duplicate submissions.

## Protected Access

While session state is unresolved, the application shows a neutral loading state rather than protected content. An invalid or expired session clears private client caches and returns the user to Login with a concise explanation.

## Sign Out

Sign out invalidates the server session, clears private client state, and redirects to Login. It never deletes financial data or resets a demo.

Shared form, loading, and error behavior is defined in [design patterns](../design/patterns.md).
