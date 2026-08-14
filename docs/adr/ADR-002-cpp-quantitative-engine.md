# ADR-002: C++ Quantitative Engine

## Status

Accepted

## Date

2026-08-14

## Context

QuantPulse is intended to be more than a conventional financial
dashboard.

The system needs a dedicated computational layer for:

- statistical analysis
- financial mathematics
- volatility calculations
- market microstructure
- risk calculations
- backtesting
- performance-sensitive workloads

The project also aims to demonstrate strong C++ engineering and
performance-oriented system design.

Using Node.js for all quantitative computation would couple the
mathematical engine to the application layer and would make it more
difficult to independently benchmark and optimize computational
workloads.

## Decision

QuantPulse will use a dedicated C++20 quantitative engine for
computationally intensive quantitative and mathematical operations.

The C++ engine will be an independent component of the monorepo.

Initial structure:

```text
cpp-engine/
├── include/
│   └── quantpulse/
├── src/
├── tests/
├── benchmarks/
└── CMakeLists.txt
```
