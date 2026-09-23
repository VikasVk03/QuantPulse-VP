export interface RiskFactorItem {
  id: string;
  asset: string;
  weight: number;
  var95Pct: number;
  var99Pct: number;
  expectedShortfall: number;
  beta: number;
  volatility: number;
  liquidityScore: number;
  riskCategory: "CRITICAL" | "ELEVATED" | "MODERATE" | "LOW";
  tailRiskScore: number;
}

export interface RiskIntelligenceSummary {
  portfolioVaR95: number;
  portfolioVaR99: number;
  expectedShortfall99: number;
  diversificationRatio: number;
  sharpeRatio: number;
  currentDrawdown: number;
  stressTestLossPct: number;
  riskStatus: "OPTIMAL" | "ATTENTION" | "DE_RISK_TRIGGERED";
  heatMap3D: RiskFactorItem[];
  correlationMatrix: {
    assets: string[];
    matrix: number[][];
  };
  deRiskingProtocols: Array<{
    stage: number;
    name: string;
    triggerCondition: string;
    action: string;
    status: "ARMED" | "STANDBY" | "TRIGGERED";
  }>;
}

export class RiskService {
  public getRiskSummary(): RiskIntelligenceSummary {
    const assets = [
      "RELIANCE",
      "TCS",
      "INFY",
      "HDFCBANK",
      "ICICIBANK",
      "TATAMOTORS",
    ];
    const matrix: number[][] = [
      [1.0, 0.42, 0.38, 0.54, 0.49, 0.61],
      [0.42, 1.0, 0.82, 0.31, 0.28, 0.35],
      [0.38, 0.82, 1.0, 0.29, 0.25, 0.32],
      [0.54, 0.31, 0.29, 1.0, 0.78, 0.48],
      [0.49, 0.28, 0.25, 0.78, 1.0, 0.44],
      [0.61, 0.35, 0.32, 0.48, 0.44, 1.0],
    ];

    const heatMap3D: RiskFactorItem[] = [
      {
        id: "RF-1",
        asset: "RELIANCE",
        weight: 28.5,
        var95Pct: 2.14,
        var99Pct: 3.42,
        expectedShortfall: 4.18,
        beta: 1.12,
        volatility: 22.4,
        liquidityScore: 96,
        riskCategory: "MODERATE",
        tailRiskScore: 32,
      },
      {
        id: "RF-2",
        asset: "TCS",
        weight: 22.0,
        var95Pct: 1.82,
        var99Pct: 2.85,
        expectedShortfall: 3.35,
        beta: 0.88,
        volatility: 18.2,
        liquidityScore: 92,
        riskCategory: "LOW",
        tailRiskScore: 24,
      },
      {
        id: "RF-3",
        asset: "INFY",
        weight: 15.5,
        var95Pct: 2.05,
        var99Pct: 3.15,
        expectedShortfall: 3.82,
        beta: 0.94,
        volatility: 20.8,
        liquidityScore: 90,
        riskCategory: "MODERATE",
        tailRiskScore: 28,
      },
      {
        id: "RF-4",
        asset: "HDFCBANK",
        weight: 18.0,
        var95Pct: 2.45,
        var99Pct: 3.85,
        expectedShortfall: 4.62,
        beta: 1.25,
        volatility: 24.5,
        liquidityScore: 95,
        riskCategory: "ELEVATED",
        tailRiskScore: 48,
      },
      {
        id: "RF-5",
        asset: "ICICIBANK",
        weight: 10.0,
        var95Pct: 2.32,
        var99Pct: 3.65,
        expectedShortfall: 4.38,
        beta: 1.18,
        volatility: 23.2,
        liquidityScore: 91,
        riskCategory: "MODERATE",
        tailRiskScore: 38,
      },
      {
        id: "RF-6",
        asset: "TATAMOTORS",
        weight: 6.0,
        var95Pct: 3.12,
        var99Pct: 4.88,
        expectedShortfall: 5.92,
        beta: 1.48,
        volatility: 31.5,
        liquidityScore: 84,
        riskCategory: "CRITICAL",
        tailRiskScore: 68,
      },
    ];

    return {
      portfolioVaR95: 1.84,
      portfolioVaR99: 2.92,
      expectedShortfall99: 3.58,
      diversificationRatio: 1.42,
      sharpeRatio: 2.18,
      currentDrawdown: -1.24,
      stressTestLossPct: -6.45,
      riskStatus: "OPTIMAL",
      heatMap3D,
      correlationMatrix: {
        assets,
        matrix,
      },
      deRiskingProtocols: [
        {
          stage: 1,
          name: "Level 1 Soft Warning",
          triggerCondition: "Portfolio Drawdown reaches -3.0%",
          action: "Freeze new long positions & tighten stop losses to 1.0 ATR",
          status: "ARMED",
        },
        {
          stage: 2,
          name: "Level 2 Dynamic Delta Hedge",
          triggerCondition:
            "Portfolio Drawdown reaches -5.0% OR INDIA VIX > 22",
          action:
            "Execute algorithmic NIFTY short futures hedge to achieve delta neutrality",
          status: "STANDBY",
        },
        {
          stage: 3,
          name: "Level 3 Systematic De-Leverage",
          triggerCondition: "Portfolio Drawdown reaches -7.5%",
          action:
            "Liquidate high-beta assets (TATAMOTORS, HDFCBANK) by 50% into cash",
          status: "STANDBY",
        },
        {
          stage: 4,
          name: "Level 4 Hard Circuit Breaker",
          triggerCondition: "Portfolio Drawdown reaches -10.0%",
          action:
            "Immediate emergency close of all active positions into 100% Cash / Liquid BeES",
          status: "STANDBY",
        },
      ],
    };
  }
}
