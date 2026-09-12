import type {
    Analytics,
    AnalyticsSeriesPoint,
} from "../../../modules/analytics/analytics.types.js";

export interface CreateAnalyticsInput {
    datasetId: string;
    symbol: string;
    timeframe: string;

    observationCount: number;
    firstPrice: number;
    lastPrice: number;
    totalVolume: number;
    averageVolume: number;
    returnPercentage: number;
    volatility: number;

    series: AnalyticsSeriesPoint[];
}

export interface AnalyticsRepository {
    create(input: CreateAnalyticsInput): Promise<Analytics>;

    getAll(): Promise<Analytics[]>;

    getById(id: string): Promise<Analytics | null>;

    getByDatasetId(datasetId: string): Promise<Analytics[]>;

    deleteById(id: string): Promise<boolean>;
}
