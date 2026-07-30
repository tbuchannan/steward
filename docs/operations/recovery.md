# Recovery and Rollback

**Status:** Draft pending provider configuration
**Last verified:** 2026-07-30

## Database Recovery

Before public launch, document and verify:

- Railway backup mechanism
- Backup frequency and retention
- Restore procedure into a non-production environment
- Responsible person
- Expected recovery time and acceptable data-loss window

A backup is not considered reliable until a restore has been tested.

## Application Rollback

- Vercel and Railway releases must be identifiable by commit.
- Keep the prior known-good frontend and API release available.
- Roll back application code only after checking database compatibility.
- Do not automatically reverse a destructive database migration.
- Prefer expand-and-contract migrations that allow old and new code to coexist temporarily.

## Failed Migration

1. Stop further rollout.
2. Preserve migration and application logs.
3. Determine whether the migration transaction rolled back.
4. Restore from backup only when forward repair is unsafe.
5. Verify ownership and financial invariants after recovery.
6. Record the incident and add a regression test.

## Demo Cleanup Failure

Cleanup is idempotent and can be retried. A cleanup failure must not delete regular users or active demo identities. Alert on accumulating expired identities before database growth becomes operationally significant.

## Secret Exposure

If a secret is exposed:

1. Revoke or rotate it immediately.
2. Redeploy affected services.
3. Invalidate sessions when the Better Auth secret or session material is affected.
4. Review access logs and source history.
5. Document impact and prevention.
