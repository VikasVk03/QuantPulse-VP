import type {
    CreateDatasetInput,
    Dataset,
    DatasetRepository,
} from "../../infrastructure/database/repositories/DatasetRepository.js";

export class DatasetService {
    constructor(
        private readonly repository: DatasetRepository,
    ) { }

    async getById(id: string): Promise<Dataset | null> {
        return this.repository.findById(id);
    }

    async getAll(): Promise<Dataset[]> {
        return this.repository.findAll();
    }

    async create(input: CreateDatasetInput): Promise<Dataset> {
        if (!input.name.trim()) {
            throw new Error("Dataset name is required");
        }

        if (!input.symbol.trim()) {
            throw new Error("Dataset symbol is required");
        }

        if (!input.timeframe.trim()) {
            throw new Error("Dataset timeframe is required");
        }

        if (!input.source.trim()) {
            throw new Error("Dataset source is required");
        }

        return this.repository.create({
            name: input.name.trim(),
            symbol: input.symbol.trim().toUpperCase(),
            timeframe: input.timeframe.trim(),
            source: input.source.trim(),
            ...(input.description !== undefined
                ? {
                    description: input.description.trim(),
                }
                : {}),
        });
    }

    async deleteById(id: string): Promise<boolean> {
        return this.repository.deleteById(id);
    }
}
