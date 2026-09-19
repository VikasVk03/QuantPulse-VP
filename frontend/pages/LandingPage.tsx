import React, { useState } from "react";
import { LandingNavbar } from "../components/landing/LandingNavbar";
import { HeroSection } from "../components/landing/HeroSection";
import { MicrostructureShowcase } from "../components/landing/MicrostructureShowcase";
import { RiskIntelligenceSection } from "../components/landing/RiskIntelligenceSection";
import { ArchitectureShowcase } from "../components/landing/ArchitectureShowcase";
import { BacktestingLabPreview } from "../components/landing/BacktestingLabPreview";
import { PricingSection } from "../components/landing/PricingSection";
import { LandingFooter } from "../components/landing/LandingFooter";
import { DemoModal } from "../components/landing/DemoModal";

interface LandingPageProps {
  onLaunchTerminal?: () => void;
}

export function LandingPage({ onLaunchTerminal }: LandingPageProps) {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#030712] text-foreground font-sans selection:bg-sky-500/30 selection:text-white">
      {/* Top Navbar */}
      <LandingNavbar
        onLaunchTerminal={onLaunchTerminal}
        onExploreSolutions={() => {
          const el = document.getElementById("microstructure");
          el?.scrollIntoView({ behavior: "smooth" });
        }}
        onViewTechnology={() => {
          const el = document.getElementById("technology");
          el?.scrollIntoView({ behavior: "smooth" });
        }}
        onViewPricing={() => {
          const el = document.getElementById("pricing");
          el?.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* Hero Section (Recreated from assests/Landing.png) */}
      <HeroSection
        onExplorePlatform={onLaunchTerminal}
        onWatchDemo={() => setDemoOpen(true)}
      />

      {/* Market Microstructure & Stoikov Microprice Visualizer */}
      <MicrostructureShowcase />

      {/* Risk Intelligence Engine & Adaptive Position Sizing */}
      <RiskIntelligenceSection />

      {/* C++20 High Performance Architecture & Benchmarks */}
      <ArchitectureShowcase />

      {/* Strategy Backtesting Lab & Equity Curve */}
      <BacktestingLabPreview onLaunchTerminal={onLaunchTerminal} />

      {/* Institutional Pricing */}
      <PricingSection onLaunchTerminal={onLaunchTerminal} />

      {/* Comprehensive Footer */}
      <LandingFooter onLaunchTerminal={onLaunchTerminal} />

      {/* Interactive Watch Demo Modal */}
      <DemoModal
        isOpen={demoOpen}
        onClose={() => setDemoOpen(false)}
        onLaunchTerminal={() => {
          setDemoOpen(false);
          onLaunchTerminal?.();
        }}
      />
    </div>
  );
}
