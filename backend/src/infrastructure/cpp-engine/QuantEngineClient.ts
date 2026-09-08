import { spawn } from "node:child_process";

import { config } from "../../config/env.js";

export interface MarketSeriesPoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketAnalyticsResult {
  symbol: string;
  observationCount: number;
  firstPrice: number;
  lastPrice: number;
  totalVolume: number;
  averageVolume: number;
  returnPercentage: number;
  volatility: number;
  series: MarketSeriesPoint[];
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function validateMarketAnalyticsResult(
  value: unknown,
): MarketAnalyticsResult {
  if (!isRecord(value)) {
    throw new Error("C++ engine returned an invalid market analysis.");
  }

  if (
    typeof value.symbol !== "string" ||
    !isFiniteNumber(value.observationCount) ||
    !isFiniteNumber(value.firstPrice) ||
    !isFiniteNumber(value.lastPrice) ||
    !isFiniteNumber(value.totalVolume) ||
    !isFiniteNumber(value.averageVolume) ||
    !isFiniteNumber(value.returnPercentage) ||
    !isFiniteNumber(value.volatility) ||
    !Array.isArray(value.series)
  ) {
    throw new Error("C++ engine returned an invalid market analysis.");
  }

  const series = value.series.map((point) => {
    if (
      !isRecord(point) ||
      !isFiniteNumber(point.timestamp) ||
      !isFiniteNumber(point.open) ||
      !isFiniteNumber(point.high) ||
      !isFiniteNumber(point.low) ||
      !isFiniteNumber(point.close) ||
      !isFiniteNumber(point.volume)
    ) {
      throw new Error("C++ engine returned an invalid market series point.");
    }

    return {
      timestamp: point.timestamp,
      open: point.open,
      high: point.high,
      low: point.low,
      close: point.close,
      volume: point.volume,
    };
  });

  return {
    symbol: value.symbol,
    observationCount: value.observationCount,
    firstPrice: value.firstPrice,
    lastPrice: value.lastPrice,
    totalVolume: value.totalVolume,
    averageVolume: value.averageVolume,
    returnPercentage: value.returnPercentage,
    volatility: value.volatility,
    series,
  };
}

export function runMarketAnalysis(
  filePath: string,
): Promise<MarketAnalyticsResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(config.cppEnginePath, ["analyze", filePath]);

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `C++ engine exited with code ${code}`));
        return;
      }

      try {
        resolve(validateMarketAnalyticsResult(JSON.parse(stdout.trim()) as unknown));
      } catch (error) {
        reject(
          new Error(
            `Failed to parse C++ engine response: ${error instanceof Error ? error.message : String(error)
            }`,
          ),
        );
      }
    });
  });
}
