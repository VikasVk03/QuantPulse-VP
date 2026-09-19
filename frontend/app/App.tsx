import React, { useState, useEffect } from "react";
import { LandingPage } from "../pages/LandingPage";
import { Header } from "../components/layout/Header";
import { MarketDashboard } from "../components/market/MarketDashboard";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

export default function App() {
  const [view, setView] = useState<"landing" | "terminal">(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;

      if (hash === "#terminal") {
        return "terminal";
      }
    }

    return "landing";
  });

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === "#terminal") {
        setView("terminal");
      } else {
        setView("landing");
      }
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
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

  return (
    <>
      <div className="min-h-screen bg-background text-foreground">
        {view === "landing" ? (
          <LandingPage onLaunchTerminal={handleLaunchTerminal} />
        ) : (
          <>
            <Header onViewLanding={handleViewLanding} />

            <main>
              <MarketDashboard />
            </main>
          </>
        )}
      </div>

      {/* Vercel Analytics */}
      <Analytics />

      {/* Vercel Speed Insights */}
      <SpeedInsights />
    </>
  );
}
