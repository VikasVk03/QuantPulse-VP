import type { RawMarketBarRecord } from "../data-pipeline.types.js";
import { AppError } from "../../../shared/errors/AppError.js";

export function parseJsonContent(
  content: string | unknown,
  defaultSymbol?: string | undefined,
): { records: RawMarketBarRecord[]; inferredSymbol?: string | undefined } {
  let parsed: unknown;

  if (typeof content === "string") {
    const trimmed = content.trim();
    if (!trimmed) {
      throw new AppError(400, "Uploaded JSON file is empty");
    }
    try {
      parsed = JSON.parse(trimmed);
    } catch (err) {
      throw new AppError(
        400,
        `Invalid JSON payload: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  } else {
    parsed = content;
  }

  let recordsArray: unknown[] = [];
  let rootSymbol: string | undefined = defaultSymbol;

  if (Array.isArray(parsed)) {
    recordsArray = parsed;
  } else if (typeof parsed === "object" && parsed !== null) {
    const obj = parsed as Record<string, unknown>;
    if (typeof obj.symbol === "string" && obj.symbol.trim()) {
      rootSymbol = obj.symbol.trim();
    }

    if (Array.isArray(obj.bars)) {
      recordsArray = obj.bars;
    } else if (Array.isArray(obj.data)) {
      recordsArray = obj.data;
    } else {
      throw new AppError(
        400,
        "JSON object must contain a 'bars' or 'data' array",
      );
    }
  } else {
    throw new AppError(
      400,
      "JSON payload must be an array or an object with 'bars'",
    );
  }

  if (recordsArray.length === 0) {
    throw new AppError(400, "JSON payload contains no data records");
  }

  const records: RawMarketBarRecord[] = [];

  for (let i = 0; i < recordsArray.length; i++) {
    const item = recordsArray[i];

    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      throw new AppError(
        400,
        `Record at index ${i} is not a valid JSON object`,
      );
    }

    const bar = item as Record<string, unknown>;
    const symbolVal =
      typeof bar.symbol === "string" && bar.symbol.trim()
        ? bar.symbol.trim()
        : (rootSymbol ?? "");

    if (bar.timestamp === undefined || bar.timestamp === null) {
      throw new AppError(400, `Record at index ${i} is missing 'timestamp'`);
    }

    const numericFields = ["open", "high", "low", "close", "volume"] as const;
    for (const field of numericFields) {
      if (bar[field] === undefined || bar[field] === null) {
        throw new AppError(400, `Record at index ${i} is missing '${field}'`);
      }
    }

    records.push({
      timestamp: bar.timestamp as string | number,
      symbol: symbolVal,
      open: bar.open as number | string,
      high: bar.high as number | string,
      low: bar.low as number | string,
      close: bar.close as number | string,
      volume: bar.volume as number | string,
    });
  }

  return { records, inferredSymbol: rootSymbol };
}
