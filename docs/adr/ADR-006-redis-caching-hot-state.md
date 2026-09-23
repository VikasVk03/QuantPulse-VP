# ADR-006: Redis for In-Memory Caching & Hot State Management

## Status

Accepted

## Date

2026-09-03

## Context

High-frequency market intelligence requires sub-millisecond access to current top-of-book quotes, Stoikov microprice indicators, active risk regime states, and rate limiting counters without hitting disk-based storage.

## Decision

QuantPulse will use **Redis** for in-memory caching, real-time quote broadcasting buffers, and BullMQ background task execution.

## Consequences

- Sub-millisecond latency for live UI quote polling and state retrieval.
- Decouples long-running backtest execution jobs from HTTP request-response cycles.
- Low operational overhead with managed cloud instances (Upstash / Redis Cloud).
