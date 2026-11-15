import { describe, it, expect, beforeEach } from "vitest";
import { WatchlistService } from "../../../src/modules/watchlist/watchlist.service.js";

describe("WatchlistService", () => {
  let service: WatchlistService;

  beforeEach(() => {
    service = new WatchlistService();
  });

  it("initializes with default institutional equities in watchlist", () => {
    const list = service.getWatchlist();
    expect(list.length).toBeGreaterThanOrEqual(4);
    const symbols = list.map((i) => i.symbol);
    expect(symbols).toContain("RELIANCE");
    expect(symbols).toContain("TCS");
  });

  it("adds and removes symbols from watchlist", () => {
    const item = service.addToWatchlist({ symbol: "WIPRO", name: "Wipro Ltd" });
    expect(item.symbol).toBe("WIPRO");
    expect(service.getWatchlist().some((i) => i.symbol === "WIPRO")).toBe(true);

    const removed = service.removeFromWatchlist("WIPRO");
    expect(removed).toBe(true);
    expect(service.getWatchlist().some((i) => i.symbol === "WIPRO")).toBe(false);
  });

  it("retrieves and manages quant alerts", () => {
    const alerts = service.getAlerts();
    expect(alerts.length).toBeGreaterThanOrEqual(2);

    const newAlert = service.createAlert({
      symbol: "INFY",
      condition: "PRICE_ABOVE",
      targetValue: 1450,
      message: "Target breakout",
    });
    expect(newAlert.id).toBeDefined();
    expect(service.getAlerts().some((a) => a.id === newAlert.id)).toBe(true);

    const dismissed = service.dismissAlert(newAlert.id);
    expect(dismissed?.status).toBe("MUTED");

    const deleted = service.deleteAlert(newAlert.id);
    expect(deleted).toBe(true);
  });
});
