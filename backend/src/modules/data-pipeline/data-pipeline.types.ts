import type { Dataset } from "../../infrastructure/database/repositories/DatasetRepository.js";
import type { MarketBar } from "../../infrastructure/database/repositories/MarketDataRepository.js";

export type PipelineStageName =
  | "ingestion"
  | "schema_detection"
  | "validation"
  | "normalization"
  | "timestamp_normalization"
  | "symbol_normalization"
  | "deduplication"
  | "persistence";

export type PipelineStageStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed";

export interface PipelineStageResult {
  name: PipelineStageName;
  status: PipelineStageStatus;
  startedAt?: Date | undefined;
  completedAt?: Date | undefined;
  inputRows?: number | undefined;
  outputRows?: number | undefined;
  error?: string | undefined;
}

export type PipelineFormat = "csv" | "json";

export interface RawMarketBarRecord {
  timestamp: string | number;
  symbol?: string | undefined;
  open: number | string;
  high: number | string;
  low: number | string;
  close: number | string;
  volume: number | string;
}

export interface ParsedFileData {
  format: PipelineFormat;
  fileName: string;
  records: RawMarketBarRecord[];
  inferredSymbol?: string | undefined;
}

export interface IngestionMetadataInput {
  name?: string | undefined;
  symbol?: string | undefined;
  timeframe?: string | undefined;
  source?: string | undefined;
  description?: string | undefined;
}

export interface UploadDatasetPayload {
  fileBuffer: Buffer;
  fileName: string;
  contentType?: string | undefined;
  metadata?: IngestionMetadataInput | undefined;
}

export interface DataPipelineResult {
  pipelineId: string;
  datasetId?: string | undefined;
  dataset?: Dataset | undefined;
  status: "completed" | "failed";
  fileName: string;
  format: PipelineFormat;
  totalRows: number;
  processedRows: number;
  duplicateRows: number;
  rejectedRows: number;
  stages: PipelineStageResult[];
  warnings: string[];
  errors: string[];
  preview?: MarketBar[] | undefined;
  createdAt: Date;
  completedAt?: Date | undefined;
}
