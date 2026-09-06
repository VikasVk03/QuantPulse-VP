export interface MarketSeriesPoint {
  timestamp: number;
  price: number;
  volume: number;
}

export interface MarketAnalyticsResult {
  symbol: string;
  observationCount: number;
  firstPrice: number;
  lastPrice: number;
  totalVolume: number;
  averageVolume: number;
  returnPercentage: number;
  volatility: number;
  series: MarketSeriesPoint[];
}

export interface MarketAnalysisResponse {
  success: boolean;
  data: MarketAnalyticsResult;
}
