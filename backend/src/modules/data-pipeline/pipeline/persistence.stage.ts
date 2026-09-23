import type {
  Dataset,
  DatasetRepository,
} from "../../../infrastructure/database/repositories/DatasetRepository.js";
import type {
  MarketBar,
  MarketBarInput,
  MarketDataRepository,
} from "../../../infrastructure/database/repositories/MarketDataRepository.js";
import type { IngestionMetadataInput } from "../data-pipeline.types.js";

export interface PersistenceStageInput {
  deduplicatedBars: MarketBarInput[];
  metadata?: IngestionMetadataInput | undefined;
  inferredSymbol?: string | undefined;
  fileName: string;
  datasetRepository: DatasetRepository;
  marketDataRepository: MarketDataRepository;
}

export interface PersistenceStageResult {
  dataset: Dataset;
  insertedCount: number;
  persistedBars: MarketBar[];
}

export async function runPersistenceStage(
  input: PersistenceStageInput,
): Promise<PersistenceStageResult> {
  const {
    deduplicatedBars,
    metadata,
    inferredSymbol,
    fileName,
    datasetRepository,
    marketDataRepository,
  } = input;

  const primarySymbol =
    metadata?.symbol?.trim().toUpperCase() ||
    inferredSymbol?.trim().toUpperCase() ||
    (deduplicatedBars[0]?.symbol
      ? deduplicatedBars[0].symbol.toUpperCase()
      : "UNKNOWN");

  const datasetName =
    metadata?.name?.trim() ||
    fileName.replace(/\.[^/.]+$/, "").trim() ||
    `${primarySymbol} Dataset`;

  const timeframe = metadata?.timeframe?.trim() || "1d";
  const source = metadata?.source?.trim() || "user-upload";
  const description =
    metadata?.description !== undefined
      ? metadata.description.trim()
      : `Imported from ${fileName}`;

  const dataset = await datasetRepository.create({
    name: datasetName,
    symbol: primarySymbol,
    timeframe,
    source,
    description,
  });

  const marketBars: MarketBar[] = deduplicatedBars.map((bar) => ({
    datasetId: dataset.id,
    timestamp: bar.timestamp,
    symbol: bar.symbol || primarySymbol,
    open: bar.open,
    high: bar.high,
    low: bar.low,
    close: bar.close,
    volume: bar.volume,
  }));

  const insertedCount = await marketDataRepository.insertBars(marketBars);

  return {
    dataset,
    insertedCount,
    persistedBars: marketBars,
  };
}
