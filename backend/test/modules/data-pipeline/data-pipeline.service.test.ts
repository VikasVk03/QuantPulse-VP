import { describe, expect, it, vi } from "vitest";

import type {
  Dataset,
  DatasetRepository,
} from "../../../src/infrastructure/database/repositories/DatasetRepository.js";
import type { MarketDataRepository } from "../../../src/infrastructure/database/repositories/MarketDataRepository.js";
import { DataPipelineService } from "../../../src/modules/data-pipeline/data-pipeline.service.js";

const mockDataset: Dataset = {
  id: "dataset-001",
  name: "Reliance Market Data",
  symbol: "RELIANCE",
  timeframe: "1d",
  source: "user-upload",
  description: "Imported from reliance.csv",
  createdAt: new Date(),
  updatedAt: new Date(),
};

function createMockRepositories() {
  const datasetRepository: DatasetRepository = {
    findById: vi.fn().mockResolvedValue(mockDataset),
    findAll: vi.fn().mockResolvedValue([mockDataset]),
    create: vi.fn().mockImplementation(async (data) => ({
      id: "dataset-001",
      name: data.name,
      symbol: data.symbol,
      timeframe: data.timeframe,
      source: data.source,
      description: data.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    deleteById: vi.fn().mockResolvedValue(true),
  };

  const marketDataRepository: MarketDataRepository = {
    getBars: vi.fn().mockResolvedValue([]),
    insertBars: vi
      .fn()
      .mockImplementation((bars) => Promise.resolve(bars.length)),
  };

  return { datasetRepository, marketDataRepository };
}

describe("DataPipelineService", () => {
  // 1. Valid CSV
  it("processes valid CSV market data successfully", async () => {
    const { datasetRepository, marketDataRepository } =
      createMockRepositories();
    const service = new DataPipelineService(
      datasetRepository,
      marketDataRepository,
    );

    const csvContent = `timestamp,symbol,open,high,low,close,volume
2026-09-10T00:00:00.000Z,reliance,1400.0,1410.0,1395.0,1405.0,100000
2026-09-11T00:00:00.000Z,reliance,1405.0,1420.0,1400.0,1415.0,120000`;

    const result = await service.processUpload({
      fileBuffer: Buffer.from(csvContent, "utf-8"),
      fileName: "reliance.csv",
      metadata: {
        name: "Reliance 2-Day Data",
        timeframe: "1d",
      },
    });

    expect(result.status).toBe("completed");
    expect(result.format).toBe("csv");
    expect(result.totalRows).toBe(2);
    expect(result.processedRows).toBe(2);
    expect(result.duplicateRows).toBe(0);
    expect(datasetRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Reliance 2-Day Data",
        symbol: "RELIANCE",
        timeframe: "1d",
      }),
    );
    expect(marketDataRepository.insertBars).toHaveBeenCalledTimes(1);
  });

  // 2. Valid JSON
  it("processes valid JSON market data successfully", async () => {
    const { datasetRepository, marketDataRepository } =
      createMockRepositories();
    const service = new DataPipelineService(
      datasetRepository,
      marketDataRepository,
    );

    const jsonContent = JSON.stringify([
      {
        timestamp: "2026-09-10T00:00:00.000Z",
        symbol: "TCS",
        open: 3500.0,
        high: 3550.0,
        low: 3490.0,
        close: 3525.0,
        volume: 50000,
      },
    ]);

    const result = await service.processUpload({
      fileBuffer: Buffer.from(jsonContent, "utf-8"),
      fileName: "tcs.json",
    });

    expect(result.status).toBe("completed");
    expect(result.format).toBe("json");
    expect(result.totalRows).toBe(1);
    expect(result.processedRows).toBe(1);
  });

  // 3. Missing columns
  it("rejects CSV with missing required columns", async () => {
    const { datasetRepository, marketDataRepository } =
      createMockRepositories();
    const service = new DataPipelineService(
      datasetRepository,
      marketDataRepository,
    );

    const invalidCsv = `timestamp,open,high,close
2026-09-10T00:00:00.000Z,100,105,103`;

    await expect(
      service.processUpload({
        fileBuffer: Buffer.from(invalidCsv, "utf-8"),
        fileName: "invalid.csv",
      }),
    ).rejects.toThrow("Missing required");
  });

  // 4. Malformed CSV row
  it("rejects malformed CSV rows with insufficient columns", async () => {
    const { datasetRepository, marketDataRepository } =
      createMockRepositories();
    const service = new DataPipelineService(
      datasetRepository,
      marketDataRepository,
    );

    const malformedCsv = `timestamp,symbol,open,high,low,close,volume
2026-09-10T00:00:00.000Z,RELIANCE,100,105`;

    await expect(
      service.processUpload({
        fileBuffer: Buffer.from(malformedCsv, "utf-8"),
        fileName: "malformed.csv",
      }),
    ).rejects.toThrow("Malformed CSV row");
  });

  // 5. Invalid OHLC
  it("rejects invalid OHLC relationships (high < low, open > high)", async () => {
    const { datasetRepository, marketDataRepository } =
      createMockRepositories();
    const service = new DataPipelineService(
      datasetRepository,
      marketDataRepository,
    );

    const invalidOhlc = `timestamp,symbol,open,high,low,close,volume
2026-09-10T00:00:00.000Z,RELIANCE,150.0,140.0,145.0,142.0,10000`;

    await expect(
      service.processUpload({
        fileBuffer: Buffer.from(invalidOhlc, "utf-8"),
        fileName: "invalid_ohlc.csv",
      }),
    ).rejects.toThrow("High (140) cannot be lower than Low (145)");
  });

  // 6. Negative volume
  it("rejects negative volume", async () => {
    const { datasetRepository, marketDataRepository } =
      createMockRepositories();
    const service = new DataPipelineService(
      datasetRepository,
      marketDataRepository,
    );

    const negativeVol = `timestamp,symbol,open,high,low,close,volume
2026-09-10T00:00:00.000Z,RELIANCE,100.0,105.0,95.0,102.0,-500`;

    await expect(
      service.processUpload({
        fileBuffer: Buffer.from(negativeVol, "utf-8"),
        fileName: "negative_vol.csv",
      }),
    ).rejects.toThrow("Volume cannot be negative");
  });

  // 7. Empty file
  it("rejects empty file payload", async () => {
    const { datasetRepository, marketDataRepository } =
      createMockRepositories();
    const service = new DataPipelineService(
      datasetRepository,
      marketDataRepository,
    );

    await expect(
      service.processUpload({
        fileBuffer: Buffer.from("", "utf-8"),
        fileName: "empty.csv",
      }),
    ).rejects.toThrow("Uploaded file is empty");
  });

  // 8. Duplicate timestamps
  it("deduplicates records with identical symbol and timestamp", async () => {
    const { datasetRepository, marketDataRepository } =
      createMockRepositories();
    const service = new DataPipelineService(
      datasetRepository,
      marketDataRepository,
    );

    const csvWithDuplicates = `timestamp,symbol,open,high,low,close,volume
2026-09-10T00:00:00.000Z,RELIANCE,1400.0,1410.0,1395.0,1405.0,100000
2026-09-10T00:00:00.000Z,RELIANCE,1400.0,1410.0,1395.0,1405.0,100000
2026-09-11T00:00:00.000Z,RELIANCE,1405.0,1420.0,1400.0,1415.0,120000`;

    const result = await service.processUpload({
      fileBuffer: Buffer.from(csvWithDuplicates, "utf-8"),
      fileName: "duplicates.csv",
    });

    expect(result.status).toBe("completed");
    expect(result.totalRows).toBe(3);
    expect(result.processedRows).toBe(2);
    expect(result.duplicateRows).toBe(1);
  });

  // 9. Symbol normalization
  it("normalizes symbol casing and whitespace", async () => {
    const { datasetRepository, marketDataRepository } =
      createMockRepositories();
    const service = new DataPipelineService(
      datasetRepository,
      marketDataRepository,
    );

    const csv = `timestamp,symbol,open,high,low,close,volume
2026-09-10T00:00:00.000Z,  infy  ,1500.0,1520.0,1490.0,1510.0,80000`;

    const result = await service.processUpload({
      fileBuffer: Buffer.from(csv, "utf-8"),
      fileName: "infy.csv",
    });

    expect(result.status).toBe("completed");
    expect(datasetRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        symbol: "INFY",
      }),
    );
  });

  // 10. Invalid timestamp
  it("rejects invalid timestamp string", async () => {
    const { datasetRepository, marketDataRepository } =
      createMockRepositories();
    const service = new DataPipelineService(
      datasetRepository,
      marketDataRepository,
    );

    const invalidTs = `timestamp,symbol,open,high,low,close,volume
not-a-date,RELIANCE,1400.0,1410.0,1395.0,1405.0,100000`;

    await expect(
      service.processUpload({
        fileBuffer: Buffer.from(invalidTs, "utf-8"),
        fileName: "invalid_ts.csv",
      }),
    ).rejects.toThrow("Invalid timestamp");
  });

  // 11. Repository failure
  it("handles repository failure gracefully and reports error", async () => {
    const { datasetRepository, marketDataRepository } =
      createMockRepositories();
    vi.mocked(marketDataRepository.insertBars).mockRejectedValueOnce(
      new Error("MongoDB connection timeout"),
    );

    const service = new DataPipelineService(
      datasetRepository,
      marketDataRepository,
    );

    const csv = `timestamp,symbol,open,high,low,close,volume
2026-09-10T00:00:00.000Z,RELIANCE,1400.0,1410.0,1395.0,1405.0,100000`;

    await expect(
      service.processUpload({
        fileBuffer: Buffer.from(csv, "utf-8"),
        fileName: "reliance.csv",
      }),
    ).rejects.toThrow("MongoDB connection timeout");
  });

  // 12. Successful persistence & result storage
  it("persists dataset and allows status and result retrieval", async () => {
    const { datasetRepository, marketDataRepository } =
      createMockRepositories();
    const service = new DataPipelineService(
      datasetRepository,
      marketDataRepository,
    );

    const csv = `timestamp,symbol,open,high,low,close,volume
2026-09-10T00:00:00.000Z,RELIANCE,1400.0,1410.0,1395.0,1405.0,100000`;

    const result = await service.processUpload({
      fileBuffer: Buffer.from(csv, "utf-8"),
      fileName: "reliance.csv",
    });

    const status = service.getPipelineStatus(result.pipelineId);
    expect(status).not.toBeNull();
    expect(status?.pipelineId).toBe(result.pipelineId);
    expect(status?.status).toBe("completed");

    const fullResult = service.getPipelineResult(result.pipelineId);
    expect(fullResult).not.toBeNull();
    expect(fullResult?.preview).toHaveLength(1);
  });

  // 13. Pipeline result contains all stages
  it("exposes all 8 pipeline stages with completed status", async () => {
    const { datasetRepository, marketDataRepository } =
      createMockRepositories();
    const service = new DataPipelineService(
      datasetRepository,
      marketDataRepository,
    );

    const csv = `timestamp,symbol,open,high,low,close,volume
2026-09-10T00:00:00.000Z,RELIANCE,1400.0,1410.0,1395.0,1405.0,100000`;

    const result = await service.processUpload({
      fileBuffer: Buffer.from(csv, "utf-8"),
      fileName: "reliance.csv",
    });

    const stageNames = result.stages.map((s) => s.name);
    expect(stageNames).toEqual([
      "ingestion",
      "schema_detection",
      "validation",
      "normalization",
      "timestamp_normalization",
      "symbol_normalization",
      "deduplication",
      "persistence",
    ]);

    for (const stage of result.stages) {
      expect(stage.status).toBe("completed");
    }
  });

  // 14. Failed stage represented correctly in cache
  it("records failed stage correctly when error occurs", async () => {
    const { datasetRepository, marketDataRepository } =
      createMockRepositories();
    const service = new DataPipelineService(
      datasetRepository,
      marketDataRepository,
    );

    const invalidCsv = `timestamp,symbol,open,high,low,close,volume
2026-09-10T00:00:00.000Z,RELIANCE,1400.0,1300.0,1395.0,1405.0,100000`;

    try {
      await service.processUpload({
        fileBuffer: Buffer.from(invalidCsv, "utf-8"),
        fileName: "reliance.csv",
      });
    } catch {
      // Error expected
    }

    // Check if any pipeline runs were recorded with failed status
    const runs = Array.from((service as any).pipelineRuns.values()) as any[];
    expect(runs.length).toBeGreaterThan(0);
    const failedRun = runs[0];
    expect(failedRun.status).toBe("failed");
    const valStage = failedRun.stages.find((s: any) => s.name === "validation");
    expect(valStage?.status).toBe("failed");
  });

  // 15. Processes real-world tab-separated market data with human dates, commas, and '-' volumes
  it("processes real-world stock data with tab delimiters, human dates, and formatted numbers", async () => {
    const { datasetRepository, marketDataRepository } =
      createMockRepositories();
    const service = new DataPipelineService(
      datasetRepository,
      marketDataRepository,
    );

    const tsvContent = `Date\tOpen\tHigh\tLow\tClose \tAdj Close \tVolume
Sep 22, 2026\t1,247.60\t1,251.90\t1,237.40\t1,240.40\t1,240.40\t10,684,376
Sep 21, 2026\t1,234.10\t1,249.10\t1,232.50\t1,247.40\t1,247.40\t10,007,218
Sep 14, 2026\t1,257.50\t1,257.50\t1,257.50\t1,257.50\t1,257.50\t-`;

    const result = await service.processUpload({
      fileBuffer: Buffer.from(tsvContent, "utf-8"),
      fileName: "reliance-range-data.csv",
    });

    expect(result.status).toBe("completed");
    expect(result.totalRows).toBe(3);
    expect(result.processedRows).toBe(3);
    expect(result.dataset?.symbol).toBe("RELIANCE");
    expect(marketDataRepository.insertBars).toHaveBeenCalledTimes(1);

    // Verify parsed bar data (sorted chronologically ascending: Sep 14 -> Sep 21 -> Sep 22)
    const insertedBars = (marketDataRepository.insertBars as any).mock
      .calls[0][0];
    expect(insertedBars).toHaveLength(3);
    expect(insertedBars[0].open).toBe(1257.5); // Sep 14
    expect(insertedBars[0].volume).toBe(0); // '-' converted to 0
    expect(insertedBars[2].open).toBe(1247.6); // Sep 22
    expect(insertedBars[2].volume).toBe(10684376);
  });

  // 16. Processes semicolon-delimited European stock market data
  it("processes semicolon-delimited stock data with aliases", async () => {
    const { datasetRepository, marketDataRepository } =
      createMockRepositories();
    const service = new DataPipelineService(
      datasetRepository,
      marketDataRepository,
    );

    const semicolonContent = `Date;Ticker;Open;High;Low;Last;Shares Traded
2026-09-01;INFY;1800.50;1820.00;1795.00;1810.00;500000
2026-09-02;INFY;1810.00;1835.00;1805.00;1825.00;620000`;

    const result = await service.processUpload({
      fileBuffer: Buffer.from(semicolonContent, "utf-8"),
      fileName: "infy-daily.csv",
    });

    expect(result.status).toBe("completed");
    expect(result.totalRows).toBe(2);
    expect(result.dataset?.symbol).toBe("INFY");
  });

  // 17. Processes the entire real-world data/samples/reliance-range-data.csv file
  it("processes the full data/samples/reliance-range-data.csv dataset cleanly", async () => {
    const { datasetRepository, marketDataRepository } =
      createMockRepositories();
    const service = new DataPipelineService(
      datasetRepository,
      marketDataRepository,
    );

    const { readFileSync } = await import("node:fs");
    const { resolve } = await import("node:path");

    const filePath = resolve(
      __dirname,
      "../../../../data/samples/reliance-range-data.csv",
    );
    const buffer = readFileSync(filePath);

    const result = await service.processUpload({
      fileBuffer: buffer,
      fileName: "reliance-range-data.csv",
    });

    expect(result.status).toBe("completed");
    expect(result.totalRows).toBe(250);
    expect(result.processedRows).toBe(250);
    expect(result.duplicateRows).toBe(0);
    expect(result.dataset?.symbol).toBe("RELIANCE");
    expect(marketDataRepository.insertBars).toHaveBeenCalledTimes(1);
  });
});
