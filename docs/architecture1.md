Yes. The current deployment document is now **outdated**, mainly because it still says **MongoDB Atlas** and leaves too many parts of the stack unspecified.

Based on our new architecture, I would **replace the document rather than patch individual sections**. The new document should make a clear distinction between:

* **Implemented locally**
* **Selected target technology**
* **Planned integration**
* **Future/advanced option**

Most importantly, the architecture should now be:

```text
                         INTERNET
                            │
                         HTTPS
                            │
                            ▼
                 ┌─────────────────────┐
                 │       Vercel        │
                 │ React 19 + Vite     │
                 │ TypeScript          │
                 │ Tailwind + shadcn   │
                 │ R3F + Three.js      │
                 │ GSAP                │
                 │ Charts              │
                 └──────────┬──────────┘
                            │ HTTPS
                            ▼
                 ┌─────────────────────┐
                 │    Node.js API      │
                 │ TypeScript          │
                 │ Express             │
                 │ REST API            │
                 │ Auth / Validation   |
                 |  Business logic     │
                 │ Orchestration       │
                 └──────┬───────┬──────┘
                        │       │
              ┌─────────┘       └──────────┐
              ▼                            ▼
     ┌─────────────────┐          ┌─────────────────┐
     │ C++20 Quant     │          │     Redis       │
     │ Engine          │          │ Cache / Jobs /  │
     │                 │          │ Hot State       │
     │ CMake + Ninja   │          └─────────────────┘
     │ GoogleTest      │
     │ GoogleBenchmark │
     └────────┬────────┘
              │
              │
       ┌──────┴──────────────────────────────┐
       │                                     │
       ▼                                     ▼
   ┌────────────────────┐        ┌────────────────────┐
   │    PostgreSQL      │        │    TimescaleDB     │
   │                    │        │                    │
   │ Prisma ORM         │        │ Market Data        │
   │                    │        │ OHLCV              │
   │ Users              │        │ Quotes             │
   │ Strategies         │        │ Trades             │
   │ Backtests          │        │ Order Book         │
   │ Research           │        │ Market Events      │
   │ Portfolios         │        │ Historical Data    │
   │ Orders             │        │                    │
   │ Jobs               │        └────────────────────┘
   └────────────────────┘

             Future Advanced Time-Series
                         │
                         ▼
                 kdb+ / KDB-X
```

Here is the **replacement document** I recommend.

---

# QuantPulse Deployment & Infrastructure

## Status

**Deployment architecture — planned**

QuantPulse deployment infrastructure is not yet fully implemented.

This document defines the target deployment architecture, technology stack, infrastructure boundaries, environment strategy, security principles, observability requirements, and deployment workflow for the QuantPulse platform.

The architecture is intentionally designed around the current application structure:

```text
React Frontend
      ↓
Node.js API
      ↓
C++20 Quant Engine
      ↓
Data & Infrastructure
```

The system separates:

* User-facing application delivery
* Application/business services
* Quantitative computation
* Relational application data
* High-volume time-series market data
* Caching and asynchronous processing
* Deployment and observability infrastructure

Individual infrastructure components will be introduced incrementally and validated against actual workload requirements.

---

# 1. Deployment Objectives

The deployment architecture should provide:

* Reliable frontend hosting
* Public HTTPS API access
* Secure service communication
* Containerized backend services
* Reproducible environments
* Managed relational database infrastructure
* Dedicated time-series storage
* Optional caching and job infrastructure
* Independent quantitative computation
* Environment-specific configuration
* Automated testing and deployment
* Structured logging
* Application observability
* Health checks
* Safe versioning and rollback
* Cost-conscious infrastructure

The initial deployment should remain simple while preserving clear boundaries between:

```text
Frontend
Backend
Quant Engine
Application Database
Time-Series Database
Cache / Jobs
Infrastructure
```

---

# 2. Technology Stack

The target QuantPulse technology stack is:

| Layer                | Technology                              | Purpose                                     |
| -------------------- | --------------------------------------- | ------------------------------------------- |
| Frontend             | React 19                                | Application UI                              |
| Frontend Build       | Vite                                    | Development/build tooling                   |
| Frontend Language    | TypeScript                              | Type-safe frontend development              |
| Styling              | Tailwind CSS v4                         | UI styling                                  |
| UI Components        | shadcn/ui                               | Reusable interface components               |
| Icons                | Lucide                                  | UI icons                                    |
| Financial Charts     | Lightweight Charts                      | Candlestick/market visualization            |
| Analytics Charts     | Recharts                                | Analytics/research visualizations           |
| 3D Visualization     | Three.js                                | 3D rendering                                |
| 3D React Integration | React Three Fiber                       | React-based Three.js integration            |
| Animation            | GSAP                                    | Cinematic/scroll animations                 |
| Backend Runtime      | Node.js                                 | API runtime                                 |
| Backend Language     | TypeScript                              | Type-safe backend                           |
| Backend Framework    | Express                                 | HTTP API                                    |
| API Style            | REST                                    | Frontend/backend communication              |
| Quant Engine         | C++20                                   | High-performance quantitative computation   |
| C++ Build            | CMake                                   | Build system                                |
| C++ Build Generator  | Ninja                                   | Fast builds                                 |
| C++ Testing          | GoogleTest                              | Unit/integration testing                    |
| C++ Benchmarking     | Google Benchmark                        | Performance benchmarking                    |
| Application Database | PostgreSQL                              | Relational application data                 |
| ORM                  | Prisma                                  | PostgreSQL data access                      |
| Time-Series Database | TimescaleDB                             | Market/time-series data                     |
| Cache                | Redis                                   | Cache, hot state, jobs when required        |
| Containers           | Docker                                  | Reproducible service environments           |
| Local Orchestration  | Docker Compose                          | Local infrastructure                        |
| Frontend Deployment  | Vercel                                  | Frontend hosting                            |
| Backend Deployment   | Render or equivalent container platform | Node.js API hosting                         |
| CI/CD                | GitHub Actions                          | Automated build/test/deployment             |
| API ↔ Quant Engine   | Internal service interface              | Quant computation boundary                  |
| Advanced Time-Series | kdb+ / KDB-X                            | Future high-performance financial analytics |
| Observability        | To be finalized                         | Logs, metrics, traces                       |

