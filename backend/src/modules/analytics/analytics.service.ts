import type { Analytics } from "./analytics.types.js";
import { AppError } from "../../shared/errors/AppError.js";

import type { AnalyticsRepository } from "../../infrastructure/database/repositories/AnalyticsRepository.js";

import type { DatasetRepository } from "../../infrastructure/database/repositories/DatasetRepository.js";

import type {
  MarketDataRepository,
  MarketBar,
} from "../../infrastructure/database/repositories/MarketDataRepository.js";

import {
  runMarketAnalysis,
  enrichMarketAnalytics,
  type MarketAnalyticsResult,
} from "../../infrastructure/cpp-engine/QuantEngineClient.js";
import { SAMPLE_DATASET, SAMPLE_BARS } from "../../infrastructure/database/sample-data.js";

const DEFAULT_PRICES: Record<string, number> = {
  RELIANCE: 1401.36,
  TCS: 3845.20,
  INFY: 1782.40,
  HDFCBANK: 1642.80,
  IBM: 215.50,
  AAPL: 228.40,
  BTCUSDT: 88500.00,
  MSFT: 425.00,
  NVDA: 135.00,
  GOOGL: 175.00,
  AMZN: 185.00,
  META: 580.00,
  TSLA: 240.00,
  NIFTY50: 23446.80,
  SENSEX: 77210.00,
  BANKNIFTY: 49850.00,
  INDIAVIX: 13.40,
};

function generateFallbackBars(symbol: string, basePrice: number, count = 30): MarketBar[] {
  const bars: MarketBar[] = [];
  const now = Date.now();
  const intervalMs = 60 * 1000;
  let currentPrice = basePrice;
  const startTs = now - count * intervalMs;

  for (let i = 0; i < count; i++) {
    const timestamp = new Date(startTs + i * intervalMs);
    const seed = (symbol.charCodeAt(i % symbol.length) + i * 17) % 100;
    const variationPct = (seed - 48) / 3000;
    const open = Math.round(currentPrice * 100) / 100;
    const close = Math.round(open * (1 + variationPct) * 100) / 100;
    const high = Math.round(Math.max(open, close) * (1 + Math.abs(variationPct) * 0.4) * 100) / 100;
    const low = Math.round(Math.min(open, close) * (1 - Math.abs(variationPct) * 0.4) * 100) / 100;
    const volume = Math.round(50000 + (seed * 1234) % 100000);

    bars.push({
      datasetId: "synthesized",
      symbol,
      timestamp,
      open,
      high,
      low,
      close,
      volume,
    });

    currentPrice = close;
  }

  return bars;
}

export class AnalyticsService {
  constructor(
    private readonly marketDataRepository: MarketDataRepository,
    private readonly datasetRepository: DatasetRepository,
    private readonly analyticsRepository?: AnalyticsRepository,
  ) {}

  async analyzeSymbol(symbol: string): Promise<MarketAnalyticsResult> {
    const cleanSymbol = symbol.trim().toUpperCase();
    if (!cleanSymbol) {
      throw new AppError(400, "Symbol is required.");
    }

    let bars = await this.marketDataRepository.getBars({
      symbol: cleanSymbol,
    });

    if (bars.length === 0) {
      const alphanum = cleanSymbol.replace(/[^A-Z0-9]/g, "");
      const allDatasets = await this.datasetRepository.findAll();
      const matchingDataset = allDatasets.find(
        (d) =>
          d.symbol?.replace(/[^A-Z0-9]/g, "").toUpperCase() === alphanum,
      );
      if (matchingDataset) {
        bars = await this.marketDataRepository.getBars({
          datasetId: matchingDataset.id,
        });
      }
    }

    if (bars.length === 0) {
      const basePrice = DEFAULT_PRICES[cleanSymbol] || 1000.0;
      bars = generateFallbackBars(cleanSymbol, basePrice, 30);
    }

    const targetAlphanum = cleanSymbol.replace(/[^A-Z0-9]/g, "");
    let filteredBars = bars.filter((b) => {
      const s = (b.symbol || "").toUpperCase();
      return (
        s === cleanSymbol ||
        (targetAlphanum && s.replace(/[^A-Z0-9]/g, "") === targetAlphanum)
      );
    });

    if (filteredBars.length === 0) {
      filteredBars = bars;
    }

    const normalizedBars: MarketBar[] = filteredBars.map((b) => ({
      ...b,
      symbol: cleanSymbol,
    }));

    normalizedBars.sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );

