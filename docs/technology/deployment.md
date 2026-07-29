# Deployment

## Decision

Steward will use:

- Vercel for the React and Vite frontend
- Railway for the Fastify backend
- Railway PostgreSQL for the production database
- GitHub Actions for continuous integration
- pnpm for dependency installation and workspace scripts
- pnpm workspaces for monorepo management

The frontend, backend, and database will remain separate deployment units.

Production deployments should be gated by automated testing.

Docker Compose is not required for normal local development.

Kubernetes will not be used.

## Selected Technologies

The confirmed deployment technologies are:

- Vercel
- Railway
- Railway PostgreSQL
- GitHub Actions
- pnpm
- pnpm workspaces
- Vite production builds
- Node.js production builds
- Drizzle Kit migrations
- `pg` / node-postgres
- Vitest
- React Testing Library
- Fastify `inject()`
- Testcontainers for Node.js
- Playwright

Still undecided:

- Custom domains
- Error monitoring
- Production log aggregation
- Status-page provider
- Backup schedule

## Deployment Architecture

```text
User browser
      |
      | HTTPS
      v
Vercel
React + TypeScript + Vite
      |
      | Credentialed HTTPS requests
      v
Railway
Fastify + TypeScript
      |
      | Private PostgreSQL connection
      v
Railway PostgreSQL
```

## Deployment Units

Steward will use three production units:

```text
Frontend application
→ Vercel

Backend API
→ Railway

PostgreSQL database
→ Railway
```

These units should not be combined solely to reduce service count.

## Platform Responsibilities

### Vercel

Vercel is responsible for:

- Installing frontend dependencies
- Building the React and Vite application
- Hosting static assets
- Serving the frontend over HTTPS
- Creating production deployments
- Creating preview deployments
- Managing frontend environment variables
- Connecting to the Git repository
- Supporting frontend rollback
- Serving client-side routes correctly

### Railway backend

Railway is responsible for:

- Installing backend dependencies
- Building TypeScript
- Running the Fastify process
- Exposing the API over HTTPS
- Managing backend variables and secrets
- Running health checks
- Providing deployment logs
- Supporting deployment rollback
- Connecting to Railway PostgreSQL
- Restarting failed services according to platform behavior

### Railway PostgreSQL

Railway PostgreSQL is responsible for:

- Hosting production relational data
- Providing connection variables
- Supporting private service connectivity
- Providing database service logs and metrics
- Supporting backup capabilities according to the selected plan

### GitHub Actions

GitHub Actions is responsible for:

- Installing dependencies with the pinned pnpm version
- Running formatting and linting checks
- Running TypeScript checks
- Running unit and component tests
- Running Fastify and PostgreSQL integration tests
- Verifying Drizzle migrations against a clean PostgreSQL Testcontainer
- Building the frontend and backend
- Running critical Playwright workflows
- Publishing useful failure artifacts
- Blocking invalid changes from production deployment

## Repository Layout

Steward will use a pnpm monorepo managed with pnpm workspaces.

The selected layout is:

```text
steward/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   └── contracts/
├── e2e/
├── docs/
├── .github/
│   └── workflows/
├── package.json
├── pnpm-lock.yaml
└── pnpm-workspace.yaml
```

In this structure:

```text
apps/web
→ React, Vite, TanStack Router, Tailwind CSS, shadcn/ui

apps/api
→ Fastify, Better Auth, Drizzle, Zod

packages/contracts
→ Shared public Zod contracts

e2e
→ Playwright browser tests

.github/workflows
→ GitHub Actions continuous-integration workflows
```

Vercel and Railway should each use the correct application root directory.

Turborepo will not be introduced initially. pnpm workspaces provide enough functionality for the current project.

## Environments

Steward should distinguish:

- Local development
- Automated test
- Preview
- Production

A staging environment may be introduced later.

## Local Development

The selected local setup is:

```text
Frontend:
http://localhost:5173

Backend:
http://localhost:3000

Database:
Locally installed PostgreSQL
```

The exact ports may change.

