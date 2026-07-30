# Accessibility Requirements

**Status:** Accepted
**Last verified:** 2026-07-30

Core MVP workflows target WCAG 2.2 AA behavior.

## Required Behavior

- All functionality is operable with a keyboard.
- Focus is visible and follows a logical order.
- Dialogs and sheets trap and restore focus correctly.
- Form controls have programmatic labels and associated errors.
- Status and error updates are announced when appropriate.
- Icon-only controls have accessible names.
- Active navigation is exposed programmatically.
- Color is not the only indicator of income, expense, warning, overspending, or selection.
- Text and essential UI components meet applicable contrast requirements.
- Touch targets are at least 24 by 24 CSS pixels, with larger targets preferred for primary mobile actions.
- Motion respects reduced-motion preferences.
- Tables have headers; mobile replacements retain equivalent labels.
- Heading structure describes the page hierarchy.

## Verification

- Component tests use accessible role and name queries.
- Automated scanning covers representative pages after an accessibility scanner is selected.
- Keyboard and screen-reader smoke checks cover Login, Dashboard, Transactions, Budget editing, and Settings.
- Playwright verifies focus behavior for dialogs and destructive confirmations.

Automated scanning supplements, but does not replace, manual interaction review.
