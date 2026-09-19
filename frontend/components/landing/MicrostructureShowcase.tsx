import React, { useState } from "react";
import { Layers, ArrowUpDown, TrendingUp, Info, Activity } from "lucide-react";

export function MicrostructureShowcase() {
  const [bestBid, setBestBid] = useState(100.0);
  const [bestAsk, setBestAsk] = useState(100.5);
  const [bidVol, setBidVol] = useState(350);
  const [askVol, setAskVol] = useState(150);

  // Stoikov Microprice Calculation: (Q_bid * P_ask + Q_ask * P_bid) / (Q_bid + Q_ask)
  const totalVol = bidVol + askVol;
  const microprice =
    totalVol > 0
      ? (bidVol * bestAsk + askVol * bestBid) / totalVol
      : (bestBid + bestAsk) / 2;
  const midPrice = (bestBid + bestAsk) / 2;
  const micropriceDrift = microprice - midPrice;
  const depthImbalance = totalVol > 0 ? (bidVol - askVol) / totalVol : 0;

  return (
    <section
      id="microstructure"
      className="relative py-20 bg-[#030919] border-t border-sky-500/15 overflow-hidden"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute top-1/2 left-0 size-[500px] -translate-y-1/2 rounded-full bg-sky-500/10 blur-[140px]"></div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-950/40 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-widest text-sky-400 mb-4">
            <Layers className="size-3.5" />
            <span>Market Microstructure Intelligence</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Beyond Simple Mid-Prices: <br />
            <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
              Stoikov Microprice & Queue Dynamics
            </span>
          </h2>

          <p className="mt-4 text-slate-300 text-base leading-relaxed">
            Standard mid-price ignores queue imbalances and order book depth
            asymmetry. QuantPulse models high-frequency order book dynamics
            using Stoikov's depth-weighted microprice to anticipate directional
            price revisions.
          </p>
        </div>

        {/* Interactive Microprice Lab Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-3xl border border-sky-500/25 bg-gradient-to-b from-[#061430]/85 to-[#030a1c]/90 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.6)]">
          {/* Left: Interactive Controls */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center justify-between border-b border-sky-500/20 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="size-5 text-sky-400" />
                <span>Live Microprice Simulator</span>
              </h3>
              <span className="font-mono text-xs px-2.5 py-1 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30">
                C++ Engine Latency: 23.5 ns
              </span>
            </div>

            {/* Slider 1: Bid Volume */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="text-emerald-400 font-bold">
                  BID DEPTH (Q_bid)
                </span>
                <span className="text-white font-bold">
                  {bidVol} units @ ${bestBid.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="800"
                value={bidVol}
                onChange={(e) => setBidVol(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Slider 2: Ask Volume */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="text-rose-400 font-bold">
                  ASK DEPTH (Q_ask)
                </span>
                <span className="text-white font-bold">
                  {askVol} units @ ${bestAsk.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="800"
                value={askVol}
                onChange={(e) => setAskVol(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
              />
            </div>

            {/* Depth Imbalance Bar */}
            <div className="rounded-xl bg-[#030919] border border-sky-500/20 p-4">
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="text-slate-400">
                  Order Book Imbalance (I_N)
                </span>
                <span
                  className={`font-bold ${depthImbalance >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                >
                  {depthImbalance > 0 ? "+" : ""}
                  {(depthImbalance * 100).toFixed(1)}% (
                  {depthImbalance >= 0 ? "Buy Heavy" : "Sell Heavy"})
                </span>
              </div>
              <div className="relative h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 transition-all duration-200"
                  style={{ width: `${(bidVol / totalVol) * 100}%` }}
                />
                <div
                  className="bg-rose-500 transition-all duration-200"
                  style={{ width: `${(askVol / totalVol) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1.5">
                <span>100% Bid Pressure</span>
                <span>Neutral (0%)</span>
                <span>100% Ask Pressure</span>
              </div>
            </div>

            {/* Microstructure Formula Callout */}
            <div className="rounded-lg bg-sky-950/30 border border-sky-500/20 p-3 text-xs font-mono text-sky-200">
              <div className="text-[10px] uppercase text-sky-400 font-bold mb-1">
                Stoikov Equation
              </div>
              <div>
                P_micro = (Q_bid · P_ask + Q_ask · P_bid) / (Q_bid + Q_ask)
              </div>
            </div>
          </div>

          {/* Right: Live Visual Metrics Output */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-4">
            {/* Main Result Cards Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Card 1: Standard Mid-Price */}
              <div className="rounded-2xl border border-slate-700/40 bg-[#030816] p-4 text-center">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Standard Mid-Price
                </div>
                <div className="text-2xl font-bold font-mono text-slate-200 mt-1">
                  ${midPrice.toFixed(4)}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Static (P_bid + P_ask) / 2
                </div>
              </div>

              {/* Card 2: Stoikov Microprice */}
              <div className="rounded-2xl border border-sky-400/50 bg-gradient-to-br from-sky-950/50 to-indigo-950/50 p-4 text-center shadow-[0_0_25px_rgba(56,189,248,0.2)]">
                <div className="text-[11px] font-mono uppercase tracking-wider text-sky-300 font-bold flex items-center justify-center gap-1">
                  <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span>Stoikov Microprice</span>
                </div>
                <div className="text-2xl font-black font-mono text-cyan-300 mt-1">
                  ${microprice.toFixed(4)}
                </div>
                <div
                  className={`text-[11px] font-mono font-bold mt-1 ${micropriceDrift >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                >
                  Drift: {micropriceDrift > 0 ? "+" : ""}
                  {(micropriceDrift * 100).toFixed(2)}¢
                </div>
              </div>
            </div>

            {/* Depth Order Ladder Preview */}
            <div className="rounded-2xl border border-sky-500/20 bg-[#020713] p-4 font-mono text-xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center justify-between">
                <span>Multi-Level Order Ladder</span>
                <span className="text-[10px] text-sky-400">
                  Spread: ${(bestAsk - bestBid).toFixed(2)}
                </span>
              </div>

              <div className="space-y-1.5">
                {/* Ask Levels */}
                <div className="flex items-center justify-between px-2 py-1 rounded bg-rose-500/10 text-rose-300 border-l-2 border-rose-500">
                  <span>Ask L2: $100.75</span>
                  <span>220 units</span>
                </div>
                <div className="flex items-center justify-between px-2 py-1.5 rounded bg-rose-500/20 text-rose-200 border-l-4 border-rose-400 font-bold">
                  <span>Ask L1 (Best Ask): ${bestAsk.toFixed(2)}</span>
                  <span>{askVol} units</span>
                </div>

                {/* Microprice Marker Line */}
                <div className="my-2 py-1 px-3 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-between text-[11px] font-bold">
                  <span>➜ STOIKOV MICROPRICE</span>
                  <span>${microprice.toFixed(4)}</span>
                </div>

                {/* Bid Levels */}
                <div className="flex items-center justify-between px-2 py-1.5 rounded bg-emerald-500/20 text-emerald-200 border-l-4 border-emerald-400 font-bold">
                  <span>Bid L1 (Best Bid): ${bestBid.toFixed(2)}</span>
                  <span>{bidVol} units</span>
                </div>
                <div className="flex items-center justify-between px-2 py-1 rounded bg-emerald-500/10 text-emerald-300 border-l-2 border-emerald-500">
                  <span>Bid L2: $99.75</span>
                  <span>410 units</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
