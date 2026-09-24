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

export interface PipelineStage {
  name: PipelineStageName;
  status: PipelineStageStatus;
  startedAt?: string;
  completedAt?: string;
  inputRows?: number;
  outputRows?: number;
  error?: string;
}

export type PipelineFormat = "csv" | "json";

export interface DatasetPreviewRow {
  datasetId: string;
  timestamp: string;
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface DatasetMetadata {
  id: string;
  name: string;
  symbol: string;
  timeframe: string;
  source: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineResult {
  pipelineId: string;
  datasetId?: string;
  dataset?: DatasetMetadata;
  status: "completed" | "failed";
  fileName: string;
  format: PipelineFormat;
  totalRows: number;
  processedRows: number;
  duplicateRows: number;
  rejectedRows: number;
  stages: PipelineStage[];
  warnings: string[];
  errors: string[];
  preview?: DatasetPreviewRow[];
  createdAt: string;
  completedAt?: string;
}

export interface UploadDatasetRequest {
  file: File;
  name?: string;
  symbol?: string;
  timeframe?: string;
  source?: string;
  description?: string;
}

export interface UploadDatasetApiResponse {
  success: boolean;
  data: PipelineResult;
  error?: string;
}
