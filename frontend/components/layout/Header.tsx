import React from "react";
import {
  Activity,
  BarChart3,
  FlaskConical,
  LayoutDashboard,
  LineChart,
  Home,
} from "lucide-react";

interface HeaderProps {
  onViewLanding?: () => void;
}

export function Header({ onViewLanding }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-[#07111f]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onViewLanding}
            className="flex items-center gap-3 text-left focus:outline-none group cursor-pointer"
            title="Return to Landing Page"
          >
            <div className="relative flex size-10 sm:size-11 items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <img
                src="/assets/logo.png"
                alt="QuantPulse Logo"
                className="size-full object-contain drop-shadow-[0_0_14px_rgba(56,189,248,0.7)]"
              />
            </div>

            <div>
              <div className="text-[15px] font-bold tracking-[0.16em] text-foreground">
                Quant
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_28px_rgba(168,85,247,0.75)]">
                  Pulse
                </span>
              </div>

              <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Market Terminal
              </div>
            </div>
          </button>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {onViewLanding && (
            <button
              onClick={onViewLanding}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
            >
              <Home className="size-3.5" />
              <span>Landing</span>
            </button>
          )}

          <NavItem active icon={<LayoutDashboard />}>
            Dashboard
          </NavItem>

          <NavItem icon={<BarChart3 />}>Analytics</NavItem>

          <NavItem icon={<LineChart />}>Backtest</NavItem>

          <NavItem icon={<FlaskConical />}>Research</NavItem>
        </nav>

        <div className="flex items-center gap-3">
          {onViewLanding && (
            <button
              onClick={onViewLanding}
              className="sm:hidden flex items-center gap-1.5 rounded-md border border-sky-500/30 bg-sky-500/10 px-2.5 py-1.5 text-xs text-sky-300 font-medium"
            >
              <Home className="size-3" />
              <span>Home</span>
            </button>
          )}

          <div className="flex items-center gap-2 rounded-md border border-emerald-400/20 bg-emerald-400/5 px-3 py-2">
            <Activity className="size-3.5 text-emerald-400" />

            <div className="hidden sm:block">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                Engine online
              </div>

              <div className="text-[9px] text-muted-foreground">
                C++20 Active
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

interface NavItemProps {
  children: React.ReactNode;
  icon: React.ReactNode;
  active?: boolean;
}

function NavItem({ children, icon, active }: NavItemProps) {
  return (
    <button
      type="button"
      className={[
        "flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
      ].join(" ")}
    >
      <span className="size-3.5 [&>svg]:size-full">{icon}</span>
      {children}
    </button>
  );
}
