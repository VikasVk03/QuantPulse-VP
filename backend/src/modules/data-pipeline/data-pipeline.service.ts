import { randomUUID } from "node:crypto";

import type { DatasetRepository } from "../../infrastructure/database/repositories/DatasetRepository.js";
import type { MarketDataRepository } from "../../infrastructure/database/repositories/MarketDataRepository.js";
import { AppError } from "../../shared/errors/AppError.js";
import { logger } from "../../shared/logger/logger.js";
import type {
  DataPipelineResult,
  PipelineStageResult,
  UploadDatasetPayload,
} from "./data-pipeline.types.js";
import { runIngestionStage } from "./pipeline/ingestion.stage.js";
import { runValidationStage } from "./pipeline/validation.stage.js";
import { runNormalizationStage } from "./pipeline/normalization.stage.js";
import { runDeduplicationStage } from "./pipeline/deduplication.stage.js";
import { runPersistenceStage } from "./pipeline/persistence.stage.js";

export class DataPipelineService {
  private readonly pipelineRuns = new Map<string, DataPipelineResult>();

  constructor(
    private readonly datasetRepository: DatasetRepository,
    private readonly marketDataRepository: MarketDataRepository,
  ) {}

  async processUpload(
    payload: UploadDatasetPayload,
  ): Promise<DataPipelineResult> {
    const pipelineId = randomUUID();
    const createdAt = new Date();

    const stages: PipelineStageResult[] = [
      { name: "ingestion", status: "pending" },
      { name: "schema_detection", status: "pending" },
      { name: "validation", status: "pending" },
      { name: "normalization", status: "pending" },
      { name: "timestamp_normalization", status: "pending" },
      { name: "symbol_normalization", status: "pending" },
      { name: "deduplication", status: "pending" },
      { name: "persistence", status: "pending" },
    ];

    const warnings: string[] = [];
    const errors: string[] = [];

    const updateStage = (
      name: PipelineStageResult["name"],
      update: Partial<PipelineStageResult>,
    ) => {
      const stage = stages.find((s) => s.name === name);
      if (stage) {
        Object.assign(stage, update);
      }
    };

    let currentStageName: PipelineStageResult["name"] = "ingestion";

    logger.info("ETL:START", `Starting pipeline ${pipelineId} for file "${payload.fileName}"`);

    try {
      // 1. Ingestion & Schema Detection
      updateStage("ingestion", { status: "running", startedAt: new Date() });
      const parsedData = runIngestionStage(payload);
      const totalRows = parsedData.records.length;

      logger.info("ETL:INGEST", `Parsed ${totalRows} records from ${payload.fileName} (format: ${parsedData.format}, inferredSymbol: ${parsedData.inferredSymbol})`);

      updateStage("ingestion", {
        status: "completed",
        completedAt: new Date(),
        inputRows: totalRows,
        outputRows: totalRows,
      });

      currentStageName = "schema_detection";
      updateStage("schema_detection", {
        status: "completed",
        startedAt: new Date(),
        completedAt: new Date(),
        inputRows: totalRows,
        outputRows: totalRows,
      });

      // 2. Validation
      currentStageName = "validation";
      updateStage("validation", {
        status: "running",
        startedAt: new Date(),
        inputRows: totalRows,
      });

      const validationResult = runValidationStage(
        parsedData.records,
        parsedData.inferredSymbol,
      );

      warnings.push(...validationResult.warnings);

      updateStage("validation", {
        status: "completed",
        completedAt: new Date(),
        outputRows: validationResult.validRecords.length,
      });

      // 3. Normalization (Data, Timestamp, Symbol)
      currentStageName = "normalization";
      updateStage("normalization", {
        status: "running",
        startedAt: new Date(),
        inputRows: validationResult.validRecords.length,
      });

      const normalizedBars = runNormalizationStage(
        validationResult.validRecords,
        parsedData.inferredSymbol,
      );

      updateStage("normalization", {
        status: "completed",
        completedAt: new Date(),
        outputRows: normalizedBars.length,
      });

      updateStage("timestamp_normalization", {
        status: "completed",
        startedAt: new Date(),
        completedAt: new Date(),
        inputRows: normalizedBars.length,
        outputRows: normalizedBars.length,
      });

      updateStage("symbol_normalization", {
        status: "completed",
        startedAt: new Date(),
        completedAt: new Date(),
        inputRows: normalizedBars.length,
        outputRows: normalizedBars.length,
      });

      // 4. Deduplication
      currentStageName = "deduplication";
      updateStage("deduplication", {
        status: "running",
        startedAt: new Date(),
        inputRows: normalizedBars.length,
      });

      const dedupResult = runDeduplicationStage(normalizedBars);

      updateStage("deduplication", {
        status: "completed",
        completedAt: new Date(),
        outputRows: dedupResult.outputRows,
      });

      // 5. Persistence
      currentStageName = "persistence";
      updateStage("persistence", {
        status: "running",
        startedAt: new Date(),
        inputRows: dedupResult.outputRows,
      });

      const persistenceResult = await runPersistenceStage({
        deduplicatedBars: dedupResult.deduplicatedBars,
        metadata: payload.metadata,
        inferredSymbol: parsedData.inferredSymbol,
        fileName: payload.fileName,
        datasetRepository: this.datasetRepository,
        marketDataRepository: this.marketDataRepository,
      });

      updateStage("persistence", {
        status: "completed",
        completedAt: new Date(),
        outputRows: persistenceResult.insertedCount,
      });

      logger.info("ETL:SUCCESS", `Pipeline ${pipelineId} completed: saved ${persistenceResult.insertedCount} bars for dataset "${persistenceResult.dataset.name}" (ID: ${persistenceResult.dataset.id})`);

      const finalResult: DataPipelineResult = {
        pipelineId,
        datasetId: persistenceResult.dataset.id,
        dataset: persistenceResult.dataset,
        status: "completed",
        fileName: payload.fileName,
        format: parsedData.format,
        totalRows,
        processedRows: persistenceResult.insertedCount,
        duplicateRows: dedupResult.duplicateRows,
        rejectedRows: 0,
        stages,
        warnings,
        errors,
        preview: persistenceResult.persistedBars,
        createdAt,
        completedAt: new Date(),
      };

      this.pipelineRuns.set(pipelineId, finalResult);
      return finalResult;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error("ETL:ERROR", `Pipeline ${pipelineId} failed at stage [${currentStageName}]: ${errorMsg}`, error);

      errors.push(errorMsg);
      updateStage(currentStageName, {
        status: "failed",
        completedAt: new Date(),
        error: errorMsg,
      });

      const failedResult: DataPipelineResult = {
        pipelineId,
        status: "failed",
        fileName: payload.fileName,
        format: payload.fileName.endsWith(".json") ? "json" : "csv",
        totalRows: 0,
        processedRows: 0,
        duplicateRows: 0,
        rejectedRows: 0,
        stages,
        warnings,
        errors,
        createdAt,
        completedAt: new Date(),
      };

      this.pipelineRuns.set(pipelineId, failedResult);

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        500,
        `Pipeline failed at stage '${currentStageName}': ${errorMsg}`,
      );
    }
  }

  getPipelineStatus(pipelineId: string): DataPipelineResult | null {
    return this.pipelineRuns.get(pipelineId) ?? null;
  }

  getPipelineResult(pipelineId: string): DataPipelineResult | null {
    return this.pipelineRuns.get(pipelineId) ?? null;
  }
}
