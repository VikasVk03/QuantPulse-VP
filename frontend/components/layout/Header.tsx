import {
  Activity,
  BarChart3,
  FlaskConical,
  LayoutDashboard,
  LineChart,
} from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-[#07111f]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[17.5] max-w-[1600px] items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg border border-primary/40 bg-primary/15 text-lg font-bold text-primary shadow-[0_0_24px_rgba(59,130,246,0.12)]">
            Q
          </div>

          <div>
            <div className="text-[15px] font-bold tracking-[0.16em] text-foreground">
              QUANT<span className="text-primary">PULSE</span>
            </div>

            <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Market Terminal
            </div>
          </div>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          <NavItem active icon={<LayoutDashboard />}>
            Dashboard
          </NavItem>

          <NavItem icon={<BarChart3 />}>Analytics</NavItem>

          <NavItem icon={<LineChart />}>Backtest</NavItem>

          <NavItem icon={<FlaskConical />}>Research</NavItem>
        </nav>

        <div className="flex items-center gap-2 rounded-md border border-emerald-400/20 bg-emerald-400/5 px-3 py-2">
          <Activity className="size-3.5 text-emerald-400" />

          <div className="hidden sm:block">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
              Engine online
            </div>

            <div className="text-[9px] text-muted-foreground">C++20</div>
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
