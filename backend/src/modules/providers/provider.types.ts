export type ProviderType =
  | "simulated"
  | "alphavantage"
  | "polygon"
  | "binance"
  | "zerodha"
  | "upstox"
  | "custom_webhook";

export interface ProviderConfig {
  providerType: ProviderType;
  name: string;
  enabled: boolean;
  apiKey?: string | undefined;
  apiSecret?: string | undefined;
  accessToken?: string | undefined;
  customEndpoint?: string | undefined;
  updateIntervalMs?: number | undefined;
  environment?: "sandbox" | "live" | undefined;
  metadata?: Record<string, string> | undefined;
}

export interface QuoteTick {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  volume: number;
  timestamp: number;
}

export interface OrderBookLevel {
  price: number;
  quantity: number;
  total: number;
  orderCount?: number | undefined;
}

export interface OrderBookSnapshot {
  symbol: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  spread: number;
  spreadBps: number;
  microprice: number;
  midPrice: number;
  depthImbalance: number;
  timestamp: number;
}

export interface TradeTick {
  id: string;
  symbol: string;
  price: number;
  quantity: number;
  side: "BUY" | "SELL";
  timestamp: number;
}

export interface ProviderStatus {
  providerType: ProviderType;
  name: string;
  isConnected: boolean;
  latencyMs: number;
  activeSymbols: string[];
  lastTickTimestamp: number;
  messageCount: number;
  hasCustomKey: boolean;
  error?: string | undefined;
}

export interface IMarketDataProvider {
  readonly type: ProviderType;
  readonly name: string;
  connect(config?: ProviderConfig): Promise<boolean>;
  disconnect(): Promise<void>;
  getStatus(): ProviderStatus;
  getQuotes(symbols: string[]): Promise<QuoteTick[]>;
  getOrderBook(symbol: string): Promise<OrderBookSnapshot>;
  getRecentTrades(symbol: string, limit?: number): Promise<TradeTick[]>;
  testConnection(
    config: ProviderConfig,
  ): Promise<{ success: boolean; message: string; latencyMs: number }>;
}