The frontend and backend will run directly on the local Node.js environment. Docker Compose is not required for normal development.

Local development should preserve production boundaries where practical:

```text
React frontend
→ HTTP request
→ Fastify backend
→ PostgreSQL
```

## Automated Test Environment

Automated integration tests should use:

```text
Vitest
→ Fastify inject()
→ PostgreSQL Testcontainer
```

Automated end-to-end tests should use:

```text
Playwright
→ Local or CI frontend
→ Local or CI backend
→ Disposable PostgreSQL database
```

Test jobs must not access production data.

## Preview Environment

Vercel may create preview frontend deployments for pull requests and branches.

Preview deployments may communicate with:

- A shared non-production Railway API
- A staging API
- A temporary test API if introduced later

The initial project does not require one isolated Railway backend and PostgreSQL database for every pull request.

Preview deployments must not receive:

- Production database credentials
- Better Auth production secrets
- Private Railway database addresses
- Demo-user passwords
- Unrestricted production API access

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

Production variables must be configured separately from local, test, and preview values.

## Git Deployment

The platforms should connect to the Steward Git repository.

Expected behavior may be:

```text
Pull request
→ GitHub Actions checks
→ Vercel preview deployment

Production branch update
→ Required GitHub Actions checks
→ Vercel production deployment
→ Railway production deployment
```

GitHub Actions is the selected CI provider. The exact production approval policy should be documented as the project approaches public launch.

## Deployment Branch

A likely production branch is:

```text
main
```

Production deployment should not rely on arbitrary developer branches.

Protected-branch rules should eventually require successful checks.

## Package Manager and Workspaces

All deployment environments will use pnpm.

The repository should pin the pnpm version through the root `package.json`:

```json
{
  "packageManager": "pnpm@<pinned-version>"
}
```

Corepack may activate the pinned version in local development, GitHub Actions, Vercel, and Railway.

The deployment model uses pnpm workspaces with these primary packages:

```text
apps/web
apps/api
packages/contracts
e2e
```

Turborepo is not required initially.

## Frontend Build

The Vercel frontend build should:

1. Install dependencies.
2. Validate required public environment variables.
3. Type-check the frontend.
4. Run required tests according to deployment workflow.
5. Build the Vite application.
6. Publish generated assets.

A likely output directory is:

```text
dist
```

The commands will use pnpm and pnpm workspace filters.

## Frontend Build Command

A likely command from `apps/web` is:

```text
pnpm build
```

A likely command from the repository root is:

```text
pnpm --filter @steward/web build
```

In a monorepo, the Vercel project may invoke a workspace-specific command.

Example root script:

```text
pnpm build:web
```

The repository should provide clear scripts rather than relying on undocumented platform defaults.

## Vercel Root Directory

If Steward uses a monorepo, the Vercel project should set the frontend root directory to:

```text
apps/web
```

or use a repository-root workspace command.

The final choice should avoid duplicated dependency installation where possible.

## Single-Page Application Routing

Steward uses TanStack Router in a client-rendered Vite application.

Direct navigation to application routes must return the frontend entry document.

Examples include:

```text
/dashboard
/accounts
/accounts/:accountId
/transactions
/budgets/2026/07
/settings
```

Without an appropriate rewrite, direct route refreshes may return a static 404.

The Vercel configuration should rewrite application routes to:

```text
/index.html
```

while preserving:

- Static assets
- Public files
- Platform-managed paths

This behavior must be covered by Playwright or deployed smoke tests.

## Frontend Environment Variables

Browser-safe Vercel variables may include:

```text
VITE_API_URL
VITE_APP_ENV
```

Example:

```text
VITE_API_URL=https://api.example.com
```

Vite-prefixed values are exposed to the browser.

They must not include:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- Database passwords
- Session tokens
- Private API keys
- Railway private-network addresses
- Demo-user passwords

## Backend Build

The Railway backend build should:

1. Install dependencies.
2. Validate build configuration.
3. Type-check the backend.
4. Build TypeScript.
5. Prepare the production start command.
6. Run deployment migrations through the approved release mechanism.
7. Start Fastify.

