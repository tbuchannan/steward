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

## Create

```text
Select Add account
→ Enter name, type, optional institution, opening balance, and as-of date
→ Correct validation errors
→ Save
→ Close editor and show the new account
```

Investment accounts accept a manually valued opening balance only. Holdings and live prices are not shown.

## Edit

A user can edit account metadata and, when allowed by domain rules, the opening balance. The interface must explain any effect an opening-balance change has on historical totals.

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
