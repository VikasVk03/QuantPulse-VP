import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  detail?: string;
  positive?: boolean;
  icon?: LucideIcon;
}

export function MetricCard({
  label,
  value,
  detail,
  positive,
  icon: Icon,
}: MetricCardProps) {
  return (
    <Card className="group relative overflow-hidden border-border/60 bg-[#0a1626]/80 shadow-none transition-colors hover:border-primary/30">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </div>

          {Icon && (
            <Icon className="size-4 text-primary/70 transition-colors group-hover:text-primary" />
          )}
        </div>

        <div className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-foreground">
          {value}
        </div>

        {detail && (
          <div
            className={[
              "mt-1 text-[11px]",
              positive
                ? "font-semibold text-emerald-400"
                : "text-muted-foreground",
            ].join(" ")}
          >
            {detail}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
