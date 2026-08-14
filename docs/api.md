# QuantPulse API

## Status

**API design — initial contract**

The QuantPulse API is currently a **planned interface**. The endpoints and request/response formats documented here are preliminary and are not considered production contracts until their corresponding services are implemented and tested.

The API will provide a stable interface between the application frontend, Node.js backend, and C++ quantitative engine.

---

# 1. Architecture

The intended request flow is:

```text
Frontend
   |
   | HTTP / JSON
   v
Node.js Backend
   |
   | Internal service interface
   v
C++ Quant Engine
   |
   v
Quantitative Models
```

The Node.js backend is responsible for application-level concerns such as:

- HTTP request handling
- Authentication and authorization
- Input validation
- Request IDs and tracing
- API versioning
- Service orchestration
- Error normalization
- Persistence
- Communication with the C++ quant engine

The C++ quant engine is responsible for:

- Numerical calculations
- Statistical models
- Quantitative analytics
- Performance-sensitive computations
- Model-specific validation where required

Controllers should remain thin and should not contain quantitative model implementations.

---

# 2. API Principles

The initial API design follows these principles.

## 2.1 REST Initially

The public API will initially use RESTful HTTP endpoints.

Example:

```text
GET  /api/v1/market-data
POST /api/v1/analytics/statistics
GET  /api/v1/research/experiments/:id
```

The architecture should remain flexible enough to introduce other interfaces later if required.

---

## 2.2 JSON Request and Response Format

JSON will be the default representation for API requests and responses.

Example request:

```json
{
    "symbol": "AAPL",
    "prices": [100, 101, 99, 102]
}
```

Example response:

```json
{
    "data": {
        "mean": 100.5
    }
}
```

Exact schemas will be defined when individual endpoints are implemented.

---

## 2.3 Explicit Validation

Requests must be validated before being passed to downstream services.

Validation should cover:

- Required fields
- Data types
- Allowed values
- Numerical constraints
- Date/time formats
- Array sizes
- Instrument identifiers
- Model-specific parameters

Invalid requests should be rejected consistently.

---

## 2.4 Consistent Error Responses

API errors should use a consistent response structure.

A preliminary format is:

```json
{
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Invalid request",
        "details": []
    },
    "requestId": "..."
}
```

The final error contract will be defined once the backend error-handling layer is implemented.

Potential error categories include:

```text
VALIDATION_ERROR
NOT_FOUND
UNAUTHORIZED
FORBIDDEN
CONFLICT
RATE_LIMITED
QUANT_ENGINE_ERROR
INTERNAL_ERROR
```

---

## 2.5 Versioned Public API

Public endpoints will be versioned.

The initial version is:

```text
/api/v1
```

Breaking changes should result in a new API version rather than silently changing the existing contract.

For example:

```text
/api/v1/analytics/statistics
/api/v2/analytics/statistics
```

---

## 2.6 Request IDs

Each API request should have a request ID for tracing.

Example:

```text
X-Request-ID: 7c1f3c8e-...
```

The request ID should be:

- Accepted from trusted upstream systems where appropriate
- Generated when absent
- Included in logs
- Propagated through internal service calls where possible
- Returned in API responses

This will make it easier to trace requests across:

```text
Frontend
    |
Node.js Backend
    |
C++ Quant Engine
```

---

## 2.7 No Quantitative Logic in Controllers

Controllers should not implement statistical or financial formulas.

For example, the controller should not calculate:

```text
mean = sum(values) / n
```

Instead:

```text
HTTP Request
     |
     v
Controller
     |
     v
Validation
     |
     v
Analytics Service
     |
     v
C++ Quant Engine
```

This keeps quantitative logic centralized, testable, and independent of HTTP concerns.

---

# 3. API Conventions

## 3.1 Base URL

The planned API base path is:

```text
/api/v1
```

A deployment-specific host will be defined later.

---

## 3.2 HTTP Methods

The API will use standard HTTP methods:

