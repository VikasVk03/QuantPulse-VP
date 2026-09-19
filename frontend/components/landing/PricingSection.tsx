import React from "react";
import { Check, Zap, Shield, Sparkles, Terminal } from "lucide-react";

export function PricingSection({
  onLaunchTerminal,
}: {
  onLaunchTerminal?: () => void;
}) {
  return (
    <section
      id="pricing"
      className="relative py-20 bg-[#030818] border-t border-sky-500/15 overflow-hidden"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-950/40 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-widest text-sky-400 mb-4">
            <Zap className="size-3.5" />
            <span>Transparent Institutional Access</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Designed for Quantitative Traders & <br />
            <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Institutional Research Teams
            </span>
          </h2>

          <p className="mt-4 text-slate-300 text-base leading-relaxed">
            Deploy self-hosted C++20 quantitative engine nodes or connect via
            ultra-low latency WebSocket feeds.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Plan 1: Developer */}
          <div className="rounded-3xl border border-slate-700/50 bg-[#050e24]/80 p-6 sm:p-8 backdrop-blur-xl flex flex-col justify-between transition-transform hover:-translate-y-1">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">
                COMMUNITY & RESEARCH
              </div>
              <h3 className="text-2xl font-black text-white mt-1">Open Core</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">$0</span>
                <span className="text-xs text-slate-400">/ forever free</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                For quantitative researchers and developers exploring
                microstructure and risk models.
              </p>

              <ul className="mt-6 space-y-3 text-xs text-slate-300 font-mono">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-400 shrink-0" />
                  <span>C++20 Quantitative Core Library</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-400 shrink-0" />
                  <span>Stoikov Microprice & Imbalance</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-400 shrink-0" />
                  <span>594 Unit Tests & Benchmark Suite</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-400 shrink-0" />
                  <span>Local Terminal & Dashboard</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onLaunchTerminal}
              className="mt-8 w-full rounded-xl border border-slate-600 bg-slate-800/80 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-slate-700 transition-colors"
            >
              Start Building
            </button>
          </div>

          {/* Plan 2: Pro Trader (Featured) */}
          <div className="relative rounded-3xl border-2 border-sky-400/80 bg-gradient-to-b from-[#0a1b42]/90 to-[#040c24]/95 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_0_50px_rgba(56,189,248,0.25)] flex flex-col justify-between transform md:-translate-y-2">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-black shadow-md">
              MOST POPULAR
            </div>

            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-sky-400 font-bold">
                PROFESSIONAL DESK
              </div>
              <h3 className="text-2xl font-black text-white mt-1">Quant Pro</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">$149</span>
                <span className="text-xs text-slate-400">/ user / mo</span>
              </div>
              <p className="text-xs text-slate-300 mt-2">
                For active proprietary traders and small quantitative funds
                demanding sub-microsecond analytics.
              </p>

              <ul className="mt-6 space-y-3 text-xs text-slate-200 font-mono">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-sky-400 shrink-0" />
                  <span>All Open Core Features</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-sky-400 shrink-0" />
                  <span>Real-time AI Signals Stream (100+ tickers)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-sky-400 shrink-0" />
                  <span>Risk Intelligence Engine & Kill-Switch</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-sky-400 shrink-0" />
                  <span>Full Backtesting Suite with Latency Replay</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-sky-400 shrink-0" />
                  <span>WebSocket & REST Stream Access</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onLaunchTerminal}
              className="mt-8 w-full rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_25px_rgba(56,189,248,0.4)] hover:scale-105 transition-all"
            >
              Get Started Now →
            </button>
          </div>

          {/* Plan 3: Institutional */}
          <div className="rounded-3xl border border-purple-500/30 bg-[#0e0a2b]/80 p-6 sm:p-8 backdrop-blur-xl flex flex-col justify-between transition-transform hover:-translate-y-1">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-purple-400 font-bold">
                ENTERPRISE & HEDGE FUNDS
              </div>
              <h3 className="text-2xl font-black text-white mt-1">
                Institutional
              </h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">Custom</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                For hedge funds and market makers requiring dedicated co-located
                C++ nodes and custom FIX gateways.
              </p>

              <ul className="mt-6 space-y-3 text-xs text-slate-300 font-mono">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-purple-400 shrink-0" />
                  <span>Dedicated Ultra-Low Latency Co-located Nodes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-purple-400 shrink-0" />
                  <span>Custom FIX / ITCH Protocol Feeds</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-purple-400 shrink-0" />
                  <span>Custom Microstructure & Risk Engine Extensions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-purple-400 shrink-0" />
                  <span>24/7 SLA & Dedicated Quant Engineer Support</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onLaunchTerminal}
              className="mt-8 w-full rounded-xl border border-purple-500/40 bg-purple-950/40 py-3 text-xs font-bold uppercase tracking-wider text-purple-200 hover:bg-purple-900/60 transition-colors"
            >
              Contact Institutional Sales
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
