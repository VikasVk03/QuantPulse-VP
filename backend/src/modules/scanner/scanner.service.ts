export interface SqueezeOpportunity {
  symbol: string;
  name: string;
  price: number;
  timeframe: string;
  bbWidth: number;
  kcWidth: number;
  squeezeStatus: "IN_SQUEEZE" | "FIRING_LONG" | "FIRING_SHORT" | "NO_SQUEEZE";
  momentumHist: number;
  historicalWinRate: number;
  expectedMovePct: number;
  qualityScore: number;
}

export interface MeanReversionOpportunity {
  symbol: string;
  price: number;
  zScore: number;
  distanceFromMeanPct: number;
  rsi14: number;
  direction: "OVERSOLD_BOUNCE" | "OVERBOUGHT_FADE";
  targetPrice: number;
  stopLossPrice: number;
  riskReward: number;
  halfLifeBars: number;
}

export interface OrderFlowImbalanceOpportunity {
  symbol: string;
  price: number;
  ofiScore: number; // -1.0 to 1.0
  deltaImbalance: number; // Volume delta
  deltaDivergence: boolean;
  regime: "ACCUMULATION_IN_RANGE" | "DISTRIBUTION_IN_RANGE" | "BALANCED";
  conviction: "VERY_HIGH" | "HIGH" | "MODERATE";
}

export interface CointegrationPair {
  pair: string;
  assetA: string;
  assetB: string;
  spreadZScore: number;
  correlation: number;
  cointegrationPValue: number;
  action: "LONG_A_SHORT_B" | "SHORT_A_LONG_B" | "NEUTRAL";
  halfLifeDays: number;
}

export interface ScannerOpportunitiesResponse {
  marketRegime: "CHOPPY_RANGEBOUND" | "TRENDING_EXPANSION" | "HIGH_VOLATILITY";
  congestionIndex: number; // 0 to 100
  summary: string;
  squeezes: SqueezeOpportunity[];
  meanReversions: MeanReversionOpportunity[];
  orderFlowImbalances: OrderFlowImbalanceOpportunity[];
  cointegrationPairs: CointegrationPair[];
}

export class ScannerService {
  public getOpportunities(): ScannerOpportunitiesResponse {
    return {
      marketRegime: "CHOPPY_RANGEBOUND",
      congestionIndex: 78.4,
      summary:
        "Market is experiencing tight compression across large-cap indices. Volatility squeezes and statistical mean-reversion strategies exhibit the highest edge.",
      squeezes: [
        {
          symbol: "RELIANCE",
          name: "Reliance Industries",
          price: 1399.5,
          timeframe: "15m",
          bbWidth: 0.012,
          kcWidth: 0.024,
          squeezeStatus: "IN_SQUEEZE",
          momentumHist: 0.045,
          historicalWinRate: 84.5,
          expectedMovePct: 3.2,
          qualityScore: 94,
        },
        {
          symbol: "TCS",
          name: "Tata Consultancy Services",
          price: 3845.2,
          timeframe: "1h",
          bbWidth: 0.014,
          kcWidth: 0.026,
          squeezeStatus: "FIRING_LONG",
          momentumHist: 0.082,
          historicalWinRate: 81.2,
          expectedMovePct: 2.8,
          qualityScore: 91,
        },
        {
          symbol: "INFY",
          name: "Infosys Ltd",
          price: 1782.4,
          timeframe: "30m",
          bbWidth: 0.011,
          kcWidth: 0.021,
          squeezeStatus: "IN_SQUEEZE",
          momentumHist: 0.018,
          historicalWinRate: 78.0,
          expectedMovePct: 2.4,
          qualityScore: 88,
        },
        {
          symbol: "TATAMOTORS",
          name: "Tata Motors Ltd",
          price: 948.6,
          timeframe: "15m",
          bbWidth: 0.016,
          kcWidth: 0.028,
          squeezeStatus: "FIRING_LONG",
          momentumHist: 0.065,
          historicalWinRate: 86.4,
          expectedMovePct: 4.1,
          qualityScore: 92,
        },
      ],
      meanReversions: [
        {
          symbol: "HDFCBANK",
          price: 1642.8,
          zScore: -2.48,
          distanceFromMeanPct: -2.3,
          rsi14: 24.2,
          direction: "OVERSOLD_BOUNCE",
          targetPrice: 1680.0,
          stopLossPrice: 1628.0,
          riskReward: 2.51,
          halfLifeBars: 14,
        },
        {
          symbol: "ICICIBANK",
          price: 1215.3,
          zScore: 2.35,
          distanceFromMeanPct: 2.1,
          rsi14: 76.8,
          direction: "OVERBOUGHT_FADE",
          targetPrice: 1190.0,
          stopLossPrice: 1228.0,
          riskReward: 1.99,
          halfLifeBars: 11,
        },
        {
          symbol: "KOTAKBANK",
          price: 1780.0,
          zScore: -2.62,
          distanceFromMeanPct: -2.8,
          rsi14: 21.5,
          direction: "OVERSOLD_BOUNCE",
          targetPrice: 1830.0,
          stopLossPrice: 1758.0,
          riskReward: 2.27,
          halfLifeBars: 16,
        },
      ],
      orderFlowImbalances: [
        {
          symbol: "RELIANCE",
          price: 1399.5,
          ofiScore: 0.82,
          deltaImbalance: 148500,
          deltaDivergence: true,
          regime: "ACCUMULATION_IN_RANGE",
          conviction: "VERY_HIGH",
        },
        {
          symbol: "TCS",
          price: 3845.2,
          ofiScore: 0.74,
          deltaImbalance: 89200,
          deltaDivergence: true,
          regime: "ACCUMULATION_IN_RANGE",
          conviction: "HIGH",
        },
        {
          symbol: "SBIN",
          price: 812.4,
          ofiScore: -0.68,
          deltaImbalance: -112000,
          deltaDivergence: false,
          regime: "DISTRIBUTION_IN_RANGE",
          conviction: "HIGH",
        },
      ],
      cointegrationPairs: [
        {
          pair: "HDFCBANK / ICICIBANK",
          assetA: "HDFCBANK",
          assetB: "ICICIBANK",
          spreadZScore: -2.54,
          correlation: 0.94,
          cointegrationPValue: 0.008,
          action: "LONG_A_SHORT_B",
          halfLifeDays: 4.2,
        },
        {
          pair: "TCS / INFY",
          assetA: "TCS",
          assetB: "INFY",
          spreadZScore: 2.18,
          correlation: 0.91,
          cointegrationPValue: 0.012,
          action: "SHORT_A_LONG_B",
          halfLifeDays: 5.1,
        },
      ],
    };
  }
}
