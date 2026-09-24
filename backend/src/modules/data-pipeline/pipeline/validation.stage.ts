import type { RawMarketBarRecord } from "../data-pipeline.types.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { sanitizeNumericString } from "../parsers/csv.parser.js";

export interface ValidationStageResult {
  validRecords: RawMarketBarRecord[];
  errors: string[];
  warnings: string[];
}

/**
 * Robust date parser supporting ISO, RFC, DD/MM/YYYY, DD-MMM-YYYY, and Unix epoch (s/ms)
 */
function parseMarketDate(rawTimestamp: unknown): Date | null {
  if (rawTimestamp === null || rawTimestamp === undefined) {
    return null;
  }

  // If already a number
  if (typeof rawTimestamp === "number") {
    if (!Number.isFinite(rawTimestamp) || rawTimestamp <= 0) return null;
    const ms = rawTimestamp < 1e11 ? rawTimestamp * 1000 : rawTimestamp;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const str = String(rawTimestamp).trim();
  if (!str) return null;

  // Numeric string timestamp
  const numericTs = Number(str);
  if (!Number.isNaN(numericTs) && numericTs > 0 && /^\d+$/.test(str)) {
    const ms = numericTs < 1e11 ? numericTs * 1000 : numericTs;
    const d = new Date(ms);
    if (!Number.isNaN(d.getTime())) return d;
  }

  // Standard JS Date parse (handles ISO8601, 'Sep 22, 2026', '2026-09-22', etc.)
  const parsedStandard = new Date(str);
  if (!Number.isNaN(parsedStandard.getTime())) {
    return parsedStandard;
  }

  // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const ddmmyyyyMatch = str.match(
    /^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/,
  );
  if (ddmmyyyyMatch) {
    const day = parseInt(ddmmyyyyMatch[1]!, 10);
    const month = parseInt(ddmmyyyyMatch[2]!, 10) - 1;
    const year = parseInt(ddmmyyyyMatch[3]!, 10);
    const hours = ddmmyyyyMatch[4] ? parseInt(ddmmyyyyMatch[4], 10) : 0;
    const minutes = ddmmyyyyMatch[5] ? parseInt(ddmmyyyyMatch[5], 10) : 0;
    const seconds = ddmmyyyyMatch[6] ? parseInt(ddmmyyyyMatch[6], 10) : 0;

    const d = new Date(Date.UTC(year, month, day, hours, minutes, seconds));
    if (!Number.isNaN(d.getTime())) return d;
  }

  return null;
}

export function runValidationStage(
  records: RawMarketBarRecord[],
  defaultSymbol?: string,
): ValidationStageResult {
  if (!records || records.length === 0) {
    throw new AppError(400, "Validation stage received 0 records");
  }

  const errors: string[] = [];
  const warnings: string[] = [];
  const validRecords: RawMarketBarRecord[] = [];

  records.forEach((record, index) => {
    const rowNum = index + 1;
    const symbol = (record.symbol || defaultSymbol || "MARKET_DATA")
      .trim()
      .toUpperCase();

    if (!symbol) {
      errors.push(`Row ${rowNum}: Symbol is required`);
      return;
    }

    // Timestamp check
    const dateVal = parseMarketDate(record.timestamp);
    if (!dateVal) {
      errors.push(`Row ${rowNum}: Invalid timestamp '${record.timestamp}'`);
      return;
    }

    // Numeric checks
    const rawOpen = sanitizeNumericString(record.open);
    const rawHigh = sanitizeNumericString(record.high);
    const rawLow = sanitizeNumericString(record.low);
    const rawClose = sanitizeNumericString(record.close);
    const rawVolume = sanitizeNumericString(record.volume, true);

    let open = Number(rawOpen);
    let high = Number(rawHigh);
    let low = Number(rawLow);
    let close = Number(rawClose);
    const volume = Number(rawVolume);

    if (
      !Number.isFinite(open) ||
      !Number.isFinite(high) ||
      !Number.isFinite(low) ||
      !Number.isFinite(close) ||
      !Number.isFinite(volume)
    ) {
      errors.push(
        `Row ${rowNum}: OHLCV values must all be finite numbers (open=${record.open}, high=${record.high}, low=${record.low}, close=${record.close}, volume=${record.volume})`,
      );
      return;
    }

    if (open <= 0 || high <= 0 || low <= 0 || close <= 0) {
      errors.push(`Row ${rowNum}: OHLC values must be strictly positive`);
      return;
    }

    if (volume < 0) {
      errors.push(`Row ${rowNum}: Volume cannot be negative`);
      return;
    }

    if (high < low) {
      errors.push(
        `Row ${rowNum}: High (${high}) cannot be lower than Low (${low})`,
      );
      return;
    }

    // Provider rounding tolerance / auto-adjustment
    if (open > high || close > high || open < low || close < low) {
      const actualMax = Math.max(high, open, close);
      const actualMin = Math.min(low, open, close);

      // If deviation is small (< 1%), adjust and record warning
      if (actualMax <= high * 1.01 && actualMin >= low * 0.99) {
        warnings.push(
          `Row ${rowNum}: Adjusted bounds to include open/close (High: ${high}->${actualMax}, Low: ${low}->${actualMin})`,
        );
        high = actualMax;
        low = actualMin;
      } else {
        errors.push(
          `Row ${rowNum}: Open (${open}) or Close (${close}) out of High (${high}) / Low (${low}) bounds`,
        );
        return;
      }
    }

    validRecords.push({
      timestamp: dateVal.toISOString(),
      symbol,
      open,
      high,
      low,
      close,
      volume,
    });
  });

  if (errors.length > 0) {
    throw new AppError(
      400,
      `Validation failed on ${errors.length} record(s): ${errors.slice(0, 5).join("; ")}${errors.length > 5 ? ` and ${errors.length - 5} more` : ""}`,
    );
  }

  return {
    validRecords,
    errors,
    warnings,
  };
}
