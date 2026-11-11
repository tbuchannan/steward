# Single Next.js Project Implementation Plan

**Goal:** Run and deploy Steward as one Next.js project at the repository root.

**Design:** Move application code, configuration, tests, and migration history
to the root. Move shared Zod contracts to `src/lib/contracts` and compile them
with the application. Keep pnpm, the lockfile, and the existing dependency
build policy.

- [ ] Move source, tests, and migrations; update contract imports and include
      schema tests in the root test run.
- [ ] Consolidate scripts and dependencies in the root manifest. Regenerate
      the lockfile and verify a frozen install.
- [ ] Align GitHub Actions, Vercel configuration, environment setup, and
      repository guidance with the root layout.
- [ ] Verify formatting, type checking, linting, 21 tests, the production
      build, and the unchanged route list and migration history.

Do not change application behavior, apply migrations to existing databases,
or alter the live deployment.