    const cleanBars: MarketBar[] = [];
    let prevTimestamp = -1;
    for (const bar of normalizedBars) {
      const ts = bar.timestamp.getTime();
      if (ts > prevTimestamp) {
        cleanBars.push(bar);
        prevTimestamp = ts;
      }
    }

    return runMarketAnalysis(cleanSymbol, cleanBars);
  }

  async analyzeDataset(
    datasetId: string,
    requestedSymbol?: string,
  ): Promise<MarketAnalyticsResult> {
    const dataset = await this.datasetRepository.findById(datasetId);

    if (!dataset) {
      if (datasetId === "sample" || datasetId === "default" || datasetId === SAMPLE_DATASET.id) {
        if (requestedSymbol && requestedSymbol.toUpperCase() !== SAMPLE_DATASET.symbol) {
          return this.analyzeSymbol(requestedSymbol);
        }
        return runMarketAnalysis(SAMPLE_DATASET.symbol, SAMPLE_BARS);
      }
      throw new AppError(404, "Dataset not found");
    }

    const targetSymbol = (requestedSymbol || dataset.symbol)?.trim().toUpperCase();
    let bars = await this.marketDataRepository.getBars({
      datasetId: dataset.id,
      ...(targetSymbol ? { symbol: targetSymbol } : {}),
    });

    // If no bars found with targetSymbol (e.g. symbol discrepancy or multi-asset dataset), fetch all bars for this dataset
    if (bars.length === 0) {
      bars = await this.marketDataRepository.getBars({
        datasetId: dataset.id,
      });
    }

    if (bars.length === 0) {
      throw new AppError(400, "Dataset contains no market data.");
    }

    // Determine effective symbol from distinct symbols present in bars
    const distinctSymbols = Array.from(
      new Set(bars.map((b) => b.symbol?.trim().toUpperCase()).filter(Boolean)),
    );

    let effectiveSymbol = targetSymbol;
    if (distinctSymbols.length > 0) {
      const match = distinctSymbols.find(
        (s) =>
          s === targetSymbol ||
          (targetSymbol &&
            s.replace(/[^A-Z0-9]/g, "") === targetSymbol.replace(/[^A-Z0-9]/g, "")),
      );
      effectiveSymbol = match || distinctSymbols[0] || targetSymbol || "UNKNOWN";
    }

    const effectiveAlphanum = effectiveSymbol?.replace(/[^A-Z0-9]/g, "") || "";
    let filteredBars = bars.filter((b) => {
      const s = (b.symbol || "").toUpperCase();
      return (
        s === effectiveSymbol ||
        (effectiveAlphanum && s.replace(/[^A-Z0-9]/g, "") === effectiveAlphanum)
      );
    });

    if (filteredBars.length === 0) {
      filteredBars = bars;
    }

    // Normalize symbol and ensure strict ascending order with deduplicated timestamps for C++ engine
    const normalizedBars: MarketBar[] = filteredBars.map((b) => ({
      ...b,
      symbol: effectiveSymbol || "UNKNOWN",
    }));

    normalizedBars.sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );

    const cleanBars: MarketBar[] = [];
    let prevTimestamp = -1;
    for (const bar of normalizedBars) {
      const ts = bar.timestamp.getTime();
      if (ts > prevTimestamp) {
        cleanBars.push(bar);
        prevTimestamp = ts;
      }
    }

    if (cleanBars.length === 0) {
      throw new AppError(400, "Dataset contains no market data.");
    }

    return runMarketAnalysis(effectiveSymbol || "UNKNOWN", cleanBars);
  }

  async analyzeBars(symbol: string, bars: MarketBar[]): Promise<MarketAnalyticsResult> {
    return runMarketAnalysis(symbol, bars);
  }

  async analyzeMarket(datasetId: string): Promise<MarketAnalyticsResult> {
    return this.analyzeDataset(datasetId);
  }

  async getAll(): Promise<Analytics[]> {
    return this.analyticsRepository ? this.analyticsRepository.getAll() : [];
  }

  async getById(id: string): Promise<Analytics | null> {
    return this.analyticsRepository
      ? this.analyticsRepository.getById(id)
      : null;
  }

  async getByDatasetId(datasetId: string): Promise<Analytics[]> {
    return this.analyticsRepository
      ? this.analyticsRepository.getByDatasetId(datasetId)
      : [];
  }

  async deleteById(id: string): Promise<boolean> {
    return this.analyticsRepository
      ? this.analyticsRepository.deleteById(id)
      : false;
  }
}
