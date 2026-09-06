# QuantPulse — Project State

> This document is the current source of truth for the development state of QuantPulse.
>
> Last updated: 15-08-2026

---

# 1. Project Overview

QuantPulse is a quantitative analytics and market-microstructure research platform.

The project combines:

- React + TypeScript frontend
- Node.js + TypeScript backend
- C++20 quantitative analytics engine
- MongoDB for persistence
- Redis for caching and asynchronous workloads
- REST for initial service communication
- gRPC as a future optimization/evolution
- Docker for reproducible deployment

The primary objective is to build a technically serious software system that demonstrates:

- C++ programming
- quantitative mathematics
- statistics
- financial analytics
- market microstructure
- backend engineering
- software architecture
- performance engineering
- benchmarking
- research workflows
- scalable system design

---

# 2. Current Development Phase

## Phase 1 — C++ Quantitative Core & Domain Engines

Status: COMPLETE

Completed milestone:

All 29 core domain engines have been implemented, unit tested with GoogleTest, and verified through CTest and Google Benchmark.

## Phase 2 — Market Microstructure & Risk Intelligence + End-to-End Integration

Status: VERIFIED & COMPLETE

Completed milestone:

- Extended `MarketMicrostructureEngine` with Stoikov microprice, multi-level depth imbalance ($N$ levels), effective spread, and relative effective spread.
- Implemented `RiskIntelligenceEngine` synthesizing microstructure metrics (spread, depth imbalance, microprice drift), volatility, drawdown, and portfolio exposure into composite risk scores $[0, 100]$, discrete regimes (Normal, Elevated, High, Critical), dynamic sizing multipliers ($1.0 \to 0.0$), and safety kill-switches.
- End-to-end trading pipeline integration implemented in `EndToEndTradingTest.cpp`, verifying the complete event/execution flow across 5 comprehensive scenarios:
  Order Book -> Microstructure & Risk Intelligence -> Strategy -> Trading -> Adaptive Position Sizing -> Risk Management -> Order Management -> Matching -> Execution -> Transaction Costs -> Latency -> Position -> Portfolio State.

Current verification:

- C++20 build working
- CMake configuration working
- Ninja build working
- GoogleTest 1.14.0 integrated
- CTest integration working
- 594/594 automated tests passing (32 test suites)
- 100% CTest pass rate
- Google Benchmark integration active across domain engines, including microstructure and risk intelligence benchmarks

---

# 3. Completed Milestones

## 3.1 Project Initialization

Status: COMPLETE

Completed:

- Monorepo initialized
- Frontend directory created
- Backend directory created
- C++ engine directory created
- Documentation structure created
- Docker structure created
- Benchmark structure created
- Git repository connected

---

## 3.2 C++ Build System

Status: COMPLETE

Technology:

- C++20
- CMake
- Ninja

Current C++ project:

```text
cpp-engine/
├── include/
├── src/
├── tests/
├── benchmarks/
└── CMakeLists.txt
```

---

## 3.3 StatisticsEngine Implementation

Status: COMPLETE

Implemented:

- Mean
- Median
- Population variance
- Standard deviation

Location:

```text
cpp-engine/include/quantpulse/domain/statistics/StatisticsEngine.hpp
cpp-engine/src/domain/statistics/StatisticsEngine.cpp
```

---

## 3.4 StatisticsEngine Unit Testing

Status: COMPLETE

Testing framework:

- GoogleTest 1.14.0
- CTest

Test file:

```text
cpp-engine/tests/statistics/StatisticsEngineTest.cpp
```

Current test coverage:

- Mean
- Median for odd-sized datasets
- Median for even-sized datasets
- Population variance
- Standard deviation
- Mean with negative values
- Mean with a single value
- Empty input for mean
- Empty input for median
- Empty input for variance

Verification:

```text
10/10 GoogleTest tests passed


100% tests passed, 0 tests failed out of 10
```

CTest command:

```text
ctest --test-dir build --output-on-failure
```

Status:

- GoogleTest integration: COMPLETE
- CTest integration: COMPLETE
- Unit tests: PASSING
- Compiler warnings from test [[nodiscard]] handling: resolved

---

## 3.5 Current C++ Build Targets

Status: COMPLETE

The current CMake project produces:

```text
quantpulse_core
quantpulse_demo
quantpulse_tests
```

Architecture:

```text
quantpulse_core
      |
      +-------------------+
      |                   |
      v                   v
quantpulse_demo     quantpulse_tests
```

