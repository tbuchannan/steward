# Account Management Flow

## Purpose

The accounts section allows users to view and manage financial accounts and inspect the activity associated with each account.

## Account List Flow

```text
Dashboard or navigation
→ Accounts
→ Review account groups and balances
→ Select an account
```

Accounts may be grouped by type:

- Checking
- Savings
- Credit cards
- Cash
- Loans
- Investments

The account list should provide a clear summary of balances without requiring the user to open every account.

## Create Account Flow

```text
Accounts
→ Add account
→ Enter account details
→ Review validation
→ Save
→ Return to account list or account detail
```

Account information may include:

- Account name
- Account type
- Current or starting balance
- Institution name
- Optional description

## Account Detail Flow

```text
Accounts
→ Select account
→ Review balance and account information
→ Review related transactions
→ Edit account or open a transaction
```

The account detail page should include:

- Account name
- Account type
- Current balance
- Institution
- Recent transactions
- Account-management actions

## Edit Account Flow

```text
Account detail
→ Edit account
→ Update fields
→ Save or cancel
→ Return to account detail
```

Cancelling should discard unsaved changes.

## Archive or Remove Account Flow

```text
Account detail
→ Archive or remove
→ Show confirmation
→ Confirm action
→ Return to account list
```

Archiving should generally be preferred over permanent deletion when an account has transaction history.

Archived accounts should no longer appear in the default active-account list but should remain available for historical records.

## Empty State

If there are no accounts:

- Explain the purpose of accounts.
- Provide an Add account action.
- Avoid displaying meaningless totals or charts.

## Validation State

Validation should identify:

- Missing required values
- Invalid balances
- Invalid account types
- Unclear or duplicate account names where relevant

Validation messages should appear near the affected fields.

## Error State

If loading or saving fails:

- Preserve entered values.
- Explain that the account was not saved.
- Provide a retry action.
- Avoid losing unsaved changes without warning.

## Success Criteria

The account-management flow is successful when the user can:

- Understand their accounts and balances.
- Add and edit accounts without unnecessary steps.
- Open an account and review related activity.
- Archive inactive accounts without losing financial history.
