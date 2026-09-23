# ADR-007: Vercel & Render Cloud Deployment Strategy

## Status

Accepted

## Date

2026-09-04

## Context

QuantPulse requires a modern, reproducible, and cost-effective deployment strategy that cleanly isolates static frontend delivery from long-running backend processes and stateful databases.

## Decision

QuantPulse will deploy:

1. **Frontend (React 19 + TypeScript + Vite)** on **Vercel** for edge CDN caching, global routing, and zero-config automated preview branches.
2. **Backend (Node.js API + C++ Quantitative Core)** on **Render** (or equivalent container platform) as a containerized web service.
3. **Database Layer** on managed cloud services (Managed PostgreSQL, Timescale Cloud, Managed Redis).

## Consequences

- Frontend builds are automatically optimized and served with global low latency.
- Backend containers encapsulate all C++20 build toolchains and runtime dependencies.
- Zero server maintenance overhead for database scaling and automated backups.
