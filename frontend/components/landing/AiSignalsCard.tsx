import React from "react";
import { Sparkles, BrainCircuit } from "lucide-react";

interface SignalItem {
  symbol: string;
  action: "BUY" | "SELL" | "HOLD";
  confidence: string;
}

const SIGNALS: SignalItem[] = [
  { symbol: "RELIANCE", action: "BUY", confidence: "94%" },
  { symbol: "HDFCBANK", action: "BUY", confidence: "91%" },
  { symbol: "TCS", action: "HOLD", confidence: "76%" },
  { symbol: "INFY", action: "BUY", confidence: "88%" },
  { symbol: "ICICIBANK", action: "SELL", confidence: "85%" },
];

export function AiSignalsCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-xl border border-indigo-500/30 bg-[#0a102b]/85 p-3.5 backdrop-blur-xl shadow-[0_12px_32px_rgba(10,16,43,0.65),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-300 hover:border-indigo-400/50 hover:shadow-[0_16px_40px_rgba(99,102,241,0.25)] ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex size-5 items-center justify-center rounded-md bg-indigo-500/20 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.4)]">
            <BrainCircuit className="size-3" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
            AI Signals
          </span>
        </div>
        <div className="flex items-center gap-1 text-[9px] font-semibold text-indigo-400">
          <Sparkles className="size-2.5 text-indigo-400 animate-pulse" />
          <span>99.2% Acc</span>
        </div>
      </div>

      {/* Rows */}
      <div className="space-y-1.5 font-mono text-[11px]">
        {SIGNALS.map((item) => (
          <div
            key={item.symbol}
            className="flex items-center justify-between rounded px-2 py-1 transition-colors hover:bg-white/[0.04]"
          >
            <span className="font-semibold text-slate-200 tracking-tight">
              {item.symbol}
            </span>

            <div className="flex items-center gap-2">
              <span className="text-[9px] text-slate-400 font-sans hidden sm:inline">
                {item.confidence}
              </span>
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                  item.action === "BUY"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_8px_rgba(52,211,153,0.2)]"
                    : item.action === "SELL"
                      ? "bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.2)]"
                      : "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_8px_rgba(251,191,36,0.2)]"
                }`}
              >
                {item.action}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