The technology stack should remain modular so individual infrastructure components can be replaced without requiring changes throughout the application.

---

# 3. Target Architecture

The target production architecture is:

```text
                              INTERNET
                                  │
                                  │ HTTPS
                                  ▼
                       ┌────────────────────┐
                       │       Vercel       │
                       │                    │
                       │ React 19           │
                       │ TypeScript         │
                       │ Vite               │
                       │ Tailwind CSS       │
                       │ shadcn/ui          │
                       │ R3F / Three.js     │
                       │ GSAP               │
                       │ Charts             │
                       └─────────┬──────────┘
                                 │
                                 │ HTTPS
                                 ▼
                       ┌────────────────────┐
                       │    Node.js API     │
                       │                    │
                       │ TypeScript         │
                       │ Express            │
                       │ REST API           │
                       │ Authentication     │
                       │ Validation         │
                       │ Business Logic     │
                       │ Orchestration      │
                       └──────┬───────┬─────┘
                              │       │
                   ┌──────────┘       └──────────┐
                   │                             │
                   ▼                             ▼
          ┌──────────────────┐          ┌──────────────────┐
          │ C++20 Quant      │          │      Redis       │
          │ Engine           │          │                  │
          │                  │          │ Cache            │
          │ CMake + Ninja    │          │ Hot State        │
          │ GoogleTest       │          │ Jobs             │
          │ GoogleBenchmark  │          │ Coordination     │
          └────────┬─────────┘          └──────────────────┘
                   │
             ┌─────┴───────────────────────┐
             │                             │
             ▼                             ▼
   ┌────────────────────┐        ┌────────────────────┐
   │    PostgreSQL      │        │    TimescaleDB     │
   │                    │        │                    │
   │ Prisma             │        │ Market Data        │
   │                    │        │ OHLCV              │
   │ Users              │        │ Quotes             │
   │ Strategies         │        │ Trades             │
   │ Backtests          │        │ Order Book         │
   │ Research           │        │ Market Events      │
   │ Portfolios         │        │ Historical Data    │
   │ Orders             │        │                    │
   │ Jobs               │        └────────────────────┘
   └────────────────────┘

            Future Advanced Time-Series
                           │
                           ▼
                      kdb+ / KDB-X

```

The C++ engine and database services should not be directly exposed to the public internet.

The Node.js backend acts as the application boundary.

---

# 4. Frontend Deployment

## Technology

The frontend uses:

```text
React 19
TypeScript
Vite
Tailwind CSS v4
shadcn/ui
Lucide
Lightweight Charts
Recharts
Three.js
React Three Fiber
GSAP
```

## Target Platform

**Vercel**

The frontend is intended to be deployed to Vercel or an equivalent managed frontend platform.

Responsibilities:

* Static asset delivery
* React application hosting
* HTTPS
* Production builds
* Environment configuration
* CDN delivery
* Frontend deployment automation

The frontend must communicate with the backend through HTTPS.

Example:

```text
Browser
   |
   | HTTPS
   ▼
Vercel
   |
   | HTTPS
   ▼
QuantPulse API
```

---

# 5. Landing Experience Infrastructure

The QuantPulse landing page contains an immersive visualization layer.

The target frontend visualization stack is:

```text
React
   │
   ▼
React Three Fiber
   │
   ▼
Three.js
   │
   ├── 3D market environment
   ├── exchange nodes
   ├── market network
   ├── data streams
   ├── QuantPulse engine visualization
   └── spatial transitions

GSAP
   │
   └── Scroll-driven animation
```

Three.js / React Three Fiber should be used for:

* 3D market visualization
* Exchange network
* Market-data flows
* Spatial storytelling
* Interactive product visualization

They should **not** replace financial charting libraries.

Financial data visualization should continue using:

```text
Lightweight Charts
Recharts
```

The 3D landing visualization should remain separate from production market-data infrastructure unless it is explicitly connected to a real data source.

---

# 6. Node.js Backend

## Technology

```text
Node.js
TypeScript
Express
REST API
```

The backend is the primary application/API boundary.

Responsibilities include:

* HTTP API
* Authentication
* Authorization
* Request validation
* API versioning
* Business logic
* Dataset management
* Market-data orchestration
* Analytics orchestration
* Signal services
* Strategy services
* Backtesting orchestration
* Portfolio services
* Risk services
* Execution services
* Research services
* Quant-engine communication
* Database access
* Cache access
* Job management

The backend should not duplicate performance-sensitive quantitative algorithms that belong in the C++ engine.

---

# 7. Backend Domain Architecture

The backend will evolve around the following domains:

