import type { Analytics } from "./analytics.types.js";

import type {
    AnalyticsRepository,
    CreateAnalyticsInput,
} from "../../infrastructure/database/repositories/AnalyticsRepository.js";

import type { DatasetRepository } from "../../infrastructure/database/repositories/DatasetRepository.js";

import type { MarketDataRepository } from "../../infrastructure/database/repositories/MarketDataRepository.js";

import {
    runMarketAnalysis,
} from "../../infrastructure/cpp-engine/QuantEngineClient.js";

export class AnalyticsService {
    constructor(
        private readonly analyticsRepository: AnalyticsRepository,
        private readonly datasetRepository: DatasetRepository,
        private readonly marketDataRepository: MarketDataRepository,
    ) { }

    async analyzeMarket(
        datasetId: string,
    ): Promise<Analytics> {
        const dataset =
            await this.datasetRepository.findById(datasetId);

        if (!dataset) {
            throw new Error("Dataset not found.");
        }

        const bars =
            await this.marketDataRepository.getBars({
                datasetId: dataset.id,
                symbol: dataset.symbol,
            });

        if (bars.length === 0) {
            throw new Error(
                "Dataset contains no market data.",
            );
        }

        const result =
            await runMarketAnalysis(
                dataset.symbol,
                bars,
            );

        const input: CreateAnalyticsInput = {
            datasetId: dataset.id,
            symbol: result.symbol,
            timeframe: dataset.timeframe,

            observationCount: result.observationCount,
            firstPrice: result.firstPrice,
            lastPrice: result.lastPrice,
            totalVolume: result.totalVolume,
            averageVolume: result.averageVolume,
            returnPercentage: result.returnPercentage,
            volatility: result.volatility,

            series: result.series,
        };

        return this.analyticsRepository.create(input);
    }

    async getAll(): Promise<Analytics[]> {
        return this.analyticsRepository.getAll();
    }

    async getById(
        id: string,
    ): Promise<Analytics | null> {
        return this.analyticsRepository.getById(id);
    }

    async getByDatasetId(
        datasetId: string,
    ): Promise<Analytics[]> {
        return this.analyticsRepository.getByDatasetId(
            datasetId,
        );
    }

    async deleteById(
        id: string,
    ): Promise<boolean> {
        return this.analyticsRepository.deleteById(id);
    }
}
