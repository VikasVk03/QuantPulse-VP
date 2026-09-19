export interface Dataset {
    id: string;
    name: string;
    symbol: string;
    timeframe: string;
    source: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateDatasetInput {
    name: string;
    symbol: string;
    timeframe: string;
    source: string;
    description?: string;
}

export interface DatasetRepository {
    findById(id: string): Promise<Dataset | null>;

    findAll(): Promise<Dataset[]>;

    create(input: CreateDatasetInput): Promise<Dataset>;

    deleteById(id: string): Promise<boolean>;
}
