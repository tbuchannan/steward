# Authentication Architecture

**Status:** Accepted
**Last verified:** 2026-07-30

## Decision

Better Auth provides email/password identity and cookie-based sessions. Its official Drizzle adapter stores authentication records in the same PostgreSQL database used by Steward.

The generated Better Auth schema is incorporated into Steward's Drizzle migration history rather than maintained by a separate migration process.

## Production Request Path

```text
Browser /api/auth/*
→ Vercel same-origin rewrite
→ Railway Fastify
→ Better Auth
→ Drizzle
→ PostgreSQL
```

This avoids relying on third-party cookies across unrelated Vercel and Railway domains. The proxy and trusted-host configuration must preserve the original HTTPS host safely.

## Identity and Authorization

- The Better Auth user ID is the canonical identity.
- Fastify retrieves the session once per protected request.
- The browser never supplies the authoritative user ID.
- Steward services and database queries enforce ownership.
- Frontend route guards are not authorization.

## Supported Scope

- Registration with name, email, and password
- Email/password sign-in
- Persistent sessions
- Sign out
- Protected frontend and API routes
- Isolated temporary demo identities

Password recovery, email verification, social authentication, MFA, passkeys, and session management are deferred.

## Demo Authentication

Demo entry creates a normal Better Auth user, authentication account, and session. The identity is marked as temporary in application-owned metadata; no public request can choose another user's demo identity.

Rate limiting and cleanup prevent unbounded identity creation. Reset preserves the active user and session while replacing only that user's financial dataset.

## Cookies and Origins

- Production cookies are Secure, HttpOnly, and scoped as narrowly as practical.
- Better Auth trusted origins are explicit and environment-specific.
- Local development uses approved localhost origins.
- Preview authentication requires an explicit host policy; arbitrary preview origins are not trusted.
- CSRF or origin validation is never disabled to make deployment easier.

## Schema Updates

When the pinned Better Auth version changes:

1. Review its upgrade notes.
2. Regenerate the Drizzle authentication schema.
3. Review the diff and resulting SQL migration.
4. Run authentication and migration integration tests.
5. Deploy the schema before code that requires it.
