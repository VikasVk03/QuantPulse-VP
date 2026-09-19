import React from "react";
import { Activity, GitBranch, Shield, Terminal, ArrowUp } from "lucide-react";

export function LandingFooter({
  onLaunchTerminal,
}: {
  onLaunchTerminal?: () => void;
}) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative border-t border-sky-500/15 bg-[#020510] pt-16 pb-12 text-slate-400 text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex size-10 sm:size-11 items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <img
                  src="/assets/logo.png"
                  alt="QuantPulse Logo"
                  className="size-full object-contain drop-shadow-[0_0_14px_rgba(56,189,248,0.7)]"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-white tracking-tight">
                  Quant
                  <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_28px_rgba(168,85,247,0.75)]">
                    Pulse
                  </span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 font-mono">
                  Market Microstructure & Risk Intelligence Platform
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              An institutional-grade quantitative research, microstructure
              intelligence, and real-time risk execution engine built in modern
              C++20.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-[10px] font-mono text-emerald-300">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>660/660 Tests Verified (100% CTest)</span>
              </div>
            </div>
          </div>

          {/* Col 1: Platform */}
          <div className="space-y-3 font-mono">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              Platform
            </div>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a
                  href="#microstructure"
                  className="hover:text-sky-400 transition-colors"
                >
                  Stoikov Microprice
                </a>
              </li>
              <li>
                <a
                  href="#risk-intelligence"
                  className="hover:text-sky-400 transition-colors"
                >
                  Risk Intelligence Engine
                </a>
              </li>
              <li>
                <a
                  href="#backtesting"
                  className="hover:text-sky-400 transition-colors"
                >
                  Backtesting Lab
                </a>
              </li>
              <li>
                <button
                  onClick={onLaunchTerminal}
                  className="hover:text-sky-400 transition-colors text-left"
                >
                  Market Terminal
                </button>
              </li>
            </ul>
          </div>

          {/* Col 2: Architecture */}
          <div className="space-y-3 font-mono">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              Architecture
            </div>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a
                  href="#technology"
                  className="hover:text-sky-400 transition-colors"
                >
                  C++20 Core Engine
                </a>
              </li>
              <li>
                <a
                  href="#technology"
                  className="hover:text-sky-400 transition-colors"
                >
                  Zero-Allocation Matching
                </a>
              </li>
              <li>
                <a
                  href="#technology"
                  className="hover:text-sky-400 transition-colors"
                >
                  Order Book L2 Queues
                </a>
              </li>
              <li>
                <a
                  href="#technology"
                  className="hover:text-sky-400 transition-colors"
                >
                  Sub-Microsecond Latency
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Research & Docs */}
          <div className="space-y-3 font-mono">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              Research
            </div>
            <ul className="space-y-2 text-slate-400">
              <li>
                <span className="text-slate-300">quant-model.md</span>
              </li>
              <li>
                <span className="text-slate-300">PROJECT_STATE.md</span>
              </li>
              <li>
                <span className="text-slate-300">Stoikov (2018) Model</span>
              </li>
              <li>
                <span className="text-slate-300">
                  Multi-Regime Risk Synthesis
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & Scroll To Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 font-mono text-[11px]">
          <div>
            © {new Date().getFullYear()} QuantPulse Platform. Built with C++20,
            React & TypeScript. All rights reserved.
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          >
            <span>Back to Top</span>
            <ArrowUp className="size-3" />
          </button>
        </div>
      </div>
    </footer>
  );
}
