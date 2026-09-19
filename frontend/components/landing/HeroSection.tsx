import React from "react";
import {
  ArrowRight,
  Play,
  Zap,
  BrainCircuit,
  BarChart2,
  TrendingUp,
} from "lucide-react";

interface HeroSectionProps {
  onExplorePlatform?: () => void;
  onWatchDemo?: () => void;
}

export function HeroSection({
  onExplorePlatform,
  onWatchDemo,
}: HeroSectionProps) {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero"
      className="relative w-full min-h-[580px] md:min-h-[640px] lg:aspect-[16/9] lg:max-h-[960px] overflow-hidden bg-[#020612]"
    >
      {/* ========================================================================= */}
      {/* 1. Resizable Background Image (landing-page-background.png)                */}
      {/* ========================================================================= */}
      <img
        src="/assets/landing-page-background.png"
        alt="QuantPulse Market Intelligence Platform"
        className="absolute inset-0 size-full object-cover object-top select-none pointer-events-none"
      />

      {/* ========================================================================= */}
      {/* 2. Hero Content (Upper-Left Overlay matching expected output)              */}
      {/* ========================================================================= */}
      <div className="relative z-10 size-full flex flex-col justify-start px-6 sm:px-10 lg:px-14 pt-8 sm:pt-10 md:pt-12 lg:pt-14">
        <div className="max-w-[340px] sm:max-w-md md:max-w-lg lg:max-w-xl flex flex-col space-y-3.5 sm:space-y-4 md:space-y-4.5">
          {/* Top Breadcrumb: DATA → MODELS → INSIGHTS → OPPORTUNITIES */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-mono tracking-[0.22em] text-sky-400 font-bold uppercase drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]">
            <span>DATA</span>
            <span className="text-sky-500 font-sans text-xs">→</span>
            <span>MODELS</span>
            <span className="text-sky-500 font-sans text-xs">→</span>
            <span>INSIGHTS</span>
            <span className="text-sky-500 font-sans text-xs">→</span>
            <span>OPPORTUNITIES</span>
          </div>

          {/* Kicker */}
          <div className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-slate-300">
            REAL-TIME. INTELLIGENT. AHEAD.
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-[42px] lg:text-[48px] font-black tracking-tight text-white leading-[1.08] font-sans drop-shadow-md">
            Smarter Signals <br />
            For A{" "}
            <span className="text-[#38bdf8] drop-shadow-[0_0_24px_rgba(56,189,248,0.75)]">
              Brighter
            </span>{" "}
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_28px_rgba(168,85,247,0.75)]">
              Tomorrow
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xs sm:text-sm md:text-[14px] text-slate-300 leading-relaxed max-w-sm sm:max-w-md font-normal drop-shadow-sm">
            Real-time market data. Advanced analytics.{" "}
            <br className="hidden sm:inline" />
            AI-powered signals. QuantPulse brings institutional-{" "}
            <br className="hidden sm:inline" />
            grade intelligence to everyone.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {/* Explore the Platform -> */}
            <button
              onClick={onExplorePlatform}
              className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-[0_0_24px_rgba(99,102,241,0.55)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_35px_rgba(129,140,248,0.75)] cursor-pointer"
            >
              <span>Explore the Platform</span>
              <ArrowRight className="size-3.5 sm:size-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>

            {/* Watch Demo */}
            <button
              onClick={onWatchDemo}
              className="group flex items-center gap-2 rounded-full border border-white/25 bg-[#07132a]/80 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-slate-100 backdrop-blur-md transition-all duration-200 hover:border-white/40 hover:bg-white/[0.08] hover:text-white cursor-pointer"
            >
              <div className="flex size-4 sm:size-4.5 items-center justify-center rounded-full bg-white/20 text-white group-hover:bg-white group-hover:text-black transition-colors">
                <Play className="size-2 fill-current ml-0.5" />
              </div>
              <span>Watch Demo</span>
            </button>
          </div>

          {/* Feature Badges below Buttons */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1 text-[11px] sm:text-xs font-semibold text-slate-200">
            <button
              onClick={() => scrollToSection("microstructure")}
              className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors cursor-pointer"
            >
              <Zap className="size-3.5 text-cyan-400 shrink-0" />
              <span>Live Data</span>
            </button>

            <button
              onClick={() => scrollToSection("risk-intelligence")}
              className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors cursor-pointer"
            >
              <BrainCircuit className="size-3.5 text-indigo-400 shrink-0" />
              <span>AI Signals</span>
            </button>

            <button
              onClick={() => scrollToSection("backtesting")}
              className="flex items-center gap-1.5 hover:text-purple-400 transition-colors cursor-pointer"
            >
              <BarChart2 className="size-3.5 text-purple-400 shrink-0" />
              <span>Backtest</span>
            </button>

            <button
              onClick={() => scrollToSection("technology")}
              className="flex items-center gap-1.5 hover:text-teal-400 transition-colors cursor-pointer"
            >
              <TrendingUp className="size-3.5 text-teal-400 shrink-0" />
              <span>Trade Smarter</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
