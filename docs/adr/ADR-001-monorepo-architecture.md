# ADR-001: Monorepo Architecture

## Status

Accepted

## Date

2026-08-14

## Context

QuantPulse consists of multiple closely related components:

- React frontend
- Node.js backend
- C++ quantitative engine
- benchmark suites
- datasets
- documentation
- deployment configuration

These components are developed as parts of a single product and need
to evolve together.

A repository structure that separates these components into independent
repositories would introduce additional coordination overhead during
early development.

## Decision

QuantPulse will use a monorepo architecture.

The repository will contain:

```text
QuantPulse-VP/
├── frontend/
├── backend/
├── cpp-engine/
├── data/
├── benchmarks/
├── docker/
├── docs/
└── scripts/
```
