# QuantPulse Institutional Dashboards & Data Pipeline

This document outlines the 7 core dashboard suites, the data pipeline flow, and how each component connects to the native C++20 quantitative engine.

```text
QUANTPULSE
│
├── 🏠 Market Overview
│   └── Global financial clocks, real-time index tickers, AI signals, sector heatmap, C++ engine telemetry
│
├── 🔎 Opportunity Scanner
│   └── Alpha extraction in congested/choppy markets: Volatility Squeezes, Mean Reversion Z-Scores, Order Flow Imbalance
│
├── 📊 Stock Intelligence
│   └── Microstructure metrics, Amihud Illiquidity, Kyle's Lambda, Roll Spread, Kelly Sizing, TradingView chart
│
├── 🛡 Risk Intelligence
│   └── 3D Risk Heatmap Matrix, Cross-Asset Correlation Matrix, VaR/ES distribution, Automated De-Risking Sequences
│
├── 🧪 Research & Backtesting
│   └── Multi-strategy quantitative backtesting, equity curve vs NIFTY 50, drawdown curves, fill execution log
│
├── ⚡ Live Market
│   └── Level-2 Order Book ladder, depth imbalance ratio, volume-weighted microprice, live trade tick stream
│
└── 📁 Data Lab
    └── 8-Stage ETL pipeline, multi-format ingestion (CSV/TSV/JSON), paginated full data table, terminal bridge
```

---

# 1. Complete Data Pipeline & Flow Architecture

```text
                    ┌─────────────────────────────┐
                    │        DATA SOURCES         │
                    │                             │
                    │ NSE / Broker API / WebSocket│
                    │ User CSV / TSV / JSON       │
                    │ Historical datasets         │
                    └──────────────┬──────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │       DATA INGESTION        │
                    │                             │
                    │ 1. Ingestion & Format Sniff │
                    │ 2. Schema & Delimiter Detect│
                    │ 3. Strict OHLC Validation   │
                    │ 4. IEEE Float Normalization │
                    │ 5. Timestamp Normalization  │
                    │ 6. Symbol Canonicalization  │
                    │ 7. Key Deduplication & Sort │
                    │ 8. Persistent Ingestion     │
                    └──────────────┬──────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │          ETL LAYER           │
                    │                             │
                    │ Raw → Clean → Feature-ready │
                    │ OHLCV Market Bars           │
                    │ Quotes & Order Book Depth   │
                    │ Trades & Microstructure     │
                    └──────────────┬──────────────┘
                                   │
                 ┌─────────────────┴─────────────────┐
                 │                                   │
                 ▼                                   ▼
       ┌───────────────────┐               ┌──────────────────┐
       │ Persistent Storage│               │ Live Data Stream │
       │                   │               │                  │
       │ MongoDB datasets  │               │ WebSocket Feed   │
       │ & market_data     │               │ Memory In-Flight │
       └─────────┬─────────┘               └────────┬─────────┘
                 │                                  │
                 └────────────────┬─────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────────┐
                    │     NATIVE C++20 ENGINE     │
                    │  (quantpulse_cli analyze-json)
                    │                             │
                    │ StatisticsEngine            │
                    │ ReturnsEngine               │
                    │ VolatilityEngine            │
                    │ RiskEngine (VaR 95/99, ES)  │
                    │ RiskIntelligenceEngine      │
                    │ MarketMicrostructureEngine  │
                    │ OrderBookEngine             │
                    │ MatchingEngine              │
                    │ StrategyEngine              │
                    │ BacktestEngine              │
                    │ PerformanceEngine           │
                    │ PositionSizingEngine        │
                    │ TransactionCostEngine       │
                    │ LatencyEngine               │
                    └──────────────┬──────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │     QUANT RESULT LAYER      │
                    │                             │
                    │ Metrics & Moments           │
                    │ Squeeze & Reversion Signals │
                    │ Market Microstructure       │
                    │ Risk Factors & Heatmaps     │
                    │ Backtest Equity & Fills     │
                    └──────────────┬──────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │       NODE.JS BACKEND       │
                    │                             │
                    │ Express / TypeScript APIs   │
                    │ QuantEngineClient (IPC)     │
                    │ MongoDB Repositories        │
                    │ Pipeline Orchestration      │
                    └──────────────┬──────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │   REACT INSTITUTIONAL UI    │
                    │                             │
                    │ 1. 🏠 Market Overview       │
                    │ 2. 🔎 Opportunity Scanner   │
                    │ 3. 📊 Stock Intelligence    │
                    │ 4. 🛡 Risk Intelligence     │
                    │ 5. 🧪 Research & Backtest   │
                    │ 6. ⚡ Live Market Depth     │
                    │ 7. 📁 Data Lab ETL Viewer   │
                    └─────────────────────────────┘
```

