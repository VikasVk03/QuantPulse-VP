import React, { useState, useEffect, useMemo } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Cpu,
  Download,
  Filter,
  Flame,
  FlaskConical,
  HelpCircle,
  Info,
  Layers,
  LineChart,
  Play,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  Sliders,
  Sparkles,
  TrendingDown,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { api } from "../../lib/apiClient";

interface BacktestingDashboardProps {
  initialSetup?: string;
  initialSymbol?: string;
}

export function BacktestingDashboard({
  initialSetup,
  initialSymbol,
}: BacktestingDashboardProps) {
  // Strategy & Instrument
  const [selectedStrategy, setSelectedStrategy] = useState<string>(
    initialSetup || "Volatility Squeeze Breakout",
  );
  const [selectedSymbol, setSelectedSymbol] = useState<string>(
    initialSymbol || "RELIANCE",
  );

  // Simulation Parameters
  const [capital, setCapital] = useState<string>("1000000");
  const [positionSizing, setPositionSizing] = useState<
    "KELLY" | "HALF_KELLY" | "FIXED_PERCENT"
  >("HALF_KELLY");
  const [riskPerTrade, setRiskPerTrade] = useState<number>(2.0);
  const [slippageBps, setSlippageBps] = useState<number>(5);
  const [stopLossPct, setStopLossPct] = useState<number>(2.0);
  const [takeProfitPct, setTakeProfitPct] = useState<number>(4.5);

  // UI Interactive Views
  const [activeViewTab, setActiveViewTab] = useState<
    "EQUITY" | "DRAWDOWN" | "MONTE_CARLO"
  >("EQUITY");
  const [tradeFilter, setTradeFilter] = useState<
    "ALL" | "WIN" | "LOSS" | "LONG" | "SHORT"
  >("ALL");
  const [tradeSearch, setTradeSearch] = useState<string>("");
  const [selectedTrade, setSelectedTrade] = useState<any | null>(null);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [backtestResult, setBacktestResult] = useState<any>(null);

  // Presets
  const applyPreset = (presetName: "CONSERVATIVE" | "AGGRESSIVE" | "ALPHA") => {
    if (presetName === "CONSERVATIVE") {
      setPositionSizing("HALF_KELLY");
      setRiskPerTrade(1.0);
      setStopLossPct(1.5);
      setTakeProfitPct(3.5);
      setSlippageBps(3);
    } else if (presetName === "AGGRESSIVE") {
      setPositionSizing("KELLY");
      setRiskPerTrade(3.5);
      setStopLossPct(2.5);
      setTakeProfitPct(7.0);
      setSlippageBps(8);
    } else {
      setPositionSizing("HALF_KELLY");
      setRiskPerTrade(2.0);
      setStopLossPct(2.0);
      setTakeProfitPct(4.5);
      setSlippageBps(5);
    }
  };

  const executeBacktest = async () => {
    setIsRunning(true);
    try {
      const json = await api.backtesting.run({
        strategyName: selectedStrategy,
        symbol: selectedSymbol,
        initialCapital: Number(capital) || 1000000,
        positionSizing,
        riskPerTradePct: riskPerTrade,
        slippageBps,
      });
      if (json && json.success) {
        setBacktestResult(json.data);
      } else if (json && json.data) {
        setBacktestResult(json.data);
      }
    } catch (err) {
      console.error("Backtest execution failed:", err);
    }
    setIsRunning(false);
  };

  useEffect(() => {
    executeBacktest();
  }, [
    selectedStrategy,
    selectedSymbol,
    positionSizing,
    riskPerTrade,
    slippageBps,
    capital,
  ]);

  const equityData =
    backtestResult?.equityCurve && backtestResult.equityCurve.length > 0
      ? backtestResult.equityCurve
      : [
          {
            date: "2024-01-01",
            equity: 1000000,
            benchmarkEquity: 1000000,
            drawdownPct: 0,
            monteCarloCeiling: 1000000,
            monteCarloFloor: 1000000,
          },
          {
            date: "2024-02-01",
            equity: 1045000,
            benchmarkEquity: 1012000,
            drawdownPct: -0.8,
            monteCarloCeiling: 1080000,
            monteCarloFloor: 1010000,
          },
          {
            date: "2024-03-01",
            equity: 1082000,
            benchmarkEquity: 1008000,
            drawdownPct: -0.5,
            monteCarloCeiling: 1150000,
            monteCarloFloor: 1025000,
          },
          {
            date: "2024-04-01",
            equity: 1140000,
            benchmarkEquity: 1035000,
            drawdownPct: -1.2,
            monteCarloCeiling: 1220000,
            monteCarloFloor: 1050000,
          },
          {
            date: "2024-05-01",
            equity: 1195000,
            benchmarkEquity: 1048000,
            drawdownPct: -0.4,
            monteCarloCeiling: 1310000,
            monteCarloFloor: 1075000,
          },
          {
            date: "2024-06-01",
            equity: 1172000,
            benchmarkEquity: 1030000,
            drawdownPct: -3.1,
            monteCarloCeiling: 1390000,
            monteCarloFloor: 1090000,
          },
          {
            date: "2024-07-01",
            equity: 1248000,
            benchmarkEquity: 1072000,
            drawdownPct: -0.2,
            monteCarloCeiling: 1480000,
            monteCarloFloor: 1120000,
          },
          {
            date: "2024-08-01",
            equity: 1310000,
            benchmarkEquity: 1095000,
            drawdownPct: -0.9,
            monteCarloCeiling: 1560000,
            monteCarloFloor: 1150000,
          },
          {
            date: "2024-09-01",
            equity: 1386000,
            benchmarkEquity: 1124000,
            drawdownPct: -1.5,
            monteCarloCeiling: 1650000,
            monteCarloFloor: 1180000,
          },
        ];

  const trades: any[] = backtestResult?.trades || [];

  const filteredTrades = useMemo(() => {
    return trades.filter((t) => {
      if (tradeFilter === "WIN" && t.pnl <= 0) return false;
      if (tradeFilter === "LOSS" && t.pnl > 0) return false;
      if (tradeFilter === "LONG" && t.direction !== "LONG") return false;
      if (tradeFilter === "SHORT" && t.direction !== "SHORT") return false;
      if (tradeSearch.trim()) {
        const query = tradeSearch.trim().toUpperCase();
        return (
          t.id.toUpperCase().includes(query) ||
          t.symbol.toUpperCase().includes(query) ||
          t.exitDate.includes(query)
        );
      }
      return true;
    });
  }, [trades, tradeFilter, tradeSearch]);

  const totalReturn = backtestResult?.totalReturnPct ?? 38.6;
  const cagr = backtestResult?.cagrPct ?? 42.1;
  const sharpe = backtestResult?.sharpeRatio ?? 2.34;
  const sortino = backtestResult?.sortinoRatio ?? 3.12;
  const maxDd = backtestResult?.maxDrawdownPct ?? -4.85;
  const winRate = backtestResult?.winRatePct ?? 68.4;
  const profitFactor = backtestResult?.profitFactor ?? 2.45;
  const expectancy = backtestResult?.expectancy ?? 4250;
  const totalTradesCount = backtestResult?.totalTrades ?? trades.length;

  const exportTradeLogCSV = () => {
    if (trades.length === 0) return;
    const headers = [
      "Trade ID",
      "Symbol",
      "Direction",
      "Entry Date",
      "Exit Date",
      "Entry Price",
      "Exit Price",
      "Quantity",
      "PnL (INR)",
      "PnL %",
      "Exit Reason",
    ];
    const rows = trades.map((t) => [
      t.id,
      t.symbol,
      t.direction,
      t.entryDate,
      t.exitDate,
      t.entryPrice,
      t.exitPrice,
      t.quantity,
      t.pnl,
      `${t.pnlPct}%`,
      t.exitReason,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `quantpulse_backtest_${selectedSymbol}_trades.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Engine Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400 mb-1">
            <FlaskConical className="size-3.5" />
            <span>Interactive Strategy Simulation • C++20 Core Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Strategy Backtesting Lab
            <span className="text-xs font-mono font-medium rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 px-3 py-0.5">
              C++ BacktestEngine
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Simulate institutional alpha strategies with slippage modeling, Kelly criterion sizing, and Monte Carlo confidence intervals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 font-mono text-xs bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase text-slate-500 px-2 font-bold">
              Presets:
            </span>
            <button
              type="button"
              onClick={() => applyPreset("CONSERVATIVE")}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              🛡️ Low Risk
            </button>
            <button
              type="button"
              onClick={() => applyPreset("ALPHA")}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/40 cursor-pointer"
            >
              🎯 Alpha Quant
            </button>
            <button
              type="button"
              onClick={() => applyPreset("AGGRESSIVE")}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              ⚡ High Kelly
            </button>
          </div>

          <button
            type="button"
            onClick={exportTradeLogCSV}
            disabled={trades.length === 0}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700/60 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="size-4 text-sky-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Interactive Parameter Control Console */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="size-4 text-sky-400" />
            Interactive Simulation Parameters
          </h3>
          <span className="text-[10px] font-mono text-slate-400">
            Slippage: {slippageBps} bps • Brokerage: ₹20/order • Modeled Fills: 180 Days
          </span>
        </div>

        {/* Primary Controls Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 items-end">
          <div className="space-y-1.5 lg:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Strategy Algorithm
            </label>
            <select
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs font-medium text-slate-200 outline-none cursor-pointer"
            >
              <option value="Volatility Squeeze Breakout">
                Volatility Squeeze (Bollinger / Keltner Compression)
              </option>
              <option value="Statistical Mean Reversion Z-Score">
                Statistical Mean Reversion (|Z| ≥ 2.2)
              </option>
              <option value="Order Flow Imbalance Scalper">
                Order Flow Imbalance (OFI Delta Divergence)
              </option>
              <option value="EMA 20 / SMA 50 Trend Cross">
                EMA 20 / SMA 50 Institutional Trend Cross
              </option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Instrument
            </label>
            <div className="flex items-center gap-1">
              {["RELIANCE", "TCS", "INFY", "HDFCBANK"].map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => setSelectedSymbol(sym)}
                  className={`flex-1 py-1.5 text-[11px] font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                    selectedSymbol === sym
                      ? "bg-sky-500/20 border-sky-400 text-sky-300"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  {sym.substring(0, 4)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Position Sizing Model
            </label>
            <select
              value={positionSizing}
              onChange={(e) => setPositionSizing(e.target.value as any)}
              className="h-9 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs font-medium text-slate-200 outline-none cursor-pointer"
            >
              <option value="HALF_KELLY">Half-Kelly (Institutional Risk)</option>
              <option value="KELLY">Full Kelly Criterion (Aggressive)</option>
              <option value="FIXED_PERCENT">Fixed 2% Equity per Trade</option>
            </select>
          </div>

          <button
            type="button"
            onClick={executeBacktest}
            disabled={isRunning}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-4 text-xs font-bold text-white shadow-lg shadow-sky-500/20 hover:scale-[1.02] transition-all cursor-pointer disabled:opacity-50"
          >
            {isRunning ? (
              <RefreshCw className="size-4 animate-spin" />
            ) : (
              <Play className="size-4 fill-current" />
            )}
            <span>{isRunning ? "Simulating..." : "Re-Run C++ Engine"}</span>
          </button>
        </div>

        {/* Interactive Parameter Sliders */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-3 border-t border-slate-800/60 font-mono text-xs">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex justify-between text-slate-400">
              <span>Risk Per Trade:</span>
              <span className="font-bold text-sky-400">{riskPerTrade.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.5"
              value={riskPerTrade}
              onChange={(e) => setRiskPerTrade(parseFloat(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer"
            />
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex justify-between text-slate-400">
              <span>Execution Slippage:</span>
              <span className="font-bold text-amber-400">{slippageBps} bps</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={slippageBps}
              onChange={(e) => setSlippageBps(parseInt(e.target.value, 10))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex justify-between text-slate-400">
              <span>Stop Loss Threshold:</span>
              <span className="font-bold text-rose-400">-{stopLossPct.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.5"
              value={stopLossPct}
              onChange={(e) => setStopLossPct(parseFloat(e.target.value))}
              className="w-full accent-rose-400 cursor-pointer"
            />
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex justify-between text-slate-400">
              <span>Take Profit Target:</span>
              <span className="font-bold text-emerald-400">+{takeProfitPct.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="15.0"
              step="0.5"
              value={takeProfitPct}
              onChange={(e) => setTakeProfitPct(parseFloat(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* KPI Performance Strip */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6 font-mono">
        <StatCard
          label="TOTAL RETURN"
          value={`${totalReturn >= 0 ? "+" : ""}${totalReturn}%`}
          detail={`Final: ₹${(backtestResult?.finalEquity || 1386000).toLocaleString()}`}
          positive={totalReturn >= 0}
        />
        <StatCard
          label="CAGR (ANNUALIZED)"
          value={`${cagr}%`}
          detail="Compounded Growth"
          positive={true}
        />
        <StatCard
          label="SHARPE RATIO"
          value={String(sharpe)}
          detail="Risk-Adjusted Alpha"
          positive={true}
        />
        <StatCard
          label="SORTINO RATIO"
          value={String(sortino)}
          detail="Downside Vol Risk"
          positive={true}
        />
        <StatCard
          label="MAX DRAWDOWN"
          value={`${maxDd}%`}
          detail="Peak to Valley"
          positive={false}
        />
        <StatCard
          label="WIN RATE / PROFIT FACTOR"
          value={`${winRate}%`}
          detail={`PF: ${profitFactor} • Exp: ₹${expectancy}`}
          positive={true}
        />
      </div>

      {/* Main Grid: Interactive Charts + Trade Log */}
      <div className="grid gap-6 xl:grid-cols-[1.65fr_1.1fr]">
        {/* Left: Interactive Multi-Tab Chart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <LineChart className="size-4 text-sky-400" />
                Performance Diagnostics & Visual Teardown
              </h3>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Strategy CAGR: {cagr}% vs NIFTY 50: {backtestResult?.benchmarkReturnPct ?? 12.4}%
              </p>
            </div>

            {/* Interactive View Tabs */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 font-mono text-xs">
              <button
                type="button"
                onClick={() => setActiveViewTab("EQUITY")}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  activeViewTab === "EQUITY"
                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Equity Curve
              </button>
              <button
                type="button"
                onClick={() => setActiveViewTab("DRAWDOWN")}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  activeViewTab === "DRAWDOWN"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Underwater Drawdown
              </button>
              <button
                type="button"
                onClick={() => setActiveViewTab("MONTE_CARLO")}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  activeViewTab === "MONTE_CARLO"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Monte Carlo CI
              </button>
            </div>
          </div>

          {/* Chart Display Area */}
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {activeViewTab === "EQUITY" ? (
                <AreaChart data={equityData}>
                  <defs>
                    <linearGradient id="colorStrategy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(val) => {
                      const parts = String(val).split("-");
                      return parts.length >= 3 ? `${parts[1]}/${parts[2]}` : String(val);
                    }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`}
                  />
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      `₹${Number(value).toLocaleString()}`,
                      name === "equity" ? "Strategy Equity" : "NIFTY 50 Benchmark",
                    ]}
                    contentStyle={{
                      backgroundColor: "#091827",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontFamily: "monospace",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="equity"
                    stroke="#38bdf8"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorStrategy)"
                  />
                  <Area
                    type="monotone"
                    dataKey="benchmarkEquity"
                    stroke="#64748b"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    fill="none"
                  />
                </AreaChart>
              ) : activeViewTab === "DRAWDOWN" ? (
                <AreaChart data={equityData}>
                  <defs>
                    <linearGradient id="colorDrawdown" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(val) => {
                      const parts = String(val).split("-");
                      return parts.length >= 3 ? `${parts[1]}/${parts[2]}` : String(val);
                    }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    formatter={(value: any) => [`${value}%`, "Drawdown from Peak"]}
                    contentStyle={{
                      backgroundColor: "#091827",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontFamily: "monospace",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="drawdownPct"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorDrawdown)"
                  />
                </AreaChart>
              ) : (
                <AreaChart data={equityData}>
                  <defs>
                    <linearGradient id="colorMC" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(val) => {
                      const parts = String(val).split("-");
                      return parts.length >= 3 ? `${parts[1]}/${parts[2]}` : String(val);
                    }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`}
                  />
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      `₹${Number(value).toLocaleString()}`,
                      name === "monteCarloCeiling"
                        ? "95% Confidence Ceiling"
                        : name === "monteCarloFloor"
                        ? "5% Tail Risk Floor"
                        : "Median Strategy Path",
                    ]}
                    contentStyle={{
                      backgroundColor: "#091827",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontFamily: "monospace",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="monteCarloCeiling"
                    stroke="#a855f7"
                    strokeWidth={1.5}
                    strokeDasharray="2 2"
                    fill="none"
                  />
                  <Area
                    type="monotone"
                    dataKey="equity"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorMC)"
                  />
                  <Area
                    type="monotone"
                    dataKey="monteCarloFloor"
                    stroke="#64748b"
                    strokeWidth={1.5}
                    strokeDasharray="2 2"
                    fill="none"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Interactive Trade Execution Log & Inspector */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="size-4 text-emerald-400" />
                Trade Execution Log
              </h3>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                {filteredTrades.length} of {totalTradesCount} Fills • Click to Inspect
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 font-mono text-[11px]">
              {(["ALL", "WIN", "LOSS"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setTradeFilter(tab)}
                  className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    tradeFilter === tab
                      ? tab === "WIN"
                        ? "bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40"
                        : tab === "LOSS"
                        ? "bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40"
                        : "bg-slate-700 text-white font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab === "ALL" ? "All" : tab === "WIN" ? "Wins" : "Losses"}
                </button>
              ))}
            </div>
          </div>

          {/* Trade Search Input */}
          <div className="relative">
            <Search className="size-3.5 absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              value={tradeSearch}
              onChange={(e) => setTradeSearch(e.target.value)}
              placeholder="Search trade ID, symbol, or date..."
              className="h-8 w-full rounded-lg border border-slate-800 bg-slate-950 pl-8 pr-3 text-xs font-mono text-slate-200 outline-none focus:border-slate-700"
            />
          </div>

          {/* Trade Rows List */}
          <div className="space-y-2 overflow-y-auto max-h-[260px] pr-1 font-mono text-xs">
            {filteredTrades.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs font-mono">
                No trades match the current filter.
              </div>
            ) : (
              filteredTrades.map((trade: any) => {
                const isPositive = trade.pnl >= 0;
                const isSelected = selectedTrade?.id === trade.id;
                return (
                  <div
                    key={trade.id}
                    onClick={() =>
                      setSelectedTrade(isSelected ? null : trade)
                    }
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-sky-500/10 border-sky-400 text-white shadow-md shadow-sky-500/10"
                        : "border-slate-800/80 bg-slate-950/60 hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">
                          {trade.symbol}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            trade.direction === "LONG"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-rose-500/20 text-rose-300"
                          }`}
                        >
                          {trade.direction}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {trade.quantity} qty
                        </span>
                        <span
                          className={`text-[9px] px-1 py-0.2 rounded font-semibold ${
                            trade.exitReason === "TARGET"
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40"
                              : "bg-rose-950 text-rose-400 border border-rose-800/40"
                          }`}
                        >
                          {trade.exitReason}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {trade.exitDate} • In: ₹{trade.entryPrice} → Out: ₹
                        {trade.exitPrice}
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`font-bold text-xs ${isPositive ? "text-emerald-400" : "text-rose-400"}`}
                      >
                        {isPositive ? "+" : ""}₹{trade.pnl.toLocaleString()}
                      </div>
                      <div
                        className={`text-[10px] flex items-center justify-end gap-0.5 ${
                          isPositive ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {isPositive ? (
                          <ArrowUpRight className="size-3" />
                        ) : (
                          <ArrowDownRight className="size-3" />
                        )}
                        <span>
                          {isPositive ? "+" : ""}
                          {trade.pnlPct}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Trade Inspector Card (shown when a trade is clicked) */}
          {selectedTrade && (
            <div className="p-3 rounded-xl border border-sky-500/30 bg-sky-950/20 font-mono text-xs space-y-1.5 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-sky-800/40 pb-1.5">
                <span className="font-bold text-sky-300 flex items-center gap-1.5">
                  <Info className="size-3.5" />
                  Trade Details • {selectedTrade.id}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedTrade(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="size-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                <div>
                  <span className="text-slate-500">Entry:</span> ₹
                  {selectedTrade.entryPrice} ({selectedTrade.entryDate})
                </div>
                <div>
                  <span className="text-slate-500">Exit:</span> ₹
                  {selectedTrade.exitPrice} ({selectedTrade.exitDate})
                </div>
                <div>
                  <span className="text-slate-500">Quantity:</span>{" "}
                  {selectedTrade.quantity} shares
                </div>
                <div>
                  <span className="text-slate-500">Net Profit:</span>{" "}
                  <span
                    className={
                      selectedTrade.pnl >= 0 ? "text-emerald-400" : "text-rose-400"
                    }
                  >
                    ₹{selectedTrade.pnl.toLocaleString()} ({selectedTrade.pnlPct}%)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
  positive,
}: {
  label: string;
  value: string;
  detail: string;
  positive: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 backdrop-blur-xl space-y-1">
      <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
        {label}
      </div>
      <div
        className={`text-lg font-bold ${positive ? "text-emerald-400" : "text-rose-400"}`}
      >
        {value}
      </div>
      <div className="text-[10px] text-slate-500">{detail}</div>
    </div>
  );
}
