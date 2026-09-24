import React, { useState, useEffect } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Box,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Compass,
  Database,
  Eye,
  Layers,
  Percent,
  Play,
  Radio,
  RefreshCw,
  RotateCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { api } from "../../lib/apiClient";

interface RiskIntelligenceDashboardProps {
  onExecuteProtocol?: (step: number) => void;
}

const VAR_DISTRIBUTION_DATA = [
  { bin: "-15%", count: 4, isVaR: true },
  { bin: "-12%", count: 9, isVaR: true },
  { bin: "-9%", count: 24, isVaR: true },
  { bin: "-6%", count: 68, isVaR: false },
  { bin: "-3%", count: 145, isVaR: false },
  { bin: "0%", count: 210, isVaR: false, isMean: true },
  { bin: "+3%", count: 160, isVaR: false },
  { bin: "+6%", count: 75, isVaR: false },
  { bin: "+9%", count: 28, isVaR: false },
  { bin: "+12%", count: 11, isVaR: false },
  { bin: "+15%", count: 3, isVaR: false },
];

export function RiskIntelligenceDashboard({
  onExecuteProtocol,
}: RiskIntelligenceDashboardProps) {
  const [selectedViewMode, setSelectedViewMode] = useState<
    "RISK" | "RETURN" | "CONTRIBUTION"
  >("RISK");
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("1M");
  const [protocolStep, setProtocolStep] = useState<number>(2);

  const [riskData, setRiskData] = useState<any>(null);

  useEffect(() => {
    const fetchRisk = async () => {
      try {
        const json = await api.risk.getSurface();
        if (json.success) {
          setRiskData(json.data);
        }
      } catch {}
    };
    fetchRisk();
  }, []);

  const handleExecuteNextStep = () => {
    if (protocolStep < 4) {
      setProtocolStep((prev) => prev + 1);
      onExecuteProtocol?.(protocolStep + 1);
    }
  };

  const correlationLabels = riskData?.correlationMatrix?.assets || [
    "TF",
    "GM",
    "ELS",
    "ED",
    "CA",
    "VT",
    "MSA",
  ];
  const correlationMatrix = riskData?.correlationMatrix?.matrix || [
    [1.0, 0.32, -0.15, 0.27, -0.08, -0.21, 0.18],
    [0.32, 1.0, 0.45, 0.33, -0.12, 0.09, 0.22],
    [-0.15, 0.45, 1.0, 0.28, 0.35, -0.17, 0.41],
    [0.27, 0.33, 0.28, 1.0, 0.42, -0.05, 0.31],
    [-0.08, -0.12, 0.35, 0.42, 1.0, 0.38, 0.25],
    [-0.21, 0.09, -0.17, -0.05, 0.38, 1.0, -0.11],
    [0.18, 0.22, 0.41, 0.31, 0.25, -0.11, 1.0],
  ];

  const heatMapList = riskData?.heatMap3D || [
    { id: "RF-1", asset: "RELIANCE", weight: 28.5, var95Pct: 2.14, beta: 1.12 },
    { id: "RF-2", asset: "TCS", weight: 22.0, var95Pct: 1.82, beta: 0.88 },
    { id: "RF-3", asset: "INFY", weight: 15.5, var95Pct: 2.05, beta: 0.94 },
    { id: "RF-4", asset: "HDFCBANK", weight: 18.0, var95Pct: 2.45, beta: 1.25 },
    {
      id: "RF-5",
      asset: "ICICIBANK",
      weight: 10.0,
      var95Pct: 2.32,
      beta: 1.18,
    },
    {
      id: "RF-6",
      asset: "TATAMOTORS",
      weight: 6.0,
      var95Pct: 3.12,
      beta: 1.48,
    },
  ];

  const var95 = riskData?.portfolioVaR95 || 1.84;
  const var99 = riskData?.portfolioVaR99 || 2.92;
  const es = riskData?.expectedShortfall99 || 3.58;
  const sharpe = riskData?.sharpeRatio || 2.18;
  const drawdown = riskData?.currentDrawdown || -1.24;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400 mb-1">
            <ShieldAlert className="size-3.5" />
            <span>Risk Architect System • Portfolio Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Portfolio Risk Intelligence
            <span className="text-xs font-mono font-medium rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 px-3 py-0.5">
              7 Strategies • Total Portfolio
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Institutional value-at-risk limits, 3D factor heatmaps, cross-asset
            correlation matrices, and automated recovery protocols.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-300">
            <ShieldCheck className="size-4 text-emerald-400" />
            <span>Risk Protocol: Normal Limits</span>
          </div>
        </div>
      </div>

      {/* Top 5 Metric Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <RiskMetricCard
          title="TOTAL EXPOSURE"
          value="₹ 1.27B"
          subtitle="Net Liquidation Value"
          detail="Gross: ₹ 2.73B | 2.15x Lev"
          color="sky"
        />
        <RiskMetricCard
          title="VALUE AT RISK (95%)"
          value={`₹ ${(var95 * 21).toFixed(2)}M`}
          subtitle="1-Day Horizon (Parametric)"
          detail={`Portfolio VaR: ${var95}%`}
          color="purple"
        />
        <RiskMetricCard
          title="EXPECTED SHORTFALL"
          value={`₹ ${(es * 21).toFixed(2)}M`}
          subtitle="Conditional VaR (CVaR)"
          detail={`Tail Risk 99%: ${es}%`}
          color="rose"
        />
        <RiskMetricCard
          title="MAX DRAWDOWN"
          value={`${drawdown}%`}
          subtitle="Peak to Trough"
          detail="Risk Limit: -18.74%"
          color="amber"
        />
        <RiskMetricCard
          title="SHARPE / SORTINO"
          value={`${sharpe} / 3.12`}
          subtitle="Risk-Adjusted Alpha"
          detail="Annualized Excess Return"
          color="emerald"
        />
      </div>

      {/* Main 2-Column Grid: 3D Risk Heatmap & Correlation Matrix */}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1.1fr]">
        {/* Left: 3D Interactive Risk Heatmap */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Box className="size-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  Portfolio Heat Map (3D Factor Topology)
                  <span className="rounded bg-purple-500/20 border border-purple-500/30 px-1.5 py-0.2 text-[9px] text-purple-300 font-mono">
                    INTERACTIVE 3D
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  3D isometric risk distribution across strategies and factors.
                </p>
              </div>
            </div>

            {/* View Modes */}
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 p-1 text-[11px] font-mono">
              {(["RISK", "RETURN", "CONTRIBUTION"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSelectedViewMode(mode)}
                  className={`rounded px-2.5 py-1 font-semibold transition-colors cursor-pointer ${
                    selectedViewMode === mode
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* 3D Visual Rendering Canvas Container */}
          <div className="relative h-[290px] w-full rounded-xl border border-slate-800/90 bg-gradient-to-b from-[#081224] via-[#050c18] to-[#03070f] p-4 flex flex-col justify-between overflow-hidden shadow-inner">
            {/* 3D Risk Level Legend */}
            <div className="absolute right-4 top-4 rounded-lg border border-slate-800 bg-slate-950/80 p-2 text-[10px] font-mono space-y-1 z-10">
              <div className="text-slate-400 font-bold mb-1">RISK LEVEL</div>
              <div className="flex items-center gap-2 text-rose-400">
                <span className="size-2 rounded bg-rose-500" />
                <span>VERY HIGH</span>
              </div>
              <div className="flex items-center gap-2 text-amber-400">
                <span className="size-2 rounded bg-amber-500" />
                <span>HIGH</span>
              </div>
              <div className="flex items-center gap-2 text-yellow-400">
                <span className="size-2 rounded bg-yellow-500" />
                <span>MEDIUM</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <span className="size-2 rounded bg-emerald-500" />
                <span>LOW</span>
              </div>
              <div className="flex items-center gap-2 text-sky-400">
                <span className="size-2 rounded bg-sky-500" />
                <span>VERY LOW</span>
              </div>
            </div>

            {/* 3D Isometric Bar Grid Visualization */}
            <div className="flex-1 flex items-center justify-center pt-2">
              <div className="relative flex items-end justify-center gap-4 sm:gap-6 pb-6 select-none">
                {heatMapList.map((strat: any, idx: number) => {
                  const height = 40 + strat.weight * 4.5;
                  const colors = [
                    "from-rose-500 to-amber-500",
                    "from-amber-500 to-yellow-500",
                    "from-yellow-500 to-emerald-500",
                    "from-emerald-500 to-teal-500",
                    "from-teal-500 to-sky-500",
                    "from-sky-500 to-indigo-500",
                    "from-indigo-500 to-purple-500",
                  ];
                  const barGradient = colors[idx % colors.length];

                  return (
                    <div
                      key={strat.id || idx}
                      className="group flex flex-col items-center cursor-pointer transition-transform hover:-translate-y-1.5"
                    >
                      {/* Floating tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 rounded bg-slate-900 border border-slate-700 px-2 py-1 text-[10px] font-mono text-white whitespace-nowrap shadow-xl z-20 pointer-events-none">
                        {strat.asset || strat.name}: {strat.weight}% (VaR:{" "}
                        {strat.var95Pct || strat.var95}%)
                      </div>

                      {/* 3D Isometric Bar Column */}
                      <div
                        className="relative"
                        style={{ height: `${height}px` }}
                      >
                        <div
                          className={`w-7 sm:w-10 rounded-t-lg bg-gradient-to-t ${barGradient} shadow-[0_0_15px_rgba(168,85,247,0.3)] opacity-90 group-hover:opacity-100 transition-all`}
                          style={{ height: "100%" }}
                        />
                        {/* 3D Top cap */}
                        <div className="absolute -top-1.5 left-0 w-7 sm:w-10 h-3 rounded-full bg-white/40 blur-[1px]" />
                      </div>

                      <span className="mt-2 text-[10px] font-mono font-bold text-slate-300">
                        {strat.asset || strat.id}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">
                        {strat.weight}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <RotateCw
                  className="size-3 text-slate-500 animate-spin"
                  style={{ animationDuration: "12s" }}
                />
                <span>3D Perspective Orbit: Active</span>
              </div>
              <div className="flex items-center gap-1.5">
                {["1D", "1W", "1M", "YTD"].map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setSelectedTimeframe(tf)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      selectedTimeframe === tf
                        ? "bg-slate-800 text-sky-300 font-bold"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Correlation Matrix */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Compass className="size-4 text-sky-400" />
              Cross-Asset Correlation Matrix
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              Scale: -1.00 to +1.00
            </span>
          </div>

          {/* Matrix Grid */}
          <div className="overflow-x-auto">
            <table className="w-full text-center font-mono text-[11px]">
              <thead>
                <tr>
                  <th className="p-1 text-slate-500 text-[10px] text-left"></th>
                  {correlationLabels.map((l: string) => (
                    <th key={l} className="p-1 text-slate-400 font-bold">
                      {l}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {correlationMatrix.map((row: number[], rIdx: number) => (
                  <tr key={rIdx}>
                    <td className="p-1 text-slate-400 font-bold text-left">
                      {correlationLabels[rIdx]}
                    </td>
                    {row.map((val: number, cIdx: number) => {
                      let bgColor = "bg-slate-900 text-slate-300";
                      if (val === 1.0)
                        bgColor = "bg-sky-500/20 text-sky-300 font-bold";
                      else if (val > 0.35)
                        bgColor =
                          "bg-emerald-500/20 text-emerald-300 font-semibold";
                      else if (val > 0)
                        bgColor = "bg-slate-800/80 text-slate-200";
                      else if (val < -0.15)
                        bgColor = "bg-rose-500/20 text-rose-300";

                      return (
                        <td key={cIdx} className="p-1">
                          <div
                            className={`rounded py-1 px-1.5 transition-colors hover:scale-105 ${bgColor}`}
                          >
                            {val.toFixed(2)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-800 pt-2 text-[10px] font-mono text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="size-2 rounded bg-rose-500/40" /> -1.00 Neg
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded bg-slate-800" /> 0.00 Neutral
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded bg-emerald-500/40" /> +1.00 Pos
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: VaR Distribution & Recovery Protocols */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: VaR & Return Distribution */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="size-4 text-sky-400" />
              Return Distribution & VaR (95% / 99%)
            </h3>
            <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1 text-sky-400">
                <span className="size-2 rounded-full bg-sky-400" /> Mean (0%)
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="size-2 rounded-full bg-rose-400" /> VaR (95%)
              </span>
            </div>
          </div>

          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={VAR_DISTRIBUTION_DATA}>
                <XAxis
                  dataKey="bin"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#091827",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontFamily: "monospace",
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {VAR_DISTRIBUTION_DATA.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.isVaR
                          ? "#f43f5e"
                          : entry.isMean
                            ? "#38bdf8"
                            : "#3b82f6"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-xs font-mono pt-2 border-t border-slate-800/80">
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-500 text-[10px]">
                Parametric VaR 95%
              </span>
              <div className="font-bold text-rose-400">
                ₹ {(var95 * 21).toFixed(2)}M
              </div>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-500 text-[10px]">
                Parametric VaR 99%
              </span>
              <div className="font-bold text-rose-300">
                ₹ {(var99 * 21).toFixed(2)}M
              </div>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-500 text-[10px]">
                Expected Shortfall (ES)
              </span>
              <div className="font-bold text-amber-300">
                ₹ {(es * 21).toFixed(2)}M
              </div>
            </div>
          </div>
        </div>

        {/* Right: De-Risking Sequence Protocols */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Automated De-Risking Sequence
              </h3>
            </div>
            <span className="rounded-md bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-300">
              TRIGGER: DRAWDOWN &gt; -15%
            </span>
          </div>

          <div className="space-y-2.5">
            <ProtocolStepRow
              step={1}
              title="Reduce Gross Exposure by 25%"
              status={
                protocolStep > 1
                  ? "COMPLETED"
                  : protocolStep === 1
                    ? "IN_PROGRESS"
                    : "PENDING"
              }
            />
            <ProtocolStepRow
              step={2}
              title="Hedge Market Beta (NIFTY Index Futures)"
              status={
                protocolStep > 2
                  ? "COMPLETED"
                  : protocolStep === 2
                    ? "IN_PROGRESS"
                    : "PENDING"
              }
            />
            <ProtocolStepRow
              step={3}
              title="Reduce Highly Correlated Strategy Positions"
              status={
                protocolStep > 3
                  ? "COMPLETED"
                  : protocolStep === 3
                    ? "IN_PROGRESS"
                    : "PENDING"
              }
            />
            <ProtocolStepRow
              step={4}
              title="Raise Cash Buffer to 20% Liquidity"
              status={
                protocolStep > 4
                  ? "COMPLETED"
                  : protocolStep === 4
                    ? "IN_PROGRESS"
                    : "PENDING"
              }
            />
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-400 font-mono">
              Protocol Status:{" "}
              <strong className="text-amber-300">
                Step {protocolStep} of 4 Active ({protocolStep * 25}%)
              </strong>
            </div>

            <button
              type="button"
              onClick={handleExecuteNextStep}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-rose-500/20 hover:scale-[1.02] transition-all cursor-pointer"
            >
              <span>Execute Protocol Step {protocolStep}</span>
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RiskMetricCard({
  title,
  value,
  subtitle,
  detail,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  detail: string;
  color: "sky" | "purple" | "rose" | "amber" | "emerald";
}) {
  const borderMap = {
    sky: "border-sky-500/30 bg-sky-950/10",
    purple: "border-purple-500/30 bg-purple-950/10",
    rose: "border-rose-500/30 bg-rose-950/10",
    amber: "border-amber-500/30 bg-amber-950/10",
    emerald: "border-emerald-500/30 bg-emerald-950/10",
  };

  return (
    <div
      className={`rounded-2xl border p-4 backdrop-blur-xl shadow-lg space-y-1.5 ${borderMap[color]}`}
    >
      <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
        {title}
      </div>
      <div className="text-xl font-bold font-mono text-white">{value}</div>
      <div className="text-xs text-slate-300 font-medium">{subtitle}</div>
      <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/80">
        {detail}
      </div>
    </div>
  );
}

function ProtocolStepRow({
  step,
  title,
  status,
}: {
  step: number;
  title: string;
  status: "COMPLETED" | "IN_PROGRESS" | "PENDING";
}) {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
        status === "COMPLETED"
          ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-300"
          : status === "IN_PROGRESS"
            ? "border-amber-500/40 bg-amber-950/30 text-amber-200 shadow-md shadow-amber-500/10"
            : "border-slate-800/80 bg-slate-950/40 text-slate-400"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex size-6 items-center justify-center rounded-full text-xs font-mono font-bold ${
            status === "COMPLETED"
              ? "bg-emerald-500/20 text-emerald-400"
              : status === "IN_PROGRESS"
                ? "bg-amber-500/20 text-amber-300"
                : "bg-slate-800 text-slate-400"
          }`}
        >
          {status === "COMPLETED" ? "✓" : step}
        </span>
        <span className="text-xs font-semibold">{title}</span>
      </div>

      <span
        className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
          status === "COMPLETED"
            ? "bg-emerald-500/20 text-emerald-300"
            : status === "IN_PROGRESS"
              ? "bg-amber-500/20 text-amber-300 animate-pulse"
              : "bg-slate-800 text-slate-500"
        }`}
      >
        {status.replace("_", " ")}
      </span>
    </div>
  );
}
