import type { ObjectId } from "mongodb";

export interface MarketDataDocument {
    _id?: ObjectId;

    datasetId: string;

    timestamp: Date;

    symbol: string;

    open: number;

    high: number;

    low: number;

    close: number;

    volume: number;
}
