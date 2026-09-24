import { describe, expect, it } from "vitest";
import { BacktestingService } from "../../../src/modules/backtesting/backtesting.service.js";

describe("BacktestingService", () => {
  const service = new BacktestingService();

  it("lists available quantitative strategies", () => {
    const strats = service.getStrategies();
    expect(strats.length).toBeGreaterThanOrEqual(3);
    expect(strats.map((s) => s.name)).toContain("Volatility Squeeze Breakout");
  });

  it("runs backtest simulation generating equity curve and trade logs", () => {
    const result = service.runBacktest({
      strategyName: "Volatility Squeeze Breakout",
      symbol: "RELIANCE",
      initialCapital: 1000000,
      positionSizing: "KELLY",
      riskPerTradePct: 2,
    });

    expect(result.initialCapital).toBe(1000000);
    expect(result.equityCurve.length).toBeGreaterThan(100);
    expect(result.trades.length).toBeGreaterThan(0);
    expect(result.sharpeRatio).toBeGreaterThan(0);
    expect(result.winRatePct).toBeGreaterThan(0);
  });
});
