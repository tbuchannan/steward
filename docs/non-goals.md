# Non-Goals

## Purpose

This document identifies features and concerns intentionally excluded from the initial Steward MVP.

These items may be considered later, but they should not delay or complicate the first complete version of the application.

## Financial Integrations

The MVP will not include:

- Real bank-account connections
- Plaid integration
- Brokerage synchronization
- Automatic transaction imports from financial institutions
- Payment processing
- Money transfers
- Bill payment
- Live investment-price synchronization

The initial version will use seeded and manually managed financial records.

## Authentication and Account Management

The MVP will use Better Auth for basic email-and-password authentication and session management.

The MVP will not require:

- Email verification
- Password recovery
- Social authentication
- Multi-factor authentication
- Passkeys
- Magic-link authentication
- Enterprise identity providers
- Account linking
- Management of multiple authentication providers
- Household or shared financial accounts
- Multiple users within one financial workspace

These features may be considered later if they support a clear product need.

## Demo Account

The demo experience will not:

- Bypass normal authorization checks
- Share the financial data of regular users
- Allow visitors to permanently alter the canonical seeded dataset
- Require visitors to provide real financial information
- Expose editable demo credentials
- Provide administrative access

The demo account should behave like a normal authenticated user while retaining the ability to restore its predefined dataset.

## Financial Features

The MVP will not include:

- Tax preparation
- Tax calculations
- Credit-score monitoring
- Loan applications
- Automated investment trading
- AI-generated financial advice
- Financial-planning recommendations
- Automated debt-repayment strategies
- Multi-currency support
- Cryptocurrency-wallet integration

## Collaboration

The MVP will not include:

- Household workspaces
- Shared budgets
- Multiple financial-data owners in one workspace
- Invitations
- Role-based workspace permissions
- Collaborative transaction review

The initial version is designed around an individual managing their own finances.

## Platform Scope

The MVP will not include:

- Native iOS or Android applications
- Desktop applications
- Browser extensions
- Offline synchronization
- Public APIs for third-party developers

The application will be delivered as a responsive web application.

## Notifications

The MVP will not require:

- Email notifications
- SMS notifications
- Push notifications
- Complex notification preferences
- Real-time budget alerts outside the application

Items requiring attention may be displayed within the application.

## Production Infrastructure

The MVP does not need:

- Enterprise-scale infrastructure
- Complex microservices
- Event-driven infrastructure without a clear requirement
- Multiple deployment regions
- Advanced observability platforms
- Extensive feature-flag infrastructure
- Complex notification systems
- High-availability guarantees
- Compliance certifications

The architecture should support the application cleanly without attempting to solve hypothetical scaling problems.

## Product Constraint

A feature should not be added to the MVP only because it exists in another personal-finance application.

New scope should:

- Support the primary Steward workflow
- Remain achievable for a solo developer
- Fit the documented demo experience
- Provide enough value to justify its implementation and maintenance cost