| Method   | Intended Use                              |
| -------- | ----------------------------------------- |
| `GET`    | Retrieve resources                        |
| `POST`   | Create resources or execute calculations  |
| `PUT`    | Replace resources where required          |
| `PATCH`  | Partially update resources where required |
| `DELETE` | Remove resources where supported          |

Not every resource will necessarily support every HTTP method.

---

## 3.3 Content Type

Requests containing JSON should use:

```text
Content-Type: application/json
```

Responses will normally use:

```text
Content-Type: application/json
```

---

## 3.4 Resource IDs

Resources such as experiments and backtests will use stable identifiers.

Example:

```text
GET /api/v1/research/experiments/:id
```

The exact ID format is not yet finalized.

---

# 4. Planned API Groups

The initial API will be organized around the following domains:

```text
/api/v1/market-data
/api/v1/analytics
/api/v1/risk
/api/v1/research
/api/v1/backtests
```

Additional domains may be introduced later.

---

# 5. Market Data API

## 5.1 List Market Data

```http
GET /api/v1/market-data
```

### Purpose

Retrieve market data according to specified filters.

Potential query parameters include:

```text
symbol
exchange
start
end
limit
```

Example:

```http
GET /api/v1/market-data?symbol=AAPL&start=2026-01-01&end=2026-01-31
```

The final query parameters and pagination strategy are not yet defined.

---

## 5.2 Get Market Data for a Symbol

```http
GET /api/v1/market-data/:symbol
```

### Purpose

Retrieve market data associated with a specific symbol.

Example:

```http
GET /api/v1/market-data/AAPL
```

The final response format will depend on the market-data storage and ingestion design.

---

# 6. Analytics API

Analytics endpoints expose quantitative calculations provided by the quant engine.

---

## 6.1 Statistics

```http
POST /api/v1/analytics/statistics
```

### Purpose

Calculate statistical metrics for a supplied dataset.

Potential request:

```json
{
    "values": [10, 20, 30, 40, 50],
    "metrics": ["mean", "median", "variance", "standardDeviation"]
}
```

Potential response:

```json
{
    "data": {
        "mean": 30,
        "median": 30,
        "variance": 200,
        "standardDeviation": 14.14213562
    },
    "requestId": "..."
}
```

The exact request and response schema will be finalized when the statistics service is implemented.

---

## 6.2 Returns

```http
POST /api/v1/analytics/returns
```

### Purpose

Calculate financial returns.

Potential models include:

- Simple returns
- Log returns

Potential request:

```json
{
    "prices": [100, 102, 101, 105],
    "method": "simple"
}
```

The supported return methods and validation rules are preliminary.

---

## 6.3 Volatility

```http
POST /api/v1/analytics/volatility
```

### Purpose

Calculate volatility from market-price or return data.

Potential models include:

- Historical volatility
- Realized volatility
- EWMA volatility

Potential request:

```json
{
    "returns": [0.01, -0.02, 0.015, 0.005],
    "method": "historical"
}
```

The final contract must explicitly define:

- Input frequency
- Annualization
- Window size
- Model parameters
- Missing-data handling

---

# 7. Risk API

Risk endpoints expose portfolio and market-risk calculations.

---

## 7.1 Value at Risk

```http
POST /api/v1/risk/var
```

### Purpose

Calculate Value at Risk for a specified dataset, portfolio, or strategy.

Potential request:

```json
{
    "returns": [],
    "confidence": 0.95,
    "horizon": 1,
    "method": "historical"
}
```

The final contract must define the supported VaR methodologies and required parameters.

---

## 7.2 Conditional Value at Risk

```http
POST /api/v1/risk/cvar
```

### Purpose

Calculate Conditional Value at Risk / Expected Shortfall.

Potential request:

```json
{
    "returns": [],
    "confidence": 0.95,
    "horizon": 1,
    "method": "historical"
}
```

The final implementation must define the exact estimation methodology.

---

# 8. Research API

The research API manages quantitative research experiments and their metadata.

---

## 8.1 Create Research Experiment

```http
POST /api/v1/research/experiments
```

### Purpose

Create a new research experiment.

Potential request:

