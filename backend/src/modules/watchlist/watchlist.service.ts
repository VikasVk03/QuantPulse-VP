import type { WatchlistItem, QuantAlert } from "./watchlist.types.js";

export class WatchlistService {
  private watchlist: Map<string, WatchlistItem> = new Map();
  private alerts: Map<string, QuantAlert> = new Map();

  constructor() {
    this.seedDefaultWatchlist();
    this.seedDefaultAlerts();
  }

  private seedDefaultWatchlist(): void {
    const defaults: WatchlistItem[] = [
      {
        symbol: "RELIANCE",
        name: "Reliance Industries Ltd",
        lastPrice: 1401.36,
        change: 12.45,
        changePct: 0.90,
        vwap: 1395.2,
        volume: 2450000,
        signal: "BUY",
        setup: "Volatility Squeeze Breakout",
        addedAt: new Date().toISOString(),
      },
      {
        symbol: "TCS",
        name: "Tata Consultancy Services",
        lastPrice: 1399.52,
        change: -0.42,
        changePct: -0.03,
        vwap: 1399.1,
        volume: 1820000,
        signal: "BUY",
        setup: "Statistical Z-Score Reversion",
        addedAt: new Date().toISOString(),
      },
      {
        symbol: "INFY",
        name: "Infosys Limited",
        lastPrice: 1399.75,
        change: 4.8,
        changePct: 0.34,
        vwap: 1396.4,
        volume: 3100000,
        signal: "BUY",
        setup: "Momentum Microstructure Flow",
        addedAt: new Date().toISOString(),
      },
      {
        symbol: "HDFCBANK",
        name: "HDFC Bank Limited",
        lastPrice: 1400.04,
        change: -3.2,
        changePct: -0.23,
        vwap: 1402.1,
        volume: 4200000,
        signal: "HOLD",
        setup: "Order Flow Imbalance Accumulation",
        addedAt: new Date().toISOString(),
      },
      {
        symbol: "ICICIBANK",
        name: "ICICI Bank Ltd",
        lastPrice: 1248.50,
        change: 8.60,
        changePct: 0.69,
        vwap: 1242.1,
        volume: 3600000,
        signal: "BUY",
        setup: "EMA 20 Pullback Reclaim",
        addedAt: new Date().toISOString(),
      },
    ];

    for (const item of defaults) {
      this.watchlist.set(item.symbol.toUpperCase(), item);
    }
  }

  private seedDefaultAlerts(): void {
    const alerts: QuantAlert[] = [
      {
        id: "ALT-1",
        symbol: "RELIANCE",
        condition: "SQUEEZE_BREAKOUT",
        targetValue: 1400.0,
        currentValue: 1401.36,
        status: "TRIGGERED",
        triggeredAt: new Date(Date.now() - 15 * 60000).toISOString(),
        message: "RELIANCE broke out of 20-period Volatility Squeeze above ₹1,400 with +0.64 OFI delta confirmation.",
        severity: "CRITICAL",
      },
      {
        id: "ALT-2",
        symbol: "TCS",
        condition: "VWAP_CROSS",
        targetValue: 1399.0,
        currentValue: 1399.52,
        status: "TRIGGERED",
        triggeredAt: new Date(Date.now() - 42 * 60000).toISOString(),
        message: "TCS reclaimed intraday VWAP at ₹1,399.10 with high buying participation.",
        severity: "WARNING",
      },
      {
        id: "ALT-3",
        symbol: "HDFCBANK",
        condition: "PRICE_ABOVE",
        targetValue: 1420.0,
        currentValue: 1400.04,
        status: "ACTIVE",
        message: "Alert when HDFCBANK crosses above resistance at ₹1,420.00.",
        severity: "INFO",
      },
    ];

    for (const a of alerts) {
      this.alerts.set(a.id, a);
    }
  }

  public getWatchlist(): WatchlistItem[] {
    return Array.from(this.watchlist.values());
  }

  public addToWatchlist(item: { symbol: string; name?: string; note?: string }): WatchlistItem {
    const sym = item.symbol.trim().toUpperCase();
    if (this.watchlist.has(sym)) {
      return this.watchlist.get(sym)!;
    }

    const newItem: WatchlistItem = {
      symbol: sym,
      name: item.name || `${sym} Equity`,
      lastPrice: 1000 + Math.floor(Math.random() * 500),
      change: Number(((Math.random() - 0.45) * 15).toFixed(2)),
      changePct: Number(((Math.random() - 0.45) * 2).toFixed(2)),
      vwap: 1000,
      volume: 1500000 + Math.floor(Math.random() * 2000000),
      signal: Math.random() > 0.4 ? "BUY" : "HOLD",
      setup: "Quant Microstructure Watch",
      addedAt: new Date().toISOString(),
    };
    newItem.vwap = Number((newItem.lastPrice * 0.996).toFixed(2));

    this.watchlist.set(sym, newItem);
    return newItem;
  }

  public removeFromWatchlist(symbol: string): boolean {
    return this.watchlist.delete(symbol.trim().toUpperCase());
  }

  public getAlerts(): QuantAlert[] {
    return Array.from(this.alerts.values());
  }

  public createAlert(alertData: Partial<QuantAlert>): QuantAlert {
    const id = `ALT-${Date.now().toString(36).toUpperCase()}`;
    const alert: QuantAlert = {
      id,
      symbol: (alertData.symbol || "RELIANCE").toUpperCase(),
      condition: alertData.condition || "PRICE_ABOVE",
      targetValue: alertData.targetValue || 1500,
      currentValue: alertData.currentValue || 1400,
      status: "ACTIVE",
      message: alertData.message || `Price alert for ${alertData.symbol} at ₹${alertData.targetValue}`,
      severity: alertData.severity || "INFO",
    };
    this.alerts.set(id, alert);
    return alert;
  }

  public deleteAlert(id: string): boolean {
    return this.alerts.delete(id);
  }

  public dismissAlert(id: string): QuantAlert | null {
    const alert = this.alerts.get(id);
    if (!alert) return null;
    alert.status = "MUTED";
    this.alerts.set(id, alert);
    return alert;
  }
}
