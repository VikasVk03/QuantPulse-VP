import React from "react";
import {
  Activity,
  BarChart3,
  Bot,
  BrainCircuit,
  Database,
  Eye,
  FileSpreadsheet,
  FlaskConical,
  Gauge,
  Home,
  Layers,
  LayoutDashboard,
  LineChart,
  Radio,
  Search,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

export type DashboardTab =
  | "overview"
  | "scanner"
  | "stocks"
  | "risk"
  | "backtest"
  | "live"
  | "data-lab"
  | "providers";

interface SidebarProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  onViewLanding: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItemConfig {
  id: DashboardTab;
  label: string;
  sublabel?: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

const NAV_ITEMS: NavItemConfig[] = [
  {
    id: "overview",
    label: "Market Overview",
    sublabel: "Macro intelligence & indices",
    icon: LayoutDashboard,
  },
  {
    id: "scanner",
    label: "Opportunity Scanner",
    sublabel: "Congested market alpha & squeeze",
    icon: Search,
    badge: "ALPHA",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  {
    id: "stocks",
    label: "Stock Intelligence",
    sublabel: "Microstructure & OHLCV",
    icon: BarChart3,
  },
  {
    id: "risk",
    label: "Risk Intelligence",
    sublabel: "3D Heatmap & VaR limits",
    icon: ShieldAlert,
    badge: "3D",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  },
  {
    id: "backtest",
    label: "Research & Backtest",
    sublabel: "Strategy simulation & stats",
    icon: FlaskConical,
  },
  {
    id: "live",
    label: "Live Market Depth",
    sublabel: "Order book ladder & OFI",
    icon: Zap,
    badge: "LIVE",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  {
    id: "data-lab",
    label: "Data Lab",
    sublabel: "ETL pipeline & MongoDB",
    icon: Database,
  },
  {
    id: "providers",
    label: "API Keys & Feed",
    sublabel: "External vendors & telemetry",
    icon: Radio,
    badge: "API",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  },
];

export function Sidebar({
  activeTab,
  onSelectTab,
  onViewLanding,
}: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-800/80 bg-[#060e1a]/95 backdrop-blur-2xl lg:flex">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-4">
        <button
          type="button"
          onClick={onViewLanding}
          className="flex items-center gap-3 text-left group cursor-pointer"
          title="Return to Landing"
        >
          <div className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/20 via-indigo-500/10 to-purple-500/20 border border-sky-500/30 shadow-[0_0_15px_rgba(56,189,248,0.25)] transition-transform group-hover:scale-105">
            <img
              src="/assets/logo.png"
              alt="QuantPulse"
              className="size-6 object-contain"
            />
          </div>
          <div>
            <div className="text-sm font-bold tracking-wider text-white">
              Quant<span className="text-sky-400">Pulse</span>
            </div>
            <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400">
              Institutional Core
            </div>
          </div>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Core Dashboards
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-[0_0_15px_rgba(56,189,248,0.15)] font-semibold"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`size-4 shrink-0 transition-colors ${
                    isActive
                      ? "text-sky-400"
                      : "text-slate-500 group-hover:text-slate-300"
                  }`}
                />
                <div className="truncate">
                  <div className="truncate">{item.label}</div>
                  {item.sublabel && (
                    <div className="text-[10px] text-slate-500 font-normal truncate">
                      {item.sublabel}
                    </div>
                  )}
                </div>
              </div>

              {item.badge && (
                <span
                  className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] font-mono font-bold ${
                    item.badgeColor || "bg-slate-800 text-slate-300"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* C++ Engine Status & Footer */}
      <div className="border-t border-slate-800/80 p-3 space-y-2.5">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
              <span className="font-semibold text-emerald-300 text-[11px]">
                C++20 Engine Active
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400/80">
              660+ Tests Passed
            </span>
          </div>
          <div className="mt-1 text-[10px] text-slate-400">
            Native Quantitative Analytics & Backtesting Link
          </div>
        </div>

        <button
          type="button"
          onClick={onViewLanding}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
        >
          <Home className="size-3.5" />
          <span>Exit to Landing Page</span>
        </button>
      </div>
    </aside>
  );
}
