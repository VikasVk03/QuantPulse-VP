import React, { useState, useEffect } from "react";
import {
  Bell,
  Globe,
  Radio,
  Search,
  SlidersHorizontal,
  Settings,
  Activity,
} from "lucide-react";
import type { DashboardTab } from "./Sidebar";
import { ProviderSettingsModal } from "../providers/ProviderSettingsModal";
import { api } from "../../lib/apiClient";

interface HeaderProps {
  onViewLanding?: () => void;
  activeTab?: DashboardTab;
  onSelectTab?: (tab: DashboardTab) => void;
}

export function Header({
  onViewLanding,
  activeTab = "overview",
  onSelectTab,
}: HeaderProps) {
  const [time, setTime] = useState(new Date());
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  const [activeProviderName, setActiveProviderName] =
    useState("Built-in Simulator");

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchCurrentProvider = async () => {
    try {
      const json = await api.providers.list();
      if (json.success) {
        const active = json.data.providers.find(
          (p: any) => p.type === json.data.activeProvider,
        );
        if (active) {
          setActiveProviderName(active.name);
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchCurrentProvider();
  }, []);

  const formatCityTime = (timeZone: string) => {
    return time.toLocaleTimeString("en-US", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const nyTime = formatCityTime("America/New_York");
  const londonTime = formatCityTime("Europe/London");
  const tokyoTime = formatCityTime("Asia/Tokyo");
  const mumbaiTime = formatCityTime("Asia/Kolkata");

  return (
    <>
      <header className="sticky top-0 z-30 flex flex-col border-b border-slate-800/80 bg-[#050c18]/95 backdrop-blur-xl">
        {/* Top Global Clock & Ticker Bar */}
        <div className="flex h-9 items-center justify-between border-b border-slate-800/60 px-4 md:px-6 text-[11px] font-mono text-slate-400 bg-[#030810]">
          {/* Global Financial Clocks */}
          <div className="hidden items-center gap-4 md:flex">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-emerald-400">
                Market OPEN
              </span>
            </div>

            <span className="text-slate-700">|</span>

            <div className="flex items-center gap-4 text-slate-400">
              <div>
                <span className="text-slate-500">NY:</span>{" "}
                <span className="text-slate-300">{nyTime}</span>
              </div>
              <div>
                <span className="text-slate-500">LON:</span>{" "}
                <span className="text-slate-300">{londonTime}</span>
              </div>
              <div>
                <span className="text-slate-500">TYO:</span>{" "}
                <span className="text-slate-300">{tokyoTime}</span>
              </div>
              <div>
                <span className="text-slate-500">MUM:</span>{" "}
                <span className="text-sky-300 font-bold">{mumbaiTime} IST</span>
              </div>
            </div>
          </div>

          {/* Global Macro Indices Ticker */}
          <div className="flex w-full items-center justify-between md:w-auto md:justify-end gap-3 sm:gap-5 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">NIFTY 50:</span>
              <span className="font-bold text-slate-200">23,446.80</span>
              <span className="flex items-center text-[10px] text-rose-400 font-semibold">
                -0.48%
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-slate-400">SENSEX:</span>
              <span className="font-bold text-slate-200">77,210.00</span>
              <span className="flex items-center text-[10px] text-rose-400 font-semibold">
                -0.44%
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-1.5">
              <span className="text-slate-400">BANKNIFTY:</span>
              <span className="font-bold text-slate-200">49,850.00</span>
              <span className="flex items-center text-[10px] text-rose-400 font-semibold">
                -0.37%
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">INDIA VIX:</span>
              <span className="font-bold text-slate-200">13.42</span>
              <span className="flex items-center text-[10px] text-emerald-400 font-semibold">
                +2.13%
              </span>
            </div>
          </div>
        </div>

        {/* Main Header Bar */}
        <div className="flex h-14 items-center justify-between px-4 md:px-6">
          {/* Left: Mobile Title / Quick Branding */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={onViewLanding}
              className="flex items-center gap-2 text-left"
            >
              <img src="/assets/logo.png" alt="Logo" className="size-6" />
              <span className="font-bold text-sm text-white">
                Quant<span className="text-sky-400">Pulse</span>
              </span>
            </button>
          </div>

          {/* Center / Search */}
          <div className="relative hidden sm:block w-72 md:w-96">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search symbols, strategies, indicators (e.g. RELIANCE, OFI, VaR)..."
              className="h-8.5 w-full rounded-lg border border-slate-700/80 bg-slate-900/80 pl-9 pr-8 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-sky-500/80 focus:ring-1 focus:ring-sky-500/50 transition-all font-mono"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-slate-700 bg-slate-800 px-1 py-0.5 text-[9px] font-mono text-slate-400">
              ⌘K
            </span>
          </div>

          {/* Mobile Navigation Dropdown */}
          <div className="flex items-center gap-2 lg:hidden">
            <select
              value={activeTab}
              onChange={(e) => onSelectTab?.(e.target.value as DashboardTab)}
              className="h-8.5 rounded-lg border border-slate-700 bg-slate-900 px-2 text-xs font-medium text-slate-200 outline-none"
            >
              <option value="overview">🏠 Market Overview</option>
              <option value="scanner">🔎 Opportunity Scanner</option>
              <option value="stocks">📊 Stock Intelligence</option>
              <option value="risk">🛡 Risk Intelligence</option>
              <option value="backtest">🧪 Research & Backtest</option>
              <option value="live">⚡ Live Market</option>
              <option value="data-lab">📁 Data Lab</option>
              <option value="providers">🔑 API Keys & Feeds</option>
            </select>
          </div>

          {/* Right Tools, Feed Selector & Status */}
          <div className="flex items-center gap-3">
            {/* Interactive Data Feed Provider Button */}
            <button
              type="button"
              onClick={() => setIsProviderModalOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-950/40 hover:bg-cyan-900/50 px-2.5 py-1.5 text-xs text-cyan-300 transition cursor-pointer shadow-sm"
              title="Click to configure Data Provider & API Keys"
            >
              <Globe className="size-3 text-cyan-400 animate-pulse" />
              <span className="font-mono text-[11px] text-cyan-200 font-semibold hidden md:inline">
                Feed:{" "}
                <strong className="text-cyan-400">{activeProviderName}</strong>
              </span>
              <Settings className="size-3 text-cyan-400 ml-1" />
            </button>

            <div className="hidden xl:flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300">
              <Radio className="size-3 text-emerald-400 animate-pulse" />
              <span className="font-mono text-[11px] text-slate-300">
                Engine: <strong className="text-emerald-400">0.42ms</strong>
              </span>
            </div>

            <div className="flex size-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white cursor-pointer transition-colors">
              <Bell className="size-4" />
            </div>

            <div className="flex size-8 items-center justify-center rounded-lg border border-sky-500/30 bg-sky-500/10 text-sky-300 font-mono font-bold text-xs">
              QP
            </div>
          </div>
        </div>
      </header>

      {/* Provider & API Keys Configuration Modal */}
      <ProviderSettingsModal
        isOpen={isProviderModalOpen}
        onClose={() => setIsProviderModalOpen(false)}
        onProviderChanged={() => fetchCurrentProvider()}
      />
    </>
  );
}
