# ADR 001: React and Vite SPA

**Status:** Accepted
**Date:** 2026-07-30

## Context

Steward is an authenticated application with no MVP requirement for search-indexed public content or server-rendered pages.

## Decision

Use React, TypeScript, and Vite for a client-rendered single-page application. Use TanStack Router for typed routes and TanStack Query for server state.

## Consequences

Vercel must rewrite unknown application routes to the SPA entry point. Authentication loading must avoid rendering protected content before session resolution. Server rendering may be reconsidered only if future public-content requirements justify it.

## Alternatives

Next.js, TanStack Start, and React Router were considered but do not provide enough MVP value to offset changing the selected architecture.
