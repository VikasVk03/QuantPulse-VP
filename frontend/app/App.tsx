import React, { useState, useEffect } from "react";
import { LandingPage } from "../pages/LandingPage";
import { Header } from "../components/layout/Header";
import { MarketDashboard } from "../components/market/MarketDashboard";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

export default function App() {
  const [view, setView] = useState<"landing" | "terminal">(() => {
    // Check URL hash or query param if user linked directly to terminal
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash === "#terminal") return "terminal";
    }
    return "landing";
  });

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === "#terminal") {
        setView("terminal");
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleLaunchTerminal = () => {
    setView("terminal");
    window.location.hash = "terminal";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewLanding = () => {
    setView("landing");
    window.location.hash = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (view === "landing") {
    return <LandingPage onLaunchTerminal={handleLaunchTerminal} />;
  }

  return (
    <>
      <div className="min-h-screen bg-background text-foreground">
        <Header onViewLanding={handleViewLanding} />
        <main>
          <MarketDashboard />
        </main>
      </div>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
