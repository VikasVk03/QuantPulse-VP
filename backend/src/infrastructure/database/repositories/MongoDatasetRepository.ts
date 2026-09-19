import { randomUUID } from "node:crypto";

import type {
    Collection,
    WithId,
} from "mongodb";

import { getMongoDB } from "../mongodb.js";

import type {
    CreateDatasetInput,
    Dataset,
    DatasetRepository,
} from "./DatasetRepository.js";

interface DatasetDocument {
    id: string;
    name: string;
    symbol: string;
    timeframe: string;
    source: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

export class MongoDatasetRepository implements DatasetRepository {
    private readonly collection: Collection<DatasetDocument>;

    constructor() {
        this.collection = getMongoDB().collection<DatasetDocument>(
            "datasets",
        );
    }

    async findById(id: string): Promise<Dataset | null> {
        const document = await this.collection.findOne({ id });

        return document ? this.toDataset(document) : null;
    }

    async findAll(): Promise<Dataset[]> {
        const documents = await this.collection
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        return documents.map((document) =>
            this.toDataset(document),
        );
    }

    async create(input: CreateDatasetInput): Promise<Dataset> {
        const now = new Date();

        const dataset: DatasetDocument = {
            id: randomUUID(),
            name: input.name,
            symbol: input.symbol,
            timeframe: input.timeframe,
            source: input.source,
            ...(input.description !== undefined
                ? { description: input.description }
                : {}),
            createdAt: now,
            updatedAt: now,
        };

        const result = await this.collection.insertOne(dataset);

        return this.toDataset({
            ...dataset,
            _id: result.insertedId,
        });
    }

    async deleteById(id: string): Promise<boolean> {
        const result = await this.collection.deleteOne({ id });

        return result.deletedCount === 1;
    }

    private toDataset(
        document: WithId<DatasetDocument>,
    ): Dataset {
        return {
            id: document.id,
            name: document.name,
            symbol: document.symbol,
            timeframe: document.timeframe,
            source: document.source,
            ...(document.description !== undefined
                ? {
                    description: document.description,
                }
                : {}),
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
        };
    }
}
