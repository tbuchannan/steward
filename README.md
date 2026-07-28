# Steward

A modern personal finance platform that helps users understand, organize, and grow their finances.

Steward brings budgeting, spending analysis, investment tracking, and net worth management into a single, thoughtfully designed experience. Rather than focusing on a single aspect of personal finance, Steward provides a complete picture of financial health through intuitive dashboards, actionable insights, and powerful budgeting tools.

This project is being built as a production-quality full-stack application with an emphasis on clean architecture, scalability, accessibility, and developer experience.

> **Status:** 🚧 In Active Development

---

# Vision

Managing personal finances shouldn't require juggling multiple applications or spreadsheets.

Steward is designed to become a central hub where users can:

* Track every financial account
* Build flexible monthly budgets
* Categorize and search transactions
* Monitor investment portfolios
* Measure net worth over time
* Understand spending habits
* Set and track financial goals

The long-term goal is to build a platform that feels as polished as modern SaaS products while remaining fast, intuitive, and privacy-conscious.

---

# Core Features

## Dashboard

A personalized financial overview featuring:

* Net worth tracking
* Cash flow
* Monthly spending
* Budget progress
* Portfolio summary
* Recent transactions
* Financial insights

---

## Accounts

Manage multiple account types including:

* Checking
* Savings
* Credit Cards
* Investment Accounts
* Cash
* Loans

---

## Transactions

* Manual transaction entry
* CSV imports
* Search & filtering
* Bulk editing
* Transaction categorization
* Transfers between accounts
* Recurring transaction detection

---

## Budgets

Create flexible monthly budgets with:

* Category budgets
* Budget groups
* Progress tracking
* Overspending alerts
* Month-over-month comparisons
* Budget insights

---

## Investments

Track investments through:

* Holdings
* Portfolio allocation
* Performance history
* Cost basis
* Unrealized gains & losses

---

## Goals

Create financial goals such as:

* Emergency fund
* Vacation savings
* Home down payment
* Debt payoff
* Retirement milestones

---

# Tech Stack

## Frontend

* React
* TypeScript
* Vite
* TanStack Router
* TanStack Query
* React Hook Form
* Tailwind CSS

## Backend

* Node.js
* Fastify
* Zod

## Database

* PostgreSQL
* Drizzle ORM

## Tooling

* pnpm Workspaces
* Docker
* GitHub Actions
* Vitest
* Playwright
* ESLint
* Prettier

---

# Architecture

```text
apps/
  web/
  api/

packages/
  contracts/
  database/
  ui/
  config/
```

The project follows a modular monorepo architecture with shared contracts, reusable UI components, and clear boundaries between frontend and backend.

---

# Design Principles

Steward is guided by a few core principles:

* **Financial clarity over visual clutter**
* **Fast workflows with minimal clicks**
* **Accessible by default**
* **Responsive across all devices**
* **Progressive disclosure of complex information**
* **Data-driven design decisions**
* **Production-quality engineering**

---

# Roadmap

## Phase 1

* Authentication
* Dashboard shell
* Accounts
* Manual transactions

## Phase 2

* Transaction management
* Categories
* CSV imports
* Budgeting

## Phase 3

* Investments
* Net worth
* Financial goals

## Phase 4

* Insights
* Notifications
* Production polish

---

# Why Steward?

This project exists to demonstrate modern full-stack engineering practices, including:

* Scalable React architecture
* Type-safe APIs
* Clean domain modeling
* Backend service design
* Testing strategy
* Performance optimization
* Accessibility
* Responsive UX
* Production deployment

Rather than being a tutorial project or a direct clone of an existing application, Steward is intended to evolve into a polished, real-world finance platform with room for future expansion.

---

# License

MIT
