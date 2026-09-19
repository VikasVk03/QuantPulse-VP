import React, { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";

interface LandingNavbarProps {
  onLaunchTerminal?: () => void;
  onExploreSolutions?: () => void;
  onViewPricing?: () => void;
  onViewTechnology?: () => void;
}

export function LandingNavbar({
  onLaunchTerminal,
  onExploreSolutions,
  onViewPricing,
  onViewTechnology,
}: LandingNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#020612]/75 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-18 sm:h-20 max-w-[1520px] items-center justify-between px-5 sm:px-10 lg:px-12">
        {/* Brand Logo - Using /assets/logo.png as requested */}
        <div className="flex items-center">
          <a
            href="#hero"
            className="group flex items-center gap-3 text-decoration-none focus:outline-none"
          >
            <div className="relative flex size-10 sm:size-11 items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <img
                src="/assets/logo.png"
                alt="QuantPulse Logo"
                className="size-full object-contain drop-shadow-[0_0_14px_rgba(56,189,248,0.7)]"
              />
            </div>

            <span className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
              Quant
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_28px_rgba(168,85,247,0.75)]">
                Pulse
              </span>
            </span>
          </a>
        </div>

        {/* Center / Right Nav Items - Matching Landing-header-final-expected-output.png */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-10">
          <a
            href="#hero"
            className="text-sm font-medium text-slate-200 transition-colors hover:text-cyan-400"
          >
            Product
          </a>

          <a
            href="#microstructure"
            onClick={onExploreSolutions}
            className="text-sm font-medium text-slate-200 transition-colors hover:text-cyan-400"
          >
            Solutions
          </a>

          <a
            href="#technology"
            onClick={onViewTechnology}
            className="text-sm font-medium text-slate-200 transition-colors hover:text-cyan-400"
          >
            Technology
          </a>

          <a
            href="#pricing"
            onClick={onViewPricing}
            className="text-sm font-medium text-slate-200 transition-colors hover:text-cyan-400"
          >
            Pricing
          </a>

          {/* Primary CTA: "Get Started ->" glowing purple-blue pill button */}
          <button
            onClick={onLaunchTerminal}
            className="group relative flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-5 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white shadow-[0_0_24px_rgba(99,102,241,0.5)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_35px_rgba(129,140,248,0.7)] cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={onLaunchTerminal}
            className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md"
          >
            Get Started
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"
          >
            {mobileMenuOpen ? (
              <X className="size-6" />
            ) : (
              <Menu className="size-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#020612]/98 px-6 py-4 space-y-3 backdrop-blur-2xl">
          <a
            href="#hero"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/10"
          >
            Product
          </a>
          <a
            href="#microstructure"
            onClick={() => {
              setMobileMenuOpen(false);
              onExploreSolutions?.();
            }}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/10"
          >
            Solutions
          </a>
          <a
            href="#technology"
            onClick={() => {
              setMobileMenuOpen(false);
              onViewTechnology?.();
            }}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/10"
          >
            Technology
          </a>
          <a
            href="#pricing"
            onClick={() => {
              setMobileMenuOpen(false);
              onViewPricing?.();
            }}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/10"
          >
            Pricing
          </a>

          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLaunchTerminal?.();
              }}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 py-3 text-sm font-bold text-white shadow-lg"
            >
              <span>Get Started</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
