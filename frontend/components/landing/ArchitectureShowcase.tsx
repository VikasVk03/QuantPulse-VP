import React from "react";
import { Cpu, Zap, Activity, HardDrive, CheckCircle2 } from "lucide-react";

export function ArchitectureShowcase() {
  return (
    <section
      id="technology"
      className="relative py-20 bg-[#030818] border-t border-sky-500/15 overflow-hidden"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute bottom-0 left-1/4 size-[500px] rounded-full bg-blue-600/10 blur-[140px]"></div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-950/40 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-widest text-teal-300 mb-4">
            <Cpu className="size-3.5" />
            <span>High-Performance C++20 Core</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Institutional Latency: <br />
            <span className="bg-gradient-to-r from-teal-400 via-sky-300 to-blue-400 bg-clip-text text-transparent">
              Sub-Microsecond Quantitative Engine
            </span>
          </h2>

          <p className="mt-4 text-slate-300 text-base leading-relaxed">
            Engineered in modern C++20 with zero heap allocation in the critical
            path, lock-free ring buffers, and SIMD vectorization for ultra-low
            latency analytics.
          </p>
        </div>

        {/* Benchmark Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {/* Metric 1 */}
          <div className="rounded-2xl border border-sky-500/25 bg-[#05122b]/80 p-5 backdrop-blur-xl transition-transform hover:-translate-y-1">
            <div className="flex items-center justify-between text-xs font-mono text-sky-400 mb-2">
              <span>STOIKOV MICROPRICE</span>
              <Zap className="size-4" />
            </div>
            <div className="text-3xl font-black font-mono text-white">
              23.5 ns
            </div>
            <div className="text-xs text-slate-400 mt-1">
              41.5M evaluations / sec
            </div>
            <div className="mt-3 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 rounded px-2 py-1 inline-block">
              Zero Heap Allocations
            </div>
          </div>

          {/* Metric 2 */}
          <div className="rounded-2xl border border-indigo-500/25 bg-[#081033]/80 p-5 backdrop-blur-xl transition-transform hover:-translate-y-1">
            <div className="flex items-center justify-between text-xs font-mono text-indigo-400 mb-2">
              <span>RISK SYNTHESIS</span>
              <Activity className="size-4" />
            </div>
            <div className="text-3xl font-black font-mono text-white">
              216 ns
            </div>
            <div className="text-xs text-slate-400 mt-1">
              4.4M regime checks / sec
            </div>
            <div className="mt-3 text-[10px] font-mono text-indigo-400 bg-indigo-500/10 rounded px-2 py-1 inline-block">
              4 Factor Pre-Trade Check
            </div>
          </div>

          {/* Metric 3 */}
          <div className="rounded-2xl border border-purple-500/25 bg-[#100b33]/80 p-5 backdrop-blur-xl transition-transform hover:-translate-y-1">
            <div className="flex items-center justify-between text-xs font-mono text-purple-400 mb-2">
              <span>ORDER MATCHING</span>
              <Zap className="size-4" />
            </div>
            <div className="text-3xl font-black font-mono text-white">
              &lt; 140 ns
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Multi-level queue sweeps
            </div>
            <div className="mt-3 text-[10px] font-mono text-purple-400 bg-purple-500/10 rounded px-2 py-1 inline-block">
              Price-Time Priority
            </div>
          </div>

          {/* Metric 4 */}
          <div className="rounded-2xl border border-teal-500/25 bg-[#051c24]/80 p-5 backdrop-blur-xl transition-transform hover:-translate-y-1">
            <div className="flex items-center justify-between text-xs font-mono text-teal-400 mb-2">
              <span>TEST VERIFICATION</span>
              <CheckCircle2 className="size-4" />
            </div>
            <div className="text-3xl font-black font-mono text-white">
              594 / 594
            </div>
            <div className="text-xs text-slate-400 mt-1">
              100% CTest GoogleTest pass
            </div>
            <div className="mt-3 text-[10px] font-mono text-teal-400 bg-teal-500/10 rounded px-2 py-1 inline-block">
              -Wall -Wextra -Wpedantic
            </div>
          </div>
        </div>

        {/* Architectural Flow Diagram */}
        <div className="rounded-3xl border border-sky-500/20 bg-gradient-to-b from-[#040e24]/90 to-[#020612]/95 p-6 sm:p-8 backdrop-blur-2xl">
          <h3 className="text-lg font-bold text-white font-mono uppercase tracking-wider mb-6 text-center">
            Event-Driven C++20 Core Execution Pipeline
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-center text-xs font-mono">
            {/* Step 1 */}
            <div className="rounded-xl border border-sky-500/30 bg-sky-950/30 p-3 flex flex-col justify-center">
              <span className="text-[10px] text-sky-400 font-bold">
                1. INGESTION
              </span>
              <span className="font-bold text-white mt-1">
                MarketData Buffer
              </span>
              <span className="text-[9px] text-slate-400 mt-1">
                Lock-free Ring Buffer
              </span>
            </div>

            {/* Step 2 */}
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-3 flex flex-col justify-center">
              <span className="text-[10px] text-cyan-400 font-bold">
                2. L2 ORDER BOOK
              </span>
              <span className="font-bold text-white mt-1">
                OrderBook Engine
              </span>
              <span className="text-[9px] text-slate-400 mt-1">
                Price-Time Depth
              </span>
            </div>

            {/* Step 3 */}
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/30 p-3 flex flex-col justify-center">
              <span className="text-[10px] text-indigo-400 font-bold">
                3. MICROSTRUCTURE
              </span>
              <span className="font-bold text-white mt-1">
                Stoikov Microprice
              </span>
              <span className="text-[9px] text-slate-400 mt-1">
                Depth Imbalance I_N
              </span>
            </div>

            {/* Step 4 */}
            <div className="rounded-xl border border-purple-500/30 bg-purple-950/30 p-3 flex flex-col justify-center">
              <span className="text-[10px] text-purple-400 font-bold">
                4. RISK ENGINE
              </span>
              <span className="font-bold text-white mt-1">
                Risk Intelligence
              </span>
              <span className="text-[9px] text-slate-400 mt-1">
                Dynamic Sizing & Halt
              </span>
            </div>

            {/* Step 5 */}
            <div className="rounded-xl border border-pink-500/30 bg-pink-950/30 p-3 flex flex-col justify-center">
              <span className="text-[10px] text-pink-400 font-bold">
                5. MATCHING
              </span>
              <span className="font-bold text-white mt-1">Matching Engine</span>
              <span className="text-[9px] text-slate-400 mt-1">
                Multi-Level Fills
              </span>
            </div>

            {/* Step 6 */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 flex flex-col justify-center">
              <span className="text-[10px] text-emerald-400 font-bold">
                6. PORTFOLIO
              </span>
              <span className="font-bold text-white mt-1">Portfolio State</span>
              <span className="text-[9px] text-slate-400 mt-1">
                Marked-to-Market P&L
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