quantpulse_core - Reusable C++ quantitative library containing the domain implementation.

quantpulse_demo - Manual smoke-test executable used to verify the current engine behavior.

quantpulse_tests - GoogleTest executable containing automated unit tests.

---

# 4. Current Verification

## Manual Smoke Test

Command:

```bash
cd cpp-engine
./build/quantpulse_demo
```

Verified output:

```text
Mean: 102.2
Median: 102
Variance: 2.96
Std Deviation: 1.72047
```

Automated Unit Tests

Command:

```bash
cd cpp-engine
./build/quantpulse_tests
```

Result:

```text
10 tests passed
0 tests failed
```

CTest

Command:

```bash
ctest --test-dir build --output-on-failure
```

Result:

```text
100% tests passed, 0 tests failed out of 10
```

Current Verification Status

```text
C++20 BUILD       PASS
CMAKE             PASS
NINJA             PASS
MANUAL DEMO       PASS
GOOGLETEST        PASS
CTEST             PASS
STATISTICS CORE   VERIFIED
```

---

# 5. Current Architecture

Initial architecture:

```text

Market Data
     |
     v
C++ Quant Engine
     |
     | REST initially
     v
Node.js Backend
     |
     +---- MongoDB
     |
     +---- Redis
     |
     v
React Frontend

```

---

# 6. Architectural Responsibilities

## Frontend

Technology:

- React
- TypeScript

Responsibilities:

- User interface
- Data visualization
- Dashboards
- Research interaction
- Portfolio interaction
- Backtesting visualization

The frontend should not perform core quantitative calculations.

---

## Backend

Technology:

- Node.js
- TypeScript

Responsibilities:

- HTTP API
- Authentication
- Authorization
- Request validation
- Business orchestration
- Database access
- Caching
- Job management
- Communication with the C++ engine

The backend should not duplicate quantitative algorithms implemented by
the C++ engine.

---

## C++ Quantitative Engine

Technology:

- C++20
- CMake
- Ninja

Responsibilities:

- Statistical calculations
- Return calculations
- Volatility calculations
- Market microstructure analytics
- Risk calculations
- Backtesting computation
- Performance-sensitive calculations

The C++ domain layer should remain independent from:

- React
- Node.js
- MongoDB
- Redis
- HTTP
- REST
- gRPC

---

## Database

Planned:

- MongoDB

Responsibilities:

- Application data
- Users
- Portfolios
- Research metadata
- Experiments
- Analytics results
- Selected market data

The final database strategy will be validated against actual workload
requirements.

---

## Redis

Planned.

Potential responsibilities:

- Caching
- Temporary analytics results
- Job coordination
- Real-time analytics state

Redis will be introduced only when an actual requirement exists.

---

# 7. C++ Architectural Principle

The C++ engine follows a Clean Architecture-inspired structure:

```text
Interface
    |
    v
Application
    |
    v
Domain
    |
    v
Infrastructure

```

The domain layer contains quantitative and financial concepts.

The application layer coordinates domain operations.

Infrastructure handles external concerns such as:

- HTTP
- Logging
- Serialization

The quantitative domain should not depend on infrastructure.

---

# 8. Important Design Principles

QuantPulse will follow:

- SOLID principles
- Separation of concerns
- Dependency inversion
- Encapsulation
- Clean Architecture principles
- Domain-oriented organization
- Testability
- Explicit interfaces
- Performance measurement before optimization

A major project principle is:

> Correctness first, measurement second, optimization third.

---

# 9. Current C++ Design Decisions

## C++ Standard

C++20.

## Build System

CMake with Ninja.

## Header / Source Separation

Public interfaces are placed under:

```text
cpp-engine/include/
```

Implementations are placed under:

```text
cpp-engine/src/
```

Library-First Design

The quantitative core is implemented as a reusable library rather than putting all quantitative logic directly inside an executable.

Current library:

```text
quantpulse_core
```

Current executables:

```text
quantpulse_demo
quantpulse_tests
```

Testing

- GoogleTest is used for unit testing.
- CTest is used to integrate and execute the test suite through CMake.

---

# 10. Current Completed Domain Engines

The C++ quantitative engine currently includes 30 core domain engines, all with unit tests and Google Benchmark coverage:

1. `StatisticsEngine`
2. `ReturnsEngine`
3. `VolatilityEngine`
4. `RiskEngine`
5. `PortfolioEngine`
6. `MarketMicrostructureEngine`
7. `FeatureEngine`
8. `SignalEngine`
9. `StrategyEngine`
10. `PositionSizingEngine`
11. `RiskManagementEngine`
12. `TradingEngine`
13. `OrderManagementEngine`
14. `OrderBookEngine`
15. `MatchingEngine`
16. `ExecutionEngine`
17. `TransactionCostEngine`
18. `LatencyEngine`
19. `PositionEngine`
20. `PortfolioStateEngine`
21. `PerformanceEngine`
22. `BacktestEngine`
23. `ResearchEngine`
24. `MarketDataEngine`
25. `MarketDataBufferEngine`
26. `IndicatorEngine`
27. `EventBusEngine`
28. `TimeSeriesEngine`
29. `RollingWindowEngine`
30. `RiskIntelligenceEngine`

---

# 11. Current Development Status

## Milestone Achieved

Market Microstructure & Risk Intelligence + End-to-End Trading Pipeline Integration is fully operational and verified through `EndToEndTradingTest.cpp` across 5 integration scenarios:

1. Full Long Entry Pipeline (Strategy -> Trading -> Sizing -> Risk -> Order Management -> Order Book Matching -> Execution Report -> Costs -> Latency -> Position -> Portfolio State)
2. Long Exit / Profit Realization Pipeline
3. Risk Limits Reject Adverse Trade (Drawdown limit breach blocks execution)
4. Partial Fill Handling with Order Book Liquidity Depletion
5. Microstructure & Risk Intelligence Adapts Position Sizing (Microprice drift + depth imbalance + spread dynamically scale sizing multiplier from 1.0 down to 0.60 before execution)

---

# 12. Next Planned Phases

## Phase 1 — C++ Quantitative Core & Domain Engines

- [x] CMake setup
- [x] C++20 configuration
- [x] StatisticsEngine
- [x] GoogleTest integration
- [x] 29 Domain Engines implemented
- [x] 29 Unit Test suites (564 unit tests)
- [x] 29 Benchmark suites with Google Benchmark

## Phase 2 — Market Microstructure & Risk Intelligence + End-to-End Trading Integration

- [x] Strategy -> Trading -> Sizing -> Risk -> Orders -> Book -> Matching -> Execution -> Costs -> Latency -> Position -> Portfolio
- [x] Microprice model (Stoikov depth-weighted mid-price)
- [x] Multi-level depth imbalance metrics ($N$ levels)
- [x] Effective and relative effective spread analytics
- [x] RiskIntelligenceEngine (composite microstructure + risk state & dynamic limits)
- [x] End-to-end integration tests (`EndToEndTradingTest.cpp` - 5 comprehensive scenarios)
- [x] 100% CTest pass rate (594/594 tests passing across 32 test suites)
- [x] Google Benchmark performance baselines for Microstructure & Risk Intelligence

## Phase 3 — Next Advanced Microstructure & Risk Capabilities

- [ ] Order Flow Imbalance (OFI) & Cumulative Volume Delta (CVD)
- [ ] Portfolio Risk (Parametric VaR, Diversification Ratio, HHI Concentration)
- [ ] Market Regime Detection (Volatility/Liquidity Regimes)
- [ ] Non-linear market impact models (Almgren-Chriss / square-root law)
- [ ] Latency-adjusted fill probability simulation
- [ ] Event-driven tick & L2 book replay backtester
- [ ] Parameter sweeps and walk-forward analysis

## Phase 3 — C++ Service

- [ ] HTTP API
- [ ] Serialization
- [ ] Health endpoint
- [ ] Error handling
- [ ] Logging

## Phase 4 — Node.js Backend

- [ ] TypeScript setup
- [ ] Backend framework decision
- [ ] API layer
- [ ] C++ engine client
- [ ] Authentication
- [ ] Database layer

## Phase 5 — Persistence

- [ ] MongoDB
- [ ] Redis
- [ ] Data model
- [ ] Market data storage

## Phase 6 — Frontend

- [ ] React + TypeScript
- [ ] Dashboard
- [ ] Market analysis
- [ ] Risk dashboard
- [ ] Research lab
- [ ] Backtesting UI

## Phase 7 — Performance Engineering

- [ ] C++ benchmarks
- [ ] REST latency measurement
- [ ] gRPC evaluation
- [ ] Memory profiling
- [ ] CPU profiling
- [ ] Concurrency experiments

## Phase 8 — Deployment

- [ ] Docker
- [ ] CI/CD
- [ ] Public backend
- [ ] Public C++ service
- [ ] Vercel frontend
- [ ] MongoDB Atlas
