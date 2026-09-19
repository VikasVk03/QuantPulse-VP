import { describe, expect, it, vi } from "vitest";

import type {
    Dataset,
    DatasetRepository,
} from "../../../src/infrastructure/database/repositories/DatasetRepository.js";

import type {
    MarketBarInput,
    MarketDataRepository,
} from "../../../src/infrastructure/database/repositories/MarketDataRepository.js";

import { MarketDataService } from "../../../src/modules/market-data/market-data.service.js";

const createDataset = (): Dataset => ({
    id: "dataset-001",
    name: "Reliance Market Bars",
    symbol: "RELIANCE",
    timeframe: "1d",
    source: "NSE",
    createdAt: new Date(),
    updatedAt: new Date(),
});

const createBar = (): MarketBarInput => ({
    timestamp: new Date("2026-09-10T00:00:00.000Z"),
    symbol: "RELIANCE",
    open: 1450,
    high: 1475,
    low: 1440,
    close: 1465,
    volume: 125000,
});

describe("MarketDataService", () => {
    it("inserts bars for an existing dataset", async () => {
        const marketRepository: MarketDataRepository = {
            getBars: vi.fn(),
            insertBars: vi.fn().mockResolvedValue(1),
        };

        const datasetRepository: DatasetRepository = {
            findById: vi
                .fn()
                .mockResolvedValue(createDataset()),
            findAll: vi.fn(),
            create: vi.fn(),
            deleteById: vi.fn(),
        };

        const service = new MarketDataService(
            marketRepository,
            datasetRepository,
        );

        const result = await service.insertBars(
            "dataset-001",
            [createBar()],
        );

        expect(result).toBe(1);

        expect(
            datasetRepository.findById,
        ).toHaveBeenCalledWith("dataset-001");

        expect(
            marketRepository.insertBars,
        ).toHaveBeenCalledWith([
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
        ]);
    });

    it("rejects insertion when dataset does not exist", async () => {
        const marketRepository: MarketDataRepository = {
            getBars: vi.fn(),
            insertBars: vi.fn(),
        };

        const datasetRepository: DatasetRepository = {
            findById: vi.fn().mockResolvedValue(null),
            findAll: vi.fn(),
            create: vi.fn(),
            deleteById: vi.fn(),
        };

        const service = new MarketDataService(
            marketRepository,
            datasetRepository,
        );

        await expect(
            service.insertBars(
                "missing-dataset",
                [createBar()],
            ),
        ).rejects.toMatchObject({
            statusCode: 404,
            message: "Dataset not found",
        });
        
        expect(
            marketRepository.insertBars,
        ).not.toHaveBeenCalled();
    });

    it("does not query the dataset for an empty bar batch", async () => {
        const marketRepository: MarketDataRepository = {
            getBars: vi.fn(),
            insertBars: vi.fn(),
        };

        const datasetRepository: DatasetRepository = {
            findById: vi.fn(),
            findAll: vi.fn(),
            create: vi.fn(),
            deleteById: vi.fn(),
        };

        const service = new MarketDataService(
            marketRepository,
            datasetRepository,
        );

        const result = await service.insertBars(
            "dataset-001",
            [],
        );

        expect(result).toBe(0);

        expect(
            datasetRepository.findById,
        ).not.toHaveBeenCalled();

        expect(
            marketRepository.insertBars,
        ).not.toHaveBeenCalled();
    });
});
