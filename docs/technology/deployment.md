# Deployment

## Decision

Steward will use:

- Vercel for the React and Vite frontend
- Railway for the Fastify backend
- Railway for PostgreSQL hosting

The frontend, backend, and database will be deployed as separate services.

## Deployment Architecture

```text
Browser
   |
   | HTTPS
   v
Vercel
React + Vite frontend
   |
   | Credentialed HTTPS requests
   v
Railway
Fastify API
   |
   | Private database connection
   v
Railway PostgreSQL
```

## Platform Responsibilities

### Vercel

Vercel is responsible for:

- Building the React application
- Hosting the generated Vite static assets
- Serving the frontend over HTTPS
- Providing production deployments
- Providing preview deployments
- Managing frontend environment variables
- Connecting deployments to the Git repository
- Serving client-side application routes correctly

### Railway

Railway is responsible for:

- Building and running the Fastify backend
- Exposing the API over HTTPS
- Managing backend environment variables and secrets
- Hosting PostgreSQL
- Providing the backend database connection
- Running health checks
- Providing backend deployment logs
- Supporting backend deployment rollbacks
- Providing database backup capabilities

## Deployment Units

Steward will use three deployment units:

```text
Frontend service
→ Vercel

Backend service
→ Railway

PostgreSQL service
→ Railway
```

The frontend and backend should not be combined into one deployment solely to reduce the number of services.

## Repository Layout

The exact repository structure has not yet been finalized.

A likely monorepo structure is:

```text
steward/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   └── contracts/
├── docs/
├── package.json
└── workspace configuration
```

In this structure:

```text
apps/web
→ React, Vite, and TanStack Router

apps/api
→ Fastify, Better Auth, Drizzle, and Zod

packages/contracts
→ Shared public Zod contracts where appropriate
```

Vercel and Railway should each be configured with the appropriate application directory as their root directory.

The final repository structure will be documented during the Application Architecture epic.

## Deployment Environments

Steward should distinguish between:

- Local development
- Preview
- Production
- Test

## Local Development

Local development uses:

- Vite development server
- Local Fastify server
- Local PostgreSQL instance
- Local environment files

Example local origins:

```text
Frontend:
http://localhost:5173

Backend:
http://localhost:3000
```

The exact ports may change.

Local configuration should mirror production boundaries where practical.

## Preview Environment

Vercel should create frontend preview deployments for eligible Git branches and pull requests.

A preview deployment may communicate with:

- A shared non-production Railway API
- A dedicated staging Railway API
- A branch-specific API environment if introduced later

The initial project does not require an isolated backend and database for every pull request.

Preview deployments must not use production secrets or unrestricted production data.

## Production Environment

Production uses:

```text
Frontend
→ Vercel production deployment

Backend
→ Railway production service

Database
→ Railway PostgreSQL production service
```

Production environment variables must be configured separately from local and preview values.

## Frontend Deployment

The React frontend will be built by Vite and deployed to Vercel.

The expected build process is:

```text
Install dependencies
→ Type-check frontend
→ Build Vite application
→ Deploy generated static assets
```

A likely production build command is:

```text
build
```

The expected Vite output directory is:

```text
dist
```

The exact commands depend on the selected package manager and repository structure.

## Vercel Project Configuration

The Vercel project should specify:

- Frontend root directory
- Install command where customization is necessary
- Build command
- Output directory
- Production branch
- Frontend environment variables
- Client-side routing behavior

Vercel framework detection may configure common Vite defaults automatically.

Repository configuration should remain explicit enough that another developer can understand how the application is built.

## Single-Page Application Routing

Steward is a client-rendered application using TanStack Router.

Requests for application routes such as:

```text
/dashboard
/accounts
/transactions
/budgets/2026/07
/settings
```

must return the frontend application entry point rather than a static 404 response.

The Vercel project should use an appropriate rewrite or Vite-compatible SPA routing configuration.

Static assets and other platform-managed paths must continue to resolve normally.

## Frontend Environment Variables

The Vercel frontend may use browser-safe environment variables such as:

```text
VITE_API_URL
VITE_APP_ENV
```

Example production value:

```text
VITE_API_URL=https://api.example.com
```

The final API domain has not yet been selected.

Vite environment variables are included in browser-delivered code when referenced by the application.

They must not contain secrets.

