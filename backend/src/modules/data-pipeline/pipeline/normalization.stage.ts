import type { RawMarketBarRecord } from "../data-pipeline.types.js";
import type { MarketBarInput } from "../../../infrastructure/database/repositories/MarketDataRepository.js";

export function runNormalizationStage(
  records: RawMarketBarRecord[],
  defaultSymbol?: string,
): MarketBarInput[] {
  return records.map((record) => {
    const rawSymbol = (record.symbol || defaultSymbol || "").trim();
    const symbol = rawSymbol.toUpperCase();

    let timestamp: Date;
    if (typeof record.timestamp === "number") {
      const ms =
        record.timestamp < 1e11 ? record.timestamp * 1000 : record.timestamp;
      timestamp = new Date(ms);
    } else {
      const numericTs = Number(record.timestamp);
      if (!Number.isNaN(numericTs) && numericTs > 0) {
        const ms = numericTs < 1e11 ? numericTs * 1000 : numericTs;
        timestamp = new Date(ms);
      } else {
        timestamp = new Date(record.timestamp);
      }
    }

    return {
      timestamp,
      symbol,
      open: Number(record.open),
      high: Number(record.high),
      low: Number(record.low),
      close: Number(record.close),
      volume: Number(record.volume),
    };
  });
}
