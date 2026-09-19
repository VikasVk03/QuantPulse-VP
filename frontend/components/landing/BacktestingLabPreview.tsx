import React from "react";
import {
  LineChart,
  TrendingUp,
  BarChart,
  Percent,
  ShieldCheck,
  Check,
} from "lucide-react";

export function BacktestingLabPreview({
  onLaunchTerminal,
}: {
  onLaunchTerminal?: () => void;
}) {
  return (
    <section
      id="backtesting"
      className="relative py-20 bg-[#020715] border-t border-purple-500/15 overflow-hidden"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 size-[600px] -translate-x-1/2 rounded-full bg-purple-600/10 blur-[160px]"></div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-950/40 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-widest text-purple-300 mb-4">
            <LineChart className="size-3.5" />
            <span>Research & Backtesting Lab</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Institutional Strategy Verification: <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-300 to-indigo-400 bg-clip-text text-transparent">
              Realistic Execution & Cost Simulation
            </span>
          </h2>

          <p className="mt-4 text-slate-300 text-base leading-relaxed">
            Eliminate backtest overfitting. QuantPulse models realistic exchange
            latency, order book liquidity consumption, bid-ask spread friction,
            and linear market impact.
          </p>
        </div>

        {/* Backtest Dashboard Card */}
        <div className="rounded-3xl border border-purple-500/25 bg-gradient-to-b from-[#090b2c]/90 to-[#030617]/95 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.6)]">
          {/* Top Performance Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8 border-b border-purple-500/20 pb-6">
            <div className="rounded-xl bg-[#04081c] border border-purple-500/20 p-3 text-center">
              <div className="text-[10px] font-mono uppercase text-slate-400">
                SHARPE RATIO
              </div>
              <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
                2.84
              </div>
              <div className="text-[9px] text-slate-500">Risk-Adjusted</div>
            </div>

            <div className="rounded-xl bg-[#04081c] border border-purple-500/20 p-3 text-center">
              <div className="text-[10px] font-mono uppercase text-slate-400">
                SORTINO RATIO
              </div>
              <div className="text-2xl font-black font-mono text-cyan-400 mt-1">
                3.42
              </div>
              <div className="text-[9px] text-slate-500">Downside Adjusted</div>
            </div>

            <div className="rounded-xl bg-[#04081c] border border-purple-500/20 p-3 text-center">
              <div className="text-[10px] font-mono uppercase text-slate-400">
                MAX DRAWDOWN
              </div>
              <div className="text-2xl font-black font-mono text-emerald-300 mt-1">
                -4.2%
              </div>
              <div className="text-[9px] text-slate-500">Risk-Controlled</div>
            </div>

            <div className="rounded-xl bg-[#04081c] border border-purple-500/20 p-3 text-center">
              <div className="text-[10px] font-mono uppercase text-slate-400">
                WIN RATE
              </div>
              <div className="text-2xl font-black font-mono text-purple-300 mt-1">
                68.4%
              </div>
              <div className="text-[9px] text-slate-500">1,420 Trades</div>
            </div>

            <div className="col-span-2 sm:col-span-1 rounded-xl bg-[#04081c] border border-purple-500/20 p-3 text-center">
              <div className="text-[10px] font-mono uppercase text-slate-400">
                PROFIT FACTOR
              </div>
              <div className="text-2xl font-black font-mono text-pink-400 mt-1">
                2.18
              </div>
              <div className="text-[9px] text-slate-500">Gross Win / Loss</div>
            </div>
          </div>

          {/* Equity Curve SVG Visualization */}
          <div className="relative rounded-2xl bg-[#020512] border border-slate-800 p-4 sm:p-6 mb-6">
            <div className="flex items-center justify-between mb-3 text-xs font-mono">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sky-400 font-bold">
                  <span className="size-2 rounded-full bg-sky-400"></span>
                  <span>QuantPulse Adaptive Strategy (+48.6%)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 hidden sm:flex">
                  <span className="size-2 rounded-full bg-slate-600"></span>
                  <span>Static Benchmark (+14.2%)</span>
                </div>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                Live Simulation
              </span>
            </div>

            {/* Equity Curve SVG */}
            <div className="w-full h-48 sm:h-64">
              <svg
                viewBox="0 0 800 240"
                className="w-full h-full overflow-visible"
              >
                <defs>
                  <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="benchGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#64748b" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#64748b" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid horizontal lines */}
                <line
                  x1="0"
                  y1="40"
                  x2="800"
                  y2="40"
                  stroke="#1e293b"
                  strokeDasharray="4 4"
                />
                <line
                  x1="0"
                  y1="100"
                  x2="800"
                  y2="100"
                  stroke="#1e293b"
                  strokeDasharray="4 4"
                />
                <line
                  x1="0"
                  y1="160"
                  x2="800"
                  y2="160"
                  stroke="#1e293b"
                  strokeDasharray="4 4"
                />
                <line
                  x1="0"
                  y1="220"
                  x2="800"
                  y2="220"
                  stroke="#1e293b"
                  strokeDasharray="4 4"
                />

                {/* Benchmark curve (grey) */}
                <path
                  d="M0,200 Q150,185 300,195 T500,165 T700,145 T800,130"
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="2"
                />

                {/* QuantPulse Strategy Area Fill */}
                <path
                  d="M0,200 Q120,170 240,140 T420,110 T600,60 T750,35 T800,20 L800,240 L0,240 Z"
                  fill="url(#equityGrad)"
                />

                {/* QuantPulse Strategy Line (Neon blue/cyan) */}
                <path
                  d="M0,200 Q120,170 240,140 T420,110 T600,60 T750,35 T800,20"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Key Buy/Sell Execution Dots */}
                <circle cx="240" cy="140" r="4" fill="#34d399" />
                <circle cx="420" cy="110" r="4" fill="#34d399" />
                <circle cx="600" cy="60" r="4" fill="#38bdf8" />
                <circle
                  cx="800"
                  cy="20"
                  r="5"
                  fill="#a855f7"
                  className="animate-ping"
                />
                <circle cx="800" cy="20" r="4" fill="#ffffff" />
              </svg>
            </div>
          </div>

          {/* CTA Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-xs text-slate-400">
              Run multi-asset backtests with sub-microsecond tick replay in the
              interactive terminal.
            </div>

            {onLaunchTerminal && (
              <button
                onClick={onLaunchTerminal}
                className="w-full sm:w-auto rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-105 transition-all"
              >
                Run Strategy in Terminal →
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
