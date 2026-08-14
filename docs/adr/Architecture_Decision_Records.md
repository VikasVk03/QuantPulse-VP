# QuantPulse Architecture Decision Records

> A historical record of the architectural decisions that shape QuantPulse.

## Overview

QuantPulse uses **Architecture Decision Records (ADRs)** to document significant technical and architectural decisions made throughout the development of the project.

The purpose of an ADR is not to document what the code currently does. It is to preserve **why an important decision was made**, what alternatives were considered, and when that decision should be reconsidered.

ADRs help prevent architectural knowledge from being lost in:

- Developer memory
- Pull requests
- Commit messages
- Chat discussions
- Temporary implementation details

The goal is to make the architectural reasoning of QuantPulse understandable to both current and future contributors.

---

## Why ADRs?

Architectural decisions often have consequences that last much longer than the code that originally implemented them.

For example, choosing:

- A monorepo instead of multiple repositories
- C++ for quantitative computation
- REST instead of gRPC
- MongoDB for initial persistence
- A particular service boundary
- A specific deployment architecture

can affect development, testing, deployment, performance, and maintainability for years.

An ADR records the reasoning behind such decisions so that future contributors can understand:

> **What problem were we solving, what options did we consider, why did we choose this approach, and when should we reconsider it?**

---

## Repository Structure

The ADR system follows this structure:

```text
QuantPulse/
│
├── Architecture_Decision_Records.md
│
├── docs/
│   └── adr/
│       ├── ADR-001-monorepo.md
│       ├── ADR-002-cpp-quant-engine.md
│       ├── ADR-003-rest-before-grpc.md
│       ├── ADR-004-mongodb-initial-persistence.md
│       └── ...
│
└── ...
```

### `Architecture_Decision_Records.md`

This document serves as the **ADR index and guidelines**.

It provides:

- The list of architectural decisions
- Their current status
- ADR conventions
- Lifecycle rules
- Guidelines for creating new ADRs

### `docs/adr/`

Individual ADRs should contain the detailed reasoning for each architectural decision.

Each significant decision should normally have its own ADR file.

---

# Current Architectural Decisions

| ID                                                         | Decision                    | Status   |
| ---------------------------------------------------------- | --------------------------- | -------- |
| [ADR-001](docs/adr/ADR-001-monorepo.md)                    | Monorepo Architecture       | Accepted |
| [ADR-002](docs/adr/ADR-002-cpp-quant-engine.md)            | C++ Quantitative Engine     | Accepted |
| [ADR-003](docs/adr/ADR-003-rest-before-grpc.md)            | REST Before gRPC            | Proposed |
| [ADR-004](docs/adr/ADR-004-mongodb-initial-persistence.md) | MongoDB Initial Persistence | Proposed |

> **Note:** Proposed decisions represent the current direction under consideration. They are not binding architectural requirements until accepted.

---

# Current Architecture

The current high-level architectural direction is:

```text
                    QuantPulse
                        |
             +----------+----------+
             |                     |
             v                     v
       React Frontend       Node.js Backend
                                   |
                                   v
                            C++ Quant Engine
                                   |
                                   v
                              Data Storage
```

The architecture is intentionally designed so that the frontend, application backend, quantitative computation layer, and persistence layer can evolve independently while maintaining clear boundaries.

Some parts of this architecture remain provisional and are expected to be validated through implementation, benchmarks, and real workload analysis.

---

# ADR Status

ADRs use the following lifecycle states.

## Proposed

The decision is being considered but has not been finalized.

A proposed ADR should **not** be treated as a binding architectural requirement.

---

## Accepted

The decision has been made and represents the current architectural direction.

Implementation should follow an accepted ADR unless a later ADR supersedes it.

---

## Superseded

The decision has been replaced by a newer ADR.

The original ADR should normally remain in the repository because it provides historical context.

A superseded ADR should identify the ADR that replaced it.

Example:

```text
ADR-004
MongoDB Initial Persistence

Status: Superseded
Superseded by: ADR-012
```

---

# ADR Format

Every detailed ADR should use a consistent structure.

```markdown
# ADR-NNN: Title

## Status

Proposed | Accepted | Superseded

## Context

What problem or architectural question are we addressing?

## Decision

What decision was made?

## Alternatives Considered

What other approaches were evaluated?

## Reasons

Why was this option selected?

## Consequences

What are the benefits, costs, and trade-offs?

## Revisit Conditions

Under what circumstances should this decision be reconsidered?
```

Additional sections may be added when they provide useful architectural context.

---

# Writing Good ADRs

## Context

Explain **why the decision was necessary**.

The context should describe the architectural problem rather than immediately presenting the solution.

Good:

```text
QuantPulse requires a quantitative computation layer capable
of supporting numerical workloads independently from the
Node.js application layer.
```

Avoid:

```text
We decided to use C++.
```

