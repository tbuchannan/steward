# Settings Workflow

**Requirements:** `SET-01`–`SET-04`, `SHELL-03`
**Status:** Accepted

## Structure

The MVP Settings page contains:

- Identity
- Appearance
- Demo data, for demo identities only
- Sign out

There is no separate Security route in the MVP.

## Identity

Name and email address are read-only. Profile and email editing are deferred.

## Appearance

```text
Open Settings
→ Select Light, Dark, or System
→ Apply immediately
→ Persist across navigation and reload
```

System follows the operating-system preference until the user selects an explicit theme.

## Demo Reset

```text
Select Reset demo data
→ Review a destructive-action confirmation
→ Confirm
→ Restore only this visitor's canonical seed dataset
→ Keep the session active
→ Refresh affected application data
```

The action is hidden from regular users. Failure reports that reset was not completed and must not leave a partially restored dataset.

## Sign Out

Sign out follows the shared [authentication workflow](authentication.md).
