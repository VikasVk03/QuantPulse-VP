# ADR-004: PostgreSQL & Prisma ORM for Relational Application Data

## Status

Accepted (Supersedes preliminary MongoDB proposal)

## Date

2026-09-01

## Context

Initial planning considered MongoDB for early persistence. However, financial data domains—such as Users, Portfolios, Positions, Orders, Executions, Strategies, and Risk Audits—are inherently relational and require strict ACID transactional guarantees, foreign key integrity, and precise relational consistency.

A document database lacked native schema enforcement and transactional guarantees required when debiting portfolio cash balances and creating execution records atomically.

## Decision

QuantPulse will use **PostgreSQL** with **Prisma ORM** as the primary relational application database.

## Consequences

- Type-safe schema definitions and auto-generated TypeScript migrations via Prisma.
- Strong ACID transactions ensuring atomic multi-table order fills and portfolio updates.
- Native indexing on relational foreign keys (`userId`, `portfolioId`, `strategyId`).
- Co-location compatibility with the TimescaleDB extension for time-series market data.
