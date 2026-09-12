import type {
    Collection,
    Filter,
} from "mongodb";

import { getMongoDB } from "../mongodb.js";

import type { MarketDataDocument } from "../models/MarketData.js";

import type {
    MarketBar,
    MarketBarQuery,
    MarketDataRepository,
} from "./MarketDataRepository.js";



export class MongoMarketDataRepository
    implements MarketDataRepository {
    private readonly collection: Collection<MarketDataDocument>;

    constructor() {
        this.collection =
            getMongoDB().collection<MarketDataDocument>(
                "market_bars",
            );
    }

    async ensureIndexes(): Promise<void> {
        await this.collection.createIndex(
            {
                datasetId: 1,
                timestamp: 1,
            },
        );

        await this.collection.createIndex(
            {
                datasetId: 1,
                symbol: 1,
                timestamp: 1,
            },
        );
    }

    async getBars(
        query: MarketBarQuery,
    ): Promise<MarketBar[]> {
        const filter: Filter<MarketDataDocument> = {
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

        const documents: MarketDataDocument[] = bars.map(
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
