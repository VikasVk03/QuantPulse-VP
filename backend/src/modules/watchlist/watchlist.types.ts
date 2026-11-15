export interface WatchlistItem {
  symbol: string;
  name: string;
  lastPrice: number;
  change: number;
  changePct: number;
  vwap: number;
  volume: number;
  signal: "BUY" | "SELL" | "HOLD";
  setup: string;
  addedAt: string;
}

export interface QuantAlert {
  id: string;
  symbol: string;
  condition: "PRICE_ABOVE" | "PRICE_BELOW" | "VWAP_CROSS" | "SQUEEZE_BREAKOUT" | "VOL_SPIKE";
  targetValue: number;
  currentValue: number;
  status: "ACTIVE" | "TRIGGERED" | "MUTED";
  triggeredAt?: string;
  message: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
}
