# Settings and Theme Flow

## Purpose

The settings section allows users to manage basic application, account, authentication, and display preferences.

## Entry Flow

```text
Primary or secondary navigation
→ Settings
→ Review available settings
```

Settings should be easy to find without interfering with primary financial workflows.

## Settings Structure

The MVP settings experience may include:

- Appearance
- Display preferences
- Profile information
- Basic account and security information
- Demo-data reset for the predefined demo user
- Sign out

Settings that do not support the MVP should not be added prematurely.

## Appearance

Appearance settings may include:

- Light theme
- Dark theme
- System theme
- Display density

### Theme Flow

```text
Settings or theme control
→ Select light, dark, or system theme
→ Apply theme immediately
→ Persist preference
```

The selected theme should affect the entire application.

## Preference Persistence

The selected preference should remain active after:

- Navigation
- Page reload
- A later authenticated session where supported

Theme preferences may initially be stored locally if server-side user preferences are not required.

## Immediate and Saved Preferences

Some settings should apply immediately.

Examples:

- Theme
- Display density

Other settings may require an explicit Save action.

Examples:

- Name
- Profile information
- Account details

The interface should clearly communicate which behavior is being used.

## Profile Information

A regular user may review or update:

- Name
- Email address
- Basic profile information

Changing an email address is not required for the initial MVP.

The demo user’s identifying information should not be editable if doing so would interfere with the shared demo experience.

## Account and Security

The account and security section may display:

- Authenticated email address
- Current account identity
- Current session information
- Sign-out action

The initial MVP does not require:

- Password changes
- Password recovery
- Email changes
- Email verification
- Multi-factor authentication
- Management of multiple active sessions
- Social-account linking

These may be added later without changing the primary settings structure.

## Demo User

When the predefined demo account is active, settings should clearly indicate that the user is in a demo experience.

The demo section may include:

- Demo-account indicator
- Explanation of seeded data
- Reset Demo Data action

### Reset Demo Data Flow

```text
Settings
→ Reset Demo Data
→ Show confirmation
→ Confirm reset
→ Restore the predefined dataset
→ Show completion feedback
```

Resetting demo data should:

- Restore the initial seeded accounts
- Restore the initial seeded transactions
- Restore the initial budget data
- Preserve the demo user’s authenticated identity
- Avoid affecting regular users

## Sign-Out Flow

```text
Settings or user menu
→ Sign out
→ Better Auth terminates the current session
→ Redirect to login
```

Signing out should not delete the user’s financial data.

For the predefined demo account, signing out should not reset the seeded dataset.

## Loading State

When settings are loaded:

- Preserve the current valid application state.
- Avoid flashing the wrong theme.
- Apply persisted appearance preferences as early as practical.
- Show placeholders for profile or account information when necessary.

## Feedback

Most appearance changes should apply immediately.

A confirmation message is useful when:

- Profile information is saved
- Demo data is reset
- A change is not otherwise visually obvious

## Error State

If a setting cannot be saved:

- Keep the current valid setting where possible.
- Explain that persistence failed.
- Allow the user to retry.
- Avoid showing a saved state when persistence did not succeed.

If demo-data reset fails:

- Explain that the data was not reset.
- Preserve the current data.
- Provide a retry action.

## Success Criteria

The settings flow is successful when the user can:

- Find basic preferences easily.
- Change the theme without confusion.
- See preferences applied consistently.
- Understand whether they are using the demo account.
- Sign out reliably.
- Return to primary workflows without unnecessary steps.