The frontend must never contain:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- Database passwords
- Private service credentials
- Demo-user passwords
- Session tokens
- Railway private-network addresses

## Backend Deployment

The Fastify API will run as a persistent Railway service.

The backend deployment process should:

```text
Install dependencies
→ Type-check backend
→ Build TypeScript
→ Apply required database migrations
→ Start Fastify
```

The exact migration strategy is defined separately in this document.

## Railway Build

Railway may build the backend using:

- Automatic Node.js detection
- Explicit build and start commands
- A Dockerfile if custom build behavior becomes necessary

The initial implementation should prefer the simplest reliable deployment method.

A Dockerfile should not be added unless it provides a concrete benefit.

## Backend Start Command

The production start command must run compiled backend code.

Conceptually:

```text
node dist/server.js
```

The exact path depends on the final backend build configuration.

Production should not depend on a development-only TypeScript runner unless that choice is explicitly reviewed.

## Railway Port

The Fastify server must listen on Railway’s provided port.

Conceptually:

```text
PORT
```

The server should also bind to an externally reachable host:

```text
0.0.0.0
```

The application must not assume that the production port is always `3000`.

## Railway Backend Variables

The Railway backend should receive server-only values such as:

```text
NODE_ENV
PORT
DATABASE_URL
BETTER_AUTH_SECRET
BETTER_AUTH_URL
FRONTEND_ORIGIN
TRUSTED_ORIGINS
LOG_LEVEL
DEMO_USER_EMAIL
```

Additional values may be added as requirements become known.

Secrets must be managed through Railway variables and must not be committed to the repository.

## PostgreSQL Deployment

PostgreSQL will run as a Railway database service.

The Fastify service should connect using Railway-provided PostgreSQL variables.

The primary application connection should use:

```text
DATABASE_URL
```

The backend should not construct a production connection string from hard-coded credentials.

## Private Database Connectivity

The backend should use Railway’s internal or private service connectivity when available.

The production database should not be exposed publicly unless an explicit operational need requires it.

External database access may still be needed temporarily for:

- Administrative tools
- Local migration commands
- Approved database inspection
- Data recovery

External access should remain restricted.

## Database Connection Pool

The Fastify backend should maintain a shared PostgreSQL connection pool.

The pool should:

- Be created during startup
- Be reused across requests
- Use environment-appropriate limits
- Be shared with Drizzle
- Be closed during graceful shutdown
- Avoid creating a new connection for every request

Connection limits should account for the resources available to the Railway PostgreSQL service.

## Better Auth Production URL

Better Auth must be configured with the final production backend URL.

Conceptually:

```text
BETTER_AUTH_URL=https://api.example.com
```

The exact environment-variable name should follow the installed Better Auth version and application configuration.

The value should point to the externally accessible Fastify API origin rather than the Vercel frontend origin.

## Trusted Origins

Better Auth and Fastify CORS should trust only approved frontend origins.

Potential trusted origins include:

```text
http://localhost:5173
https://steward.example.com
Approved Vercel preview origins
```

Production should not allow arbitrary origins.

Preview-origin support must be implemented deliberately rather than by allowing every requesting origin.

## CORS

Because Vercel and Railway use different origins, the Fastify API must configure credential-aware CORS.

The configuration should:

- Allow the production Vercel frontend origin
- Allow approved preview origins
- Allow the local frontend during development
- Allow credentials
- Reject unrelated origins
- Support Better Auth session cookies
- Use environment-specific configuration

Wildcard origins must not be used with credentialed authentication requests.

## Authentication Cookies

The deployed authentication setup must account for:

- HTTPS
- Secure cookies
- Same-site policy
- Frontend and API domains
- Credentialed browser requests
- Better Auth trusted origins
- Preview deployments

The final domain structure should be chosen before cookie behavior is finalized.

A custom domain structure such as:

```text
app.example.com
api.example.com
```

may simplify the relationship between frontend and API services.

## Health Check

The Railway backend should expose a health-check route.

Recommended route:

```text
GET /health
```

A successful response may be:

```json
{
  "status": "ok"
}
```

The health check should confirm that the Fastify process is ready to receive requests.

The initial health check should not expose:

- Secrets
- Environment variables
- Database credentials
- Internal configuration
- User data
- Detailed dependency information

## Readiness and Database State

The Railway health check should only report success after the Fastify application has completed startup.

This includes:

