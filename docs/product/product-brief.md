# Product Brief

**Status:** Accepted
**Last verified:** 2026-07-30

## Product

Steward is a personal-finance application for managing accounts, transactions, monthly budgets, and financial summaries in one place.

The project also serves as a complete full-stack engineering exercise covering frontend architecture, backend design, relational data, authentication, testing, and deployment.

## Problem

Personal financial information is often spread across bank applications, spreadsheets, budgeting tools, and investment platforms. That fragmentation makes it harder to understand balances, review spending, maintain a budget, and see whether recent changes improved or worsened a financial position.

Steward provides one organized view using manually managed or seeded data. The MVP does not connect to real financial institutions.

Steward records information only. Creating or editing a transaction changes Steward's internal records and summaries; it never initiates a payment, bill payment, withdrawal, deposit, or movement of funds.

## Primary User

The primary user is one individual managing their own financial information. Each authenticated user owns an isolated dataset. The MVP does not support households, shared workspaces, or roles.

The user needs to:

- Review account balances and recent activity
- Organize transactions
- Understand spending by category
- Create a monthly budget
- Monitor budget progress
- See consistent summaries after making changes

## Secondary Audience

Developers and reviewers can use an isolated seeded demo to understand the product and its architecture without providing financial information. Reviewer convenience must not weaken authorization or distort the primary personal-finance experience.

## Product Principles

- Prefer a complete, coherent workflow over a broad feature list.
- Make financial calculations explicit and predictable.
- Preserve user ownership at every protected data boundary.
- Keep the product achievable for a solo developer.
- Avoid production complexity that does not support an MVP requirement.
- Make the demo reliable even when multiple visitors use it concurrently.
- Make the distinction between recording activity and executing financial activity explicit.

## Initial Constraints

- One individual dataset per authenticated identity
- One supported base currency: USD
- Manually entered or seeded financial records
- No payment execution or account-to-account transfers
- Responsive web application only
- No real bank or brokerage integrations
