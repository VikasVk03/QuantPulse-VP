import type { MarketBarInput } from "../../../infrastructure/database/repositories/MarketDataRepository.js";

export interface DeduplicationStageResult {
  deduplicatedBars: MarketBarInput[];
  inputRows: number;
  duplicateRows: number;
  outputRows: number;
}

export function runDeduplicationStage(
  bars: MarketBarInput[],
): DeduplicationStageResult {
  const inputRows = bars.length;
  const seen = new Set<string>();
  const deduplicatedBars: MarketBarInput[] = [];

  for (const bar of bars) {
    const key = `${bar.symbol}::${bar.timestamp.getTime()}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduplicatedBars.push(bar);
    }
  }

  // Sort chronologically ascending
  deduplicatedBars.sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
  );

  const outputRows = deduplicatedBars.length;
  const duplicateRows = inputRows - outputRows;

  return {
    deduplicatedBars,
    inputRows,
    duplicateRows,
    outputRows,
  };
}