```text
modules/
│
├── auth/
├── market-data/
├── analytics/
├── microstructure/
├── signals/
├── strategy/
├── backtesting/
├── portfolio/
├── risk/
├── execution/
├── research/
└── intelligence/
```

The high-level application flow becomes:

```text
Market Data
     ↓
Analytics
     ↓
Signals
     ↓
Strategy
     ↓
Backtest
     ↓
Performance
     ↓
Portfolio
     ↓
Risk
     ↓
Execution
     ↓
Research
```

The `intelligence` layer can eventually provide higher-level orchestration across these domains.

---

# 8. C++ Quantitative Engine

## Technology

```text
C++20
CMake
Ninja
GoogleTest
Google Benchmark
```

The C++ engine is responsible for computationally intensive quantitative workloads.

Current and planned domains include:

```text
Market Data
Market Data Buffer
Returns
Volatility
Statistics
Indicators
Features
Signals
Strategies
Backtesting
Performance
Risk
Risk Management
Risk Intelligence
Portfolio
Position
Sizing
Execution
Orders
Trading
Matching
Order Book
Order Flow
Liquidity
Market Microstructure
Latency
Transaction Cost
Research
Time Series
```

The C++ engine should remain independently testable and benchmarkable.

---

# 9. C++ Deployment Model

The C++ engine should eventually run as an independently deployable service or controlled compute component.

Conceptually:

```text
Node.js Backend
       |
       | Quant Request
       ▼
C++ Quant Engine
       |
       | Result
       ▼
Node.js Backend
       |
       ▼
Frontend
```

The final communication mechanism will be selected based on measured requirements.

Candidates include:

```text
HTTP
gRPC
Native Node.js bindings
Shared library
Separate process
```

The preferred direction for an independently deployed production engine is an internal service boundary, with **gRPC as a strong candidate** when the performance and operational requirements justify it.

No public route should directly expose the C++ engine.

---

# 10. Application Database

## Selected Technology

**PostgreSQL + Prisma**

MongoDB is no longer the primary database direction for QuantPulse.

The application domain is highly relational:

```text
User
 │
 ├── Portfolio
 │      └── Position
 │
 ├── Strategy
 │      └── Strategy Version
 │
 ├── Backtest
 │      ├── Trades
 │      └── Performance
 │
 └── Research Experiment
```

PostgreSQL is therefore the primary application database.

Prisma provides the application-level ORM/data-access layer.

---

# 11. PostgreSQL Responsibilities

PostgreSQL should store application-oriented and relational data such as:

```text
Users
Datasets
Strategies
Strategy Versions
Backtests
Backtest Metadata
Backtest Metrics
Trades
Research Experiments
Research Runs
Signals
Portfolios
Positions
Orders
Executions
Jobs
Application Configuration
```

PostgreSQL should not automatically become the storage solution for every high-volume market-data workload.

---

# 12. Prisma

Prisma provides the application database abstraction:

```text
Node.js
   ↓
Prisma
   ↓
PostgreSQL
```

Prisma will be responsible for:

* Schema management
* Type-safe database access
* Application persistence
* Database migrations
* Relational queries

The Prisma layer should remain focused on application data.

It should not be treated as an abstraction over every possible time-series database.

---

# 13. Time-Series Data Architecture

Market data has different characteristics from ordinary application data.

Potential data includes:

```text
OHLCV
Quotes
Trades
Order Book
Order Flow
Market Events
Ticks
Historical Replay Data
```

These workloads may require:

* High write throughput
* Efficient range queries
* Time-based partitioning
* Compression
* Retention policies
* Historical replay
* Large-scale analytical queries

Therefore QuantPulse will use a dedicated time-series repository boundary.

---

# 14. TimescaleDB

## Initial Time-Series Direction

**TimescaleDB**

TimescaleDB will be the first dedicated time-series storage technology evaluated for QuantPulse.

Conceptually:

```text
Market Data
     ↓
MarketDataRepository
     ↓
TimescaleDB
```

The application should not tightly couple business logic directly to TimescaleDB-specific queries.

Instead:

```typescript
interface MarketDataRepository {
    getCandles(request: CandleQuery): Promise<MarketBar[]>;
    getQuotes(request: QuoteQuery): Promise<MarketQuote[]>;
    getTrades(request: TradeQuery): Promise<Trade[]>;
}
```

This allows the storage implementation to evolve independently.

---

# 15. Advanced Time-Series Infrastructure

A future high-performance deployment may evaluate:

**kdb+ / KDB-X**

for workloads involving:

* Large financial datasets
* High-frequency market data
* Advanced time-series analytics
* Tick data
* Order-book analytics
* Real-time financial computation

The architecture should therefore support:

```text
MarketDataRepository
       │
       ├── TimescaleDB implementation
       │
       └── Future kdb+ / KDB-X implementation
```

kdb+ / KDB-X is an **advanced future option**, not a required initial dependency.

The system should first measure actual workloads before introducing it.

---

# 16. Repository Architecture

The database architecture should follow a repository/adapter model.

```text
Application
     │
     ├── DatasetRepository
     │
     └── MarketDataRepository
             │
             ├── TimescaleDB
             │
             └── Future kdb+ / KDB-X
```

Example:

```typescript
interface DatasetRepository {
    findById(id: string): Promise<Dataset | null>;
    create(dataset: CreateDataset): Promise<Dataset>;
}

interface MarketDataRepository {
    getCandles(request: CandleQuery): Promise<MarketBar[]>;
    getQuotes(request: QuoteQuery): Promise<MarketQuote[]>;
    getTrades(request: TradeQuery): Promise<Trade[]>;
}
```

