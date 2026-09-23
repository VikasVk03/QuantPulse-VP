export interface MarketIndexStatus {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  trend: "bullish" | "bearish" | "neutral";
  volume: number;
}

export interface AlgorithmicSignal {
  id: string;
  symbol: string;
  timeframe: string;
  type: "LONG" | "SHORT" | "SQUEEZE_ALERT" | "MEAN_REVERSION";
  confidence: number;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  riskReward: number;
  strategy: string;
  timestamp: number;
}

export interface SectorPerformance {
  sector: string;
  changePercent: number;
  leadingStock: string;
  volumeShare: number;
  momentumScore: number;
}

export interface EngineTelemetry {
  engineName: string;
  version: string;
  status: "ONLINE" | "DEGRADED" | "OFFLINE";
  processedOpsPerSec: number;
  latencyMicroseconds: number;
  totalTestsPassed: number;
}

export class OverviewService {
  public getMarketStatus(): {
    marketState: "OPEN" | "CLOSED" | "PRE_OPEN";
    indices: MarketIndexStatus[];
    globalClocks: Array<{
      city: string;
      timezone: string;
      time: string;
      isOpen: boolean;
    }>;
  } {
    const now = new Date();
    const utcHours = now.getUTCHours();
    const isTradingHours = utcHours >= 3 && utcHours <= 10; // IST 9:15 to 15:30 is approx UTC 3:45 to 10:00

    return {
      marketState: isTradingHours ? "OPEN" : "CLOSED",
      indices: [
        {
          symbol: "NIFTY50",
          name: "NIFTY 50",
          price: 23446.8,
          change: -112.4,
          changePercent: -0.48,
          trend: "neutral",
          volume: 185000000,
        },
        {
          symbol: "SENSEX",
          name: "BSE SENSEX",
          price: 77210.0,
          change: -340.2,
          changePercent: -0.44,
          trend: "neutral",
          volume: 95000000,
        },
        {
          symbol: "BANKNIFTY",
          name: "NIFTY BANK",
          price: 49850.0,
          change: -185.1,
          changePercent: -0.37,
          trend: "neutral",
          volume: 120000000,
        },
        {
          symbol: "INDIAVIX",
          name: "INDIA VIX",
          price: 13.42,
          change: +0.28,
          changePercent: +2.13,
          trend: "neutral",
          volume: 0,
        },
      ],
      globalClocks: [
        {
          city: "New York",
          timezone: "America/New_York",
          time: new Intl.DateTimeFormat("en-US", {
            timeZone: "America/New_York",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          }).format(now),
          isOpen: false,
        },
        {
          city: "London",
          timezone: "Europe/London",
          time: new Intl.DateTimeFormat("en-GB", {
            timeZone: "Europe/London",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          }).format(now),
          isOpen: true,
        },
        {
          city: "Tokyo",
          timezone: "Asia/Tokyo",
          time: new Intl.DateTimeFormat("ja-JP", {
            timeZone: "Asia/Tokyo",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          }).format(now),
          isOpen: false,
        },
        {
          city: "Mumbai",
          timezone: "Asia/Kolkata",
          time: new Intl.DateTimeFormat("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          }).format(now),
          isOpen: isTradingHours,
        },
      ],
    };
  }

  public getSignals(): AlgorithmicSignal[] {
    return [
      {
        id: "SIG-001",
        symbol: "RELIANCE",
        timeframe: "15m",
        type: "SQUEEZE_ALERT",
        confidence: 94.2,
        entryPrice: 1399.5,
        targetPrice: 1435.0,
        stopLoss: 1382.0,
        riskReward: 2.03,
        strategy: "Volatility Squeeze Breakout",
        timestamp: Date.now() - 120000,
      },
      {
        id: "SIG-002",
        symbol: "TCS",
        timeframe: "1h",
        type: "MEAN_REVERSION",
        confidence: 88.5,
        entryPrice: 3845.0,
        targetPrice: 3920.0,
        stopLoss: 3810.0,
        riskReward: 2.14,
        strategy: "Statistical Z-Score Reversion",
        timestamp: Date.now() - 360000,
      },
      {
        id: "SIG-003",
        symbol: "HDFCBANK",
        timeframe: "5m",
        type: "LONG",
        confidence: 86.0,
        entryPrice: 1642.8,
        targetPrice: 1670.0,
        stopLoss: 1630.0,
        riskReward: 2.12,
        strategy: "Order Flow Imbalance Accumulation",
        timestamp: Date.now() - 600000,
      },
      {
        id: "SIG-004",
        symbol: "INFY",
        timeframe: "1d",
        type: "LONG",
        confidence: 91.0,
        entryPrice: 1782.4,
        targetPrice: 1840.0,
        stopLoss: 1755.0,
        riskReward: 2.1,
        strategy: "Momentum Microstructure Flow",
        timestamp: Date.now() - 900000,
      },
    ];
  }

  public getSectors(): SectorPerformance[] {
    return [
      {
        sector: "Nifty IT",
        changePercent: 1.84,
        leadingStock: "TCS (+2.1%)",
        volumeShare: 24.5,
        momentumScore: 88,
      },
      {
        sector: "Nifty Auto",
        changePercent: 1.42,
        leadingStock: "TATAMOTORS (+2.6%)",
        volumeShare: 18.2,
        momentumScore: 82,
      },
      {
        sector: "Nifty Energy",
        changePercent: 0.95,
        leadingStock: "RELIANCE (+1.1%)",
        volumeShare: 21.0,
        momentumScore: 76,
      },
      {
        sector: "Nifty Bank",
        changePercent: -0.17,
        leadingStock: "ICICIBANK (+0.4%)",
        volumeShare: 22.8,
        momentumScore: 54,
      },
      {
        sector: "Nifty FMCG",
        changePercent: -0.45,
        leadingStock: "ITC (-0.8%)",
        volumeShare: 8.5,
        momentumScore: 42,
      },
      {
        sector: "Nifty Pharma",
        changePercent: 0.32,
        leadingStock: "SUNPHARMA (+0.9%)",
        volumeShare: 5.0,
        momentumScore: 61,
      },
    ];
  }

  public getEngineTelemetry(): EngineTelemetry[] {
    return [
      {
        engineName: "StatisticsEngine",
        version: "C++20 v1.4",
        status: "ONLINE",
        processedOpsPerSec: 1450000,
        latencyMicroseconds: 8.4,
        totalTestsPassed: 48,
      },
      {
        engineName: "VolatilityEngine",
        version: "C++20 v1.4",
        status: "ONLINE",
        processedOpsPerSec: 980000,
        latencyMicroseconds: 12.1,
        totalTestsPassed: 36,
      },
      {
        engineName: "RiskEngine",
        version: "C++20 v1.4",
        status: "ONLINE",
        processedOpsPerSec: 720000,
        latencyMicroseconds: 16.5,
        totalTestsPassed: 52,
      },
      {
        engineName: "MarketMicrostructureEngine",
        version: "C++20 v1.4",
        status: "ONLINE",
        processedOpsPerSec: 2100000,
        latencyMicroseconds: 4.2,
        totalTestsPassed: 64,
      },
      {
        engineName: "OrderBookEngine",
        version: "C++20 v1.4",
        status: "ONLINE",
        processedOpsPerSec: 3200000,
        latencyMicroseconds: 2.1,
        totalTestsPassed: 56,
      },
      {
        engineName: "MatchingEngine",
        version: "C++20 v1.4",
        status: "ONLINE",
        processedOpsPerSec: 2800000,
        latencyMicroseconds: 3.0,
        totalTestsPassed: 40,
      },
    ];
  }
}
