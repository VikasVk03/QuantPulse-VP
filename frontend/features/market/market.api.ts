import type { DatasetListItem, MarketAnalysisResponse } from "./market.types";

const API_BASE_URL = "http://localhost:8000";

const DEFAULT_SAMPLE_FILE = "../data/samples/reliance-market-bar-v1.csv";

/**
 * Fetch all available datasets from MongoDB
 */
export async function fetchDatasets(): Promise<DatasetListItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/datasets`);
    if (!response.ok) {
      throw new Error(`Failed to fetch datasets: ${response.status}`);
    }
    const result = await response.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.warn("Could not fetch datasets from backend:", error);
    return [];
  }
}

/**
 * Run C++ quantitative analysis on a specific persisted dataset
 */
export async function fetchDatasetAnalytics(
  datasetId: string,
): Promise<MarketAnalysisResponse> {
  const url = `${API_BASE_URL}/api/analytics/datasets/${encodeURIComponent(datasetId)}`;
  const response = await fetch(url);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.error ||
        `Analytics request failed with status ${response.status}`,
    );
  }

  const result = (await response.json()) as MarketAnalysisResponse;
  if (!result.success) {
    throw new Error("Market analysis failed.");
  }

  return result;
}

/**
 * Fallback to legacy file-based market analysis if needed
 */
export async function fetchMarketAnalysis(
  filePath: string = DEFAULT_SAMPLE_FILE,
): Promise<MarketAnalysisResponse> {
  const url =
    `${API_BASE_URL}/api/market/analyze` +
    `?file=${encodeURIComponent(filePath)}`;

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
