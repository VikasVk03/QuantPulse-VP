# ADR-005: TimescaleDB for High-Volume Time-Series Market Data

## Status

Accepted

## Date

2026-09-02

## Context

Financial market data (tick-by-tick trades, quote updates, L2 order book snapshots, OHLCV candles) exhibits massive write volume, strict temporal ordering, and distinct query access patterns (e.g. range queries across timestamp intervals for backtesting).

Storing millions of high-frequency tick records in a standard relational table degrades query performance over time due to index bloat.

## Decision

QuantPulse will use **TimescaleDB** (PostgreSQL extension) for time-series market data persistence.

## Consequences

- Automated time-based hypertable partitioning (chunks).
- High-ratio columnar compression for historical data (>30 days old), reducing storage costs by up to 90%.
- Native time-bucket aggregations for fast multi-timeframe OHLCV generation.
- Preserves standard SQL query interface while sharing operational infrastructure with the primary PostgreSQL instance.