---

# 2. Detailed Dashboard Functionality

### 🏠 Market Overview
- **Global Clocks**: Real-time clocks for NY, London, Tokyo, Mumbai.
- **Index Tickers**: Live status for NIFTY 50, SENSEX, BANKNIFTY, INDIA VIX.
- **TradingView Canvas Chart**: Interactive candlestick chart with volume overlay.
- **AI Signal Stream**: Quantitative breakout and momentum alerts with suggested stops/targets.
- **C++ Engine Health**: Real-time monitoring of all 30+ C++ engine microservices.

### 🔎 Opportunity Scanner (Congested / Choppy Market Alpha)
- **Volatility Squeezes**: Bollinger Bands compressing inside Keltner Channels to capture sudden volatility expansions.
- **Extreme Mean Reversion**: Quantitative Z-score deviations ($|Z| \ge 2.2\sigma$) paired with RSI overbought/oversold levels.
- **Order Flow Imbalance (OFI)**: Institutional accumulation and delta divergences in consolidation zones.
- **Statistical Arbitrage**: Cointegration spread monitoring on equity pairs.

### 📊 Stock Intelligence
- **Microstructure Telemetry**: Kyle's Lambda (price impact), Amihud Illiquidity ratio, Roll effective spread, Microprice.
- **Statistical Moments**: Return distribution skewness, kurtosis, annualized volatility ($\sigma_{ann} = \sigma_{daily}\sqrt{252}$).
- **Kelly Position Sizing**: Optimal capital allocation based on win probability and reward-to-risk ratio.

### 🛡 Risk Intelligence (Inspired by `assests/Portfolio.png`)
- **3D Risk Heatmap Matrix**: Interactive multi-factor risk grid mapping asset allocations against volatility and liquidity.
- **Correlation Matrix**: Real-time cross-asset correlation coefficients.
- **VaR / Expected Shortfall**: Historical and parametric Value at Risk (95% & 99%) and tail risk (CVaR).
- **Automated De-Risking Protocol**: 4-stage systematic risk controls (Warning $\to$ Hedge $\to$ De-Leverage $\to$ Liquidation).

### 🧪 Research & Backtesting
- **Simulation Suite**: Historical backtesting with slippage, transaction costs, and latency simulation.
- **Comparative Equity**: Portfolio growth curve vs NIFTY 50 benchmark.
- **Risk Profiles**: Maximum Drawdown underwater curves, Sharpe ratio, Sortino ratio, Profit Factor.
- **Fill Execution Stream**: Granular trade execution log with fill prices and realized P&L.

### ⚡ Live Market
- **Level-2 Depth Ladder**: Real-time bid and ask order ladder.
- **Depth Imbalance Gauge**: Instantaneous bid-ask liquidity ratio.
- **Microprice Calculations**: Volume-weighted fair price calculations vs top-of-book mid price.
- **Trade Execution Feed**: Low-latency trade tick stream with aggressive side identification.

### 📁 Data Lab
- **8-Stage ETL Pipeline**: Ingestion $\to$ Schema $\to$ Validation $\to$ Normalization $\to$ Timestamp Norm $\to$ Symbol Norm $\to$ Deduplication $\to$ Persistence.
- **Universal Ingestion**: Automatic parsing of CSV, TSV, Semicolon CSV, Pipe-delimited, and JSON files with vendor-agnostic header mapping.
- **Multi-Page Data Viewer**: Custom pagination (`10`, `25`, `50`, `100`, `250`, `All`), multi-column sorting, and instant search.
- **Terminal Bridge**: Direct transition to the C++ quantitative engine analytics dashboard.

---

For technical API specifications and developer commands, refer to [`QUANT_PULSE_SYSTEM_GUIDE.md`](QUANT_PULSE_SYSTEM_GUIDE.md) and [`dataPipelineGuide.md`](dataPipelineGuide.md).
