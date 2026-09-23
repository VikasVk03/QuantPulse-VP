# total dashboards in QuantPulse

```text
QUANTPULSE
│
├── 🏠 Market Overview
│
├── 🔎 Opportunity Scanner
│
├── 📊 Stock Intelligence
│
├── 🛡 Risk Intelligence
│
├── 🧪 Research & Backtesting
│
├── ⚡ Live Market
│
└── 📁 Data Lab
```

---

# Data pineline

```text

                    ┌─────────────────────────────┐
                    │        DATA SOURCES         │
                    │                             │
                    │ NSE / Broker API / WebSocket│
                    │ User CSV / Parquet / JSON   │
                    │ Historical datasets         │
                    └──────────────┬──────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │       DATA INGESTION        │
                    │                             │
                    │ Connector                   │
                    │ Validation                  │
                    │ Normalization               │
                    │ Deduplication               │
                    │ Timestamp normalization     │
                    │ Symbol mapping              │
                    └──────────────┬──────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │          ETL LAYER           │
                    │                             │
                    │ Raw → Clean → Feature-ready │
                    │ OHLCV                       │
                    │ Quotes                      │
                    │ Trades                      │
                    │ Order Book                  │
                    └──────────────┬──────────────┘
                                   │
                 ┌─────────────────┴─────────────────┐
                 │                                   │
                 ▼                                   ▼
       ┌───────────────────┐               ┌──────────────────┐
       │ Persistent Storage│               │ Live Data Stream │
       │                   │               │                  │
       │ MongoDB initially │               │ WebSocket        │
       │ Timescale later   │               │ Redis hot state  │
       └─────────┬─────────┘               └────────┬─────────┘
                 │                                  │
                 └────────────────┬─────────────────┘
                                  ▼
                    ┌─────────────────────────────┐
                    │       C++20 QUANT ENGINE    │
                    │                             │
                    │ Statistics                  │
                    │ Returns                     │
                    │ Volatility                  │
                    │ Indicators                  │
                    │ Features                    │
                    │ Signals                     │
                    │ Strategy                    │
                    │ Backtesting                 │
                    │ Performance                 │
                    │ Portfolio                   │
                    │ Risk                        │
                    │ Risk Intelligence           │
                    │ Order Book                   │
                    │ Order Flow                  │
                    │ Liquidity                   │
                    │ Microstructure               │
                    │ Execution                    │
                    │ Transaction Cost             │
                    │ Latency                      │
                    │ Research                     │
                    └──────────────┬──────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │     QUANT RESULT LAYER      │
                    │                             │
                    │ Metrics                     │
                    │ Signals                     │
                    │ Opportunities               │
                    │ Risk Factors                │
                    │ Explanations                │
                    │ Backtest results             │
                    │ Portfolio analytics          │
                    └──────────────┬──────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │       NODE.JS BACKEND       │
                    │                             │
                    │ API                         │
                    │ Authentication              │
                    │ Orchestration               │
                    │ Jobs                        │
                    │ Persistence                 │
                    │ WebSocket/SSE               │
                    └──────────────┬──────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │       REACT DASHBOARD       │
                    │                             │
                    │ Market Intelligence         │
                    │ Screener                   │
                    │ Stock Analysis              │
                    │ Risk Intelligence           │
                    │ Backtesting                 │
                    │ Research                    │
                    │ Microstructure              │
                    │ Portfolio                   │
                    │ Live Market                 │
                    └─────────────────────────────┘

```
