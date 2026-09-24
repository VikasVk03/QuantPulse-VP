import type {
  IMarketDataProvider,
  OrderBookLevel,
  OrderBookSnapshot,
  ProviderConfig,
  ProviderStatus,
  ProviderType,
  QuoteTick,
  TradeTick,
} from "./provider.types.js";

export class SimulatedMarketDataProvider implements IMarketDataProvider {
  public readonly type: ProviderType = "simulated";
  public readonly name = "Built-in High-Frequency Simulator";

  private isConnected = false;
  private messageCount = 0;
  private lastTickTimestamp = Date.now();
  private basePrices: Record<string, number> = {
    RELIANCE: 1240.5,
    TCS: 3845.2,
    INFY: 1782.4,
    HDFCBANK: 1642.8,
    ICICIBANK: 1215.3,
    TATAMOTORS: 948.6,
    NIFTY50: 23446.8,
    SENSEX: 77210.0,
    BANKNIFTY: 49850.0,
    INDIAVIX: 13.4,
  };

  public async connect(_config?: ProviderConfig): Promise<boolean> {
    this.isConnected = true;
    this.lastTickTimestamp = Date.now();
    return true;
  }

  public async disconnect(): Promise<void> {
    this.isConnected = false;
  }

  public getStatus(): ProviderStatus {
    return {
      providerType: this.type,
      name: this.name,
      isConnected: this.isConnected,
      latencyMs: 1.2,
      activeSymbols: Object.keys(this.basePrices),
      lastTickTimestamp: this.lastTickTimestamp,
      messageCount: this.messageCount,
      hasCustomKey: false,
    };
  }

  public async testConnection(
    _config: ProviderConfig,
  ): Promise<{ success: boolean; message: string; latencyMs: number }> {
    return {
      success: true,
      message:
        "Built-in Simulator engine operating nominally at sub-2ms latency.",
      latencyMs: 1.2,
    };
  }

  public async getQuotes(symbols: string[]): Promise<QuoteTick[]> {
    this.lastTickTimestamp = Date.now();
    this.messageCount++;

    return symbols.map((sym) => {
      const canonical = sym.toUpperCase();
      const base = this.basePrices[canonical] || 1000.0;
      // Add subtle deterministic random walk variation
      const jitter = (Math.random() - 0.49) * (base * 0.001);
      const currentPrice = Number((base + jitter).toFixed(2));
      const change = Number((currentPrice - base).toFixed(2));
      const changePercent = Number(((change / base) * 100).toFixed(2));

      return {
        symbol: canonical,
        price: currentPrice,
        change,
        changePercent,
        high24h: Number((base * 1.018).toFixed(2)),
        low24h: Number((base * 0.985).toFixed(2)),
        volume: Math.floor(1500000 + Math.random() * 500000),
        timestamp: this.lastTickTimestamp,
      };
    });
  }

  public async getOrderBook(symbol: string): Promise<OrderBookSnapshot> {
    this.lastTickTimestamp = Date.now();
    this.messageCount++;

    const canonical = symbol.toUpperCase();
    const base = this.basePrices[canonical] || 1399.5;
    const spread = Number((base * 0.0004).toFixed(2));
    const bestBid = Number((base - spread / 2).toFixed(2));
    const bestAsk = Number((base + spread / 2).toFixed(2));

    const bids: OrderBookLevel[] = [];
    const asks: OrderBookLevel[] = [];
    let runningBidTotal = 0;
    let runningAskTotal = 0;

    for (let i = 0; i < 10; i++) {
      const bidPrice = Number((bestBid - i * (base * 0.0003)).toFixed(2));
      const bidQty = Math.floor(250 + Math.random() * 800 + (10 - i) * 120);
      runningBidTotal += bidQty;
      bids.push({
        price: bidPrice,
        quantity: bidQty,
        total: runningBidTotal,
        orderCount: Math.floor(3 + Math.random() * 8),
      });

      const askPrice = Number((bestAsk + i * (base * 0.0003)).toFixed(2));
      const askQty = Math.floor(220 + Math.random() * 780 + (10 - i) * 110);
      runningAskTotal += askQty;
      asks.push({
        price: askPrice,
        quantity: askQty,
        total: runningAskTotal,
        orderCount: Math.floor(3 + Math.random() * 8),
      });
    }

    const totalBidQty = bids[0]?.quantity ?? 1;
    const totalAskQty = asks[0]?.quantity ?? 1;
    const midPrice = Number(((bestBid + bestAsk) / 2).toFixed(2));
    const microprice = Number(
      (
        (bestBid * totalAskQty + bestAsk * totalBidQty) /
        (totalBidQty + totalAskQty)
      ).toFixed(2),
    );
    const depthImbalance = Number(
      (
        (runningBidTotal - runningAskTotal) /
        (runningBidTotal + runningAskTotal)
      ).toFixed(4),
    );
    const spreadBps = Number(((spread / midPrice) * 10000).toFixed(2));

    return {
      symbol: canonical,
      bids,
      asks,
      spread,
      spreadBps,
      midPrice,
      microprice,
      depthImbalance,
      timestamp: this.lastTickTimestamp,
    };
  }

  public async getRecentTrades(
    symbol: string,
    limit = 20,
  ): Promise<TradeTick[]> {
    this.lastTickTimestamp = Date.now();
    const canonical = symbol.toUpperCase();
    const base = this.basePrices[canonical] || 1399.5;
    const trades: TradeTick[] = [];

    for (let i = 0; i < limit; i++) {
      const isBuy = Math.random() > 0.48;
      const priceOffset = (Math.random() - 0.48) * (base * 0.001);
      trades.push({
        id: `TRD-${Date.now()}-${i}`,
        symbol: canonical,
        price: Number((base + priceOffset).toFixed(2)),
        quantity: Math.floor(10 + Math.random() * 250),
        side: isBuy ? "BUY" : "SELL",
        timestamp: Date.now() - i * 450,
      });
    }

    return trades;
  }
}
