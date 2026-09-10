import type {
    MarketBar,
    MarketBarInput,
    MarketBarQuery,
    MarketDataRepository,
} from "../../infrastructure/database/repositories/MarketDataRepository.js";

import type { DatasetRepository } from "../../infrastructure/database/repositories/DatasetRepository.js";

import { AppError } from "../../shared/errors/AppError.js";

export class MarketDataService {
    constructor(
        private readonly repository: MarketDataRepository,
        private readonly datasetRepository: DatasetRepository,
    ) { }

    async getBars(
        query: MarketBarQuery,
    ): Promise<MarketBarInput[]> {
        if (!query.datasetId.trim()) {
            throw new Error(
                "Dataset ID is required",
            );
        }

        if (
            query.symbol !== undefined &&
            !query.symbol.trim()
        ) {
            throw new Error(
                "Market data symbol cannot be empty",
            );
        }

        return this.repository.getBars({
            ...query,
            datasetId: query.datasetId.trim(),
            ...(query.symbol !== undefined
                ? {
                    symbol: query.symbol
                        .trim()
                        .toUpperCase(),
                }
                : {}),
        });
    }

    async insertBars(
        datasetId: string,
        bars: MarketBarInput[],
    ): Promise<number> {
        if (!datasetId.trim()) {
            throw new AppError(400, "Dataset ID is required");
        }

        if (bars.length === 0) {
            return 0;
        }

        const dataset = await this.datasetRepository.findById(
            datasetId.trim(),
        );

        if (!dataset) {
            throw new AppError(404, "Dataset not found");
        }

        const datasetBars: MarketBar[] = bars.map((bar) => ({
            ...bar,
            datasetId: dataset.id,
            symbol: bar.symbol.toUpperCase(),
        }));

        return this.repository.insertBars(datasetBars);
    }
}
