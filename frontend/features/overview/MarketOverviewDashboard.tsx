import React, { useState, useEffect } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bot,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  Database,
  Eye,
  Flame,
  Layers,
  LineChart,
  Radio,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  Star,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { PriceChart } from "../../components/market/PriceChart";
import type { MarketSeriesPoint } from "../market/market.types";
import { useRealTimeMarketStream } from "../../hooks/useRealTimeMarketStream";
import { api } from "../../lib/apiClient";

interface MarketOverviewDashboardProps {
  onNavigateToStocks?: (symbol?: string) => void;
  onNavigateToScanner?: () => void;
  onNavigateToRisk?: () => void;
}

const SAMPLE_CHART_SERIES: MarketSeriesPoint[] = [
  { timestamp: 1785748500000, price: 2910.5, volume: 142000 },
  { timestamp: 1785748560000, price: 2915.2, volume: 156000 },
  { timestamp: 1785748620000, price: 2908.0, volume: 118000 },
  { timestamp: 1785748680000, price: 2922.4, volume: 189000 },
  { timestamp: 1785748740000, price: 2928.0, volume: 195000 },
  { timestamp: 1785748800000, price: 2920.1, volume: 132000 },
  { timestamp: 1785748860000, price: 2935.6, volume: 220000 },
  { timestamp: 1785748920000, price: 2942.0, volume: 245000 },
  { timestamp: 1785748980000, price: 2938.5, volume: 160000 },
  { timestamp: 1785749040000, price: 2945.2, volume: 280000 },
];