```json
{
    "name": "Momentum Experiment",
    "description": "Initial momentum strategy research",
    "parameters": {}
}
```

Potential response:

```json
{
    "data": {
        "id": "...",
        "name": "Momentum Experiment",
        "status": "created"
    },
    "requestId": "..."
}
```

The final experiment model will be defined in conjunction with the data model.

---

## 8.2 Get Research Experiment

```http
GET /api/v1/research/experiments/:id
```

### Purpose

Retrieve an experiment and its associated metadata.

Potential response:

```json
{
    "data": {
        "id": "...",
        "name": "Momentum Experiment",
        "status": "completed",
        "parameters": {},
        "results": {}
    },
    "requestId": "..."
}
```

---

# 9. Backtesting API

The backtesting API will provide access to historical strategy simulations.

---

## 9.1 Create Backtest

```http
POST /api/v1/backtests
```

### Purpose

Create or execute a backtest.

Potential request:

```json
{
    "strategy": "example-strategy",
    "symbol": "AAPL",
    "start": "2025-01-01",
    "end": "2025-12-31",
    "initialCapital": 100000,
    "parameters": {}
}
```

The distinction between:

- Creating a backtest job
- Starting execution
- Waiting for completion
- Retrieving results

has not yet been finalized.

A future asynchronous job model may be required for long-running backtests.

---

## 9.2 Get Backtest

```http
GET /api/v1/backtests/:id
```

### Purpose

Retrieve a backtest and its results.

Potential response:

```json
{
    "data": {
        "id": "...",
        "status": "completed",
        "performance": {
            "return": 0,
            "sharpe": 0,
            "maxDrawdown": 0
        }
    },
    "requestId": "..."
}
```

The final result schema will be defined when the backtesting engine is implemented.

---

# 10. HTTP Status Codes

The API will use standard HTTP status codes.

| Status | Meaning                                      |
| -----: | -------------------------------------------- |
|  `200` | Successful request                           |
|  `201` | Resource created                             |
|  `202` | Request accepted for asynchronous processing |
|  `204` | Successful request with no response body     |
|  `400` | Invalid request                              |
|  `401` | Authentication required                      |
|  `403` | Access denied                                |
|  `404` | Resource not found                           |
|  `409` | Resource conflict                            |
|  `422` | Semantically invalid request                 |
|  `429` | Rate limit exceeded                          |
|  `500` | Internal server error                        |
|  `502` | Upstream service failure                     |
|  `503` | Service temporarily unavailable              |

The final status-code policy will be standardized during backend implementation.

---

# 11. Validation

Validation should occur at the API boundary before data is passed to the quant engine.

Example:

```text
HTTP Request
     |
     v
Schema Validation
     |
     +---- Invalid ----> 4xx Response
     |
     v
Service Layer
     |
     v
Quant Engine
```

Validation should prevent invalid data from reaching numerical calculations whenever possible.

Examples include:

```text
Empty price array
Invalid confidence level
Negative quantity
Invalid date range
Unsupported analytics method
Missing instrument identifier
```

---

# 12. Quant Engine Integration

The C++ quant engine should be treated as a separate computational component.

The Node.js backend should translate API-level requests into quant-engine inputs.

Conceptually:

```text
Frontend
   |
   | JSON
   v
Node.js API
   |
   | validated internal request
   v
Quant Service
   |
   | engine request
   v
C++ Quant Engine
   |
   | calculation result
   v
Quant Service
   |
   v
Node.js API
   |
   | JSON
   v
Frontend
```

The exact communication mechanism between Node.js and C++ is not yet finalized.

Possible approaches may include:

- Native bindings
- Shared library integration
- Child-process execution
- Internal service interface

The final choice should be based on performance, reliability, deployment complexity, and operational requirements.

---

# 13. Error Handling

Errors returned by internal components should be normalized by the API layer.

The frontend should not need to understand internal C++ exceptions or implementation-specific error messages.

For example:

```text
C++ Quant Engine
      |
      | numerical/input error
      v
Node.js Service
      |
      | normalized API error
      v
Frontend
```

A preliminary error response is:

