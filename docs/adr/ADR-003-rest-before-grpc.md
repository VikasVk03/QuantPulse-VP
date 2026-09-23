# ADR-003: REST API Prior to gRPC Integration

## Status

Accepted

## Date

2026-08-20

## Context

QuantPulse requires clear communication between the React 19 frontend, the Node.js backend API gateway, and the C++ quantitative computation layer.

While gRPC provides high-throughput binary serialization and low-overhead multiplexing, introducing Protobuf generation and gRPC toolchains during initial service integration increases development friction for standard CRUD and visualization queries.

## Decision

QuantPulse will use a versioned RESTful HTTP API (`/api/v1`) as the primary external application interface, while reserving gRPC as a future optimization for high-throughput internal microservice communication between Node.js and the C++ engine.

## Consequences

- Standard JSON payloads simplify frontend integration, debugging, and testing.
- Easy integration with browser Developer Tools and OpenAPI / Swagger specifications.
- Service interfaces remain modular so that gRPC or binary IPC can be introduced transparently behind the service layer.
