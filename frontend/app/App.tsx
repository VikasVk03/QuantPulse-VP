import React, { useState, useEffect } from "react";
import { LandingPage } from "../pages/LandingPage";
import { Header } from "../components/layout/Header";
import { Sidebar, type DashboardTab } from "../components/layout/Sidebar";
import { MarketOverviewDashboard } from "../features/overview/MarketOverviewDashboard";
import { OpportunityScannerDashboard } from "../features/scanner/OpportunityScannerDashboard";
import { MarketDashboard } from "../components/market/MarketDashboard";
import { RiskIntelligenceDashboard } from "../features/risk/RiskIntelligenceDashboard";
import { BacktestingDashboard } from "../features/backtesting/BacktestingDashboard";
import { LiveMarketDashboard } from "../features/live-market/LiveMarketDashboard";
import { DataLabPage } from "../features/data-lab/DataLabPage";
import { ProvidersPage } from "../features/providers/ProvidersPage";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

function parseRouteFromLocation(): {
  view: "landing" | "app";
  tab: DashboardTab;
} {
  if (typeof window === "undefined") {
    return { view: "landing", tab: "overview" };
  }

  const pathname = window.location.pathname
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase()
    .trim();
  const hash = window.location.hash.replace("#", "").toLowerCase().trim();
  const target = pathname || hash;

  if (!target || target === "" || target === "landing") {
    return { view: "landing", tab: "overview" };
  }

  if (target === "overview") return { view: "app", tab: "overview" };
  if (target === "scanner") return { view: "app", tab: "scanner" };
  if (target === "stocks" || target === "market" || target === "terminal")
    return { view: "app", tab: "stocks" };
  if (target === "risk") return { view: "app", tab: "risk" };
  if (target === "backtest" || target === "research")
    return { view: "app", tab: "backtest" };
  if (target === "live" || target === "live-market")
    return { view: "app", tab: "live" };
  if (
    target === "data-lab" ||
    target === "datalab" ||
    target === "data-pipeline"
  )
    return { view: "app", tab: "data-lab" };
  if (
    target === "providers" ||
    target === "api-keys" ||
    target === "apikeys" ||
    target === "keys" ||
    target === "feed"
  )
    return { view: "app", tab: "providers" };

  return { view: "app", tab: "overview" };
}

export default function App() {
  const initialRoute = parseRouteFromLocation();
  const [view, setView] = useState<"landing" | "app">(initialRoute.view);
  const [activeTab, setActiveTab] = useState<DashboardTab>(initialRoute.tab);

  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(
    null,
  );
  const [backtestSetup, setBacktestSetup] = useState<string | undefined>(
    undefined,
  );
  const [backtestSymbol, setBacktestSymbol] = useState<string | undefined>(
    undefined,
  );

  // Sync route on popstate and convert legacy hash to clean pathname
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const route = parseRouteFromLocation();
      const targetPath = route.view === "landing" ? "/" : `/${route.tab}`;
      window.history.replaceState(null, "", targetPath);
    }

    const handlePopState = () => {
      const route = parseRouteFromLocation();
      setView(route.view);
      setActiveTab(route.tab);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigateTo = (
    path: string,
    tab?: DashboardTab,
    options?: { replace?: boolean },
  ) => {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    if (options?.replace) {
      window.history.replaceState(null, "", cleanPath);
    } else {
      window.history.pushState(null, "", cleanPath);
    }

    if (cleanPath === "/" || cleanPath === "") {
      setView("landing");
    } else {
      setView("app");
      if (tab) {
        setActiveTab(tab);
      } else {
        const route = parseRouteFromLocation();
        setActiveTab(route.tab);
      }
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectTab = (tab: DashboardTab) => {
    navigateTo(`/${tab}`, tab);
  };

  const handleLaunchTerminal = (datasetId?: string) => {
    if (datasetId) {
      setSelectedDatasetId(datasetId);
      navigateTo("/stocks", "stocks");
    } else {
      navigateTo("/overview", "overview");
    }
  };

  const handleViewLanding = () => {
    navigateTo("/", undefined);
  };

  const handleNavigateToStocks = (symbol?: string) => {
    navigateTo("/stocks", "stocks");
  };

  const handleNavigateToBacktest = (setupName: string, symbol: string) => {
    setBacktestSetup(setupName);
    setBacktestSymbol(symbol);
    navigateTo("/backtest", "backtest");
  };

  return (
    <>
      <div className="min-h-screen bg-[#040914] text-slate-100 font-sans selection:bg-sky-500/30">
        {view === "landing" ? (
          <LandingPage onLaunchTerminal={() => handleLaunchTerminal()} />
        ) : (
          <div className="flex min-h-screen">
            {/* Left Sidebar */}
            <Sidebar
              activeTab={activeTab}
              onSelectTab={handleSelectTab}
              onViewLanding={handleViewLanding}
            />

            {/* Right Main Content Column */}
            <div className="flex flex-1 flex-col lg:pl-64">
              <Header
                activeTab={activeTab}
                onSelectTab={handleSelectTab}
                onViewLanding={handleViewLanding}
              />

              <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
                {activeTab === "overview" && (
                  <MarketOverviewDashboard
                    onNavigateToStocks={handleNavigateToStocks}
                    onNavigateToScanner={() => handleSelectTab("scanner")}
                    onNavigateToRisk={() => handleSelectTab("risk")}
                  />
                )}

                {activeTab === "scanner" && (
                  <OpportunityScannerDashboard
                    onAnalyzeStock={handleNavigateToStocks}
                    onBacktestSetup={handleNavigateToBacktest}
                  />
                )}

                {activeTab === "stocks" && (
                  <MarketDashboard
                    initialDatasetId={selectedDatasetId}
                    onNavigateToDataLab={() => handleSelectTab("data-lab")}
                  />
                )}

                {activeTab === "risk" && <RiskIntelligenceDashboard />}

                {activeTab === "backtest" && (
                  <BacktestingDashboard
                    initialSetup={backtestSetup}
                    initialSymbol={backtestSymbol}
                  />
                )}

                {activeTab === "live" && <LiveMarketDashboard />}

                {activeTab === "data-lab" && (
                  <DataLabPage onNavigateToTerminal={handleLaunchTerminal} />
                )}

                {activeTab === "providers" && (
                  <ProvidersPage
                    onProviderActivated={() => {
                      // refresh or toast
                    }}
                  />
                )}
              </main>
            </div>
          </div>
        )}
      </div>

      {/* Vercel Analytics */}
      <Analytics />

      {/* Vercel Speed Insights */}
      <SpeedInsights />
    </>
  );
}