- Environment validation
- Plugin registration
- Better Auth configuration
- Database client initialization
- Required startup checks

The initial health check does not need to run an expensive database query on every request.

A separate readiness strategy may be introduced later if needed.

## Graceful Shutdown

The Fastify service should handle termination signals.

Shutdown should:

1. Stop accepting new requests.
2. Allow active requests to complete where practical.
3. Close Fastify.
4. Close the PostgreSQL connection pool.
5. Release associated resources.
6. Exit cleanly.

This behavior is required for safe Railway redeployments and restarts.

## Database Migrations

Drizzle Kit will manage production migrations.

Production migrations must be:

- Version controlled
- Reviewed before deployment
- Applied before incompatible application code becomes active
- Logged
- Allowed to fail the deployment
- Kept separate from normal HTTP request handling

The application must not run uncontrolled schema synchronization on every request.

## Migration Strategy

The exact Railway migration mechanism may use one of these approaches:

### Pre-deployment command

Run migrations before the new backend version starts accepting traffic.

### Dedicated migration command

Run a one-time Railway command as part of the release workflow.

### CI deployment workflow

Run migrations from CI before or during an approved production release.

The final mechanism should ensure:

```text
Migration succeeds
→ New backend becomes active

Migration fails
→ Deployment stops
```

Running migrations concurrently from multiple backend replicas should be avoided.

## Migration Command

The migration command should use the project’s Drizzle migration script.

Conceptually:

```text
db:migrate
```

The script should:

- Load validated database configuration
- Connect to Railway PostgreSQL
- Apply pending Drizzle migrations
- Exit successfully when complete
- Exit unsuccessfully when migration fails
- Close the database connection

## Backward-Compatible Migrations

Schema changes should prefer backward-compatible deployment steps.

For more complex changes:

```text
Add compatible schema
→ Deploy compatible application code
→ Migrate or backfill data
→ Remove old schema in a later deployment
```

Destructive schema changes should not be combined casually with application deployment.

## Seed Data

Production startup should not automatically reseed the entire database.

Seed commands should be explicit.

Production seeding may create:

- The initial demo user
- Canonical demo financial data
- Required system categories

Seed commands must:

- Be idempotent where practical
- Avoid overwriting regular users
- Avoid exposing demo credentials
- Run separately from normal backend startup

## Demo Reset

Demo reset remains an authenticated application operation.

It should not depend on redeploying either Railway or Vercel.

The reset should execute through:

```text
React frontend
→ Protected Fastify endpoint
→ Better Auth session validation
→ Drizzle transaction
→ Railway PostgreSQL
```

## Database Backups

The Railway PostgreSQL production service should use scheduled backups when the application reaches a production-ready state.

The backup schedule should reflect:

- Data importance
- Expected update frequency
- Railway plan capabilities
- Acceptable recovery window

At minimum, the project should document:

- Whether backups are enabled
- Backup frequency
- Retention expectations
- Restore procedure
- Who can initiate a restore

Backup availability should not replace migration review or safe deletion practices.

## Recovery

Recovery planning should cover:

- Restoring a database backup
- Rolling back a Railway backend deployment
- Rolling back a Vercel frontend deployment
- Correcting a failed migration
- Restoring demo data
- Rotating compromised secrets

An application rollback does not automatically reverse a database migration.

Database and application rollback compatibility must be considered before deployment.

## Frontend Rollback

A previous Vercel deployment may be promoted or restored when a frontend release fails.

Frontend rollback is generally independent from PostgreSQL when the API contract remains compatible.

A frontend rollback may fail if the backend contract has already changed incompatibly.

## Backend Rollback

Railway may restore a previously successful backend deployment.

A backend rollback must be checked against the current PostgreSQL schema.

The previous backend version may not work if a migration removed or changed required columns.

## Environment Separation

Production resources must remain separate from test resources.

At minimum:

```text
Production frontend
Production backend
Production database

Local frontend
Local backend
Local database

Test backend
Test database
```

A staging environment may be added when the release workflow requires it.

## Preview Deployment Safety

Vercel preview deployments should not automatically receive:

- Production-only secrets
- Database administration credentials
- Unrestricted production API access
- Demo-user passwords
- Private Railway database URLs

Preview frontend deployments should communicate only with an approved API environment.

## Git Deployment

The deployment platforms should connect to the Steward Git repository.

Expected behavior:

```text
Pull request or branch update
→ Vercel preview deployment

Production branch update
→ Vercel production deployment
→ Railway backend deployment
```

The final production branch and deployment controls should be documented.

Automatic production deployment may be enabled after tests and migration safeguards are in place.

## CI Requirements

Before production deployment, CI should eventually verify:

- Installation succeeds
- Formatting checks pass
- Linting passes
- Type checking passes
- Unit tests pass
- Integration tests pass
- Frontend build succeeds
- Backend build succeeds
- Drizzle migrations are valid

Deployment should not replace CI validation.

## Build Reproducibility

The repository should pin:

- Node.js compatibility
- Package-manager version
- Dependency lockfile
- Build scripts

Vercel, Railway, local development, and CI should use compatible runtime and package-manager versions.

## Logging

### Vercel

Frontend deployment logs should be used to diagnose:

- Dependency installation failures
- Type-check failures
- Vite build failures
- Invalid environment configuration
- Missing output files

### Railway

Backend logs should be used to diagnose:

- Startup failures
- Invalid environment variables
- Database connection failures
- Migration failures
- Health-check failures
- Unexpected Fastify errors

Logs must not include:

- Passwords
- Authentication cookies
- Session tokens
- Better Auth secrets
- Database passwords
- Full database URLs
- Sensitive financial payloads

## Observability

The MVP should initially rely on:

- Vercel deployment logs
- Railway deployment and runtime logs
- Fastify structured logs
- Railway service metrics
- PostgreSQL monitoring available through Railway

Additional error tracking or observability services may be introduced later.

## Domains

The initial deployment may use platform-provided domains.

Custom domains may later use a structure such as:

```text
steward.example.com
api.steward.example.com
```

The final domains must be reflected in:

- Vercel configuration
- Railway networking
- `VITE_API_URL`
- Better Auth base URL
- Better Auth trusted origins
- Fastify CORS
- Cookie configuration

## HTTPS

Production frontend and backend traffic must use HTTPS.

The application should not send authentication cookies or financial data over unencrypted public connections.

## Secrets

Secrets must be stored only in approved server-side configuration.

Examples include:

- Better Auth secret
- PostgreSQL credentials
- Database connection URL
- Private service tokens

Secrets must not be:

- Committed to Git
- Stored in Vite browser variables
- Included in frontend bundles
- Printed in deployment logs
- Added directly to documentation
- Included in screenshots

## Deployment Documentation

The repository should eventually document:

- How Vercel is connected
- How Railway is connected
- Required environment variables
- Build commands
- Start commands
- Migration commands
- Health-check path
- Production domains
- Backup configuration
- Rollback procedures

Values that are secret should be represented by variable names rather than real credentials.

## Deployment Testing

Deployment verification should include:

### Frontend

- Root page loads
- Direct navigation to nested routes works
- Static assets load
- Correct API origin is used
- Authentication pages render
- Production build contains no server secrets

### Backend

- Health check succeeds
- Fastify starts using Railway’s port
- CORS accepts approved origins
- CORS rejects unrelated origins
- Better Auth endpoints work
- Protected routes reject unauthenticated requests
- Database connections succeed

### Full application

- Registration works
- Login works
- Demo login works
- Session cookies persist
- Dashboard data loads
- Protected data remains user-scoped
- Sign out works
- Direct browser refreshes work on frontend routes

## Non-Goals

The initial deployment will not require:

- Kubernetes
- AWS infrastructure management
- Multiple production regions
- Active-active databases
- Self-hosted CI runners
- Microservice orchestration
- Custom load balancers
- Multiple backend providers
- Multiple frontend providers
- Per-pull-request PostgreSQL databases
- Enterprise disaster-recovery guarantees

These should only be introduced for concrete operational requirements.

## Success Criteria

The deployment architecture is successful when:

- Vercel builds and serves the React and Vite frontend.
- TanStack Router routes work on direct navigation and refresh.
- Railway builds and runs the Fastify API.
- Fastify listens on Railway’s assigned port.
- Railway health checks pass.
- PostgreSQL is accessible to the backend.
- Drizzle migrations run safely.
- Better Auth cookies work between Vercel and Railway.
- CORS permits only approved frontend origins.
- Secrets remain outside frontend bundles and source control.
- Preview and production environments use appropriate configuration.
- Frontend, backend, and database deployments can be diagnosed and rolled back safely.
