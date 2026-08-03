# Glossary

**Status:** Accepted
**Last verified:** 2026-08-03

- **Allocation:** The amount assigned to a budget category for one month.
- **Authenticated user:** A person or temporary demo identity with a valid Better Auth session.
- **Authentication account:** A Better Auth credential or identity-provider record. It is not a financial account.
- **Available cash:** The sum of active checking, savings, and cash account balances. It excludes credit, loan, and investment accounts.
- **Budget:** A user-owned record for one calendar month containing category allocations.
- **Budget spending:** Net expense activity assigned to a budget category during the budget month.
- **Canonical demo dataset:** Immutable seed definitions used to create an isolated demo dataset.
- **Category:** A user-owned classification assigned to transactions and optionally used in a monthly budget.
- **Credit debt:** The positive magnitude of balances owed across active credit-card accounts.
- **Demo identity:** A temporary authenticated user created for one visitor's demo experience.
- **Financial account:** A user-owned checking, savings, credit-card, cash, loan, or investment record.
- **Investment balance snapshot:** A manual value for one investment account on one date. At most one snapshot exists per account and date.
- **Minor units:** The smallest unit of a currency. For USD, 100 minor units equals one dollar.
- **Opening balance:** The baseline value of a financial account when tracking in Steward begins.
- **Posted transaction:** A transaction included in balances and financial summaries.
- **Refund:** A standalone positive record that reduces expense activity for a category. It does not count as income.
- **Regular user:** A person who registered with an email address and password.
- **Unbudgeted spending:** Net categorized expense and refund activity for a month whose category has no allocation in that month's budget.
- **Uncategorized spending:** Expense and refund activity with no category assignment; it remains separate from budget spending until categorized.
- **Transfer:** A linked record representing movement between two financial accounts. Steward would not execute the movement. Transfer records are not part of the MVP.
- **User timezone:** The IANA timezone used to determine the current month and display timestamps. It does not reinterpret date-only transaction values.
