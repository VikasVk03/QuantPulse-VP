import { api } from "../../lib/apiClient";
import type { DatasetListItem, MarketAnalysisResponse } from "./market.types";

const DEFAULT_SAMPLE_FILE = "../data/samples/reliance-market-bar-v1.csv";

/**
 * Fetch all available datasets from MongoDB
 */
export async function fetchDatasets(): Promise<DatasetListItem[]> {
  try {
    const result = await api.datasets.list();
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
  const result = await api.analytics.getDatasetAnalytics(datasetId);

  if (!result || !result.success) {
    throw new Error(result?.error || "Market analysis failed.");
  }

  return result as MarketAnalysisResponse;
}

/**
 * Fallback to legacy file-based market analysis if needed
 */
export async function fetchMarketAnalysis(
  filePath: string = DEFAULT_SAMPLE_FILE,
): Promise<MarketAnalysisResponse> {
  const result = await api.get(
    `/api/market/analyze?file=${encodeURIComponent(filePath)}`,
  );

  if (!result || !result.success) {
    throw new Error(result?.error || "Market analysis failed.");
  }

  return result as MarketAnalysisResponse;
}