Testing may run in CI before Railway receives the deployment.

## Railway Build Strategy

Railway may use:

- Automatic Node.js build detection
- Explicit pnpm build and start commands
- A Dockerfile only if a concrete deployment need appears later

The initial deployment should prefer Railway's standard Node.js build behavior with explicit pnpm workspace scripts.

A Dockerfile is not required for the initial deployment.

## Backend Build Output

A likely build output is:

```text
apps/api/dist/
```

The exact structure depends on repository organization.

Production should run compiled JavaScript.

## Backend Start Command

A likely command is:

```text
node dist/server.js
```

In a monorepo, it may be:

```text
node apps/api/dist/server.js
```

The final script should be represented through a package command rather than duplicated manually across systems.

## Railway Port

Railway provides the backend port through:

```text
PORT
```

Fastify must listen on that port.

The server should bind to:

```text
0.0.0.0
```

The application must not assume production uses port `3000`.

## Railway Variables

The backend may require:

```text
NODE_ENV
HOST
PORT
DATABASE_URL
BETTER_AUTH_SECRET
BETTER_AUTH_URL
FRONTEND_ORIGIN
TRUSTED_ORIGINS
LOG_LEVEL
DEMO_USER_EMAIL
```

Additional values may be introduced as features are added.

Secrets should be configured through Railway variables.

They must not be committed to the repository.

## Database Connection

The Fastify backend should connect through Railway-provided database variables.

The primary connection should use:

```text
DATABASE_URL
```

The application should not hard-code:

- Host
- Port
- Username
- Password
- Database name

## Private Database Networking

The backend should use Railway private networking where available.

The production PostgreSQL service should not be publicly exposed without a concrete operational requirement.

External access should be limited to approved administration or recovery workflows.

## Connection Pool

The backend should create one shared `pg.Pool`.

The pool should:

- Initialize during startup
- Use the `pg` / node-postgres driver
- Be passed to `drizzle-orm/node-postgres`
- Be shared with Drizzle
- Be reused across requests
- Respect Railway and PostgreSQL connection limits
- Close during graceful shutdown
- Avoid one connection per request

Connection limits should be configurable if deployment scale changes.

## Better Auth URL

Better Auth must know the production API origin.

Conceptually:

```text
BETTER_AUTH_URL=https://api.example.com
```

The exact variable name and configuration should follow the installed Better Auth version.

The value should reference the Fastify API origin.

## Frontend Origin

The backend should know the approved frontend origin.

Conceptually:

```text
FRONTEND_ORIGIN=https://steward.example.com
```

Multiple trusted origins may be represented separately.

## CORS

Because the frontend and backend are separate origins, Fastify must use credential-aware CORS.

The configuration should:

- Allow local development frontend
- Allow production Vercel frontend
- Allow approved preview origins
- Allow credentials
- Reject unrelated origins
- Support Better Auth cookies
- Use environment-specific values

Wildcard origins must not be used with credentials.

## Preview Origins

Vercel preview origins may be temporary.

Possible strategies include:

- Explicit allowlist
- Controlled suffix validation
- Dedicated preview API without credentials
- Disabling authentication in arbitrary previews
- Using a stable custom preview domain

The final strategy should not accept arbitrary malicious origins.

## Cookie Configuration

Authentication cookie behavior must account for:

- HTTPS
- Secure attribute
- HttpOnly attribute
- SameSite policy
- Frontend origin
- API origin
- Custom domain structure
- Preview deployments
- Local development

The production cookie configuration should be verified in a production-like browser test.

## Custom Domains

The initial application may use platform domains.

A later custom-domain structure may use:

```text
Frontend:
steward.example.com

Backend:
api.steward.example.com
```

Custom domains must be reflected in:

- Vercel
- Railway
- DNS
- `VITE_API_URL`
- Better Auth base URL
- Fastify CORS
- Trusted origins
- Cookie configuration
- Playwright deployment tests

## HTTPS

Production frontend and backend traffic must use HTTPS.