The first statement explains the problem. The second only describes the outcome.

---

## Decision

Clearly state the selected approach.

Prefer:

```text
QuantPulse will maintain the frontend, Node.js backend,
and C++ quantitative engine within a single monorepository.
```

Avoid:

```text
We probably want a monorepo.
```

The decision should be unambiguous.

---

## Alternatives Considered

Document meaningful alternatives that could reasonably have been selected.

For example:

```text
1. Monorepo
2. Multiple repositories
3. Separate repositories per service
```

There is no need to document every technology or theoretical possibility.

The purpose is to preserve the alternatives that were genuinely relevant to the decision.

---

## Reasons

Explain why the selected option was preferred.

Relevant factors may include:

- Development simplicity
- Performance
- Maintainability
- Deployment requirements
- Team workflow
- Operational complexity
- Scalability
- Existing infrastructure
- Cost
- Developer experience

Reasons should be tied to actual QuantPulse requirements rather than generic technology preferences.

---

## Consequences

Document both benefits and trade-offs.

For example:

```text
Positive:

- Easier cross-language development
- Shared repository history
- Simplified local development

Negative:

- Larger repository
- More complex build configuration
- Multiple toolchains
```

An ADR should not present an architectural decision as universally correct.

Every significant decision should acknowledge its costs and limitations.

---

## Revisit Conditions

Document the circumstances under which the decision should be reconsidered.

For example:

```text
Revisit if:

- Quantitative workloads require independent scaling.
- Repository size becomes problematic.
- Deployment boundaries require repository separation.
- Build times become unacceptable.
```

This keeps ADRs useful as living architectural documentation rather than permanent declarations.

---

# Current ADRs

## ADR-001 — Monorepo Architecture

**Status:** Accepted

QuantPulse uses a monorepository as the initial project architecture.

The repository may contain:

- React frontend
- Node.js backend
- C++ quantitative engine
- Documentation
- Tests
- Benchmarks
- Research infrastructure

The monorepo allows the frontend, backend, and quantitative engine to evolve together while their interfaces and boundaries are still changing.

[Read ADR-001 →](docs/adr/ADR-001-monorepo.md)

---

## ADR-002 — C++ Quantitative Engine

**Status:** Accepted

QuantPulse uses a C++ quantitative engine for computationally intensive quantitative functionality.

The intended architecture is:

```text
React Frontend
      |
      v
Node.js Backend
      |
      v
C++ Quant Engine
```

The C++ engine is intended for:

- Numerical calculations
- Statistical models
- Quantitative analytics
- Performance-sensitive computation
- Future risk calculations
- Future market-data calculations

The Node.js backend remains responsible for application-level concerns rather than becoming the primary implementation location for quantitative algorithms.

The exact Node.js-to-C++ integration mechanism is a separate architectural decision.

[Read ADR-002 →](docs/adr/ADR-002-cpp-quant-engine.md)

---

## ADR-003 — REST Before gRPC

**Status:** Proposed

QuantPulse currently intends to use REST as the initial API architecture.

The planned public API is:

```text
Frontend
   |
   | HTTPS / REST
   v
Node.js Backend
```

gRPC may be evaluated later, particularly for internal communication with the C++ quantitative engine.

This decision remains proposed until the API and service boundaries have been implemented and evaluated.

Potential reasons to revisit the decision include:

- High internal request volume
- Latency requirements
- Serialization overhead
- Streaming requirements
- Service-to-service communication complexity

[Read ADR-003 →](docs/adr/ADR-003-rest-before-grpc.md)

---

## ADR-004 — MongoDB Initial Persistence

**Status:** Proposed

MongoDB is currently planned as the initial persistence layer for application and research metadata.

Potential data includes:

- Users
- Portfolios
- Research metadata
- Analytics metadata
- Backtest metadata
- Application data

MongoDB is **not considered the final storage solution for all market data**.

High-volume time-series requirements should be evaluated independently based on realistic workload and access-pattern analysis.

This decision should be revisited once actual market-data requirements are understood.

[Read ADR-004 →](docs/adr/ADR-004-mongodb-initial-persistence.md)

---

# When to Create an ADR

Create an ADR when a decision materially affects the architecture or long-term behavior of QuantPulse.

Typical examples include:

- Architecture
- Technology selection
- Service boundaries
- Database selection
- Data storage
- Deployment
- Scalability
- Performance
- Security architecture
- Maintainability
- Inter-service communication
- Build architecture
- Major infrastructure choices

A useful test is:

> **Would changing this decision later require significant architectural, operational, or implementation changes?**

If yes, an ADR is probably appropriate.

---

# When Not to Create an ADR

Not every technical decision requires an ADR.

An ADR is generally unnecessary for:

- Variable names
- Function names
- Small refactors
- Formatting changes
- Minor bug fixes
- Routine dependency updates
- Individual implementation details
- Small UI changes
- Normal code cleanup

