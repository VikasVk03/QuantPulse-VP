import { EventEmitter } from "node:events";

import { describe, expect, it, vi } from "vitest";

const { spawnMock } = vi.hoisted(() => ({
  spawnMock: vi.fn(),
}));

vi.mock("node:child_process", () => ({
  spawn: spawnMock,
}));

import {
  runMarketAnalysis,
  validateMarketAnalyticsResult,
  type MarketAnalyticsResult,
} from "../../../src/infrastructure/cpp-engine/QuantEngineClient.js";
import type { MarketBar } from "../../../src/infrastructure/database/repositories/MarketDataRepository.js";

const sampleBars: MarketBar[] = [
  {
    datasetId: "dataset-001",
    timestamp: new Date("2026-09-10T00:00:00.000Z"),
    symbol: "RELIANCE",
    open: 1398.2,
    high: 1400.1,
    low: 1397.8,
    close: 1399.5,
    volume: 125000,
  },
];

const validResult: MarketAnalyticsResult = {
  symbol: "RELIANCE",
  observationCount: 1,
  firstPrice: 1399.5,
  lastPrice: 1399.5,
  totalVolume: 125000,
  averageVolume: 125000,
  returnPercentage: 0,
  volatility: 0,
  series: [
    {
      timestamp: 1785748500000,
      open: 1398.2,
      high: 1400.1,
      low: 1397.8,
      close: 1399.5,
      volume: 125000,
    },
  ],
};

function createChildProcess() {
  const child = new EventEmitter() as EventEmitter & {
    stdout: EventEmitter;
    stderr: EventEmitter;
    stdin: {
      write: ReturnType<typeof vi.fn>;
      end: ReturnType<typeof vi.fn>;
    };
  };

  child.stdout = new EventEmitter();
  child.stderr = new EventEmitter();
  child.stdin = {
    write: vi.fn(),
    end: vi.fn(),
  };

  return child;
}

describe("validateMarketAnalyticsResult", () => {
  it("accepts a valid MarketBar analytics response", () => {
    expect(validateMarketAnalyticsResult(validResult)).toEqual(validResult);
  });

  it("rejects non-object responses", () => {
    expect(() => validateMarketAnalyticsResult(null)).toThrow(
      "C++ engine returned an invalid market analysis.",
    );
    expect(() => validateMarketAnalyticsResult("invalid")).toThrow(
      "C++ engine returned an invalid market analysis.",
    );
  });

  it("rejects a missing series", () => {
    const result = { ...validResult, series: undefined };
    expect(() => validateMarketAnalyticsResult(result)).toThrow(
      "C++ engine returned an invalid market analysis.",
    );
  });

  it("rejects an invalid numeric metric", () => {
    const result = { ...validResult, volatility: "0" };
    expect(() => validateMarketAnalyticsResult(result)).toThrow(
      "C++ engine returned an invalid market analysis.",
    );
  });

  it("rejects an invalid series point", () => {
    const result = {
      ...validResult,
      series: [{ ...validResult.series[0], close: Number.NaN }],
    };
    expect(() => validateMarketAnalyticsResult(result)).toThrow(
      "C++ engine returned an invalid market series point.",
    );
  });
});

describe("runMarketAnalysis", () => {
  it("accepts valid C++ response", async () => {
    const child = createChildProcess();
    spawnMock.mockReturnValueOnce(child);

    const resultPromise = runMarketAnalysis("RELIANCE", sampleBars);

    expect(child.stdin.write).toHaveBeenCalledWith(
      JSON.stringify({
        symbol: "RELIANCE",
        bars: [
          {
            timestamp: sampleBars[0]!.timestamp.getTime(),
            open: 1398.2,
            high: 1400.1,
            low: 1397.8,
            close: 1399.5,
            volume: 125000,
          },
        ],
      }),
    );
    expect(child.stdin.end).toHaveBeenCalled();

    child.stdout.emit("data", Buffer.from(JSON.stringify(validResult)));
    child.emit("close", 0);

    await expect(resultPromise).resolves.toEqual(validResult);
    expect(spawnMock).toHaveBeenCalledWith(
      expect.stringContaining("quantpulse_cli"),
      ["analyze-json"],
    );
  });

  it("rejects invalid JSON", async () => {
    const child = createChildProcess();
    spawnMock.mockReturnValueOnce(child);

    const resultPromise = runMarketAnalysis("RELIANCE", sampleBars);
    child.stdout.emit("data", Buffer.from("not-json"));
    child.emit("close", 0);

    await expect(resultPromise).rejects.toThrow(
      "Failed to parse C++ engine response",
    );
  });

  it("rejects C++ process failure with stderr message", async () => {
    const child = createChildProcess();
    spawnMock.mockReturnValueOnce(child);

    const resultPromise = runMarketAnalysis("RELIANCE", sampleBars);
    child.stderr.emit("data", Buffer.from("QuantPulse error: engine failed"));
    child.emit("close", 1);

    await expect(resultPromise).rejects.toThrow(
      "QuantPulse error: engine failed",
    );
  });

  it("rejects C++ process failure when stderr is empty", async () => {
    const child = createChildProcess();
    spawnMock.mockReturnValueOnce(child);

    const resultPromise = runMarketAnalysis("RELIANCE", sampleBars);
    child.emit("close", 2);

    await expect(resultPromise).rejects.toThrow(
      "C++ engine exited with code 2",
    );
  });

  it("rejects when spawn emits an error event", async () => {
    const child = createChildProcess();
    spawnMock.mockReturnValueOnce(child);

    const resultPromise = runMarketAnalysis("RELIANCE", sampleBars);
    child.emit("error", new Error("Spawn error: ENOENT"));

    await expect(resultPromise).rejects.toThrow("Spawn error: ENOENT");
  });

  it("rejects invalid analytics response from C++ process", async () => {
    const child = createChildProcess();
    spawnMock.mockReturnValueOnce(child);

    const invalidAnalytics = { ...validResult, symbol: 123 };
    const resultPromise = runMarketAnalysis("RELIANCE", sampleBars);
    child.stdout.emit("data", Buffer.from(JSON.stringify(invalidAnalytics)));
    child.emit("close", 0);

    await expect(resultPromise).rejects.toThrow(
      "C++ engine returned an invalid market analysis.",
    );
  });

  it("rejects invalid series point from C++ process", async () => {
    const child = createChildProcess();
    spawnMock.mockReturnValueOnce(child);

    const invalidSeries = {
      ...validResult,
      series: [{ ...validResult.series[0], open: "invalid" }],
    };
    const resultPromise = runMarketAnalysis("RELIANCE", sampleBars);
    child.stdout.emit("data", Buffer.from(JSON.stringify(invalidSeries)));
    child.emit("close", 0);

    await expect(resultPromise).rejects.toThrow(
      "C++ engine returned an invalid market series point.",
    );
  });

  it("rejects empty symbol", async () => {
    await expect(runMarketAnalysis("", sampleBars)).rejects.toThrow(
      "Market analysis symbol cannot be empty.",
    );
    await expect(runMarketAnalysis("   ", sampleBars)).rejects.toThrow(
      "Market analysis symbol cannot be empty.",
    );
  });

  it("rejects empty bars", async () => {
    await expect(runMarketAnalysis("RELIANCE", [])).rejects.toThrow(
      "Cannot analyze empty market data.",
    );
  });
});
