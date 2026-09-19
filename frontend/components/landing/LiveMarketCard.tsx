import React, { useState, useEffect } from "react";
import { Zap, TrendingUp, TrendingDown } from "lucide-react";

interface TickerItem {
  symbol: string;
  price: number;
  changePercent: number;
  isUp: boolean;
}

const INITIAL_TICKERS: TickerItem[] = [
  { symbol: "NIFTY", price: 24882.3, changePercent: 0.72, isUp: true },
  { symbol: "SENSEX", price: 81203.56, changePercent: 0.68, isUp: true },
  { symbol: "BANKNIFTY", price: 51114.2, changePercent: 1.21, isUp: true },
  { symbol: "RELIANCE", price: 2945.2, changePercent: 1.23, isUp: true },
  { symbol: "TCS", price: 4112.15, changePercent: -0.18, isUp: false },
  { symbol: "INFY", price: 1562.4, changePercent: 0.94, isUp: true },
];

export function LiveMarketCard({ className = "" }: { className?: string }) {
  const [tickers, setTickers] = useState<TickerItem[]>(INITIAL_TICKERS);
  const [flashingIndex, setFlashingIndex] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * INITIAL_TICKERS.length);
      setTickers((prev) => {
        const next = [...prev];
        const item = { ...next[idx] };
        const delta = (Math.random() * 0.4 - 0.18) * (item.price * 0.0008);
        item.price = Number((item.price + delta).toFixed(2));
        item.changePercent = Number(
          (item.changePercent + (delta > 0 ? 0.01 : -0.01)).toFixed(2),
        );
        item.isUp = item.changePercent >= 0;
        next[idx] = item;
        return next;
      });
      setFlashingIndex(idx);
      setTimeout(() => setFlashingIndex(null), 600);
    }, 2400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`rounded-xl border border-sky-500/30 bg-[#07132a]/85 p-3.5 backdrop-blur-xl shadow-[0_12px_32px_rgba(3,15,40,0.65),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-300 hover:border-sky-400/50 hover:shadow-[0_16px_40px_rgba(56,189,248,0.2)] ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-sky-500/20 pb-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex size-5 items-center justify-center rounded-md bg-sky-500/20 text-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.4)]">
            <Zap className="size-3 fill-sky-400" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300">
            Live Market Data
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
          </span>
          <span className="text-[9px] font-semibold text-emerald-400 uppercase tracking-widest">
            Stream
          </span>
        </div>
      </div>

      {/* Rows */}
      <div className="space-y-1.5 font-mono text-[11px]">
        {tickers.map((item, i) => (
          <div
            key={item.symbol}
            className={`flex items-center justify-between rounded px-2 py-1 transition-colors duration-300 ${
              flashingIndex === i
                ? item.isUp
                  ? "bg-emerald-500/20"
                  : "bg-rose-500/20"
                : "hover:bg-white/[0.04]"
            }`}
          >
            <span className="font-semibold text-slate-200 tracking-tight">
              {item.symbol}
            </span>
            <span className="text-slate-300">
              {item.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