These decisions belong in the code, commit history, pull request, or normal project documentation.

---

# ADR Lifecycle

The expected workflow is:

```text
Architectural Question
        |
        v
Identify Alternatives
        |
        v
Evaluate Trade-offs
        |
        v
Create ADR
        |
        v
     Proposed
        |
        v
Decision Made
        |
        v
     Accepted
        |
        +-------------------+
        |                   |
        v                   v
     Continue          Reconsider Later
                            |
                            v
                        New ADR
                            |
                            v
                       Superseded
```

A new architectural decision should generally be recorded in a **new ADR** rather than rewriting the historical record.

---

# Changing an Existing Decision

When an accepted decision needs to change:

1. Create a new ADR.
2. Explain the new context.
3. Reference the previous ADR.
4. Explain why the previous decision is no longer appropriate.
5. Document the new decision.
6. Mark the previous ADR as **Superseded**.
7. Update this index.

Example:

```text
ADR-004
MongoDB Initial Persistence
        |
        v
Superseded by ADR-012
Alternative Time-Series Storage
```

This preserves the architectural reasoning of the project over time.

---

# Evidence and Measurements

Architectural decisions should be supported by evidence whenever practical.

If a decision depends on performance or operational behavior, the ADR should reference relevant measurements.

For example:

```text
Decision:
Use implementation A.

Evidence:
Benchmark results in docs/benchmarking.md demonstrate
that implementation A meets the required latency target.
```

Avoid relying solely on assumptions such as:

- "This language is faster."
- "This database scales better."
- "This architecture is more modern."
- "This service will eventually need Kubernetes."

When possible, use:

- Benchmarks
- Prototypes
- Production observations
- Capacity estimates
- Failure analysis
- Cost analysis
- Operational experience

The goal is to make architectural decisions **evidence-based rather than preference-based**.

---

# Relationship to Other Documentation

ADRs complement the rest of the QuantPulse documentation.

| Document                           | Purpose                                      |
| ---------------------------------- | -------------------------------------------- |
| `README.md`                        | Project overview and getting started         |
| `docs/quant-model.md`              | Mathematical and quantitative models         |
| `docs/data-model.md`               | Conceptual data architecture                 |
| `docs/api.md`                      | API contract                                 |
| `docs/benchmarking.md`             | Performance measurement methodology          |
| `docs/research.md`                 | Research methodology                         |
| `docs/deployment.md`               | Deployment architecture                      |
| `Architecture_Decision_Records.md` | ADR index and architectural decision history |

For example:

```text
docs/deployment.md
        |
        v
Describes the deployment architecture

ADR
        |
        v
Explains why a major deployment decision was made
```

ADRs should explain the **reasoning behind major decisions**, while other documentation should explain how the resulting system works.

---

# Contributing an ADR

Before creating an ADR:

1. Confirm that the decision is architectural in scope.
2. Identify the problem or question.
3. Document the meaningful alternatives.
4. Evaluate the relevant trade-offs.
5. Record the decision and its reasoning.
6. Document consequences.
7. Define conditions that would justify reconsideration.
8. Add the ADR to this index.
9. Link related documentation where appropriate.

Keep ADRs concise and focused on the decision.

---

# ADR Principles

QuantPulse ADRs follow these principles:

### 1. Record reasoning, not just outcomes

The important information is not only **what** was chosen, but **why**.

### 2. Preserve history

Do not rewrite old decisions to make them appear correct in hindsight.

Create a new ADR when an architectural decision changes.

### 3. Be honest about uncertainty

If a decision is provisional, mark it **Proposed**.

Do not present an assumption as a finalized architectural requirement.

### 4. Document trade-offs

Every architectural decision has costs.

Record both benefits and drawbacks.

### 5. Prefer evidence

Use benchmarks, prototypes, measurements, and operational data when available.

### 6. Keep the scope appropriate

ADRs should cover decisions significant enough to have meaningful architectural consequences.

---

# Current Status Summary

| ID      | Decision                    | Status       |
| ------- | --------------------------- | ------------ |
| ADR-001 | Monorepo architecture       | **Accepted** |
| ADR-002 | C++ quantitative engine     | **Accepted** |
| ADR-003 | REST before gRPC            | **Proposed** |
| ADR-004 | MongoDB initial persistence | **Proposed** |

**Accepted** decisions represent the current architectural direction.

**Proposed** decisions remain subject to implementation experience, benchmarks, and further analysis.

---

# Design Goal

The QuantPulse ADR system exists to preserve architectural reasoning over the lifetime of the project.

The intended chain is:

```text
Problem
   |
   v
Context
   |
   v
Alternatives
   |
   v
Decision
   |
   v
Reasons
   |
   v
Consequences
   |
   v
Future Reconsideration
```

> **Document important decisions once, preserve their reasoning, and create a new ADR when the architecture materially changes.**
