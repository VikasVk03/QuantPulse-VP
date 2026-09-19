import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Sliders,
  Lock,
} from "lucide-react";

export function RiskIntelligenceSection() {
  const [spreadStress, setSpreadStress] = useState(25); // 0-100
  const [volatilityStress, setVolatilityStress] = useState(30); // 0-100
  const [drawdownStress, setDrawdownStress] = useState(20); // 0-100
  const [exposureStress, setExposureStress] = useState(35); // 0-100

  // Calculate composite risk score: w_micro(0.3) + w_vol(0.3) + w_dd(0.25) + w_exp(0.15)
  const compositeScore =
    spreadStress * 0.3 +
    volatilityStress * 0.3 +
    drawdownStress * 0.25 +
    exposureStress * 0.15;

  let regime: "Normal" | "Elevated" | "High" | "Critical" = "Normal";
  let multiplier = 1.0;
  let allowTrading = true;
  let color = "text-emerald-400";
  let borderGlow =
    "border-emerald-500/40 shadow-[0_0_30px_rgba(52,211,153,0.2)]";

  if (compositeScore >= 85) {
    regime = "Critical";
    multiplier = 0.0;
    allowTrading = false;
    color = "text-rose-400";
    borderGlow = "border-rose-500/60 shadow-[0_0_35px_rgba(244,63,94,0.35)]";
  } else if (compositeScore >= 65) {
    regime = "High";
    multiplier = 0.25;
    allowTrading = true;
    color = "text-orange-400";
    borderGlow = "border-orange-500/40 shadow-[0_0_30px_rgba(251,146,60,0.25)]";
  } else if (compositeScore >= 35) {
    regime = "Elevated";
    multiplier = 0.6;
    allowTrading = true;
    color = "text-amber-400";
    borderGlow = "border-amber-500/40 shadow-[0_0_30px_rgba(251,191,36,0.25)]";
  }

  const setPreset = (preset: "calm" | "elevated" | "stress" | "crash") => {
    if (preset === "calm") {
      setSpreadStress(15);
      setVolatilityStress(20);
      setDrawdownStress(10);
      setExposureStress(25);
    } else if (preset === "elevated") {
      setSpreadStress(45);
      setVolatilityStress(55);
      setDrawdownStress(30);
      setExposureStress(40);
    } else if (preset === "stress") {
      setSpreadStress(75);
      setVolatilityStress(80);
      setDrawdownStress(60);
      setExposureStress(70);
    } else if (preset === "crash") {
      setSpreadStress(95);
      setVolatilityStress(95);
      setDrawdownStress(90);
      setExposureStress(85);
    }
  };

  return (
    <section
      id="risk-intelligence"
      className="relative py-20 bg-[#020614] border-t border-indigo-500/15 overflow-hidden"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute top-1/2 right-0 size-[550px] -translate-y-1/2 rounded-full bg-purple-600/10 blur-[150px]"></div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/40 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-widest text-indigo-300 mb-4">
            <ShieldCheck className="size-3.5" />
            <span>Quantitative Risk Intelligence</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Autonomous Regime Detection & <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Adaptive Dynamic Position Sizing
            </span>
          </h2>

          <p className="mt-4 text-slate-300 text-base leading-relaxed">
            Eliminate catastrophic drawdowns. The Risk Intelligence Engine
            continuously synthesizes microstructure stress, volatility spikes,
            and portfolio exposure to dynamically scale position sizing or
            trigger instant safety halts in under 220 nanoseconds.
          </p>
        </div>

        {/* Interactive Risk Lab Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-3xl border border-indigo-500/25 bg-gradient-to-b from-[#080d2a]/90 to-[#030617]/95 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.6)]">
          {/* Left: Interactive Stress Factor Controls */}
          <div className="lg:col-span-6 space-y-5">
            <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sliders className="size-5 text-indigo-400" />
                <span>Multi-Factor Stress Simulator</span>
              </h3>
              <span className="font-mono text-xs px-2.5 py-1 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                Evaluation: ~216 ns
              </span>
            </div>

            {/* Quick Presets */}
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                Test Scenario Presets:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => setPreset("calm")}
                  className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 py-1.5 px-2 text-xs font-mono text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                >
                  Calm Market
                </button>
                <button
                  onClick={() => setPreset("elevated")}
                  className="rounded-lg border border-amber-500/30 bg-amber-950/30 py-1.5 px-2 text-xs font-mono text-amber-300 hover:bg-amber-500/20 transition-colors"
                >
                  Elevated Vol
                </button>
                <button
                  onClick={() => setPreset("stress")}
                  className="rounded-lg border border-orange-500/30 bg-orange-950/30 py-1.5 px-2 text-xs font-mono text-orange-300 hover:bg-orange-500/20 transition-colors"
                >
                  Liquidity Shock
                </button>
                <button
                  onClick={() => setPreset("crash")}
                  className="rounded-lg border border-rose-500/30 bg-rose-950/30 py-1.5 px-2 text-xs font-mono text-rose-300 hover:bg-rose-500/20 transition-colors font-bold"
                >
                  Flash Crash ⚠️
                </button>
              </div>
            </div>

            {/* Factor 1: Microstructure Spread & Imbalance Stress */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-sky-300">
                  1. Microstructure Stress (Weight: 30%)
                </span>
                <span className="text-white font-bold">{spreadStress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={spreadStress}
                onChange={(e) => setSpreadStress(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>

            {/* Factor 2: Market Volatility Spike */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-purple-300">
                  2. Volatility Shock (Weight: 30%)
                </span>
                <span className="text-white font-bold">
                  {volatilityStress}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={volatilityStress}
                onChange={(e) => setVolatilityStress(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
            </div>

            {/* Factor 3: Portfolio Drawdown */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-amber-300">
                  3. Portfolio Drawdown (Weight: 25%)
                </span>
                <span className="text-white font-bold">{drawdownStress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={drawdownStress}
                onChange={(e) => setDrawdownStress(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            {/* Factor 4: Exposure & Leverage */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-indigo-300">
                  4. Leverage Exposure (Weight: 15%)
                </span>
                <span className="text-white font-bold">{exposureStress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={exposureStress}
                onChange={(e) => setExposureStress(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
              />
            </div>
          </div>

          {/* Right: Real-time Decision & Sizing Output */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-4">
            {/* Main Regime Badge Card */}
            <div
              className={`rounded-2xl border ${borderGlow} bg-[#04081c] p-6 text-center transition-all duration-300`}
            >
              <div className="text-xs font-mono uppercase tracking-widest text-slate-400">
                ACTIVE RISK REGIME
              </div>

              <div
                className={`text-4xl font-black font-mono tracking-tight mt-1 ${color}`}
              >
                {regime.toUpperCase()}
              </div>

              {/* Sizing Multiplier */}
              <div className="mt-4 flex items-center justify-center gap-4">
                <div className="rounded-xl bg-slate-900/80 border border-slate-700/50 px-4 py-2 text-center">
                  <div className="text-[10px] font-mono text-slate-400">
                    COMPOSITE SCORE
                  </div>
                  <div className="text-xl font-mono font-black text-white">
                    {compositeScore.toFixed(1)} / 100
                  </div>
                </div>

                <div className="rounded-xl bg-slate-900/80 border border-slate-700/50 px-4 py-2 text-center">
                  <div className="text-[10px] font-mono text-slate-400">
                    SIZING MULTIPLIER
                  </div>
                  <div className={`text-xl font-mono font-black ${color}`}>
                    {(multiplier * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Status Message */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-center gap-2 text-xs font-mono font-semibold">
                {allowTrading ? (
                  <>
                    <ShieldCheck className="size-4 text-emerald-400" />
                    <span className="text-emerald-300">
                      TRADING PERMITTED · DYNAMIC RISK SIZING ACTIVE
                    </span>
                  </>
                ) : (
                  <>
                    <Lock className="size-4 text-rose-400 animate-pulse" />
                    <span className="text-rose-400 font-bold">
                      SAFETY HALT ENGAGED · NEW ORDERS BLOCKED
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Example Base Sizing Output */}
            <div className="rounded-2xl border border-indigo-500/20 bg-[#030718] p-4 text-xs font-mono">
              <div className="text-[11px] font-bold uppercase text-slate-300 mb-2">
                Execution Pipeline Adaptation
              </div>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">
                    Base Strategy Target Size:
                  </span>
                  <span className="font-bold text-white">100 Shares</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">
                    Risk Sizing Factor Applied:
                  </span>
                  <span className={`font-bold ${color}`}>
                    x{multiplier.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800 font-bold">
                  <span className="text-sky-300">
                    Final Executed Order Size:
                  </span>
                  <span className={`text-sm ${color}`}>
                    {Math.floor(100 * multiplier)} Shares
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
