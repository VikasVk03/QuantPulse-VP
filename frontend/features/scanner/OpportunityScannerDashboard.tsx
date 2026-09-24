import React, { useState, useEffect, useMemo } from "react";
import {
  Activity,
  ArrowRight,
  ArrowUpDown,
  BarChart2,
  CheckCircle2,
  ChevronRight,
  Compass,
  Database,
  Filter,
  Flame,
  Layers,
  Percent,
  Radio,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { api } from "../../lib/apiClient";

interface OpportunityScannerDashboardProps {
  onAnalyzeStock?: (symbol: string) => void;
  onBacktestSetup?: (setupName: string, symbol: string) => void;
}

export type MarketRegime =
  | "ALL"
  | "SQUEEZE"
  | "MEAN_REVERSION"
  | "OFI_ACCUMULATION"
  | "STAT_ARB";

interface OpportunityItem {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  regime: "SQUEEZE" | "MEAN_REVERSION" | "OFI_ACCUMULATION" | "STAT_ARB";
  setupName: string;
  currentPrice: number;
  entryTrigger: number;
  stopLoss: number;
  target1: number;
  target2: number;
  riskReward: string;
  zScore: number;
  squeezeBars: number;
  ofiPressure: number;
  probability: number;
  volume24h: string;
  description: string;
}

const DEFAULT_OPPORTUNITIES: OpportunityItem[] = [
  {
    id: "opp-1",
    symbol: "RELIANCE",
    name: "Reliance Industries Ltd",
    sector: "Energy",
    regime: "SQUEEZE",
    setupName: "Bollinger Squeeze Explosive Breakout",
    currentPrice: 2945.2,
    entryTrigger: 2958.0,
    stopLoss: 2915.0,
    target1: 3040.0,
    target2: 3120.0,
    riskReward: "3.8 : 1",
    zScore: 0.45,
    squeezeBars: 18,
    ofiPressure: 0.74,
    probability: 86,
    volume24h: "12.4M",
    description:
      "Bollinger Bands tightly compressed inside Keltner Channel for 18 bars in congested range. Positive order flow imbalance accumulating.",
  },
  {
    id: "opp-2",
    symbol: "TCS",
    name: "Tata Consultancy Services",
    sector: "Technology",
    regime: "MEAN_REVERSION",
    setupName: "Range Exhaustion Mean Reversion",
    currentPrice: 4112.15,
    entryTrigger: 4115.0,
    stopLoss: 4060.0,
    target1: 4230.0,
    target2: 4290.0,
    riskReward: "3.2 : 1",
    zScore: -2.45,
    squeezeBars: 6,
    ofiPressure: 0.62,
    probability: 82,
    volume24h: "3.8M",
    description:
      "Price extended -2.45 standard deviations below 20-day VWAP in choppy range. Extreme statistical stretch with low downside volatility.",
  },
  {
    id: "opp-3",
    symbol: "HDFCBANK",
    name: "HDFC Bank Ltd",
    sector: "Banking",
    regime: "OFI_ACCUMULATION",
    setupName: "Institutional Order Flow Inflow",
    currentPrice: 1648.35,
    entryTrigger: 1652.0,
    stopLoss: 1630.0,
    target1: 1710.0,
    target2: 1750.0,
    riskReward: "4.5 : 1",
    zScore: 1.15,
    squeezeBars: 14,
    ofiPressure: 0.88,
    probability: 89,
    volume24h: "18.6M",
    description:
      "Significant bid-side depth absorption inside 1635-1650 congestion. Heavy accumulation preceding range expansion.",
  },
  {
    id: "opp-4",
    symbol: "INFY",
    name: "Infosys Ltd",
    sector: "Technology",
    regime: "SQUEEZE",
    setupName: "Keltner Volatility Compression",
    currentPrice: 1562.4,
    entryTrigger: 1575.0,
    stopLoss: 1540.0,
    target1: 1635.0,
    target2: 1680.0,
    riskReward: "3.5 : 1",
    zScore: 0.82,
    squeezeBars: 22,
    ofiPressure: 0.71,
    probability: 84,
    volume24h: "9.2M",
    description:
      "22-bar volatility squeeze. Historical volatility contracted to 6-month lows with volume spikes on up-ticks.",
  },
  {
    id: "opp-5",
    symbol: "ICICIBANK_vs_AXISBANK",
    name: "ICICI vs Axis Bank Spread",
    sector: "Banking",
    regime: "STAT_ARB",
    setupName: "Cointegrated Pairs Spread Divergence",
    currentPrice: 1.408,
    entryTrigger: 1.41,
    stopLoss: 1.385,
    target1: 1.465,
    target2: 1.49,
    riskReward: "3.6 : 1",
    zScore: -2.3,
    squeezeBars: 0,
    ofiPressure: 0.55,
    probability: 80,
    volume24h: "Pair",
    description:
      "Price ratio spread deviated -2.3 sigma from 60-day mean. High historical cointegration (p < 0.01) with fast mean reversion speed.",
  },
  {
    id: "opp-6",
    symbol: "TATAMOTORS",
    name: "Tata Motors Ltd",
    sector: "Automobile",
    regime: "MEAN_REVERSION",
    setupName: "Congestion Floor Support Bounce",
    currentPrice: 987.25,
    entryTrigger: 990.0,
    stopLoss: 972.0,
    target1: 1030.0,
    target2: 1065.0,
    riskReward: "4.1 : 1",
    zScore: -2.1,
    squeezeBars: 9,
    ofiPressure: 0.68,
    probability: 81,
    volume24h: "14.1M",
    description:
      "Tested bottom of horizontal congestion channel 3 times with reducing sell volume and bullish hammer candle confirmation.",
  },
  {
    id: "opp-7",
    symbol: "LT",
    name: "Larsen & Toubro Ltd",
    sector: "Capital Goods",
    regime: "SQUEEZE",
    setupName: "Multi-Day Range Compression",
    currentPrice: 3624.5,
    entryTrigger: 3645.0,
    stopLoss: 3590.0,
    target1: 3760.0,
    target2: 3850.0,
    riskReward: "3.9 : 1",
    zScore: 0.95,
    squeezeBars: 16,
    ofiPressure: 0.79,
    probability: 85,
    volume24h: "4.2M",
    description:
      "Tight consolidation within a 1.2% daily range. Kyle's Lambda shows low price impact resistance on upside volume.",
  },
];

export function OpportunityScannerDashboard({
  onAnalyzeStock,
  onBacktestSetup,
}: OpportunityScannerDashboardProps) {
  const [selectedRegime, setSelectedRegime] = useState<MarketRegime>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("ALL");
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>(
    DEFAULT_OPPORTUNITIES,
  );
  const [marketRegimeInfo, setMarketRegimeInfo] = useState<{
    regime: string;
    congestionIndex: number;
    summary: string;
  }>({
    regime: "CHOPPY_RANGEBOUND",
    congestionIndex: 78.4,
    summary:
      "Market is experiencing tight compression across large-cap indices. Squeezes and mean-reversions exhibit the highest edge.",
  });

  useEffect(() => {
    const fetchOpps = async () => {
      try {
        const json = await api.scanner.getOpportunities();
        if (json.success && json.data) {
          setMarketRegimeInfo({
            regime: json.data.marketRegime,
            congestionIndex: json.data.congestionIndex,
            summary: json.data.summary,
          });
        }
      } catch {}
    };
    fetchOpps();
  }, []);

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      const matchRegime =
        selectedRegime === "ALL" || opp.regime === selectedRegime;
      const matchSector =
        selectedSector === "ALL" || opp.sector === selectedSector;
      const matchQuery =
        !searchQuery.trim() ||
        opp.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.setupName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchRegime && matchSector && matchQuery;
    });
  }, [opportunities, selectedRegime, selectedSector, searchQuery]);

  const squeezeCount = opportunities.filter(
    (o) => o.regime === "SQUEEZE",
  ).length;
  const meanRevCount = opportunities.filter(
    (o) => o.regime === "MEAN_REVERSION",
  ).length;
  const ofiCount = opportunities.filter(
    (o) => o.regime === "OFI_ACCUMULATION",
  ).length;
  const statArbCount = opportunities.filter(
    (o) => o.regime === "STAT_ARB",
  ).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
            <Compass className="size-3.5" />
            <span>Market Regime Intelligence • Alpha Screener</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Opportunity Scanner
            <span className="text-xs font-mono font-medium rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 px-3 py-0.5">
              Congested Market Specialist ({marketRegimeInfo.congestionIndex}%
              Compression)
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            {marketRegimeInfo.summary}
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
          <Activity className="size-4 text-emerald-400" />
          <span>
            Active Setups Found:{" "}
            <strong className="text-emerald-300 font-bold">
              {opportunities.length}
            </strong>
          </span>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricBadgeCard
          title="Volatility Squeeze (TTM)"
          count={squeezeCount}
          description="Bollinger inside Keltner Channel"
          badge="High Energy"
          color="amber"
          active={selectedRegime === "SQUEEZE"}
          onClick={() =>
            setSelectedRegime(selectedRegime === "SQUEEZE" ? "ALL" : "SQUEEZE")
          }
        />
        <MetricBadgeCard
          title="Mean Reversion Extreme"
          count={meanRevCount}
          description="|Z-Score| ≥ 2.2σ in range"
          badge="Statistical Edge"
          color="sky"
          active={selectedRegime === "MEAN_REVERSION"}
          onClick={() =>
            setSelectedRegime(
              selectedRegime === "MEAN_REVERSION" ? "ALL" : "MEAN_REVERSION",
            )
          }
        />
        <MetricBadgeCard
          title="OFI Inflow Absorption"
          count={ofiCount}
          description="Institutional block accumulation"
          badge="Order Book Delta"
          color="emerald"
          active={selectedRegime === "OFI_ACCUMULATION"}
          onClick={() =>
            setSelectedRegime(
              selectedRegime === "OFI_ACCUMULATION"
                ? "ALL"
                : "OFI_ACCUMULATION",
            )
          }
        />
        <MetricBadgeCard
          title="Statistical Arbitrage"
          count={statArbCount}
          description="Cointegrated spread deviation"
          badge="Market Neutral"
          color="purple"
          active={selectedRegime === "STAT_ARB"}
          onClick={() =>
            setSelectedRegime(
              selectedRegime === "STAT_ARB" ? "ALL" : "STAT_ARB",
            )
          }
        />
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
        {/* Regime Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          {[
            { id: "ALL", label: `All Setups (${opportunities.length})` },
            { id: "SQUEEZE", label: `Squeeze (${squeezeCount})` },
            { id: "MEAN_REVERSION", label: `Mean Rev (${meanRevCount})` },
            { id: "OFI_ACCUMULATION", label: `OFI Inflow (${ofiCount})` },
            { id: "STAT_ARB", label: `Stat-Arb (${statArbCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedRegime(tab.id as MarketRegime)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                selectedRegime === tab.id
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Sector Select */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search symbol, setup..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8.5 w-44 sm:w-56 rounded-lg border border-slate-700/80 bg-slate-950/80 pl-8.5 pr-3 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-amber-500/80"
            />
          </div>

          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="h-8.5 rounded-lg border border-slate-700/80 bg-slate-950/80 px-2.5 text-xs text-slate-200 outline-none cursor-pointer"
          >
            <option value="ALL">All Sectors</option>
            <option value="Energy">Energy</option>
            <option value="Banking">Banking</option>
            <option value="Technology">Technology</option>
            <option value="Automobile">Automobile</option>
            <option value="Capital Goods">Capital Goods</option>
          </select>
        </div>
      </div>

      {/* Opportunities List */}
      <div className="space-y-4">
        {filteredOpportunities.map((opp) => (
          <div
            key={opp.id}
            className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl shadow-xl hover:border-amber-500/40 hover:bg-slate-900/80 transition-all space-y-4"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-3.5">
              {/* Left Title & Tickers */}
              <div className="flex items-center gap-3.5">
                <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-slate-900 border border-amber-500/30 text-amber-300 font-mono font-bold text-xs shadow-md">
                  {opp.symbol.slice(0, 4)}
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                      {opp.symbol}
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">
                      {opp.name}
                    </span>
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-700">
                      {opp.sector}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-amber-400 mt-0.5 flex items-center gap-2">
                    <span>{opp.setupName}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400 text-[11px] font-mono font-normal">
                      Vol: {opp.volume24h}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Action Badges */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs font-mono text-slate-400">
                    Live Price
                  </div>
                  <div className="text-base font-mono font-bold text-slate-100">
                    ₹{opp.currentPrice.toFixed(2)}
                  </div>
                </div>

                <div className="h-8 w-px bg-slate-800" />

                <div className="text-right">
                  <div className="text-xs font-mono text-slate-400">
                    Win Probability
                  </div>
                  <div className="text-base font-mono font-bold text-emerald-400">
                    {opp.probability}%
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-2">
                  <button
                    type="button"
                    onClick={() => onAnalyzeStock?.(opp.symbol)}
                    className="flex items-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3.5 py-2 text-xs font-semibold text-sky-300 hover:bg-sky-500/20 transition-all cursor-pointer"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="size-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onBacktestSetup?.(opp.setupName, opp.symbol)}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-all cursor-pointer"
                  >
                    <Zap className="size-3.5 fill-current" />
                    <span>Backtest Setup</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-500 text-[10px]">
                  Entry Trigger
                </span>
                <div className="font-bold text-slate-200 mt-0.5">
                  ₹{opp.entryTrigger.toFixed(2)}
                </div>
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-500 text-[10px]">Stop Loss</span>
                <div className="font-bold text-rose-400 mt-0.5">
                  ₹{opp.stopLoss.toFixed(2)}
                </div>
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-500 text-[10px]">
                  Target 1 (R1)
                </span>
                <div className="font-bold text-emerald-400 mt-0.5">
                  ₹{opp.target1.toFixed(2)}
                </div>
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-500 text-[10px]">
                  Risk / Reward
                </span>
                <div className="font-bold text-amber-300 mt-0.5">
                  {opp.riskReward}
                </div>
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-500 text-[10px]">
                  Statistical Z-Score
                </span>
                <div className="font-bold text-sky-400 mt-0.5">
                  {opp.zScore > 0 ? "+" : ""}
                  {opp.zScore.toFixed(2)}σ
                </div>
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-500 text-[10px]">
                  {opp.regime === "SQUEEZE"
                    ? "Squeeze Duration"
                    : "OFI Inflow Delta"}
                </span>
                <div className="font-bold text-emerald-300 mt-0.5">
                  {opp.regime === "SQUEEZE"
                    ? `${opp.squeezeBars} Bars`
                    : `+${(opp.ofiPressure * 100).toFixed(0)}% Delta`}
                </div>
              </div>
            </div>

            {/* Rationale & Description */}
            <div className="text-xs text-slate-300/90 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 flex items-start gap-2.5">
              <Sparkles className="size-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300">
                  Quantitative Rationale:
                </strong>{" "}
                {opp.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricBadgeCard({
  title,
  count,
  description,
  badge,
  color,
  active,
  onClick,
}: {
  title: string;
  count: number;
  description: string;
  badge: string;
  color: "amber" | "sky" | "emerald" | "purple";
  active?: boolean;
  onClick?: () => void;
}) {
  const colorMap = {
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    sky: "border-sky-500/30 bg-sky-500/10 text-sky-300",
    emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    purple: "border-purple-500/30 bg-purple-500/10 text-purple-300",
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border p-4 backdrop-blur-xl transition-all cursor-pointer ${
        active
          ? "border-amber-400 bg-amber-950/30 shadow-lg shadow-amber-500/20 ring-1 ring-amber-400"
          : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <span
          className={`rounded-md border px-2 py-0.5 text-[9px] font-mono font-bold ${colorMap[color]}`}
        >
          {badge}
        </span>
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold font-mono text-white">{count}</span>
        <span className="text-xs font-mono text-slate-400">Active Setups</span>
      </div>

      <div className="mt-1 text-[11px] text-slate-500">{description}</div>
    </div>
  );
}