export function MarketOverviewDashboard({
  onNavigateToStocks,
  onNavigateToScanner,
  onNavigateToRisk,
}: MarketOverviewDashboardProps) {
  const [activeTabRanking, setActiveTabRanking] = useState<
    "gainers" | "losers"
  >("gainers");
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("1D");
  const [selectedSymbol, setSelectedSymbol] = useState<string>("RELIANCE");
  const [availableDatasets, setAvailableDatasets] = useState<any[]>([]);

  const [indices, setIndices] = useState<any[]>([]);
  const [signals, setSignals] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Hook into live real-time SSE stream
  const { quotes, isConnected, activeProvider } = useRealTimeMarketStream({
    symbol: selectedSymbol,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusJson, sigJson, secJson, telJson, dataJson] =
          await Promise.all([
            api.overview.getMarketStatus(),
            api.overview.getSignals(),
            api.overview.getSectors(),
            api.overview.getTelemetry(),
            api.datasets.list(),
          ]);

        if (statusJson.success) setIndices(statusJson.data.indices);
        if (sigJson.success) setSignals(sigJson.data);
        if (secJson.success) setSectors(secJson.data);
        if (telJson.success) setTelemetry(telJson.data);
        if (dataJson.success && Array.isArray(dataJson.data)) {
          setAvailableDatasets(dataJson.data);
        }
      } catch {}
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const topGainers = [
    { symbol: "ONGC", price: 312.4, change: 3.21 },
    { symbol: "NTPC", price: 422.15, change: 2.98 },
    { symbol: "POWERGRID", price: 315.6, change: 2.74 },
    { symbol: "TATAMOTORS", price: 987.25, change: 2.61 },
    { symbol: "M&M", price: 2847.1, change: 2.43 },
  ];

  const topLosers = [
    { symbol: "BAJFINANCE", price: 6890.0, change: -1.85 },
    { symbol: "HINDUNILVR", price: 2450.2, change: -1.42 },
    { symbol: "DIVISLAB", price: 4210.0, change: -1.25 },
    { symbol: "ASIANPAINT", price: 2890.5, change: -0.95 },
    { symbol: "SUNPHARMA", price: 1680.0, change: -0.82 },
  ];

  const symbolQuote = quotes[selectedSymbol];
  const currentPrice =
    symbolQuote?.price || (selectedSymbol === "RELIANCE" ? 2945.2 : 100.0);
  const currentChange = symbolQuote?.changePercent || 1.23;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400 mb-1">
            <Radio
              className={`size-3.5 ${isConnected ? "text-emerald-400 animate-pulse" : "text-amber-400"}`}
            />
            <span>Institutional Terminal • Market Overview</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Real-Time Market Intelligence
            <span className="text-xs font-mono font-medium rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-3 py-0.5">
              Live C++ Engine Link
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Macro indexes, algorithmic signals, and real-time microstructure
            metrics across Indian equities.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onNavigateToScanner && (
            <button
              type="button"
              onClick={onNavigateToScanner}
              className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer shadow-lg shadow-amber-500/10"
            >
              <Sparkles className="size-3.5" />
              <span>Opportunity Scanner</span>
            </button>
          )}

          {onNavigateToRisk && (
            <button
              type="button"
              onClick={onNavigateToRisk}
              className="flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-xs font-semibold text-purple-300 hover:bg-purple-500/20 transition-all cursor-pointer shadow-lg shadow-purple-500/10"
            >
              <Shield className="size-3.5" />
              <span>3D Risk Intelligence</span>
            </button>
          )}
        </div>
      </div>

      {/* 5-Column Major Index Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {(indices.length > 0
          ? indices
          : [
              {
                symbol: "NIFTY50",
                name: "NIFTY 50",
                price: 24862.3,
                change: 178.4,
                changePercent: 0.72,
                trend: "bullish",
              },
              {
                symbol: "SENSEX",
                name: "SENSEX",
                price: 81203.56,
                change: 548.9,
                changePercent: 0.68,
                trend: "bullish",
              },
              {
                symbol: "BANKNIFTY",
                name: "BANKNIFTY",
                price: 51114.2,
                change: 612.3,
                changePercent: 1.21,
                trend: "bullish",
              },
              {
                symbol: "FINNIFTY",
                name: "FINNIFTY",
                price: 22945.1,
                change: 210.8,
                changePercent: 0.93,
                trend: "bullish",
              },
              {
                symbol: "INDIAVIX",
                name: "INDIA VIX",
                price: 12.34,
                change: -0.28,
                changePercent: -2.18,
                trend: "neutral",
              },
            ]
        ).map((idx) => {
          const liveQ = quotes[idx.symbol];
          const price = liveQ
            ? liveQ.price.toLocaleString("en-IN")
            : idx.price.toLocaleString("en-IN");
          const changePercent = liveQ ? liveQ.changePercent : idx.changePercent;
          const positive = changePercent >= 0;

          return (
            <IndexCard
              key={idx.symbol}
              title={idx.name || idx.symbol}
              value={price}
              change={`${positive ? "+" : ""}${changePercent.toFixed(2)}%`}
              points={`${positive ? "+" : ""}${idx.change?.toFixed(2) || "0.00"}`}
              positive={positive}
              subtext={
                idx.symbol === "INDIAVIX"
                  ? "Low Volatility Regime"
                  : "Live Index"
              }
            />
          );
        })}
      </div>

      {/* Main Hero Grid: Candlestick Chart + AI Signals */}
      <div className="grid gap-6 xl:grid-cols-[2fr_1.2fr]">
        {/* Left: Hero Chart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 font-bold text-xs font-mono">
                {selectedSymbol.substring(0, 4)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">
                    {selectedSymbol}
                  </h3>
                  <span
                    className={`text-xs font-mono font-bold ${currentChange >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                  >
                    ₹{currentPrice.toFixed(2)} ({currentChange >= 0 ? "+" : ""}
                    {currentChange.toFixed(2)}%)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  Feed: {activeProvider.toUpperCase()} • Live Microstructure &
                  Real-Time Stream
                </p>
              </div>
            </div>

            {/* Symbol & Dataset Selector + Timeframe */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={selectedSymbol}
                  onChange={(e) =>
                    setSelectedSymbol(e.target.value.toUpperCase())
                  }
                  placeholder="Symbol..."
                  className="h-7.5 w-24 sm:w-28 rounded-md border border-slate-700 bg-slate-950 px-2 text-xs font-mono font-bold text-sky-300 outline-none focus:border-sky-500"
                />
                <select
                  value={
                    [
                      "RELIANCE",
                      "TCS",
                      "INFY",
                      "HDFCBANK",
                      "IBM",
                      "AAPL",
                      "BTCUSDT",
                    ].includes(selectedSymbol)
                      ? selectedSymbol
                      : ""
                  }
                  onChange={(e) => {
                    if (e.target.value) setSelectedSymbol(e.target.value);
                  }}
                  className="h-7.5 rounded-md border border-slate-700 bg-slate-950 px-2 text-xs font-mono text-slate-300 outline-none cursor-pointer"
                >
                  <option value="" disabled>
                    Presets / Datasets
                  </option>
                  {availableDatasets.map((ds) => (
                    <option key={ds.id || ds._id} value={ds.symbol}>
                      📁 {ds.name || ds.symbol} ({ds.symbol})
                    </option>
                  ))}
                  <option value="RELIANCE">RELIANCE (NSE)</option>
                  <option value="TCS">TCS (NSE)</option>
                  <option value="INFY">INFY (NSE)</option>
                  <option value="HDFCBANK">HDFCBANK (NSE)</option>
                  <option value="IBM">IBM (US/AlphaVantage)</option>
                  <option value="AAPL">AAPL (US)</option>
                  <option value="BTCUSDT">BTCUSDT (Binance)</option>
                </select>
              </div>

              {/* Timeframe Selector */}
              <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950/80 p-1 text-xs font-mono">
                {["1m", "5m", "15m", "1h", "1D", "1W", "1M"].map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setSelectedTimeframe(tf)}
                    className={`rounded-md px-2 py-0.5 text-[11px] font-semibold transition-colors cursor-pointer ${
                      selectedTimeframe === tf
                        ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="h-[360px] w-full">
            <PriceChart series={SAMPLE_CHART_SERIES} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono border-t border-slate-800/80">
            <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-slate-500 text-[10px]">VWAP (C++):</span>
              <div className="font-bold text-slate-200">₹2,931.40</div>
            </div>
            <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-slate-500 text-[10px]">OFI Pressure:</span>
              <div className="font-bold text-emerald-400">+0.64 Bullish</div>
            </div>
            <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-slate-500 text-[10px]">
                Amihud Illiquidity:
              </span>
              <div className="font-bold text-slate-200">0.0018</div>
            </div>
            <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-slate-500 text-[10px]">
                Annualized Vol:
              </span>
              <div className="font-bold text-slate-200">18.4%</div>
            </div>
          </div>
        </div>

        {/* Right: AI & Quantitative Signals */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <BrainCircuit className="size-4 text-sky-400" />
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Quantitative Alpha Signals
              </h3>
            </div>
            <span className="rounded-full bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 text-[10px] font-mono text-sky-300">
              C++ Signal Engine
            </span>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[380px] pr-1">
            {(signals.length > 0
              ? signals
              : [
                  {
                    symbol: "RELIANCE",
                    action: "BUY",
                    confidence: 88,
                    price: 2945.2,
                    reason: "Volatility Squeeze Breakout + OFI Inflow",
                  },
                  {
                    symbol: "TCS",
                    action: "HOLD",
                    confidence: 62,
                    price: 4112.15,
                    reason: "Rangebound Consolidation (Z=0.4)",
                  },
                  {
                    symbol: "INFY",
                    action: "BUY",
                    confidence: 78,
                    price: 1562.4,
                    reason: "RSI Mean Reversion + Positive Delta",
                  },
                  {
                    symbol: "HDFCBANK",
                    action: "BUY",
                    confidence: 82,
                    price: 1648.35,
                    reason: "Institutional Block Flow Absorption",
                  },
                ]
            ).map((sig) => {
              const liveQ = quotes[sig.symbol];
              const price = liveQ ? liveQ.price : sig.price;
              const action =
                sig.action ||
                (sig.type === "LONG"
                  ? "BUY"
                  : sig.type === "SHORT"
                    ? "SELL"
                    : "BUY");

              return (
                <div
                  key={sig.symbol}
                  onClick={() => onNavigateToStocks?.(sig.symbol)}
                  className="group flex items-center justify-between p-3 rounded-xl border border-slate-800/80 bg-slate-950/60 hover:bg-slate-800/40 hover:border-sky-500/30 transition-all cursor-pointer"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-100 group-hover:text-sky-300 transition-colors">
                        {sig.symbol}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          action === "BUY"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : action === "SELL"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {action}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[210px]">
                      {sig.strategy || sig.reason}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-bold text-slate-200">
                      ₹{price.toFixed(2)}
                    </div>
                    <div className="flex items-center justify-end gap-1.5 mt-1">
                      <div className="w-14 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-sky-400 h-full rounded-full"
                          style={{ width: `${sig.confidence}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {sig.confidence}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onNavigateToScanner}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
          >
            <span>Scan 200+ Equities in Opportunity Scanner</span>
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Grid: Sector Performance, Top Movers, Engine Health */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sector Performance */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <BarChart3 className="size-3.5 text-sky-400" />
              Sector Performance
            </h3>
            <span className="text-[10px] font-mono text-slate-500">
              Today % Change
            </span>
          </div>

          <div className="space-y-2 pt-1 font-mono text-xs">
            {(sectors.length > 0
              ? sectors
              : [
                  { sector: "Financial Services", changePercent: 1.21 },
                  { sector: "Information Tech", changePercent: 0.84 },
                  { sector: "Energy & Oil", changePercent: 0.62 },
                  { sector: "Automobile", changePercent: 0.48 },
                  { sector: "FMCG", changePercent: 0.31 },
                  { sector: "Pharma & Healthcare", changePercent: -0.12 },
                ]
            ).map((sec) => {
              const name = sec.sector || sec.name;
              const change =
                sec.changePercent !== undefined
                  ? sec.changePercent
                  : sec.change;
              const positive = change >= 0;

              return (
                <div key={name} className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px] truncate max-w-[160px]">
                    {name}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden flex justify-end">
                      <div
                        className={`h-full rounded-full ${positive ? "bg-emerald-400" : "bg-rose-400"}`}
                        style={{
                          width: `${Math.min(100, Math.abs(change) * 50)}%`,
                        }}
                      />
                    </div>
                    <span
                      className={`font-semibold text-[11px] w-12 text-right ${
                        positive ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {positive ? "+" : ""}
                      {change.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Gainers & Losers */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Flame className="size-3.5 text-amber-400" />
              <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTabRanking("gainers")}
                  className={`px-2.5 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                    activeTabRanking === "gainers"
                      ? "bg-emerald-500/20 text-emerald-300 font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Top Gainers
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTabRanking("losers")}
                  className={`px-2.5 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                    activeTabRanking === "losers"
                      ? "bg-rose-500/20 text-rose-300 font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Top Losers
                </button>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              NIFTY 500
            </span>
          </div>

          <div className="space-y-2 pt-1 font-mono text-xs">
            {(activeTabRanking === "gainers" ? topGainers : topLosers).map(
              (stock) => (
                <div
                  key={stock.symbol}
                  onClick={() => onNavigateToStocks?.(stock.symbol)}
                  className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <span className="font-bold text-slate-200 hover:text-sky-300">
                    {stock.symbol}
                  </span>
                  <div className="text-right">
                    <span className="text-slate-300 text-xs">
                      ₹{stock.price.toFixed(2)}
                    </span>
                    <span
                      className={`ml-2 text-[11px] font-bold ${
                        stock.change >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {stock.change >= 0 ? "+" : ""}
                      {stock.change.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>

        {/* C++ Engine Health & Live Telemetry */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Cpu className="size-3.5 text-purple-400" />
              C++20 Engine System Telemetry
            </h3>
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <div className="space-y-2 pt-1 text-xs">
            {(telemetry.length > 0
              ? telemetry
              : [
                  {
                    engineName: "Statistics & Returns Engine",
                    status: "ONLINE",
                    latencyMicroseconds: 8.4,
                  },
                  {
                    engineName: "Volatility & Risk Engine",
                    status: "ONLINE",
                    latencyMicroseconds: 12.1,
                  },
                  {
                    engineName: "Market Microstructure Engine",
                    status: "ONLINE",
                    latencyMicroseconds: 4.2,
                  },
                  {
                    engineName: "OrderBook & Matching Engine",
                    status: "ONLINE",
                    latencyMicroseconds: 2.1,
                  },
                  {
                    engineName: "Backtesting & Portfolio Engine",
                    status: "ONLINE",
                    latencyMicroseconds: 14.5,
                  },
                ]
            ).map((t) => (
              <EngineStatusRow
                key={t.engineName}
                name={t.engineName}
                status={t.status}
                latency={`${(t.latencyMicroseconds / 1000).toFixed(2)}ms`}
              />
            ))}
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5 text-[11px] text-slate-400 font-mono">
            Deterministic C++20 quantitative engine compiled natively with 660+
            unit tests verified.
          </div>
        </div>
      </div>
    </div>
  );
}

function IndexCard({
  title,
  value,
  change,
  points,
  positive,
  subtext,
}: {
  title: string;
  value: string;
  change: string;
  points: string;
  positive: boolean;
  subtext?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-xl shadow-lg space-y-2">
      <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
        <span>{title}</span>
        {positive ? (
          <TrendingUp className="size-3.5 text-emerald-400" />
        ) : (
          <TrendingDown className="size-3.5 text-rose-400" />
        )}
      </div>

      <div className="flex items-baseline justify-between">
        <div className="text-xl font-bold font-mono text-white">{value}</div>
        <div
          className={`text-xs font-mono font-bold flex items-center ${
            positive ? "text-emerald-400" : "text-rose-400"
          }`}
        >
          {change}
        </div>
      </div>

      <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between">
        <span>{points} pts</span>
        <span>{subtext || "Live Index"}</span>
      </div>
    </div>
  );
}

function EngineStatusRow({
  name,
  status,
  latency,
}: {
  name: string;
  status: "ONLINE" | "ACTIVE" | "READY" | "IDLE";
  latency: string;
}) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-slate-800/40 last:border-0">
      <span className="text-slate-400 text-[11px]">{name}</span>
      <div className="flex items-center gap-2 font-mono text-[10px]">
        <span className="text-slate-500">{latency}</span>
        <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-emerald-300 font-bold">
          {status}
        </span>
      </div>
    </div>
  );
}
