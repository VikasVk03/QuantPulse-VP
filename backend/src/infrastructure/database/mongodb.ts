import {
    MongoClient,
    type Db,
} from "mongodb";

import { config } from "../../config/env.js";

const client = new MongoClient(config.mongodb.uri);

let database: Db | null = null;

export const connectMongoDB = async (): Promise<Db> => {
    if (database) {
        return database;
    }

    await client.connect();

    database = client.db(config.mongodb.databaseName);

    await database.command({ ping: 1 });

    console.log(
        `MongoDB connected: ${config.mongodb.databaseName}`,
    );

    return database;
};

export const getMongoDB = (): Db => {
    if (!database) {
        throw new Error(
            "MongoDB has not been connected. Call connectMongoDB() first.",
        );
    }

    return database;
};

export const disconnectMongoDB = async (): Promise<void> => {
    await client.close();

    database = null;

    console.log("MongoDB disconnected");
};

export const ensureMongoIndexes = async (): Promise<void> => {
    const db = getMongoDB();

    await db.collection("datasets").createIndex(
        { id: 1 },
        { unique: true },
    );

    await db.collection("datasets").createIndex({
        symbol: 1,
        timeframe: 1,
    });

    await db.collection("market_bars").createIndex(
        {
            datasetId: 1,
            symbol: 1,
            timestamp: 1,
        },
        {
            unique: true,
        },
    );
};
