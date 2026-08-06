# Interaction Patterns

**Status:** Accepted
**Last verified:** 2026-07-30

## Page Header

A page header contains a title, optional concise description, and no more than the necessary primary actions. On small screens, actions may stack without changing their reading or focus order.

## Data Collections

Desktop tables and mobile lists expose the same important information and actions. Rows have stable accessible names. Financial columns use tabular numerals and explicit headers.

## Date Display

User-visible calendar dates use `MM-DD-YYYY`. For example, the API date
`2026-08-06` is displayed as `08-06-2026`. Date inputs, tables, lists, account
details, and transaction details use this presentation consistently.

This is a display transformation only. Public contracts and persisted
date-only values continue to use `YYYY-MM-DD`, and formatting never converts a
date through a timestamp or timezone.

## Search, Filters, and Pagination

- Search has a visible label or accessible name.
- Applied filters are visible and individually removable where practical.
- `Clear filters` restores documented defaults.
- Changing filters resets pagination to page 1.
- Pagination communicates current page and unavailable directions.

## Dialogs and Sheets

Desktop editing uses dialogs; small-screen editing may use sheets. Both:

- Move focus into the editor
- Trap focus while open
- Return focus to the invoking control
- Have a programmatic title and optional description
- Protect unsaved changes from accidental dismissal

## Loading

- Initial page loading uses a layout-preserving skeleton or concise status.
- Buttons retain their label context while pending.
- Duplicate submission is prevented.
- Existing data remains visible during background refresh when safe.

## Empty States

An empty state explains:

1. What is absent
2. Why the page may be empty
3. The most useful next action

An empty dataset differs from zero filtered results.

## Errors

- Field errors appear next to the field and are associated programmatically.
- Page errors preserve navigation and offer Retry when appropriate.
- Mutation errors preserve safe user input.
- Authentication errors do not expose identity or infrastructure details.
- Error messages say what happened and what the user can do next.

## Destructive Actions

Archive account, delete transaction, and reset demo data use confirmation dialogs. The confirmation names the target, explains consequences, uses a specific action label, and prevents duplicate confirmation.

## Feedback

Use inline feedback for validation or persistent state and brief notifications for successful background changes. Notifications do not contain the only record of important information.

## Responsive Behavior

- Below the selected small-screen breakpoint, tables become labeled list rows.
- Primary actions remain reachable without horizontal scrolling.
- Touch targets meet the accessibility minimum.
- Dialogs may become sheets without changing validation or submission behavior.
