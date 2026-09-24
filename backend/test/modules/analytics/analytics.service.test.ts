import { describe, expect, it, vi } from "vitest";

const { runMarketAnalysisMock } = vi.hoisted(() => ({
  runMarketAnalysisMock: vi.fn(),
}));

vi.mock("../../../src/infrastructure/cpp-engine/QuantEngineClient.js", () => ({
  runMarketAnalysis: runMarketAnalysisMock,
}));

import type {
  Dataset,
  DatasetRepository,
} from "../../../src/infrastructure/database/repositories/DatasetRepository.js";
import type {
  MarketBar,
  MarketDataRepository,
} from "../../../src/infrastructure/database/repositories/MarketDataRepository.js";
import type { MarketAnalyticsResult } from "../../../src/infrastructure/cpp-engine/QuantEngineClient.js";
import { AnalyticsService } from "../../../src/modules/analytics/analytics.service.js";

const createDataset = (): Dataset => ({
  id: "dataset-001",
  name: "Reliance Daily",
  symbol: "RELIANCE",
  timeframe: "1d",
  source: "NSE",
  createdAt: new Date(),
  updatedAt: new Date(),
});

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

const validAnalyticsResult: MarketAnalyticsResult = {
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

describe("AnalyticsService", () => {
  it("runs market analysis successfully for an existing dataset", async () => {
    const datasetRepository: DatasetRepository = {
      findById: vi.fn().mockResolvedValue(createDataset()),
      findAll: vi.fn(),
      create: vi.fn(),
      deleteById: vi.fn(),
    };

    const marketDataRepository: MarketDataRepository = {
      getBars: vi.fn().mockResolvedValue(sampleBars),
      insertBars: vi.fn(),
    };

    runMarketAnalysisMock.mockResolvedValueOnce(validAnalyticsResult);

    const service = new AnalyticsService(
      marketDataRepository,
      datasetRepository,
    );

    const result = await service.analyzeDataset("dataset-001");

    expect(datasetRepository.findById).toHaveBeenCalledWith("dataset-001");
    expect(marketDataRepository.getBars).toHaveBeenCalledWith({
      datasetId: "dataset-001",
      symbol: "RELIANCE",
    });
    expect(runMarketAnalysisMock).toHaveBeenCalledWith("RELIANCE", sampleBars);
    expect(result).toEqual(validAnalyticsResult);
  });

  it("rejects when dataset does not exist", async () => {
    const datasetRepository: DatasetRepository = {
      findById: vi.fn().mockResolvedValue(null),
      findAll: vi.fn(),
      create: vi.fn(),
      deleteById: vi.fn(),
    };

    const marketDataRepository: MarketDataRepository = {
      getBars: vi.fn(),
      insertBars: vi.fn(),
    };

    const service = new AnalyticsService(
      marketDataRepository,
      datasetRepository,
    );

    await expect(service.analyzeDataset("non-existent")).rejects.toMatchObject({
      statusCode: 404,
      message: "Dataset not found",
    });

    expect(marketDataRepository.getBars).not.toHaveBeenCalled();
    expect(runMarketAnalysisMock).not.toHaveBeenCalled();
  });

  it("rejects when dataset contains no market bars", async () => {
    const datasetRepository: DatasetRepository = {
      findById: vi.fn().mockResolvedValue(createDataset()),
      findAll: vi.fn(),
      create: vi.fn(),
      deleteById: vi.fn(),
    };

    const marketDataRepository: MarketDataRepository = {
      getBars: vi.fn().mockResolvedValue([]),
      insertBars: vi.fn(),
    };

    const service = new AnalyticsService(
      marketDataRepository,
      datasetRepository,
    );

    await expect(service.analyzeDataset("dataset-001")).rejects.toMatchObject({
      statusCode: 400,
      message: "Dataset contains no market data.",
    });

    expect(runMarketAnalysisMock).not.toHaveBeenCalled();
  });

  it("propagates C++ engine failure", async () => {
    const datasetRepository: DatasetRepository = {
      findById: vi.fn().mockResolvedValue(createDataset()),
      findAll: vi.fn(),
      create: vi.fn(),
      deleteById: vi.fn(),
    };

    const marketDataRepository: MarketDataRepository = {
      getBars: vi.fn().mockResolvedValue(sampleBars),
      insertBars: vi.fn(),
    };

    runMarketAnalysisMock.mockRejectedValueOnce(
      new Error("C++ engine calculation failed"),
    );

    const service = new AnalyticsService(
      marketDataRepository,
      datasetRepository,
    );

    await expect(service.analyzeDataset("dataset-001")).rejects.toThrow(
      "C++ engine calculation failed",
    );
  });
});