```json
{
    "error": {
        "code": "QUANT_ENGINE_ERROR",
        "message": "Unable to calculate requested metric"
    },
    "requestId": "..."
}
```

Internal stack traces and implementation details must not be exposed through production API responses.

---

# 14. API Security

Security requirements will be finalized when authentication and deployment architecture are implemented.

The API is expected to eventually support:

- Authentication
- Authorization
- Input validation
- Rate limiting
- Request tracing
- Secure transport
- Access control for user-owned resources

Sensitive internal information must not be exposed through API responses.

---

# 15. Performance Considerations

Not all quantitative operations have the same execution characteristics.

Simple calculations such as:

```text
mean
median
variance
```

may complete synchronously.

Long-running operations such as:

```text
large historical analytics
Monte Carlo simulations
large backtests
```

may require asynchronous execution.

A potential future pattern is:

```text
POST /api/v1/backtests
        |
        v
202 Accepted
        |
        v
Job ID
        |
        v
GET /api/v1/backtests/:id
```

This is a design option and is not yet part of the finalized API contract.

---

# 16. Observability

The API should eventually provide sufficient information to trace requests through the system.

Important observability concepts include:

- Request IDs
- Structured logs
- API latency
- Quant-engine execution time
- Error rates
- Request volume
- Backtest execution time
- Market-data ingestion latency

A future implementation may expose operational metrics separately from the public API.

---

# 17. API Documentation

Once endpoints are implemented, each endpoint should document:

- HTTP method
- URL
- Authentication requirements
- Request headers
- Query parameters
- Path parameters
- Request body
- Validation rules
- Response body
- HTTP status codes
- Error responses
- Examples
- Performance considerations

An OpenAPI specification may eventually become the machine-readable source of truth for the public API.

---

# 18. Planned Endpoint Summary

| Domain      | Method | Endpoint                           | Status  |
| ----------- | ------ | ---------------------------------- | ------- |
| Market Data | `GET`  | `/api/v1/market-data`              | Planned |
| Market Data | `GET`  | `/api/v1/market-data/:symbol`      | Planned |
| Analytics   | `POST` | `/api/v1/analytics/statistics`     | Planned |
| Analytics   | `POST` | `/api/v1/analytics/returns`        | Planned |
| Analytics   | `POST` | `/api/v1/analytics/volatility`     | Planned |
| Risk        | `POST` | `/api/v1/risk/var`                 | Planned |
| Risk        | `POST` | `/api/v1/risk/cvar`                | Planned |
| Research    | `POST` | `/api/v1/research/experiments`     | Planned |
| Research    | `GET`  | `/api/v1/research/experiments/:id` | Planned |
| Backtesting | `POST` | `/api/v1/backtests`                | Planned |
| Backtesting | `GET`  | `/api/v1/backtests/:id`            | Planned |

---

# 19. Contract Status

The endpoints in this document are **preliminary**.

They should not be considered stable contracts until:

1. The corresponding backend service exists.
2. Request validation has been implemented.
3. The quant-engine integration has been tested.
4. Request and response schemas have been finalized.
5. Error handling has been standardized.
6. Integration tests have been added.
7. API documentation has been generated or validated.
8. Performance characteristics have been measured.

Changes to the API during this stage are expected.

---

# 20. Future API Groups

Additional API domains may be introduced as QuantPulse expands.

Potential future groups include:

```text
/api/v1/instruments
/api/v1/portfolios
/api/v1/positions
/api/v1/orders
/api/v1/strategies
/api/v1/models
/api/v1/datasets
/api/v1/jobs
```

These should only be added when there is a concrete application requirement.

---

# 21. Design Goal

The QuantPulse API should provide a clear separation between:

```text
Presentation
     |
     v
API / Application Layer
     |
     v
Quantitative Computation
     |
     v
Data / Persistence
```

The API should remain:

- Predictable
- Explicit
- Versioned
- Validated
- Observable
- Testable
- Independent of quantitative implementation details

The objective is to establish a stable boundary around the quantitative engine without prematurely locking QuantPulse into a final API or data architecture.
