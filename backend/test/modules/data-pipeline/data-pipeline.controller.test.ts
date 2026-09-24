import { describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";

import type { DataPipelineResult } from "../../../src/modules/data-pipeline/data-pipeline.types.js";
import { DataPipelineController } from "../../../src/modules/data-pipeline/data-pipeline.controller.js";
import { DataPipelineService } from "../../../src/modules/data-pipeline/data-pipeline.service.js";

const mockPipelineResult: DataPipelineResult = {
  pipelineId: "pipe-001",
  datasetId: "dataset-001",
  status: "completed",
  fileName: "reliance.csv",
  format: "csv",
  totalRows: 10,
  processedRows: 10,
  duplicateRows: 0,
  rejectedRows: 0,
  stages: [],
  warnings: [],
  errors: [],
  createdAt: new Date(),
  completedAt: new Date(),
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

describe("DataPipelineController", () => {
  it("processes upload and returns 201 on success", async () => {
    const service = {
      processUpload: vi.fn().mockResolvedValue(mockPipelineResult),
      getPipelineStatus: vi.fn(),
      getPipelineResult: vi.fn(),
    } as unknown as DataPipelineService;

    const controller = new DataPipelineController(service);

    const csvContent =
      "timestamp,symbol,open,high,low,close,volume\n2026-09-10T00:00:00.000Z,RELIANCE,100,105,95,102,1000";
    const req = {
      headers: { "content-type": "application/json" },
      body: {
        fileName: "reliance.csv",
        fileContent: csvContent,
        name: "Reliance Daily",
      },
    } as unknown as Request;

    const res = createResponse();

    await controller.upload(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockPipelineResult,
    });
  });

  it("returns 400 when no file or file content is provided", async () => {
    const service = {
      processUpload: vi.fn(),
      getPipelineStatus: vi.fn(),
      getPipelineResult: vi.fn(),
    } as unknown as DataPipelineService;

    const controller = new DataPipelineController(service);

    const req = {
      headers: { "content-type": "application/json" },
      body: {},
    } as unknown as Request;

    const res = createResponse();

    await controller.upload(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining("No market data file"),
      }),
    );
  });

  it("returns 200 for valid pipeline status query", async () => {
    const service = {
      processUpload: vi.fn(),
      getPipelineStatus: vi.fn().mockReturnValue(mockPipelineResult),
      getPipelineResult: vi.fn(),
    } as unknown as DataPipelineService;

    const controller = new DataPipelineController(service);

    const req = {
      params: { pipelineId: "pipe-001" },
    } as unknown as Request;

    const res = createResponse();

    await controller.getStatus(req, res);

    expect(service.getPipelineStatus).toHaveBeenCalledWith("pipe-001");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockPipelineResult,
    });
  });

  it("returns 404 for unknown pipeline status query", async () => {
    const service = {
      processUpload: vi.fn(),
      getPipelineStatus: vi.fn().mockReturnValue(null),
      getPipelineResult: vi.fn(),
    } as unknown as DataPipelineService;

    const controller = new DataPipelineController(service);

    const req = {
      params: { pipelineId: "unknown-pipe" },
    } as unknown as Request;

    const res = createResponse();

    await controller.getStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Pipeline execution not found",
    });
  });

  it("returns 200 for valid pipeline result query", async () => {
    const service = {
      processUpload: vi.fn(),
      getPipelineStatus: vi.fn(),
      getPipelineResult: vi.fn().mockReturnValue(mockPipelineResult),
    } as unknown as DataPipelineService;

    const controller = new DataPipelineController(service);

    const req = {
      params: { pipelineId: "pipe-001" },
    } as unknown as Request;

    const res = createResponse();

    await controller.getResult(req, res);

    expect(service.getPipelineResult).toHaveBeenCalledWith("pipe-001");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockPipelineResult,
    });
  });

  it("returns 404 for unknown pipeline result query", async () => {
    const service = {
      processUpload: vi.fn(),
      getPipelineStatus: vi.fn(),
      getPipelineResult: vi.fn().mockReturnValue(null),
    } as unknown as DataPipelineService;

    const controller = new DataPipelineController(service);

    const req = {
      params: { pipelineId: "unknown-pipe" },
    } as unknown as Request;

    const res = createResponse();

    await controller.getResult(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Pipeline result not found",
    });
  });
});
