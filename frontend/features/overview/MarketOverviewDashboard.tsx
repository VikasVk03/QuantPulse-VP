import React, { useState, useEffect } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Bot,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Cpu,
  Database,
  Eye,
  Flame,
  Layers,
  LineChart,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingDown,
  TrendingUp,
  X,
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
  const [chartSeries, setChartSeries] =
    useState<MarketSeriesPoint[]>(SAMPLE_CHART_SERIES);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [chartLoading, setChartLoading] = useState<boolean>(false);

  // Watchlist & Alert System States
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [newSymbolInput, setNewSymbolInput] = useState<string>("");
  const [showAddSymbol, setShowAddSymbol] = useState<boolean>(false);

  // Hook into live real-time SSE stream
  const { quotes, isConnected, activeProvider } = useRealTimeMarketStream({
    symbol: selectedSymbol,
  });

  useEffect(() => {
    let isCancelled = false;

    async function loadSymbolAnalytics() {
      setChartLoading(true);
      try {
        const matchingDataset = availableDatasets.find(
          (d) =>
            d.symbol?.toUpperCase() === selectedSymbol.toUpperCase() ||
            d.symbol?.replace(/[^A-Z0-9]/g, "").toUpperCase() ===
              selectedSymbol.replace(/[^A-Z0-9]/g, "").toUpperCase(),
        );

        let res;
        if (matchingDataset) {
          res = await api.analytics.getDatasetAnalytics(
            matchingDataset.id || matchingDataset._id,
            selectedSymbol,
          );
        } else {
          res = await api.analytics.getSymbolAnalytics(selectedSymbol);
        }

        if (!isCancelled && res?.success && res.data) {
          setAnalyticsData(res.data);
          if (Array.isArray(res.data.series) && res.data.series.length > 0) {
            setChartSeries(res.data.series);
          }
        }
      } catch (err) {
        console.warn("Could not load symbol analytics:", err);
      } finally {
        if (!isCancelled) setChartLoading(false);
      }
    }

    void loadSymbolAnalytics();

    return () => {
      isCancelled = true;
    };
  }, [selectedSymbol, selectedTimeframe, availableDatasets]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusJson, sigJson, secJson, telJson, dataJson, watchJson, alertJson] =
          await Promise.all([
            api.overview.getMarketStatus(),
            api.overview.getSignals(),
            api.overview.getSectors(),
            api.overview.getTelemetry(),
            api.datasets.list(),
            api.watchlist.get(),
            api.alerts.get(),
          ]);

        if (statusJson.success) setIndices(statusJson.data.indices);
        if (sigJson.success) setSignals(sigJson.data);
        if (secJson.success) setSectors(secJson.data);
        if (telJson.success) setTelemetry(telJson.data);
        if (dataJson.success && Array.isArray(dataJson.data)) {
          setAvailableDatasets(dataJson.data);
        }
        if (watchJson?.success && Array.isArray(watchJson.data)) {
          setWatchlist(watchJson.data);
        }
        if (alertJson?.success && Array.isArray(alertJson.data)) {
          setAlerts(alertJson.data);
        }
      } catch {}
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const handleAddWatchlist = async () => {
    if (!newSymbolInput.trim()) return;
    const sym = newSymbolInput.trim().toUpperCase();
    try {
      const res = await api.watchlist.add({ symbol: sym });
      if (res?.success && res.data) {
        setWatchlist((prev) => [...prev.filter((p) => p.symbol !== res.data.symbol), res.data]);
        setSelectedSymbol(res.data.symbol);
        setNewSymbolInput("");
        setShowAddSymbol(false);
      }
    } catch (err) {
      console.error("Failed to add to watchlist:", err);
    }
  };

  const handleRemoveWatchlist = async (sym: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.watchlist.remove(sym);
      setWatchlist((prev) => prev.filter((p) => p.symbol !== sym));
    } catch (err) {
      console.error("Failed to remove from watchlist:", err);
    }
  };

  const handleDismissAlert = async (id: string) => {
    try {
      await api.alerts.dismiss(id);
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: "MUTED" } : a)));
    } catch (err) {
      console.error("Failed to dismiss alert:", err);
    }
  };

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
    symbolQuote?.price ||
    analyticsData?.lastPrice ||
    (selectedSymbol === "RELIANCE" ? 2945.2 : selectedSymbol === "TCS" ? 3845.2 : 100.0);
  const currentChange =
    symbolQuote?.changePercent ||
    analyticsData?.returnPercentage ||
    1.23;

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

      {/* Real-Time Quant Alert Trigger Notification */}
      {alerts.filter((a) => a.status === "TRIGGERED").length > 0 && (
        <div className="space-y-2">
          {alerts
            .filter((a) => a.status === "TRIGGERED")
            .map((alert) => (
              <div
                key={alert.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 backdrop-blur-xl shadow-lg shadow-amber-500/5 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300">
                    <Bell className="size-4 animate-bounce" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-300">
                        ⚡ QUANT ALERT TRIGGERED • {alert.symbol}
                      </span>
                      <span className="text-[10px] font-mono rounded bg-amber-500/20 px-1.5 py-0.2 text-amber-200">
                        {alert.condition}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 mt-0.5">{alert.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center font-mono">
                  <button
                    type="button"
                    onClick={() => setSelectedSymbol(alert.symbol)}
                    className="rounded-lg bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 text-xs font-bold text-amber-200 hover:bg-amber-500/30 transition-all cursor-pointer"
                  >
                    View Chart
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDismissAlert(alert.id)}
                    className="flex size-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
                    title="Dismiss Alert"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Persistent User Watchlist Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 backdrop-blur-xl shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Star className="size-3.5 text-amber-400 fill-amber-400/20" />
          <span>Active Watchlist</span>
          <span className="text-[10px] font-mono rounded-full bg-slate-800 px-2 py-0.2 text-slate-400">
            {watchlist.length} Tickers
          </span>
        </div>

        {/* Watchlist Symbol Pills */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {watchlist.map((item) => {
            const isSelected = selectedSymbol.toUpperCase() === item.symbol.toUpperCase();
            const liveQ = quotes[item.symbol];
            const price = liveQ?.price ?? item.lastPrice;
            const changePct = liveQ?.changePercent ?? item.changePct;
            const isPos = changePct >= 0;

            return (
              <div
                key={item.symbol}
                onClick={() => setSelectedSymbol(item.symbol)}
                className={`group flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-mono transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-sky-500/15 border-sky-400 text-white shadow-md shadow-sky-500/10 scale-[1.02]"
                    : "bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  {isSelected && (
                    <span className="size-1.5 rounded-full bg-sky-400 animate-pulse" />
                  )}
                  <span>{item.symbol}</span>
                </div>

                <div className="flex items-center gap-1 text-[11px]">
                  <span>₹{price.toFixed(1)}</span>
                  <span
                    className={`font-semibold ${isPos ? "text-emerald-400" : "text-rose-400"}`}
                  >
                    {isPos ? "+" : ""}
                    {changePct.toFixed(1)}%
                  </span>
                </div>

                <span
                  className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                    item.signal === "BUY"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {item.signal}
                </span>

                <button
                  type="button"
                  onClick={(e) => handleRemoveWatchlist(item.symbol, e)}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity ml-0.5"
                  title="Remove from Watchlist"
                >
                  <X className="size-3" />
                </button>
              </div>
            );
          })}

          {/* Add Symbol Input / Trigger */}
          {showAddSymbol ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                autoFocus
                value={newSymbolInput}
                onChange={(e) => setNewSymbolInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleAddWatchlist()}
                placeholder="SYMBOL (e.g. SBIN)"
                className="h-8 w-28 rounded-lg border border-sky-500/50 bg-slate-950 px-2 text-xs font-mono font-bold text-sky-300 outline-none"
              />
              <button
                type="button"
                onClick={handleAddWatchlist}
                className="flex h-8 items-center justify-center rounded-lg bg-sky-500 px-2.5 text-xs font-bold text-white hover:bg-sky-400 transition-colors cursor-pointer"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddSymbol(false);
                  setNewSymbolInput("");
                }}
                className="flex size-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddSymbol(true)}
              className="flex items-center gap-1.5 rounded-xl border border-dashed border-slate-700 bg-slate-950/40 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:border-slate-500 hover:text-white transition-all cursor-pointer"
            >
              <Plus className="size-3.5 text-sky-400" />
              <span>Add Ticker</span>
            </button>
          )}
        </div>
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
                      ...availableDatasets.map((d) => d.symbol),
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
                  {availableDatasets.length > 0 && (
                    <optgroup label="Uploaded Datasets">
                      {availableDatasets.map((ds) => (
                        <option key={ds.id || ds._id} value={ds.symbol}>
                          📁 {ds.name || ds.symbol} ({ds.symbol})
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="Preset Instruments">
                    <option value="RELIANCE">RELIANCE (NSE)</option>
                    <option value="TCS">TCS (NSE)</option>
                    <option value="INFY">INFY (NSE)</option>
                    <option value="HDFCBANK">HDFCBANK (NSE)</option>
                    <option value="IBM">IBM (US/AlphaVantage)</option>
                    <option value="AAPL">AAPL (US)</option>
                    <option value="BTCUSDT">BTCUSDT (Binance)</option>
                  </optgroup>
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

          <div className="relative w-full overflow-hidden rounded-md" style={{ minHeight: "340px" }}>
            {chartLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/50 backdrop-blur-[2px]">
                <div className="flex items-center gap-2 rounded-lg border border-sky-500/30 bg-slate-900/90 px-3 py-1.5 text-xs font-mono text-sky-400 shadow-xl">
                  <span className="size-2 rounded-full bg-sky-400 animate-ping" />
                  Running C++ Microstructure...
                </div>
              </div>
            )}
            <PriceChart series={chartSeries} height={340} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono border-t border-slate-800/80">
            {/* 1. Fair Value (VWAP) */}
            <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-slate-500 text-[10px] block">FAIR VALUE (VWAP):</span>
              <div className="font-bold text-slate-200 mt-0.5">
                ₹{analyticsData?.microstructure?.vwap !== undefined
                  ? analyticsData.microstructure.vwap.toFixed(2)
                  : currentPrice.toFixed(2)}
              </div>
              <div className="text-[10px] mt-0.5 font-semibold text-emerald-400">
                {(analyticsData?.microstructure?.vwap ?? currentPrice) >= currentPrice
                  ? "Discount (Value Buy Zone)"
                  : "Momentum (Trading Above VWAP)"}
              </div>
            </div>

            {/* 2. Order Flow (OFI) */}
            <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-slate-500 text-[10px] block">INSTITUTIONAL FLOW (OFI):</span>
              <div
                className={`font-bold mt-0.5 ${
                  (analyticsData?.microstructure?.orderFlowImbalance ?? 0.64) >= 0
                    ? "text-emerald-400"
                    : "text-rose-400"
                }`}
              >
                {analyticsData?.microstructure?.ofiPressureSignal || "+0.64 Bullish"}
              </div>
              <div className="text-[10px] mt-0.5 text-slate-400">
                {(analyticsData?.microstructure?.orderFlowImbalance ?? 0.64) >= 0
                  ? "Buyer Absorption Confirmed"
                  : "Institutional Distribution"}
              </div>
            </div>

            {/* 3. Volatility Regime */}
            <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-slate-500 text-[10px] block">VOLATILITY REGIME:</span>
              <div className="font-bold text-sky-400 mt-0.5">
                {(analyticsData?.volatility ?? 0.18) < 0.20 ? "Squeeze Active" : "Expansion Wave"}
              </div>
              <div className="text-[10px] mt-0.5 text-slate-400">
                {(analyticsData?.volatility ?? 0.18) < 0.20
                  ? "Breakout Explosion Imminent"
                  : "High Volatility Active"}
              </div>
            </div>

            {/* 4. Asymmetric Risk Parameter */}
            <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-slate-500 text-[10px] block">ASYMMETRIC RISK (VaR):</span>
              <div className="font-bold text-amber-300 mt-0.5">
                {analyticsData?.microstructure?.var95 !== undefined
                  ? `${(analyticsData.microstructure.var95 * 100).toFixed(1)}% 1D Risk`
                  : "1.4% 1D Risk"}
              </div>
              <div className="text-[10px] mt-0.5 text-emerald-400 font-semibold">
                Reward &gt; 2.5x Risk Unit
              </div>
            </div>
          </div>
        </div>

        {/* Right: AI & Quantitative Signals */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <BrainCircuit className="size-4 text-sky-400" />
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                High-Conviction Alpha Setups
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
                    target: 3025.0,
                    stopLoss: 2910.0,
                    riskReward: "1 : 2.3",
                  },
                  {
                    symbol: "TCS",
                    action: "BUY",
                    confidence: 84,
                    price: 3845.2,
                    reason: "Institutional VWAP Rebound + Positive Delta",
                    target: 3960.0,
                    stopLoss: 3795.0,
                    riskReward: "1 : 2.5",
                  },
                  {
                    symbol: "INFY",
                    action: "BUY",
                    confidence: 79,
                    price: 1782.4,
                    reason: "RSI Mean Reversion + Buyer Block Flow",
                    target: 1845.0,
                    stopLoss: 1755.0,
                    riskReward: "1 : 2.3",
                  },
                  {
                    symbol: "HDFCBANK",
                    action: "BUY",
                    confidence: 82,
                    price: 1642.8,
                    reason: "Institutional Support Absorption",
                    target: 1710.0,
                    stopLoss: 1615.0,
                    riskReward: "1 : 2.4",
                  },
                ]
            ).map((sig) => {
              const liveQ = quotes[sig.symbol];
              const rawPrice = liveQ?.price ?? sig.entryPrice ?? sig.price ?? 0;
              const price = typeof rawPrice === "number" && !Number.isNaN(rawPrice) ? rawPrice : 0;
              const action =
                sig.action ||
                (sig.type === "LONG"
                  ? "BUY"
                  : sig.type === "SHORT"
                    ? "SELL"
                    : "BUY");

              const isBuy = action === "BUY";
              const targetPrice = sig.targetPrice ?? sig.target ?? (isBuy ? price * 1.03 : price * 0.97);
              const stopPrice = sig.stopLoss ?? (isBuy ? price * 0.985 : price * 1.015);
              const rr = sig.riskReward ? (typeof sig.riskReward === "number" ? `1 : ${sig.riskReward.toFixed(1)}` : sig.riskReward) : "1 : 2.4";

              return (
                <div
                  key={sig.symbol}
                  onClick={() => onNavigateToStocks?.(sig.symbol)}
                  className="group p-3 rounded-xl border border-slate-800/80 bg-slate-950/60 hover:bg-slate-800/40 hover:border-sky-500/30 transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-100 group-hover:text-sky-300 transition-colors">
                        {sig.symbol}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isBuy
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        }`}
                      >
                        {action} SETUP
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-sky-300 font-bold">
                        {sig.confidence}% Conviction
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-300 font-sans truncate">
                    {sig.strategy || sig.reason}
                  </div>

                  {/* Actionable Trader Levels */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1.5 border-t border-slate-800/70 text-[10px] font-mono">
                    <div className="bg-slate-900/80 p-1.5 rounded">
                      <span className="text-slate-500 text-[9px] block">ENTRY</span>
                      <span className="text-slate-200 font-bold">₹{price.toFixed(0)}</span>
                    </div>
                    <div className="bg-slate-900/80 p-1.5 rounded">
                      <span className="text-slate-500 text-[9px] block">TARGET</span>
                      <span className="text-emerald-400 font-bold">₹{targetPrice.toFixed(0)}</span>
                    </div>
                    <div className="bg-slate-900/80 p-1.5 rounded">
                      <span className="text-slate-500 text-[9px] block">STOP</span>
                      <span className="text-rose-400 font-bold">₹{stopPrice.toFixed(0)}</span>
                    </div>
                    <div className="bg-slate-900/80 p-1.5 rounded">
                      <span className="text-slate-500 text-[9px] block">R : R</span>
                      <span className="text-amber-300 font-bold">{rr}</span>
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
              const name = sec.sector || sec.name || "Sector";
              const rawChange =
                sec.changePercent !== undefined
                  ? sec.changePercent
                  : sec.change;
              const change = typeof rawChange === "number" && !Number.isNaN(rawChange) ? rawChange : 0;
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

        {/* Trading Regime & Market Conviction Matrix */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Compass className="size-3.5 text-sky-400" />
              Market Regime & Execution Edge
            </h3>
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-300">
              BULLISH BIAS
            </span>
          </div>

          <div className="space-y-2.5 pt-1 text-xs font-mono">
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-2.5 space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Market Breadth:</span>
                <span className="font-bold text-emerald-400">72% Advancing Stocks</span>
              </div>
              <p className="text-[10px] text-slate-500 font-sans">
                Broad equity participation across large caps; low distribution pressure.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-2.5 space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Volatility Regime (INDIA VIX):</span>
                <span className="font-bold text-sky-300">13.4 - Compressed Volatility</span>
              </div>
              <p className="text-[10px] text-slate-500 font-sans">
                Favorable for breakout continuation & trend following; options buying cheap.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-2.5 space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Institutional Action Plan:</span>
                <span className="font-bold text-amber-300">Buy Breakouts in Leaders</span>
              </div>
              <p className="text-[10px] text-slate-500 font-sans">
                Prioritize Tech & Banking setups trading near VWAP with high positive OFI confirmation.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-2.5 text-[11px] text-sky-300 font-mono flex items-center justify-between">
            <span>Algorithmic Confluence:</span>
            <span className="font-bold text-emerald-400">84% Macro Bullish Alignment</span>
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
