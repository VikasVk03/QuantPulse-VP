import { describe, expect, it, vi } from "vitest";

import type { Request, Response } from "express";

import type { MarketBar } from "../../../src/infrastructure/database/repositories/MarketDataRepository.js";

import { MarketDataController } from "../../../src/modules/market-data/market-data.controller.js";
import { MarketDataService } from "../../../src/modules/market-data/market-data.service.js";

const service = {
    getBars: vi.fn(),
    insertBars: vi.fn(),
} as unknown as MarketDataService;

const createResponse = () => {
    const res = {
        status: vi.fn(),
        json: vi.fn(),
        send: vi.fn(),
    } as unknown as Response;

    vi.mocked(res.status).mockReturnValue(res);

    return res;
};

const createRequest = (
    overrides: Partial<Request> = {},
): Request => {
    return {
        params: {
            datasetId: "dataset-001",
        },
        query: {},
        body: [],
        ...overrides,
    } as Request;
};

describe("MarketDataController", () => {
    it("returns market bars successfully", async () => {
        const bars: MarketBar[] = [
            {
                datasetId: "dataset-001",
                timestamp: new Date(
                    "2026-09-10T00:00:00.000Z",
                ),
                symbol: "RELIANCE",
                open: 1450,
                high: 1475,
                low: 1440,
                close: 1465,
                volume: 125000,
            },
        ];

        const service = {
            getBars: vi.fn().mockResolvedValue(bars),
            insertBars: vi.fn(),
        } as unknown as MarketDataService;

        const controller =
            new MarketDataController(service);

        const req = createRequest({
            query: {
                symbol: "RELIANCE",
            },
        });

        const res = createResponse();

        await controller.getBars(req, res);

        expect(service.getBars).toHaveBeenCalledWith({
            datasetId: "dataset-001",
            symbol: "RELIANCE",
        });

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: bars,
        });
    });

    it("rejects a missing dataset ID", async () => {
        const service = {
            getBars: vi.fn(),
            insertBars: vi.fn(),
        } as unknown as MarketDataService;

        const controller =
            new MarketDataController(service);

        const req = createRequest({
            params: {},
        });

        const res = createResponse();

        await controller.getBars(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: "Dataset ID is required",
        });

        expect(service.getBars).not.toHaveBeenCalled();
    });

    it("rejects an invalid market-bar payload", async () => {
        const service = {
            getBars: vi.fn(),
            insertBars: vi.fn(),
        } as unknown as MarketDataService;

        const controller =
            new MarketDataController(service);

        const req = createRequest({
            body: [
                {
                    symbol: "RELIANCE",
                    open: "invalid",
                },
            ],
        });

        const res = createResponse();

        await controller.insertBars(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                error: "Invalid market bar payload",
            }),
        );

        expect(service.insertBars).not.toHaveBeenCalled();
    });

    it("inserts valid market bars", async () => {
        const service = {
            getBars: vi.fn(),
            insertBars: vi.fn().mockResolvedValue(1),
        } as unknown as MarketDataService;

        const controller =
            new MarketDataController(service);

        const req = createRequest({
            body: [
                {
                    timestamp:
                        "2026-09-10T00:00:00.000Z",
                    symbol: "RELIANCE",
                    open: 1450,
                    high: 1475,
                    low: 1440,
                    close: 1465,
                    volume: 125000,
                },
            ],
        });

        const res = createResponse();

        await controller.insertBars(req, res);

        expect(
            service.insertBars,
        ).toHaveBeenCalledTimes(1);

        expect(
            service.insertBars,
        ).toHaveBeenCalledWith(
            "dataset-001",
            [
                {
                    timestamp: new Date(
                        "2026-09-10T00:00:00.000Z",
                    ),
                    symbol: "RELIANCE",
                    open: 1450,
                    high: 1475,
                    low: 1440,
                    close: 1465,
                    volume: 125000,
                },
            ],
        );

        expect(res.status).toHaveBeenCalledWith(201);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: {
                inserted: 1,
            },
        });
    });

    it("returns 404 when dataset does not exist", async () => {
        const service = {
            getBars: vi.fn(),
            insertBars: vi
                .fn()
                .mockRejectedValue(
                    new Error("Dataset not found"),
                ),
        } as unknown as MarketDataService;

        const controller =
            new MarketDataController(service);

        const req = createRequest({
            body: [
                {
                    timestamp:
                        "2026-09-10T00:00:00.000Z",
                    symbol: "RELIANCE",
                    open: 1450,
                    high: 1475,
                    low: 1440,
                    close: 1465,
                    volume: 125000,
                },
            ],
        });

        const res = createResponse();

        await controller.insertBars(req, res);

        expect(res.status).toHaveBeenCalledWith(404);

        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: "Dataset not found",
        });
    });
});
