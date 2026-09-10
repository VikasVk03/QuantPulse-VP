import type {
    Collection,
    Filter,
} from "mongodb";

import { getMongoDB } from "../mongodb.js";

import type {
    MarketBar,
    MarketBarQuery,
    MarketDataRepository,
} from "./MarketDataRepository.js";

interface MarketBarDocument {
    datasetId: string;
    timestamp: Date;
    symbol: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export class MongoMarketDataRepository
    implements MarketDataRepository {
    private readonly collection: Collection<MarketBarDocument>;

    constructor() {
        this.collection =
            getMongoDB().collection<MarketBarDocument>(
                "market_bars",
            );
    }

    async getBars(
        query: MarketBarQuery,
    ): Promise<MarketBar[]> {
        const filter: Filter<MarketBarDocument> = {
            datasetId: query.datasetId,
        };

        if (query.symbol !== undefined) {
            filter.symbol = query.symbol.toUpperCase();
        }

        if (
            query.startTime !== undefined ||
            query.endTime !== undefined
        ) {
            filter.timestamp = {};

            if (query.startTime !== undefined) {
                filter.timestamp.$gte = query.startTime;
            }

            if (query.endTime !== undefined) {
                filter.timestamp.$lte = query.endTime;
            }
        }

        const cursor = this.collection
            .find(filter)
            .sort({ timestamp: 1 });

        if (query.limit !== undefined) {
            cursor.limit(query.limit);
        }

        const documents = await cursor.toArray();

        return documents.map((document) => ({
            datasetId: document.datasetId,
            timestamp: document.timestamp,
            symbol: document.symbol,
            open: document.open,
            high: document.high,
            low: document.low,
            close: document.close,
            volume: document.volume,
        }));
    }

    async insertBars(
        bars: MarketBar[],
    ): Promise<number> {
        if (bars.length === 0) {
            return 0;
        }

        const documents: MarketBarDocument[] = bars.map(
            (bar) => ({
                datasetId: bar.datasetId,
                timestamp: bar.timestamp,
                symbol: bar.symbol.toUpperCase(),
                open: bar.open,
                high: bar.high,
                low: bar.low,
                close: bar.close,
                volume: bar.volume,
            }),
        );

        const result =
            await this.collection.insertMany(documents);

        return result.insertedCount;
    }
}
