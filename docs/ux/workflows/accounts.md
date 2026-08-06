# Account Workflow

**Requirements:** `ACCT-01`–`ACCT-06`
**Status:** Accepted

## Browse

```text
Open Accounts
→ View active accounts grouped by type
→ Select an account
→ View account details and related transactions
```

An explicit `Show archived` action reveals archived accounts without mixing them into default active summaries.
Archived accounts are read-only historical records in the MVP. Restoring an
archived account is deferred.

## Create

```text
Select Add account
→ Enter name, type, optional institution, balance, and as-of date
→ Correct validation errors
→ Save
→ Close editor and show the new account
```

For asset accounts, balances are entered as owned value. For credit cards and loans, balances are entered as a positive amount owed. Investment accounts accept a manual opening valuation; later value edits create or update dated snapshots. Holdings and live prices are not shown.

## Edit

A user can edit account metadata. Transaction-derived accounts may edit their opening balance with a clear explanation of the historical effect. Editing an investment value creates or updates a dated snapshot instead of rewriting history.

## Archive

```text
Open account actions
→ Select Archive account
→ Review consequences
→ Confirm
→ Return to Accounts
```

Archiving preserves history and excludes the account from active selectors and summaries. Account deletion is not offered for accounts with history.

## Empty and Failure States

An empty state explains what an account represents and offers `Add account`. A failed list or detail request preserves navigation and offers Retry. Mutation failures keep the editor open and preserve safe input.
