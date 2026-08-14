# QuantPulse — Project State

> This document is the current source of truth for the development state of QuantPulse.
>
> Last updated: 2026-08-14

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

## Phase 1 — C++ Quantitative Core

Status: IN PROGRESS

Current milestone:

StatisticsEngine has been implemented and successfully built.

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
