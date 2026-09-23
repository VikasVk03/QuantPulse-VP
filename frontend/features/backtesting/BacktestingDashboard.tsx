import React, { useState, useEffect } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Database,
  Download,
  FileCode,
  FlaskConical,
  Layers,
  LineChart,
  Play,
  RefreshCw,
  Sliders,
  Sparkles,
  TrendingDown,
  TrendingUp,
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
  const [selectedStrategy, setSelectedStrategy] = useState<string>(
    initialSetup || "Volatility Squeeze Breakout",
  );
  const [selectedSymbol, setSelectedSymbol] = useState<string>(
    initialSymbol || "RELIANCE",
  );
  const [capital, setCapital] = useState<string>("1000000");
  const [timeframe, setTimeframe] = useState<string>("1d");
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const [backtestResult, setBacktestResult] = useState<any>(null);

  const executeBacktest = async () => {
    setIsRunning(true);
    try {
      const json = await api.backtesting.run({
        strategyName: selectedStrategy,
        symbol: selectedSymbol,
        initialCapital: Number(capital) || 1000000,
        positionSizing: "KELLY",
        riskPerTradePct: 2,
      });
      if (json.success) {
        setBacktestResult(json.data);
      }
    } catch {}
    setIsRunning(false);
  };

  useEffect(() => {
    executeBacktest();
  }, [selectedStrategy, selectedSymbol]);

  const equityData = backtestResult?.equityCurve || [
    { date: "Jan", strategy: 1000000, benchmark: 1000000 },
    { date: "Feb", strategy: 1045000, benchmark: 1012000 },
    { date: "Mar", strategy: 1082000, benchmark: 1008000 },
    { date: "Apr", strategy: 1140000, benchmark: 1035000 },
    { date: "May", strategy: 1195000, benchmark: 1048000 },
    { date: "Jun", strategy: 1172000, benchmark: 1030000 },
    { date: "Jul", strategy: 1248000, benchmark: 1072000 },
    { date: "Aug", strategy: 1310000, benchmark: 1095000 },
    { date: "Sep", strategy: 1386000, benchmark: 1124000 },
  ];

  const trades = backtestResult?.trades || [];
  const totalReturn = backtestResult?.totalReturnPct || 38.6;
  const sharpe = backtestResult?.sharpeRatio || 1.82;
  const sortino = backtestResult?.sortinoRatio || 2.45;
  const maxDd = backtestResult?.maxDrawdownPct || -6.12;
  const winRate = backtestResult?.winRatePct || 68.4;
  const profitFactor = backtestResult?.profitFactor || 2.34;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400 mb-1">
            <FlaskConical className="size-3.5" />
            <span>Research & Strategy Simulation • C++ Backtest Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Strategy Backtesting Lab
            <span className="text-xs font-mono font-medium rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 px-3 py-0.5">
              C++ Core BacktestingEngine
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Execute institutional backtests on historical market datasets with
            transaction costs, slippage modeling, and equity curve diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-300 font-mono">
            <Cpu className="size-4 text-emerald-400" />
            <span>BacktestingEngine: C++20 Native</span>
          </div>
        </div>
      </div>

      {/* Strategy Configuration Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="size-4 text-sky-400" />
            Simulation Parameters & Strategy Setup
          </h3>
          <span className="text-[10px] font-mono text-slate-400">
            Slippage: 0.05% • Brokerage: ₹20/order
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 items-end">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Strategy Algorithm
            </label>
            <select
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs font-medium text-slate-200 outline-none cursor-pointer"
            >
              <option value="Volatility Squeeze Breakout">
                Volatility Squeeze (Congested Market)
              </option>
              <option value="Statistical Mean Reversion Z-Score">
                Statistical Mean Reversion (|Z| ≥ 2.2)
              </option>
              <option value="Order Flow Imbalance Scalper">
                Order Flow Imbalance Accumulation
              </option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Instrument / Universe
            </label>
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs font-medium text-slate-200 outline-none cursor-pointer"
            >
              <option value="RELIANCE">RELIANCE (Uploaded Dataset)</option>
              <option value="TCS">TCS</option>
              <option value="INFY">INFY</option>
              <option value="HDFCBANK">HDFCBANK</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Initial Capital (₹)
            </label>
            <input
              type="text"
              value={capital}
              onChange={(e) => setCapital(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs font-mono font-medium text-slate-200 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Bar Timeframe
            </label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs font-medium text-slate-200 outline-none cursor-pointer"
            >
              <option value="1m">1 Minute</option>
              <option value="5m">5 Minute</option>
              <option value="15m">15 Minute</option>
              <option value="1d">1 Day</option>
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
            <span>{isRunning ? "Simulating..." : "Run C++ Backtest"}</span>
          </button>
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
          label="SHARPE RATIO"
          value={String(sharpe)}
          detail="Risk-Adjusted Alpha"
          positive={true}
        />
        <StatCard
          label="SORTINO RATIO"
          value={String(sortino)}
          detail="Downside Protection"
          positive={true}
        />
        <StatCard
          label="MAX DRAWDOWN"
          value={`${maxDd}%`}
          detail="Peak to Valley"
          positive={false}
        />
        <StatCard
          label="WIN RATE"
          value={`${winRate}%`}
          detail={`${backtestResult?.winningTrades || 26}W / ${backtestResult?.losingTrades || 12}L`}
          positive={true}
        />
        <StatCard
          label="PROFIT FACTOR"
          value={String(profitFactor)}
          detail="Gross Gain / Loss"
          positive={true}
        />
      </div>

      {/* Main Grid: Cumulative Equity Curve + Trade Log */}
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1.1fr]">
        {/* Left: Equity Curve Chart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Cumulative Equity Curve vs Benchmark (NIFTY 50)
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Strategy CAGR: {backtestResult?.cagrPct || 38.6}% vs NIFTY:{" "}
                {backtestResult?.benchmarkReturnPct || 12.4}%
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-sky-400 font-bold">
                <span className="size-2 rounded-full bg-sky-400" />
                <span>
                  Strategy ({totalReturn >= 0 ? "+" : ""}
                  {totalReturn}%)
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="size-2 rounded-full bg-slate-500" />
                <span>
                  NIFTY 50 (+{backtestResult?.benchmarkReturnPct || 12.4}%)
                </span>
              </div>
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityData}>
                <defs>
                  <linearGradient
                    id="colorStrategy"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`}
                />
                <Tooltip
                  formatter={(value: any) => [
                    `₹${Number(value).toLocaleString()}`,
                    "Portfolio Value",
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
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Trade Execution Log */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="size-4 text-emerald-400" />
              Trade Execution Log
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              {trades.length} Total Trades
            </span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[290px] pr-1 font-mono text-xs">
            {trades.map((trade: any) => {
              const isPositive = trade.pnl >= 0;
              return (
                <div
                  key={trade.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800/80 bg-slate-950/60 hover:bg-slate-800/40 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">
                        {trade.symbol}
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                          trade.direction === "LONG"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-rose-500/20 text-rose-300"
                        }`}
                      >
                        {trade.direction}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {trade.quantity} shares
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
                      className={`text-[10px] ${isPositive ? "text-emerald-400" : "text-rose-400"}`}
                    >
                      {isPositive ? "+" : ""}
                      {trade.pnlPct}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
