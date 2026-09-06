import type { MarketAnalysisResponse } from "./market.types";

const API_BASE_URL = "http://localhost:8000";

const MARKET_DATA_FILE = "../data/samples/reliance-market-bar-v1.csv";

export async function fetchMarketAnalysis(): Promise<MarketAnalysisResponse> {
  const url =
    `${API_BASE_URL}/api/market/analyze` +
    `?file=${encodeURIComponent(MARKET_DATA_FILE)}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Market API request failed: ${response.status}`);
  }

  const result = (await response.json()) as MarketAnalysisResponse;

  if (!result.success) {
    throw new Error("Market analysis failed.");
  }

  return result;
}