This prevents the rest of the application from depending directly on a specific storage vendor.

---

# 17. Redis

## Status

**Optional / requirement-driven**

Redis is not a mandatory first component.

It should be introduced when the application demonstrates a concrete need.

Potential uses:

```text
Redis
 ├── Analytics Cache
 ├── Latest Market State
 ├── Latest Signals
 ├── Dashboard Cache
 ├── Background Job State
 ├── Queue Coordination
 ├── Distributed Locks
 └── Rate Limiting
```

Redis should not be introduced merely because it is common in distributed systems.

---

# 18. Background Jobs

Long-running quantitative workloads should eventually move to asynchronous processing.

Examples:

```text
Large Backtest
Monte Carlo Simulation
Historical Dataset Processing
Feature Generation
Parameter Sweep
Research Experiment
```

Target architecture:

```text
POST /api/backtests
        │
        ▼
Create Job
        │
        ▼
Redis / Queue
        │
        ▼
Worker
        │
        ▼
C++ Quant Engine
        │
        ▼
Store Result
        │
        ▼
PostgreSQL
```

The first implementation may remain synchronous for smaller workloads.

Asynchronous processing should be introduced when measured execution time and concurrency justify it.

---

# 19. Docker

## Status

**Planned**

Docker will provide reproducible service environments.

The target containerized services are:

```text
Node.js API
C++ Quant Engine
PostgreSQL
TimescaleDB
Redis
```

The frontend may use Vercel's native build/runtime environment rather than requiring a production Docker container.

---

# 20. Docker Compose

Docker Compose should provide a reproducible local infrastructure environment.

Conceptually:

```text
docker compose
      │
      ├── PostgreSQL
      ├── TimescaleDB
      ├── Redis
      ├── Backend
      └── Quant Engine
```

This allows developers to reproduce infrastructure locally without manually installing every service.

The exact Compose topology will be finalized during infrastructure implementation.

---

# 21. Container Requirements

## Node.js Container

Must explicitly define:

* Node.js version
* Dependencies
* Build process
* Production runtime
* Environment configuration

## C++ Container

Must explicitly define:

* C++ compiler/toolchain
* C++20 support
* CMake
* Ninja
* Runtime dependencies
* Build configuration
* Target architecture

Containers should use reproducible versions wherever practical.

---

# 22. Environment Model

QuantPulse should support:

```text
Development
      ↓
Staging
      ↓
Production
```

Each environment should have independent configuration and appropriate data isolation.

---

# 23. Development Environment

The development environment should support:

```text
Developer Machine
       │
       ├── React + Vite
       ├── Node.js API
       ├── C++20 Engine
       ├── PostgreSQL
       ├── TimescaleDB
       └── Redis
```

Not every infrastructure component must run at all times.

For example:

```text
Basic Development
React
Node.js
C++
PostgreSQL

Full Infrastructure Development
React
Node.js
C++
PostgreSQL
TimescaleDB
Redis
```

The development environment should remain easy to start and reproduce.

---

# 24. Staging

Staging should reproduce production behavior as closely as practical.

It should validate:

* Frontend/backend integration
* API contracts
* Database migrations
* C++ engine integration
* Time-series queries
* Authentication
* Backtesting workflows
* Research workflows
* Performance
* Configuration
* Deployment behavior

Staging should use isolated data.

Production data should not be used in staging unless explicitly required and protected.

---

# 25. Production

Production should eventually provide:

```text
HTTPS
Secure Secrets
Managed PostgreSQL
TimescaleDB
Containerized Backend
Containerized Quant Engine
Optional Redis
Monitoring
Structured Logging
Health Checks
Backups
Automated Deployment
Rollback
```

---

# 26. Network Architecture

Public access:

```text
Internet
   │
   │ HTTPS
   ▼
Vercel
   │
   │ HTTPS
   ▼
Node.js API
```

Internal services:

```text
Node.js API
    │
    ├── PostgreSQL
    │
    ├── TimescaleDB
    │
    ├── Redis
    │
    └── C++ Quant Engine
```

Database and C++ engine services should remain private wherever the deployment platform permits.

---

# 27. HTTPS

All public production communication must use HTTPS.

```text
Browser
   │
   │ HTTPS
   ▼
Frontend
   │
   │ HTTPS
   ▼
Backend
```

Internal service communication should use secure transport appropriate to the final deployment topology.

---

# 28. Environment Configuration

Configuration must be supplied through environment variables or deployment-platform configuration.

Example:

```text
NODE_ENV
PORT
API_BASE_URL

DATABASE_URL
TIMESERIES_DATABASE_URL

REDIS_URL

QUANT_ENGINE_URL

LOG_LEVEL
```

Additional configuration will be introduced as services are implemented.

Secrets must never be hard-coded.

---

# 29. Secrets Management

Production secrets should be stored using the deployment platform's secret-management facilities or a dedicated secrets-management system.

Sensitive values include:

```text
PostgreSQL credentials
Database URLs
Redis credentials
Authentication secrets
JWT/session secrets
Encryption keys
Provider credentials
Internal service credentials
```

The repository should contain:

```text
.env.example
```

with safe placeholder values only.

---

# 30. CI/CD

## Target

**GitHub Actions**

The CI/CD pipeline should eventually automate:

```text
Git Push
    ↓
Install Dependencies
    ↓
Frontend Typecheck
    ↓
Frontend Tests
    ↓
Frontend Build
    ↓
Backend Typecheck
    ↓
Backend Tests
    ↓
Backend Build
    ↓
C++ Build
    ↓
C++ Tests
    ↓
C++ Benchmarks
    ↓
Container Build
    ↓
Staging
    ↓
Verification
    ↓
Production
```

A deployment should not bypass automated validation once CI/CD is established.

---

# 31. Build Validation

The project should preserve the following validation layers.

## Frontend

```text
TypeScript
    ↓
Vitest / React Testing Library
    ↓
Vite Build
```

## Backend

```text
TypeScript
    ↓
Vitest
    ↓
Production Build
```

## C++

```text
CMake
    ↓
Ninja Build
    ↓
GoogleTest
    ↓
Google Benchmark
```

The benchmark suite should be used to detect performance regressions in quantitative workloads.

---

# 32. Deployment Artifacts

Production deployments should be based on reproducible artifacts.

Potential artifacts include:

```text
Frontend Build
Node.js Container Image
C++ Quant Engine Container Image
Database Migration Version
Git Commit / Release Tag
```

Every production deployment should be traceable to a source revision.

---

# 33. Deployment Strategy

The initial deployment strategy should remain simple:

```text
Developer
    ↓
Git Commit
    ↓
   CI
    ↓
  Tests
    ↓
  Build
    ↓
  Staging
    ↓
Verification
    ↓
Production
```

More advanced strategies may later include:

* Rolling deployment
* Blue/green deployment
* Canary deployment

These are not required for the initial deployment.

---

# 34. Versioning

Production releases should be associated with:

```text
Git Commit
Release Version
Container Version
Database Migration Version
```

This enables:

```text
Deployment
     ↓
Observe
     ↓
Detect Problem
     ↓
Identify Version
     ↓
Rollback
```

---

# 35. Database Migrations

Application database schema changes should be managed through Prisma migrations.

Conceptually:

```text
Prisma Schema
      ↓
Migration
      ↓
PostgreSQL
```

Database migrations should be version-controlled.

Production migrations should be executed through the deployment process rather than manually modifying the production database.

Time-series schema changes should be managed separately according to the TimescaleDB deployment strategy.

---

# 36. Logging

All backend and quantitative services should eventually produce structured logs.

Recommended fields:

```text
timestamp
service
environment
level
requestId
operation
duration
message
error
```

Example:

```text
Frontend
   │
requestId = ABC123
   ▼
Node.js API
   │
requestId = ABC123
   ▼
C++ Engine
```

The same request/correlation identifier should be propagated across service boundaries where practical.

---

# 37. Observability

Production observability should eventually cover three primary signals:

```text
Logs
Metrics
Traces
```

## Frontend

Monitor:

* Page errors
* API failures
* Performance
* WebGL failures
* Client-side exceptions

## Backend

Monitor:

* Request rate
* Error rate
* Response latency
* HTTP status codes
* Event-loop health
* Database latency
* Quant-engine latency

## C++ Engine

Monitor:

* Calculation duration
* CPU utilization
* Memory usage
* Calculation failures
* Request throughput
* Queue depth

## Databases

Monitor:

* Query latency
* Connection count
* Storage
* Read/write load
* Slow queries
* Time-series ingestion rate

The final observability vendor/tooling should be selected during infrastructure implementation based on cost and deployment requirements.

---

# 38. Health Checks

The backend should eventually expose:

```text
GET /health
```

A readiness endpoint may eventually verify:

```text
Backend
   │
   ├── PostgreSQL
   ├── TimescaleDB
   ├── Redis
   └── C++ Engine
```

Health and readiness should be treated separately.

### Liveness

Answers:

> Is the service process running?

### Readiness

Answers:

> Can the service currently handle requests?

---

# 39. Security Architecture

Production deployment should follow:

```text
Public Internet
      │
      │ HTTPS
      ▼
Frontend
      │
      │ HTTPS
      ▼
Backend
      │
      ├── Private Database
      ├── Private Time-Series DB
      ├── Private Redis
      └── Private Quant Engine
```

Security principles:

* HTTPS
* Authentication
* Authorization
* Input validation
* Rate limiting where required
* Least-privilege database credentials
* Private internal services
* Secure secrets
* Dependency updates
* Container hardening
* Controlled network access
* No secrets in source control

---

# 40. C++ Engine Security Boundary

The C++ engine must not become a public API endpoint.

The intended boundary is:

```text
Internet
   ↓
Node.js
   ↓
Validation
   ↓
C++ Quant Engine
```

The Node.js service should validate and constrain requests before passing them to the quantitative engine.

This also protects the C++ process from direct arbitrary external input.

---

# 41. Market Data Security

Market data must be treated separately from application data.

The system should distinguish:

```text
Raw Data
Processed Data
Database Data
Application Metadata
Derived Analytics
```

Raw market datasets should remain outside application code where appropriate.

Example:

```text
data/
├── raw/
├── processed/
└── schemas/
```

Database records should reference controlled datasets rather than allowing arbitrary filesystem paths from public API requests.

---

# 42. Background Quantitative Workloads

Backtests and research experiments may eventually become computationally expensive.

The target architecture is:

```text
Frontend
   ↓
POST /api/backtests
   ↓
Node.js
   ↓
Create Job
   ↓
Queue
   ↓
Worker
   ↓
C++20 Engine
   ↓
Results
   ↓
PostgreSQL
   ↓
Frontend
```

This allows the API to remain responsive while long-running quantitative calculations execute independently.

