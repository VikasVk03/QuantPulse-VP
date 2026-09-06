# QuantPulse Market Data Schemas

## Market Bar v1

Used for historical OHLCV market data.

Fields:

- timestamp
- symbol
- open
- high
- low
- close
- volume

This schema is suitable for:

- returns
- volatility
- technical indicators
- bar-based strategies
- historical backtesting

It must not be interpreted as Level-2 order-book data.

## Market Quote v1

Used for quote/order-book research.

Fields:

- timestamp
- symbol
- bid_price
- bid_quantity
- ask_price
- ask_quantity
- last_price
- last_quantity

This schema is suitable for:

- spread
- microprice
- order imbalance
- order-flow imbalance
- liquidity
- execution simulation

Quote/order-book metrics must only be calculated when the source actually provides the required bid/ask information.
