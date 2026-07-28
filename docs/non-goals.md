# Non-Goals

## Purpose

This document identifies features and concerns that are intentionally excluded from the initial Steward MVP.

These items may be considered later, but they should not delay or complicate the first complete version of the application.

## Financial Integrations

The MVP will not include:

- Real bank account connections
- Plaid integration
- Brokerage synchronization
- Automatic transaction imports from financial institutions
- Payment processing
- Money transfers
- Bill payment

The initial version will use seeded data and manually managed financial records.

## Authentication and Account Management

The MVP will not require:

- Email verification
- Password recovery
- Social authentication
- Multi-factor authentication
- Enterprise identity providers
- Household or shared accounts
- Multiple users within one financial workspace

Authentication should be sufficient for the demo experience without introducing unnecessary infrastructure.

## Financial Features

The MVP will not include:

- Tax preparation
- Tax calculations
- Credit score monitoring
- Loan applications
- Automated investment trading
- AI-generated financial advice
- Financial planning recommendations
- Automated debt repayment strategies
- Multi-currency support
- Cryptocurrency wallet integration

## Platform Scope

The MVP will not include:

- Native iOS or Android applications
- Desktop applications
- Browser extensions
- Offline synchronization
- Public APIs for third-party developers

The application will be delivered as a responsive web application.

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

A feature should not be added to the MVP only because it exists in another personal finance application.

New scope should support the primary Steward workflow and remain achievable for a solo developer.