---

# 43. Scaling

The initial system should avoid unnecessary distributed complexity.

Scaling should happen based on measured bottlenecks.

Potential future topology:

```text
                   Load
                    │
              ┌─────┴─────┐
              ▼           ▼
          Backend A   Backend B
              │           │
              └─────┬─────┘
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
     Quant Worker A      Quant Worker B
```

The C++ engine can eventually scale horizontally when quantitative workloads justify it.

---

# 44. Database Scaling

Application data and market data should scale independently.

```text
Application Data
       ↓
PostgreSQL
       ↓
Scale according to relational workload
```

```text
Market Data
       ↓
TimescaleDB
       ↓
Scale according to time-series workload
```

This separation prevents market-data ingestion from unnecessarily affecting application transactions.

---

# 45. Backups

Production backups should cover:

### PostgreSQL

* Users
* Strategies
* Backtests
* Research
* Portfolios
* Orders
* Application metadata

### TimescaleDB

* Important historical market data
* Derived datasets where required

### Configuration

* Deployment configuration
* Infrastructure configuration
* Database migration history

Backup and recovery procedures should eventually be tested rather than only documented.

---

# 46. Disaster Recovery

The production system should eventually define:

```text
Backup
   ↓
Detection
   ↓
Recovery
   ↓
Verification
   ↓
Service Restoration
```

Recovery requirements should be based on:

* Acceptable downtime
* Data criticality
* Dataset size
* Cost
* Research reproducibility

---

# 47. Data Retention

Different data classes may require different retention policies.

```text
Application Data
Research Data
Backtest Results
Market Data
Raw Data
Logs
Metrics
```

Retention should consider:

* Storage cost
* Research requirements
* Reproducibility
* Historical analysis
* Applicable legal/compliance requirements

---

# 48. Local-to-Production Parity

The same application architecture should work across:

```text
Local
   ↓
Staging
   ↓
Production
```

The primary difference should be infrastructure configuration rather than undocumented application behavior.

For example:

```text
LOCAL
PostgreSQL → localhost
TimescaleDB → localhost
Redis → localhost

STAGING
Managed/Containerized Services

PRODUCTION
Managed Production Services
```

The application should consume these through environment configuration.

---

# 49. Deployment Platforms

## Frontend

**Target: Vercel**

```text
React
   ↓
Vite Build
   ↓
Vercel
```

## Backend

**Target: Render or equivalent managed container platform**

```text
Node.js
   ↓
Docker
   ↓
Render / Cloud Platform
```

## C++ Engine

**Target: Containerized compute environment**

```text
C++20
   ↓
Docker
   ↓
Private Compute Service
```

The exact C++ hosting platform will be selected after measuring computational requirements.

## Databases

```text
PostgreSQL
TimescaleDB
Redis
```

These may initially run through Docker Compose locally and later use managed infrastructure in production.

---

# 50. Full Technology Architecture

The complete QuantPulse technology architecture is:

```text
┌────────────────────────────────────────────────────────────┐
│                         FRONTEND                           │
│                                                            │
│ React 19                                                   │
│ TypeScript                                                 │
│ Vite                                                       │
│ Tailwind CSS v4                                            │
│ shadcn/ui                                                  │
│ Lucide                                                     │
│                                                            │
│ Lightweight Charts                                         │
│ Recharts                                                   │
│                                                            │
│ React Three Fiber                                          │
│ Three.js                                                   │
│ GSAP                                                       │
└───────────────────────────┬────────────────────────────────┘
                            │
                            │ HTTPS / REST
                            ▼
┌────────────────────────────────────────────────────────────┐
│                         BACKEND                            │
│                                                            │
│ Node.js                                                    │
│ TypeScript                                                 │
│ Express                                                    │
│ REST API                                                   │
│                                                            │
│ Auth                                                       │
│ Validation                                                 │
│ Business Logic                                             │
│ Quant Orchestration                                        │
│ Research                                                   │
│ Portfolio                                                  │
│ Risk                                                       │
│ Execution                                                  │
└───────────────┬──────────────────────┬─────────────────────┘
                │                      │
                │                      │
                ▼                      ▼
┌────────────────────────┐   ┌──────────────────────────────┐
│    C++20 QUANT ENGINE  │   │            REDIS             │
│                        │   │                              │
│ C++20                  │   │ Cache                        │
│ CMake                  │   │ Hot Market State             │
│ Ninja                  │   │ Signals                      │
│ GoogleTest             │   │ Jobs                         │
│ Google Benchmark       │   │ Coordination                 │
│                        │   │                              │
│ Analytics              │   └──────────────────────────────┘
│ Signals                │
│ Strategies             │
│ Backtesting            │
│ Risk                   │
│ Portfolio              │
│ Execution              │
│ Microstructure         │
│ Research               │
└────────────┬───────────┘
             │
       ┌─────┴──────────────────────┐
       │                            │
       ▼                            ▼
┌─────────────────────┐   ┌─────────────────────────┐
│    POSTGRESQL       │   │      TIMESCALEDB        │
│                     │   │                         │
│ Prisma              │   │ OHLCV                   │
│                     │   │ Quotes                  │
│ Users               │   │ Trades                  │
│ Strategies          │   │ Order Book              │
│ Backtests           │   │ Market Events           │
│ Research            │   │ Historical Data         │
│ Portfolios          │   │                         │
│ Orders              │   │ Time-Series Analytics   │
│ Jobs                │   └─────────────────────────┘
└─────────────────────┘

                              FUTURE ADVANCED
                                     │
                                     ▼
                              kdb+ / KDB-X
```

