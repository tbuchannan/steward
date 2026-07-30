# ADR 005: Same-Origin API Proxy

**Status:** Accepted
**Date:** 2026-07-30

## Context

The frontend is hosted by Vercel and the Fastify API by Railway. Direct browser calls between unrelated hosting domains can make authentication cookies third-party and unreliable in privacy-restrictive browsers.

## Decision

The browser calls relative `/api/*` URLs. Vercel rewrites these requests to the Railway API while preserving the approved original host and protocol.

## Consequences

Production browser authentication is same-origin. The proxy must not cache personalized API or authentication responses. Preview hosts require an explicit Better Auth trusted-origin policy. Railway remains independently protected and observable.

## Alternatives

Direct cross-origin credentialed requests were rejected. Sibling custom domains remain a possible future topology if they share a controlled parent domain.
