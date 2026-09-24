import { describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";

import type { MarketAnalyticsResult } from "../../../src/infrastructure/cpp-engine/QuantEngineClient.js";
import { AnalyticsController } from "../../../src/modules/analytics/analytics.controller.js";
import { AnalyticsService } from "../../../src/modules/analytics/analytics.service.js";
import { AppError } from "../../../src/shared/errors/AppError.js";

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

const createResponse = () => {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
    send: vi.fn(),
  } as unknown as Response;

  vi.mocked(res.status).mockReturnValue(res);

  return res;
};

const createRequest = (overrides: Partial<Request> = {}): Request => {
  return {
    params: {
      datasetId: "dataset-001",
    },
    query: {},
    body: {},
    ...overrides,
  } as Request;
};

describe("AnalyticsController", () => {
  it("returns 200 with analytics data on success", async () => {
    const service = {
      analyzeDataset: vi.fn().mockResolvedValue(validAnalyticsResult),
    } as unknown as AnalyticsService;

    const controller = new AnalyticsController(service);
    const req = createRequest({ params: { datasetId: "dataset-001" } });
    const res = createResponse();

    await controller.analyzeDataset(req, res);

    expect(service.analyzeDataset).toHaveBeenCalledWith("dataset-001");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: validAnalyticsResult,
    });
  });

  it("returns 400 when dataset ID is missing", async () => {
    const service = {
      analyzeDataset: vi.fn(),
    } as unknown as AnalyticsService;

    const controller = new AnalyticsController(service);
    const req = createRequest({ params: {} });
    const res = createResponse();

    await controller.analyzeDataset(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Dataset ID is required",
    });
    expect(service.analyzeDataset).not.toHaveBeenCalled();
  });

  it("returns 404 when dataset is not found", async () => {
    const service = {
      analyzeDataset: vi
        .fn()
        .mockRejectedValue(new AppError(404, "Dataset not found")),
    } as unknown as AnalyticsService;

    const controller = new AnalyticsController(service);
    const req = createRequest({ params: { datasetId: "non-existent" } });
    const res = createResponse();

    await controller.analyzeDataset(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Dataset not found",
    });
  });

  it("returns 400 when dataset contains no market data", async () => {
    const service = {
      analyzeDataset: vi
        .fn()
        .mockRejectedValue(
          new AppError(400, "Dataset contains no market data."),
        ),
    } as unknown as AnalyticsService;

    const controller = new AnalyticsController(service);
    const req = createRequest({ params: { datasetId: "dataset-001" } });
    const res = createResponse();

    await controller.analyzeDataset(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Dataset contains no market data.",
    });
  });

  it("returns 500 when C++ engine or unhandled error occurs", async () => {
    const service = {
      analyzeDataset: vi
        .fn()
        .mockRejectedValue(new Error("C++ engine calculation failed")),
    } as unknown as AnalyticsService;

    const controller = new AnalyticsController(service);
    const req = createRequest({ params: { datasetId: "dataset-001" } });
    const res = createResponse();

    await controller.analyzeDataset(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "C++ engine calculation failed",
    });
  });
});