---

# 51. Infrastructure Development Order

Infrastructure should be implemented incrementally.

Recommended order:

```text
1. PostgreSQL
      ↓
2. Prisma
      ↓
3. Application repositories
      ↓
4. TimescaleDB
      ↓
5. Market-data repository
      ↓
6. Docker Compose
      ↓
7. Backend container
      ↓
8. C++ engine container
      ↓
9. Internal C++ service communication
      ↓
10. Redis
      ↓
11. Background jobs
      ↓
12. CI/CD
      ↓
13. Staging
      ↓
14. Production
      ↓
15. Monitoring / observability
      ↓
16. Advanced scaling
```

This avoids introducing infrastructure before the application has a clear requirement for it.

---

# 52. Deployment Validation Pipeline

The final deployment pipeline should be:

```text
Developer
    │
    ▼
Git Commit
    │
    ▼
GitHub
    │
    ▼
GitHub Actions
    │
    ├── Frontend Typecheck
    ├── Frontend Tests
    ├── Frontend Build
    │
    ├── Backend Typecheck
    ├── Backend Tests
    ├── Backend Build
    │
    ├── C++ Build
    ├── C++ Tests
    └── C++ Benchmarks
             │
             ▼
       Docker Build
             │
             ▼
          Staging
             │
             ▼
        Verification
             │
             ▼
        Production
```

---

# 53. Production Health Model

Production health should eventually be represented as:

```text
QuantPulse
   │
   ├── Frontend
   │
   ├── Backend
   │     ├── PostgreSQL
   │     ├── TimescaleDB
   │     ├── Redis
   │     └── Quant Engine
   │
   └── Infrastructure
```

A deployment is considered healthy only when required dependencies are operational.

---

# 54. Production Deployment Checklist

Before production deployment:

### Frontend

* [ ] Typecheck succeeds
* [ ] Tests pass
* [ ] Vite production build succeeds
* [ ] API URL configured
* [ ] HTTPS enabled

### Backend

* [ ] Typecheck succeeds
* [ ] Tests pass
* [ ] Production build succeeds
* [ ] Environment variables configured
* [ ] Authentication configured
* [ ] Database connectivity verified
* [ ] Quant-engine connectivity verified
* [ ] Health endpoint verified

### C++ Engine

* [ ] CMake configuration succeeds
* [ ] Ninja build succeeds
* [ ] GoogleTest passes
* [ ] Benchmarks run successfully
* [ ] Container builds successfully
* [ ] Runtime dependencies verified

### PostgreSQL

* [ ] Production database created
* [ ] Prisma migrations applied
* [ ] Credentials secured
* [ ] Backups configured

### TimescaleDB

* [ ] Time-series schema configured
* [ ] Market-data ingestion verified
* [ ] Range queries verified
* [ ] Retention strategy defined

### Redis

Only if enabled:

* [ ] Connection verified
* [ ] Authentication configured
* [ ] Cache behavior verified
* [ ] Job/queue behavior verified

### Infrastructure

* [ ] Docker images build
* [ ] CI pipeline passes
* [ ] Staging deployment succeeds
* [ ] Health checks pass
* [ ] Logs available
* [ ] Monitoring available
* [ ] Deployment version recorded
* [ ] Rollback procedure understood

---

# 55. Current Infrastructure Status

| Component          | Current Status      | Target                      |
| ------------------ | ------------------- | --------------------------- |
| React Frontend     | Implemented locally | Vercel                      |
| Vite               | Implemented         | Vercel build                |
| TypeScript         | Implemented         | CI validation               |
| Tailwind CSS       | Implemented         | Production frontend         |
| shadcn/ui          | Implemented         | Production frontend         |
| Lightweight Charts | Implemented         | Production frontend         |
| Recharts           | Implemented         | Production frontend         |
| Three.js           | Planned for landing | Vercel                      |
| React Three Fiber  | Planned for landing | Vercel                      |
| GSAP               | Planned for landing | Vercel                      |
| Node.js Backend    | Implemented locally | Render / cloud container    |
| Express            | Implemented         | Production API              |
| REST API           | Implemented         | Production API              |
| C++20 Engine       | Implemented locally | Containerized compute       |
| CMake              | Implemented         | CI/container                |
| Ninja              | Implemented         | CI/container                |
| GoogleTest         | Implemented         | CI                          |
| Google Benchmark   | Implemented         | CI/performance              |
| PostgreSQL         | Planned             | Managed PostgreSQL          |
| Prisma             | Planned             | PostgreSQL ORM              |
| TimescaleDB        | Planned             | Market-data storage         |
| Redis              | Not required yet    | Requirement-driven          |
| Docker             | Planned             | Containers                  |
| Docker Compose     | Planned             | Local infrastructure        |
| GitHub Actions     | Planned             | CI/CD                       |
| Monitoring         | Planned             | Observability stack         |
| Production HTTPS   | Not configured      | Required                    |
| Backups            | Not configured      | Required                    |
| kdb+ / KDB-X       | Future option       | Advanced time-series        |
| Staging            | Not deployed        | Production-like environment |
| Production         | Not deployed        | Vercel + cloud backend      |

---

# 56. Open Infrastructure Decisions

The following decisions remain intentionally open:

1. Final Node.js hosting platform
2. Final C++ compute platform
3. HTTP vs gRPC for C++ service communication
4. Managed PostgreSQL provider
5. Managed TimescaleDB deployment strategy
6. Redis introduction point
7. Background-job technology
8. Final observability stack
9. Production traffic requirements
10. Quant-engine compute requirements
11. Market-data volume requirements
12. kdb+ / KDB-X adoption criteria
13. Backup and disaster-recovery targets
14. Production scaling requirements

These decisions should be driven by measured application requirements.

---

# 57. Architecture Principles

QuantPulse deployment follows these principles:

### 1. Local first

The complete application should work locally before production deployment.

### 2. Measure before scaling

Infrastructure should be introduced because the workload requires it, not because it is fashionable.

### 3. Separate application data from market data

```text
PostgreSQL
    ↓
Application / relational data

TimescaleDB
    ↓
Market / time-series data
```

### 4. Keep quantitative computation in C++

Performance-sensitive quantitative algorithms belong in the C++ engine.

### 5. Keep the C++ engine behind the backend boundary

The browser should never directly communicate with the quant engine.

### 6. Use repository boundaries

Database implementations should be replaceable without rewriting domain logic.

### 7. Redis is optional

Redis should solve an identified problem rather than become an unnecessary dependency.

### 8. Containers provide reproducibility

Docker should make development, testing, and deployment environments more consistent.

### 9. Automate validation

Every production deployment should pass automated validation.

### 10. Keep deployment simple

Distributed architecture should be introduced only when actual workload characteristics justify it.

---

# 58. Target Final Architecture

The long-term QuantPulse platform is:

```text
                    ┌──────────────────────┐
                    │       USERS          │
                    └──────────┬───────────┘
                               │
                              HTTPS
                               │
                               ▼
                    ┌──────────────────────┐
                    │       VERCEL         │
                    │                      │
                    │ React 19             │
                    │ TypeScript           │
                    │ Vite                 │
                    │ Tailwind             │
                    │ shadcn/ui            │
                    │ R3F + Three.js       │
                    │ GSAP                 │
                    │ Charts               │
                    └──────────┬───────────┘
                               │
                              REST
                               │
                               ▼
                    ┌──────────────────────┐
                    │     NODE.JS API      │
                    │                      │
                    │ TypeScript + Express │
                    │ Auth                 │
                    │ Validation           │
                    │ Business Logic        │
                    │ Orchestration         │
                    └──────┬─────┬─────┬───┘
                           │     │     │
             ┌─────────────┘     │     └─────────────┐
             │                   │                   │
             ▼                   ▼                   ▼
      ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
      │ C++20       │     │ PostgreSQL  │     │ TimescaleDB │
      │ Quant       │     │             │     │             │
      │ Engine      │     │ Prisma      │     │ Market Data │
      │             │     │             │     │             │
      │ Analytics   │     │ Users       │     │ OHLCV       │
      │ Signals     │     │ Strategies  │     │ Quotes      │
      │ Backtests   │     │ Backtests   │     │ Trades      │
      │ Risk        │     │ Research    │     │ Order Book  │
      │ Execution   │     │ Portfolio   │     │ Events      │
      │ Research    │     │ Orders      │     │             │
      └─────────────┘     └─────────────┘     └─────────────┘
             │
             │
             ▼
      ┌─────────────┐
      │    Redis    │
      │             │
      │ Cache       │
      │ Jobs        │
      │ Hot State   │
      └─────────────┘

      Future Advanced Infrastructure
                    │
                    ▼
             ┌─────────────┐
             │ kdb+ / KDB-X│
             └─────────────┘
```

---

# 59. Current Status Summary

QuantPulse currently has a **defined target technology architecture**, but production infrastructure is not yet deployed.

The current direction is:

```text
Frontend
    → React 19
    → TypeScript
    → Vite
    → Tailwind CSS
    → shadcn/ui
    → Lightweight Charts
    → Recharts
    → React Three Fiber
    → Three.js
    → GSAP
    → Vercel

Backend
    → Node.js
    → TypeScript
    → Express
    → REST
    → Render / cloud container platform

Quant Engine
    → C++20
    → CMake
    → Ninja
    → GoogleTest
    → Google Benchmark
    → Containerized compute

Application Data
    → PostgreSQL
    → Prisma

Market Data
    → TimescaleDB
    → Repository abstraction
    → Future kdb+ / KDB-X option

Infrastructure
    → Docker
    → Docker Compose
    → Redis when justified
    → GitHub Actions
    → Staging
    → Production
    → Observability

Security
    → HTTPS
    → Secure secrets
    → Private internal services
    → Authentication
    → Authorization
    → Validation
```

---

# 60. Design Goal

QuantPulse deployment should remain:

* **Simple**
* **Reproducible**
* **Secure**
* **Observable**
* **Cost-conscious**
* **Performance-aware**
* **Independently testable**
* **Container-ready**
* **Database-flexible**
* **Easy to evolve**

The primary principle remains:

> **Build and validate the application locally first, measure its actual requirements, and introduce deployment complexity only when the system needs it.**

### One important correction from your old document

I would **remove MongoDB Atlas completely from this deployment document**.

Our architecture has now moved to:

```text
                    APPLICATION DATA
                           │
                           ▼
                  PostgreSQL + Prisma


                      MARKET DATA
                           │
                           ▼
                       TimescaleDB
                           │
                  ┌────────┴────────┐
                  │                 │
                  ▼                 ▼
             Current          Future Advanced
          TimescaleDB        kdb+ / KDB-X
```

---
