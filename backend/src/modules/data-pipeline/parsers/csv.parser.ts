import type { RawMarketBarRecord } from "../data-pipeline.types.js";
import { AppError } from "../../../shared/errors/AppError.js";

const DELIMITERS = [",", "\t", ";", "|"];

/**
 * Detect the delimiter used in the CSV/TSV content by checking candidate counts
 */
function detectDelimiter(lines: string[]): string {
  const sampleLines = lines.slice(0, Math.min(lines.length, 10));
  let bestDelimiter = ",";
  let maxConsistentCols = 0;

  for (const delim of DELIMITERS) {
    const colCounts = sampleLines.map(
      (l) => parseCsvLineWithDelimiter(l, delim).length,
    );
    const minCols = Math.min(...colCounts);
    const maxCols = Math.max(...colCounts);

    // Delimiter is consistent if minCols === maxCols and gives at least 2 columns
    if (minCols > 1 && minCols === maxCols && minCols > maxConsistentCols) {
      maxConsistentCols = minCols;
      bestDelimiter = delim;
    }
  }

  // Fallback if not all lines have exact same count (e.g. trailing empty values)
  if (maxConsistentCols === 0) {
    for (const delim of DELIMITERS) {
      const headerCols = parseCsvLineWithDelimiter(
        sampleLines[0] || "",
        delim,
      ).length;
      if (headerCols > maxConsistentCols && headerCols > 1) {
        maxConsistentCols = headerCols;
        bestDelimiter = delim;
      }
    }
  }

  return bestDelimiter;
}

