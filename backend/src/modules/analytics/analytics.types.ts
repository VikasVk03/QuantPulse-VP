export interface AnalyticsSeriesPoint {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface Analytics {
    id: string;

    datasetId: string;

    symbol: string;

    timeframe: string;

    type: "market";

    observationCount: number;

    firstPrice: number;

    lastPrice: number;

    totalVolume: number;

    averageVolume: number;

    returnPercentage: number;

    volatility: number;

    series: AnalyticsSeriesPoint[];

    createdAt: Date;
}
