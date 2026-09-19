export interface MarketBar {
    datasetId: string;
    timestamp: Date;
    symbol: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface MarketBarInput {
    timestamp: Date;
    symbol: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface MarketBarQuery {
    datasetId: string;
    symbol?: string;
    startTime?: Date;
    endTime?: Date;
    limit?: number;
}

export interface MarketDataRepository {
    getBars(query: MarketBarQuery): Promise<MarketBar[]>;

    insertBars(
        bars: MarketBar[],
    ): Promise<number>;
}