Authentication cookies and financial data must not travel over unencrypted public connections.

## Health Check

Railway should use:

```text
GET /health
```

A successful response may be:

```json
{
  "status": "ok"
}
```

The health route should not expose:

- Secrets
- Database credentials
- Environment variables
- Internal service names
- User data

## Health-Check Activation

A new Railway deployment should not become active until the health endpoint succeeds.

The backend should report ready only after:

- Environment validation
- Fastify plugin registration
- Database client initialization
- Better Auth configuration
- Route registration

## Graceful Shutdown

The backend should handle termination signals.

Shutdown should:

1. Stop accepting new requests.
2. Allow active requests to finish where practical.
3. Close Fastify.
4. Close the shared `pg.Pool` with `pool.end()`.
5. Release resources.
6. Exit cleanly.

This supports safe Railway redeployment.

## Database Migrations

Drizzle Kit will manage production migrations.

Migrations must be:

- Version controlled
- Reviewed
- Applied before incompatible application code becomes active
- Logged
- Allowed to stop a failed release
- Separate from normal request handling

## Migration Strategy

The final release workflow may use:

### Railway pre-deploy command

Run migrations before activating the new backend.

### Dedicated migration command

Run a one-time release command.

### CI-managed migration

Run migrations from an approved CI release job.

The selected mechanism must ensure:

```text
Migration succeeds
→ New backend activates

Migration fails
→ Deployment stops
```

## Migration Concurrency

Migrations must not run concurrently from multiple backend replicas.

The deployment process should have one clearly owned migration step.

The Fastify startup command should not cause every process to race to migrate.

## Migration Command

A package script should provide a command such as:

```text
db:migrate
```

The migration script should:

- Validate database configuration
- Connect to PostgreSQL through `pg`
- Apply pending migrations
- Exit successfully when complete
- Exit unsuccessfully on failure
- Close its `pg` pool with `pool.end()`

## Backward-Compatible Releases

Complex changes should use staged deployment.

Example:

```text
Add compatible schema
→ Deploy compatible backend
→ Backfill data
→ Deploy new behavior
→ Remove old schema later
```

This reduces rollback risk.

## Production Seeds

Production startup must not automatically reseed all data.

Seed commands should be explicit.

Production seeding may create:

- Demo user
- Demo financial data
- Required system categories

Seed commands should be:

- Environment-aware
- Idempotent where practical
- Transactional where appropriate
- Safe for existing users

## Demo Reset

Demo reset should remain an authenticated application workflow:

```text
Vercel frontend
→ Railway Fastify endpoint
→ Better Auth session
→ Drizzle transaction
→ Railway PostgreSQL
```

It should not require:

- Redeploying the frontend
- Redeploying the backend
- Resetting the full database

## Backups

Production backups should be enabled when the application reaches production readiness.

The project should document:

- Backup status
- Frequency
- Retention
- Restore procedure
- Access controls
- Recovery time expectations

Backup policy may depend on Railway plan capabilities.

## Restore Testing

A backup is not reliable until the restore process is understood.

The project should eventually test:

- Restoring into a non-production database
- Starting the backend against restored data
- Verifying Better Auth records
- Verifying financial data
- Confirming migration state

## Frontend Rollback

Vercel can restore or promote a previous frontend deployment.

Frontend rollback is generally safe when the backend API remains compatible.

An old frontend may fail if the backend contract changed incompatibly.

## Backend Rollback

Railway may restore a prior successful backend deployment.

A previous backend version must remain compatible with the current PostgreSQL schema.

Database migrations are not automatically reversed by application rollback.

## Database Rollback

Database rollback may require:

- Restoring a backup
- Applying a corrective migration
- Running a data repair
- Redeploying compatible code

Destructive down migrations should not be assumed safe.

## Deployment Testing Decision

GitHub Actions will gate deployment through:

- Vitest unit tests
- React Testing Library component tests
- Fastify `inject()` integration tests
- PostgreSQL Testcontainer integration tests
- Drizzle migration verification
- Playwright end-to-end tests
- Frontend build
- Backend build