function parseCsvLineWithDelimiter(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

const COLUMN_ALIASES = {
  timestamp: [
    "timestamp",
    "time",
    "date",
    "datetime",
    "tradedate",
    "tradedate",
    "trade_date",
    "dt",
    "epoch",
    "timestamp_utc",
  ],
  symbol: [
    "symbol",
    "ticker",
    "stock",
    "instrument",
    "name",
    "scrip",
    "code",
    "tradingsymbol",
  ],
  open: ["open", "open_price", "openprice", "op"],
  high: ["high", "high_price", "highprice", "hi"],
  low: ["low", "low_price", "lowprice", "lo"],
  close: [
    "close",
    "close_price",
    "closeprice",
    "last",
    "last_price",
    "lastprice",
    "settle",
    "settlement",
    "adj_close",
    "adjclose",
    "adjusted_close",
  ],
  volume: [
    "volume",
    "vol",
    "v",
    "qty",
    "quantity",
    "shares",
    "sharestraded",
    "shares_traded",
    "totaltradedqty",
    "trade_qty",
    "volume_traded",
  ],
};

function normalizeHeaderName(header: string): string {
  return header
    .toLowerCase()
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function findColumnIndex(
  normalizedHeaders: string[],
  aliases: string[],
): number {
  // First look for exact match in order of aliases
  for (const alias of aliases) {
    const cleanAlias = alias.replace(/[^a-z0-9]/g, "");
    const idx = normalizedHeaders.indexOf(cleanAlias);
    if (idx !== -1) {
      return idx;
    }
  }

  // Fallback: check if header starts with or contains the alias
  for (const alias of aliases) {
    const cleanAlias = alias.replace(/[^a-z0-9]/g, "");
    const idx = normalizedHeaders.findIndex(
      (h) => h === cleanAlias || h.startsWith(cleanAlias),
    );
    if (idx !== -1) {
      return idx;
    }
  }

  return -1;
}

/**
 * Clean numeric string from commas, currency symbols, and handle '-' or empty
 */
export function sanitizeNumericString(
  value: unknown,
  isVolume = false,
): string {
  if (value === null || value === undefined) {
    return isVolume ? "0" : "";
  }

  const str = String(value).trim();
  if (
    str === "-" ||
    str === "N/A" ||
    str === "NA" ||
    str === "null" ||
    str === ""
  ) {
    return isVolume ? "0" : "";
  }

  // Strip commas, spaces, currency symbols ($, ₹, €, £)
  return str.replace(/[,\s$₹€£]/g, "");
}

export function parseCsvContent(
  content: string,
  defaultSymbol?: string | undefined,
): { records: RawMarketBarRecord[]; inferredSymbol?: string | undefined } {
  const trimmed = content.trim();

  if (!trimmed) {
    throw new AppError(400, "Uploaded CSV file is empty");
  }

  const lines = trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    throw new AppError(400, "Uploaded CSV file contains no data");
  }

  const delimiter = detectDelimiter(lines);
  const headerLine = lines[0]!;
  const rawHeaders = parseCsvLineWithDelimiter(headerLine, delimiter);
  const normalizedHeaders = rawHeaders.map(normalizeHeaderName);

  // Find column indices using alias dictionary
  const timestampIdx = findColumnIndex(
    normalizedHeaders,
    COLUMN_ALIASES.timestamp,
  );
  const symbolIdx = findColumnIndex(normalizedHeaders, COLUMN_ALIASES.symbol);
  const openIdx = findColumnIndex(normalizedHeaders, COLUMN_ALIASES.open);
  const highIdx = findColumnIndex(normalizedHeaders, COLUMN_ALIASES.high);
  const lowIdx = findColumnIndex(normalizedHeaders, COLUMN_ALIASES.low);
  const closeIdx = findColumnIndex(normalizedHeaders, COLUMN_ALIASES.close);
  const volumeIdx = findColumnIndex(normalizedHeaders, COLUMN_ALIASES.volume);

  const missingColumns: string[] = [];
  if (timestampIdx === -1) missingColumns.push("timestamp (Date/Time)");
  if (openIdx === -1) missingColumns.push("open");
  if (highIdx === -1) missingColumns.push("high");
  if (lowIdx === -1) missingColumns.push("low");
  if (closeIdx === -1) missingColumns.push("close");
  if (volumeIdx === -1) missingColumns.push("volume");

  if (missingColumns.length > 0) {
    throw new AppError(
      400,
      `Missing required column(s) in CSV header: ${missingColumns.join(", ")}. Found headers: [${rawHeaders.join(", ")}]`,
    );
  }

  if (symbolIdx === -1 && !defaultSymbol) {
    // If no symbol column and no defaultSymbol, we will default to "MARKET_DATA" or let ingestion stage infer from filename
  }

  const records: RawMarketBarRecord[] = [];
  let inferredSymbol: string | undefined = defaultSymbol;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]!;
    const cols = parseCsvLineWithDelimiter(line, delimiter);

    // Skip empty lines
    if (cols.length === 1 && cols[0] === "") {
      continue;
    }

    const minRequiredCols =
      Math.max(
        timestampIdx,
        openIdx,
        highIdx,
        lowIdx,
        closeIdx,
        volumeIdx,
        symbolIdx,
      ) + 1;

    const isCorporateAction =
      line.toLowerCase().includes("dividend") ||
      line.toLowerCase().includes("split") ||
      line.toLowerCase().includes("bonus") ||
      line.toLowerCase().includes("capital gain");

    if (cols.length < minRequiredCols) {
      if (isCorporateAction) {
        // Skip corporate action annotation rows in stock feeds
        continue;
      }

      throw new AppError(
        400,
        `Malformed CSV row at line ${i + 1}: expected at least ${minRequiredCols} columns, found ${cols.length}`,
      );
    }

    const symbolVal =
      symbolIdx !== -1
        ? cols[symbolIdx] || defaultSymbol || ""
        : defaultSymbol || "";

    if (!inferredSymbol && symbolVal && symbolVal.trim() !== "") {
      inferredSymbol = symbolVal.trim();
    }

    const rawTimestamp = cols[timestampIdx] ?? "";
    const rawOpen = sanitizeNumericString(cols[openIdx]);
    const rawHigh = sanitizeNumericString(cols[highIdx]);
    const rawLow = sanitizeNumericString(cols[lowIdx]);
    const rawClose = sanitizeNumericString(cols[closeIdx]);
    const rawVolume = sanitizeNumericString(cols[volumeIdx], true);

    records.push({
      timestamp: rawTimestamp,
      symbol: symbolVal,
      open: rawOpen,
      high: rawHigh,
      low: rawLow,
      close: rawClose,
      volume: rawVolume,
    });
  }

  if (records.length === 0) {
    throw new AppError(400, "Uploaded CSV file contains no data rows");
  }

  return { records, inferredSymbol };
}
