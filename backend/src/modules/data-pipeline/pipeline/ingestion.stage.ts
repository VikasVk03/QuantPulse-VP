import type {
  ParsedFileData,
  PipelineFormat,
  UploadDatasetPayload,
} from "../data-pipeline.types.js";
import { parseCsvContent } from "../parsers/csv.parser.js";
import { parseJsonContent } from "../parsers/json.parser.js";
import { AppError } from "../../../shared/errors/AppError.js";

/**
 * Infer ticker symbol from filename if not explicitly provided
 * e.g. "reliance-range-data.csv" -> "RELIANCE"
 * e.g. "AAPL_1d.json" -> "AAPL"
 */
function inferSymbolFromFileName(fileName: string): string {
  const baseName = fileName.replace(/\.[^/.]+$/, "");
  const firstToken = baseName.split(/[-_.\s]/)[0]?.trim();
  if (firstToken && firstToken.length > 0 && !/^\d+$/.test(firstToken)) {
    return firstToken.toUpperCase();
  }
  return "MARKET_DATA";
}

export function runIngestionStage(
  payload: UploadDatasetPayload,
): ParsedFileData {
  const { fileBuffer, fileName, contentType, metadata } = payload;

  if (!fileBuffer || fileBuffer.length === 0) {
    throw new AppError(400, "Uploaded file is empty");
  }

  const lowerName = fileName.toLowerCase();
  let format: PipelineFormat;

  if (lowerName.endsWith(".json") || contentType?.includes("json")) {
    format = "json";
  } else if (
    lowerName.endsWith(".csv") ||
    lowerName.endsWith(".tsv") ||
    lowerName.endsWith(".txt") ||
    contentType?.includes("csv") ||
    contentType?.includes("text/plain") ||
    contentType?.includes("tab-separated-values")
  ) {
    format = "csv";
  } else {
    // Attempt detection from content start
    const sample = fileBuffer.subarray(0, 50).toString("utf-8").trim();
    if (sample.startsWith("{") || sample.startsWith("[")) {
      format = "json";
    } else if (
      sample.includes(",") ||
      sample.includes("\t") ||
      sample.includes("\n")
    ) {
      format = "csv";
    } else {
      throw new AppError(
        400,
        `Unsupported file format for '${fileName}'. Supported formats: CSV, TSV, JSON.`,
      );
    }
  }

  const content = fileBuffer.toString("utf-8");
  const defaultSymbol =
    metadata?.symbol?.trim() || inferSymbolFromFileName(fileName);

  if (format === "csv") {
    const { records, inferredSymbol } = parseCsvContent(content, defaultSymbol);
    return {
      format,
      fileName,
      records,
      inferredSymbol: inferredSymbol || defaultSymbol,
    };
  }

  const { records, inferredSymbol } = parseJsonContent(content, defaultSymbol);
  return {
    format,
    fileName,
    records,
    inferredSymbol: inferredSymbol || defaultSymbol,
  };
}