## Required Pre-Deployment Checks

Before production deployment, GitHub Actions should eventually verify:

1. Dependency installation
2. Formatting
3. Linting
4. Type checking
5. Unit tests
6. Frontend component tests
7. Fastify integration tests
8. PostgreSQL integration tests
9. Drizzle migration validity
10. Frontend production build
11. Backend production build
12. Critical Playwright workflows

A required failure should block production deployment.

## Recommended GitHub Actions Flow

```text
Install dependencies
        ↓
Formatting and linting
        ↓
Type checking
        ↓
Unit and component tests
        ↓
Fastify and PostgreSQL integration tests
        ↓
Migration verification
        ↓
Frontend and backend builds
        ↓
Playwright end-to-end tests
        ↓
Production deployment
```

Independent jobs may run in parallel where safe.

## Testcontainers in GitHub Actions

GitHub Actions must support:

- Docker or compatible container runtime
- Pulling a pinned PostgreSQL image
- Starting disposable containers
- Temporary port exposure
- Container cleanup
- Sufficient memory and disk

Test jobs should use temporary database credentials.

They should not receive production `DATABASE_URL`.

## Migration Verification in GitHub Actions

GitHub Actions should start a clean PostgreSQL Testcontainer and apply all committed Drizzle migrations.

The job should fail when:

- A migration cannot apply
- Required Better Auth tables are unavailable
- Steward tables are missing
- The current backend cannot query the schema
- Seed setup fails
- Migration tooling exits incorrectly

## Playwright in GitHub Actions

GitHub Actions should install the required Playwright browser and operating-system dependencies.

The initial required suite should use Chromium.

The project may add Firefox and WebKit later.

## Playwright Test Environment

Playwright should run against:

```text
Vite frontend
Fastify backend
Disposable PostgreSQL database
```

The test environment should use test-only:

- Better Auth secret
- Database
- User accounts
- Session state
- Demo data

## Playwright Failure Artifacts

GitHub Actions should retain useful artifacts when Playwright fails.

Possible artifacts include:

- Trace
- Screenshot
- HTML report
- Video where useful
- Browser console output

Artifacts must not contain production secrets or real financial data.

## Preview Deployment Testing

Vercel previews may be used for:

- Manual review
- Smoke tests
- Accessibility review
- Responsive review
- Stakeholder review

Preview deployments should not automatically use production data.

## Production Smoke Tests

After deployment, a small smoke suite may verify:

- Frontend root loads
- Nested frontend route loads directly
- Static assets load
- Railway health check succeeds
- Frontend can reach the API
- Public auth endpoint responds
- Protected endpoint rejects unauthenticated access

Smoke tests should not modify real financial data.

## Deployment Approval

Early development may allow automatic deployments from the production branch.

As Steward approaches public launch, production deployments may require:

- Protected branch
- Required status checks
- Manual approval
- Migration review
- Backup confirmation for risky changes

The final policy depends on CI and project maturity.

## Logging

### Vercel logs

Useful for:

- Dependency-install failures
- Type-check failures
- Vite build failures
- Missing public environment variables
- Invalid output configuration

### Railway logs

Useful for:

- Backend startup failures
- Environment-validation failures
- Database connection failures
- Migration failures
- Health-check failures
- Unexpected API errors

Logs must not include:

- Passwords
- Authentication cookies
- Better Auth secrets
- Database passwords
- Full database URLs
- Session tokens
- Sensitive financial payloads

## Monitoring

The MVP may initially rely on:

- Vercel deployment logs
- Railway deployment logs
- Railway runtime logs
- Fastify structured logs
- Railway service metrics
- PostgreSQL metrics available through Railway

A dedicated error-monitoring provider remains undecided.

## Alerts

Future operational alerts may cover:

- Backend unavailable
- Health check failing
- Repeated deployment failure
- High error rate
- Database unavailable
- Connection exhaustion
- Backup failure
- Migration failure

Alerting should be added as production usage grows.

## Secrets

Secrets must be stored only in server-side configuration.

Examples include:

- Better Auth secret
- Database URL
- Database credentials
- Private service tokens
- Future email credentials

Secrets must not be:

- Committed to Git
- Added to Vite environment variables
- Included in frontend bundles
- Printed in logs
- Added to documentation
- Stored in screenshots

## Environment Separation

Production resources must remain separate from test resources.

At minimum:

```text
Production frontend
Production backend
Production PostgreSQL

Local frontend
Local backend
Local PostgreSQL

Automated test frontend
Automated test backend
Disposable PostgreSQL
```

A shared staging environment may be introduced later.

## Build Reproducibility

The repository should pin:

- Node.js compatibility
- Package-manager version
- Dependency lockfile
- Build scripts
- PostgreSQL Testcontainer image
- Playwright version

Local development, CI, Vercel, and Railway should use compatible versions.

## Package Scripts

The repository will use pnpm scripts.

It should provide commands equivalent to:

```text
pnpm dev
pnpm build
pnpm build:web
pnpm build:api
pnpm start
pnpm typecheck
pnpm lint
pnpm test
pnpm test:run
pnpm test:integration
pnpm test:e2e
pnpm test:coverage
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

## Deployment Documentation

The repository should document:

- How Vercel is connected
- How Railway is connected
- Root directories
- Environment variables
- Build commands
- Start commands
- Migration commands
- Health-check path
- Production domains
- Trusted origins
- CORS behavior
- Backup configuration
- Rollback procedure
- Smoke tests
- CI requirements

Secret values should be represented only by variable names.

## Deployment Verification

### Frontend checks

- Root page loads
- Login page loads
- Direct nested route loads
- Static assets load
- Correct API URL is used
- No server secrets exist in the bundle
- Light and dark themes work
- Mobile navigation works

### Backend checks

- Health endpoint succeeds
- Fastify listens on Railway's port
- Approved CORS origins work
- Unrelated origins fail
- Better Auth endpoints respond
- Protected routes require authentication
- Database connection succeeds
- Graceful shutdown works

### Full application checks

- Registration works
- Login works
- Logout works
- Session persists
- Dashboard loads
- Account creation works
- Transaction creation works
- Budget creation works
- Ownership remains isolated
- Direct browser refresh works

## Non-Goals

The initial deployment architecture will not require:

- Kubernetes
- Docker Compose as a required local-development dependency
- Dockerized local frontend or backend development
- Turborepo without a demonstrated need
- AWS infrastructure management
- Multiple active regions
- Active-active PostgreSQL
- Custom load balancers
- Multiple frontend providers
- Multiple backend providers
- One database per pull request
- Self-hosted CI runners
- Enterprise disaster-recovery guarantees
- Production data in browser tests
- Automatic destructive migrations
- Vercel Functions as the primary backend

These should only be introduced for concrete operational requirements.

## Open Decisions

The following deployment decisions remain open:

- Custom domains
- Error monitoring
- Production log aggregation
- Backup schedule
- Backup retention
- Staging environment
- Preview API strategy
- Manual production approval
- Post-deployment smoke-test runner
- Production PostgreSQL version

## Success Criteria

The deployment architecture is successful when:

- Vercel builds and serves the React and Vite frontend.
- Direct TanStack Router navigation and refreshes work.
- Railway builds and runs the Fastify backend.
- Fastify listens on Railway's assigned port.
- Railway health checks pass.
- Railway PostgreSQL is accessible to the backend.
- Drizzle migrations run safely once per release.
- Better Auth cookies work between frontend and backend.
- CORS permits only approved origins.
- Secrets remain outside frontend bundles and source control.
- Automated tests use disposable PostgreSQL instead of production.
- GitHub Actions runs required tests and builds before deployment.
- Required tests and builds block invalid deployments.
- Playwright verifies critical full-stack workflows.
- Frontend and backend releases can be diagnosed and rolled back.
- Database compatibility is considered before rollback.
- pnpm and pnpm workspaces provide reproducible installation and builds.
- Local development works without Docker Compose.
- Kubernetes remains unnecessary.
