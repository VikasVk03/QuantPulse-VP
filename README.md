# QuantPulse-VP

Market Microstructure and Risk Intelligence Platform

QuantPulse is a quantitative analytics and market-microstructure
research platform built around a C++ quantitative engine and a
modern web application.

---

## Architecture

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
