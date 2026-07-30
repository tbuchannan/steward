# ADR 002: Fastify API

**Status:** Accepted
**Date:** 2026-07-30

## Context

Steward needs a typed HTTP API with runtime validation, authentication integration, testable request injection, and low framework overhead.

## Decision

Use Fastify on Node.js with Zod through `fastify-type-provider-zod`.

## Consequences

The application factory remains separate from network listening. Routes define runtime request and response schemas. Framework-specific plugins are isolated from financial services.

## Alternatives

Express, NestJS, GraphQL, and microservices were rejected for the MVP.
