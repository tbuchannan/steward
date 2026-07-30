# Design Foundations

**Status:** Draft pending implementation validation
**Last verified:** 2026-07-30

## Principles

- Financial information is scannable before decorative.
- Primary actions are clear but not visually overwhelming.
- Destructive actions require deliberate confirmation.
- Color reinforces meaning but never carries meaning alone.
- Mobile layouts preserve the workflow rather than compressing desktop tables.

## Tokens

Use semantic CSS variables compatible with the selected shadcn/ui and Tailwind setup:

- Background, foreground, surface, muted, border
- Primary and primary foreground
- Destructive and destructive foreground
- Positive, warning, and informational states
- Focus ring

Exact color values are chosen during implementation and must satisfy contrast requirements in [accessibility](../../quality/accessibility.md).

## Typography

- Use one readable sans-serif family.
- Use tabular numerals for aligned financial values.
- Maintain a clear hierarchy for page title, section title, labels, and supporting text.
- Avoid shrinking essential table content below a comfortable reading size.

## Spacing and Layout

- Use the Tailwind spacing scale and a small set of container widths.
- Desktop uses persistent or clearly available primary navigation.
- Small screens replace wide tables with labeled rows or cards.
- Forms use one column by default and add columns only when field relationships remain clear.

## Theme

Light, dark, and system themes use the same semantic tokens. Theme initialization must avoid a visible incorrect-theme flash where practical.

## Content

- Use plain action labels: `Add account`, `Save transaction`, `Archive account`.
- Explain consequences near destructive or financially significant controls.
- Show dates, currency, and negative values consistently.
- Do not use “account” without context when authentication and financial accounts could be confused.
