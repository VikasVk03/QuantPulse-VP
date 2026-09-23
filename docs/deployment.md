# QuantPulse Deployment & Infrastructure

## Status

**Deployment Architecture — Active Target**

This document defines the deployment architecture, hosting platforms, infrastructure topology, environment promotion pipelines, security policies, and observability standards for the **QuantPulse Platform**.

---

# 1. Deployment Objectives

The QuantPulse deployment architecture is designed to provide:

- **Global Edge Delivery**: High-speed, CDN-cached React 19 frontend delivery via Vercel.
- **Scalable Application API**: Containerized Node.js REST and WebSocket services on Render.
- **Deterministic High-Performance Computing**: Isolated C++20 quantitative engine execution.
- **Relational & Time-Series Specialization**: PostgreSQL for relational business entities; TimescaleDB for high-volume market feeds.
- **Low-Latency Caching**: Managed Redis for rate limiting, hot order book caches, and background jobs.
- **Automated CI/CD**: GitHub Actions executing static analysis, C++ GoogleTest suites (594 tests), TypeScript typechecking, and automated builds on every push.
- **Safe Environment Progression**: Strict separation across `Development`, `Staging`, and `Production`.

---

# 2. Production Topology

```text
                         INTERNET
                            │
                         HTTPS
                            │
                            ▼
                 ┌─────────────────────┐
                 │       Vercel        │
                 │ React 19 + Vite     │
                 │ Edge CDN Delivery   │
                 └──────────┬──────────┘
                            │ HTTPS / REST / WSS
                            ▼
                 ┌─────────────────────┐
                 │    Render Cloud     │
                 │ Node.js Backend API │
                 │ Docker Container    │
                 └──────┬───────┬──────┘
                        │       │
              ┌─────────┘       └──────────┐
              ▼                            ▼
     ┌─────────────────┐          ┌─────────────────┐
     │ C++20 Quant     │          │  Managed Redis  │
     │ Engine          │          │ Hot Cache /     │
     │ Containerized   │          │ Job Queue       │
     └────────┬────────┘          └─────────────────┘
              │
              │
       ┌──────┴──────────────────────────────┐
       │                                     │
       ▼                                     ▼
   ┌────────────────────┐        ┌────────────────────┐
   │ Managed PostgreSQL │        │ TimescaleDB Cloud  │
   │ Prisma ORM Access  │        │ High-Volume Ticks  │
   │ Relational State   │        │ Time-Series Data   │
   └────────────────────┘        └────────────────────┘
```

---

# 3. Component Deployment Specifications

## 3.1 Frontend (Vercel)

- **Platform**: Vercel (Static & Edge CDN)
- **Framework Preset**: Vite / React
- **Build Command**: `npm run build` (runs `tsc -b && vite build`)
- **Output Directory**: `dist`
- **Environment Variables**:
    - `VITE_API_URL`: Backend API base endpoint (e.g. `https://api.quantpulse.io/api/v1`)
    - `VITE_WS_URL`: WebSocket stream endpoint (e.g. `wss://api.quantpulse.io/stream`)
- **Features**: Automatic preview deployments on pull requests, HTTPS by default, Brotli/Gzip compression.

## 3.2 Backend Service (Render Container)

- **Platform**: Render Web Service (Docker runtime)
- **Base Image**: `node:20-alpine` (multi-stage build with TypeScript compiler)
- **Health Check Path**: `/health` (returns HTTP 200 and system diagnostics)
- **Environment Variables**:
    - `PORT`: Service port (default 4000)
    - `DATABASE_URL`: PostgreSQL connection string (Prisma)
    - `TIMESCALE_URL`: TimescaleDB connection string
    - `REDIS_URL`: Redis connection string
    - `JWT_SECRET`: Authentication signing secret
    - `NODE_ENV`: `production` | `staging` | `development`

## 3.3 Quantitative Engine (C++20 Service / Library)

- **Runtime**: Linux x86_64 container optimized with `-O3 -march=x86-64-v3`
- **Compiler**: GCC 13.3+ / Clang 17+
- **Build System**: CMake 3.28+ with Ninja generator
- **Verification Gate**: CTest 100% pass rate across 594 unit & integration tests required before container promotion.

## 3.4 Data & Storage Layer

| Service            | Technology     | Provider                                       | Backup / HA Policy                              |
| :----------------- | :------------- | :--------------------------------------------- | :---------------------------------------------- |
| **Relational DB**  | PostgreSQL 16+ | Managed PostgreSQL (Neon / Supabase / AWS RDS) | Automated daily backups, point-in-time recovery |
| **Time-Series DB** | TimescaleDB    | Timescale Cloud / Managed Instance             | Chunk compression, tiered storage retention     |
| **Hot Cache**      | Redis 7+       | Managed Redis (Upstash / Redis Cloud)          | In-memory with RDB snapshotting                 |

---

# 4. CI/CD Pipeline (GitHub Actions)

Every pull request and merge to `main` executes the automated pipeline:

```text
GitHub Push / Pull Request
         │
         ├──► 1. C++ Quantitative Engine Job
         │       ├── Configure CMake + Ninja (C++20)
         │       ├── Compile with -Wall -Wextra -Wpedantic
         │       ├── Run GoogleTest executable (594 tests)
         │       └── Run CTest verification suite
         │
         ├──► 2. Backend Job
         │       ├── Node.js 20 environment
         │       ├── Lint & TypeScript typecheck
         │       ├── Run Prisma schema validation
         │       └── Execute backend unit tests
         │
         └──► 3. Frontend Job
                 ├── Node.js 20 environment
                 ├── Run TypeScript typecheck (tsc --noEmit)
                 ├── Vite production build verification
                 └── Trigger Vercel preview deployment
```

---

# 5. Environment Strategy

```text
┌────────────────────────────────────────────────────────────────────────┐
│ DEVELOPMENT (Local)                                                    │
│ Docker Compose: Node.js API + C++ Engine + Local Postgres + Redis     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Automated PR Validation
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ STAGING (Preview)                                                      │
│ Vercel Preview Deployments + Render Staging Service + Staging DBs      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Merge to main & Tagged Release
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PRODUCTION                                                             │
│ Vercel Production + Render High-Availability Container + Managed DBs   │
└────────────────────────────────────────────────────────────────────────┘
```
