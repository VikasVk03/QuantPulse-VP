import { randomUUID } from "node:crypto";

import type { Collection } from "mongodb";

import { getMongoDB } from "../mongodb.js";

import type { AnalyticsDocument } from "../models/Analytics.js";

import type {
    Analytics,
    AnalyticsSeriesPoint,
} from "../../../modules/analytics/analytics.types.js";

import type {
    AnalyticsRepository,
    CreateAnalyticsInput,
} from "./AnalyticsRepository.js";

export class MongoAnalyticsRepository implements AnalyticsRepository {
    private readonly collection: Collection<AnalyticsDocument>;

    constructor() {
        this.collection = getMongoDB().collection<AnalyticsDocument>(
            "analytics",
        );
    }

    async ensureIndexes(): Promise<void> {
        await this.collection.createIndex(
            { datasetId: 1, createdAt: -1 },
        );
    }

    async create(input: CreateAnalyticsInput): Promise<Analytics> {
        const analytics: AnalyticsDocument = {
            id: randomUUID(),

            datasetId: input.datasetId,

            symbol: input.symbol,

            timeframe: input.timeframe,

            type: "market",

            observationCount: input.observationCount,

            firstPrice: input.firstPrice,

            lastPrice: input.lastPrice,

            totalVolume: input.totalVolume,

            averageVolume: input.averageVolume,

            returnPercentage: input.returnPercentage,

            volatility: input.volatility,

            series: input.series,

            createdAt: new Date(),
        };

        await this.collection.insertOne(analytics);

        return this.toAnalytics(analytics);
    }

    async getAll(): Promise<Analytics[]> {
        const documents = await this.collection
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        return documents.map((document) => this.toAnalytics(document));
    }

    async getById(id: string): Promise<Analytics | null> {
        const document = await this.collection.findOne({ id });

        return document ? this.toAnalytics(document) : null;
    }

    async getByDatasetId(datasetId: string): Promise<Analytics[]> {
        const documents = await this.collection
            .find({ datasetId })
            .sort({ createdAt: -1 })
            .toArray();

        return documents.map((document) => this.toAnalytics(document));
    }

    async deleteById(id: string): Promise<boolean> {
        const result = await this.collection.deleteOne({ id });

        return result.deletedCount === 1;
    }

    private toAnalytics(document: AnalyticsDocument): Analytics {
        return {
            id: document.id,

            datasetId: document.datasetId,

            symbol: document.symbol,

            timeframe: document.timeframe,

            type: document.type,

            observationCount: document.observationCount,

            firstPrice: document.firstPrice,

            lastPrice: document.lastPrice,

            totalVolume: document.totalVolume,

            averageVolume: document.averageVolume,

            returnPercentage: document.returnPercentage,

            volatility: document.volatility,

            series: document.series.map(
                (point): AnalyticsSeriesPoint => ({
                    timestamp: point.timestamp,
                    open: point.open,
                    high: point.high,
                    low: point.low,
                    close: point.close,
                    volume: point.volume,
                }),
            ),

            createdAt: document.createdAt,
        };
    }
}
