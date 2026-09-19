import React from "react";
import {
  X,
  Play,
  Activity,
  Terminal,
  CheckCircle2,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchTerminal: () => void;
}

export function DemoModal({
  isOpen,
  onClose,
  onLaunchTerminal,
}: DemoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-3xl border border-sky-500/40 bg-[#061026] p-6 sm:p-8 shadow-[0_0_80px_rgba(56,189,248,0.3)] animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          <X className="size-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex size-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
            <Play className="size-5 fill-sky-400 ml-0.5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              QuantPulse Platform Overview
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              C++20 Market Microstructure & Risk Intelligence Engine Demo
            </p>
          </div>
        </div>

        {/* Simulated Video Preview / Interactive Terminal Simulation Screen */}
        <div className="relative rounded-2xl border border-slate-700/60 bg-[#020510] p-6 font-mono text-xs overflow-hidden shadow-inner">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-rose-500"></span>
              <span className="size-3 rounded-full bg-amber-500"></span>
              <span className="size-3 rounded-full bg-emerald-500"></span>
              <span className="text-[11px] text-slate-400 ml-2">
                quantpulse-terminal.cpp20
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>SIMULATION STREAMING · 60 FPS</span>
            </div>
          </div>

          <div className="space-y-2 text-slate-300">
            <div className="text-sky-400 font-bold">
              [14:32:01.004] INIT QuantPulse Quantitative Engine v2.0 (C++20
              compiled with -O3 -march=native)
            </div>
            <div>
              [14:32:01.012]{" "}
              <span className="text-emerald-400">✓ 594 / 594</span> Unit &
              Integration Tests verified (100% pass)
            </div>
            <div>
              [14:32:01.015] Ingesting L2 Order Book snapshot:{" "}
              <span className="text-white">
                RELIANCE (Bids: 480k, Asks: 210k)
              </span>
            </div>
            <div>
              [14:32:01.016] Computing Stoikov Depth-Weighted Microprice:{" "}
              <span className="text-cyan-300 font-bold">$2,946.85</span> (Drift:
              +$1.65 vs Mid: $2,945.20)
            </div>
            <div>
              [14:32:01.016] Depth Imbalance I_N ={" "}
              <span className="text-emerald-400 font-bold">
                +0.391 (Buy Pressure)
              </span>{" "}
              [Latency: 23.5 ns]
            </div>
            <div>
              [14:32:01.017] RiskIntelligenceEngine: Classifying Regime &rarr;{" "}
              <span className="text-emerald-300 font-bold">
                NORMAL (Score: 24.2 / 100)
              </span>{" "}
              [Latency: 216 ns]
            </div>
            <div>
              [14:32:01.018] TradingEngine: Generating Buy Order 25 units @
              $2,945.50 &rarr; Sizing Multiplier 1.00x applied
            </div>
            <div className="text-emerald-400">
              [14:32:01.019] MatchingEngine: MATCH EXECUTED @ $2,945.50 (Fill:
              25/25 units) [Latency: 138 ns]
            </div>
            <div className="text-purple-400">
              [14:32:01.020] PortfolioStateEngine: Realized P&L: +$412.50 |
              Total Equity: $1,024,800.00
            </div>
          </div>

          {/* Interactive Action Overlay */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Zap className="size-3.5 text-sky-400" /> Sub-microsecond
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-emerald-400" /> Zero
                Regressions
              </span>
            </div>

            <button
              onClick={() => {
                onClose();
                onLaunchTerminal();
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:scale-105 transition-all"
            >
              <Terminal className="size-4" />
              <span>Launch Full Interactive Terminal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
