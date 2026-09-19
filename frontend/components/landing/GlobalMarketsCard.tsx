import React, { useState, useEffect } from "react";
import { Globe, TrendingUp, TrendingDown } from "lucide-react";

interface GlobalIndexItem {
  index: string;
  value: number;
  changePercent: number;
  isUp: boolean;
}

const GLOBAL_INDICES: GlobalIndexItem[] = [
  { index: "DOW", value: 41563.28, changePercent: 0.41, isUp: true },
  { index: "NASDAQ", value: 17892.11, changePercent: 0.73, isUp: true },
  { index: "FTSE", value: 8276.15, changePercent: -0.12, isUp: false },
  { index: "NIKKEI", value: 38124.2, changePercent: 0.62, isUp: true },
];

export function GlobalMarketsCard({ className = "" }: { className?: string }) {
  const [indices, setIndices] = useState<GlobalIndexItem[]>(GLOBAL_INDICES);

  useEffect(() => {
    const timer = setInterval(() => {
      const idx = Math.floor(Math.random() * GLOBAL_INDICES.length);
      setIndices((prev) => {
        const next = [...prev];
        const item = { ...next[idx] };
        const delta = (Math.random() * 0.3 - 0.14) * (item.value * 0.0006);
        item.value = Number((item.value + delta).toFixed(2));
        next[idx] = item;
        return next;
      });
    }, 3200);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={`rounded-xl border border-teal-500/30 bg-[#061524]/85 p-3.5 backdrop-blur-xl shadow-[0_12px_32px_rgba(6,21,36,0.65),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-300 hover:border-teal-400/50 hover:shadow-[0_16px_40px_rgba(45,212,191,0.2)] ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-teal-500/20 pb-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex size-5 items-center justify-center rounded-md bg-teal-500/20 text-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.4)]">
            <Globe className="size-3" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300">
            Global Markets
          </span>
        </div>
        <span className="text-[9px] font-semibold text-teal-400 uppercase tracking-wider">
          Sync 24/7
        </span>
      </div>

      {/* Rows */}
      <div className="space-y-1.5 font-mono text-[11px]">
        {indices.map((item) => (
          <div
            key={item.index}
            className="flex items-center justify-between rounded px-2 py-1 transition-colors hover:bg-white/[0.04]"
          >
            <span className="font-semibold text-slate-200 tracking-tight">
              {item.index}
            </span>
            <span className="text-slate-300">
              {item.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            <div
              className={`flex items-center gap-0.5 font-bold text-[10px] ${
                item.isUp ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {item.isUp ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
              <span>
                {item.isUp ? "+" : ""}
                {item.changePercent.toFixed(2)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
