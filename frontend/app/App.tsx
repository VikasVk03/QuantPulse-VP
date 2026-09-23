import React, { useState, useEffect } from "react";
import { LandingPage } from "../pages/LandingPage";
import { Header } from "../components/layout/Header";
import { MarketDashboard } from "../components/market/MarketDashboard";
import { DataLabPage } from "../features/data-lab/DataLabPage";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

export default function App() {
  const [view, setView] = useState<"landing" | "terminal" | "data-lab">(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      const path = window.location.pathname;

      if (hash === "#data-lab" || path === "/data-lab") {
        return "data-lab";
      }
      if (hash === "#terminal") {
        return "terminal";
      }
    }

    return "landing";
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#data-lab") {
        setView("data-lab");
      } else if (hash === "#terminal") {
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

  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(
    null,
  );

  const handleLaunchTerminal = (datasetId?: string) => {
    if (datasetId) {
      setSelectedDatasetId(datasetId);
    }
    setView("terminal");
    window.location.hash = "terminal";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLaunchDataLab = () => {
    setView("data-lab");
    window.location.hash = "data-lab";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewLanding = () => {
    setView("landing");
    window.location.hash = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectTab = (tab: string) => {
    if (tab === "data-lab") {
      handleLaunchDataLab();
    } else if (tab === "dashboard") {
      handleLaunchTerminal();
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background text-foreground">
        {view === "landing" ? (
          <LandingPage onLaunchTerminal={() => handleLaunchTerminal()} />
        ) : (
          <>
            <Header
              activeTab={view === "terminal" ? "dashboard" : view}
              onSelectTab={handleSelectTab}
              onViewLanding={handleViewLanding}
            />

            <main>
              {view === "data-lab" ? (
                <DataLabPage onNavigateToTerminal={handleLaunchTerminal} />
              ) : (
                <MarketDashboard
                  initialDatasetId={selectedDatasetId}
                  onNavigateToDataLab={handleLaunchDataLab}
                />
              )}
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
