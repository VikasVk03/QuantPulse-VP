import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  BrainCircuit,
  ChartNoAxesCombined,
  Database,
  Gauge,
  Play,
  Signal,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { fetchMarketAnalysis } from "@/features/market/market.api";
import type { MarketAnalyticsResult } from "@/features/market/market.types";

import { MetricCard } from "./MetricCard";
import { PriceChart } from "./PriceChart";

export function MarketDashboard() {
  const [data, setData] = useState<MarketAnalyticsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchMarketAnalysis();
      setData(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load market analysis.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void handleAnalyze();
  }, []);

  return (
    <main className="min-h-[calc(100vh-70px)] bg-[#050c16] text-foreground">
      <div className="mx-auto max-w-[1600px] space-y-5 px-4 py-5 md:px-6 lg:py-6">
        {/* Page heading */}
        <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-primary/40 bg-primary/10 text-[10px] font-semibold tracking-wider text-primary"
              >
                MARKET
              </Badge>

              <span className="text-xs text-muted-foreground">
                QuantPulse Analytics Engine
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight">
              Market Analysis
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Historical market intelligence powered by the C++20 quant engine.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-4 py-2.5 sm:block">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />

                <span className="text-xs font-semibold text-emerald-300">
                  ENGINE READY
                </span>
              </div>

              <div className="mt-0.5 text-[10px] text-muted-foreground">
                C++20 Analytics Engine
              </div>
            </div>

            <Button
              size="default"
              className="gap-2 bg-primary shadow-[0_0_24px_rgba(59,130,246,0.16)]"
              onClick={() => void handleAnalyze()}
              disabled={loading}
            >
              <Play className="size-3.5 fill-current" />

              {loading ? "Analyzing..." : "Analyze"}
            </Button>
          </div>
        </section>

        {/* Controls */}
        <Card className="border-primary/30 bg-[#071426]/80 shadow-none">
          <CardContent className="p-3">
            <div className="grid gap-3 md:grid-cols-[1fr_140px_180px_1fr]">
              <ControlBlock label="Instrument">
                <Select defaultValue="RELIANCE">
                  <SelectTrigger className="h-9 border-border/70 bg-[#091827]">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="RELIANCE">RELIANCE</SelectItem>
                  </SelectContent>
                </Select>
              </ControlBlock>

              <ControlBlock label="Timeframe">
                <Select defaultValue="1m">
                  <SelectTrigger className="h-9 border-border/70 bg-[#091827]">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="1m">1m</SelectItem>
                  </SelectContent>
                </Select>
              </ControlBlock>

              <ControlBlock label="Data source">
                <Select defaultValue="sample">
                  <SelectTrigger className="h-9 border-border/70 bg-[#091827]">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="sample">Sample data</SelectItem>
                  </SelectContent>
                </Select>
              </ControlBlock>

              <div className="hidden items-center justify-end gap-3 pr-2 text-xs text-muted-foreground md:flex">
                <span>1-minute bars</span>
                <span className="size-1 rounded-full bg-border" />
                <span>Close + volume</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-destructive/40 bg-destructive/5 shadow-none">
            <CardContent className="p-4 text-sm text-destructive">
              {error}
            </CardContent>
          </Card>
        )}

        {data && (
          <>
            {/* KPI strip */}
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <MetricCard
                label="Last price"
                value={`₹${data.lastPrice.toFixed(2)}`}
                detail={`${data.returnPercentage >= 0 ? "+" : ""}${data.returnPercentage.toFixed(2)}%`}
                positive={data.returnPercentage >= 0}
                icon={TrendingUp}
              />

              <MetricCard
                label="Return"
                value={`${data.returnPercentage >= 0 ? "+" : ""}${data.returnPercentage.toFixed(3)}%`}
                detail={data.returnPercentage >= 0 ? "POSITIVE" : "NEGATIVE"}
                positive={data.returnPercentage >= 0}
                icon={BarChart3}
              />

              <MetricCard
                label="Volatility"
                value={`${(data.volatility * 100).toFixed(3)}%`}
                detail="ANNUALIZED"
                icon={Activity}
              />

              <MetricCard
                label="Total volume"
                value={formatCompactNumber(data.totalVolume)}
                detail={data.totalVolume.toLocaleString("en-IN")}
                icon={BarChart3}
              />

              <MetricCard
                label="Observations"
                value={data.observationCount.toLocaleString("en-IN")}
                detail="MARKET BARS"
                icon={Database}
              />
            </section>

            {/* Chart + summary */}
            <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
              <Card className="overflow-hidden border-primary/25 bg-[#071426]/75 shadow-none">
                <CardHeader className="border-b border-border/50 pb-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-base uppercase tracking-wide">
                        Price
                      </CardTitle>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Historical closing price and traded volume.
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <LegendDot className="bg-primary" label="Close price" />

                      <LegendDot
                        className="bg-primary/40"
                        label="Volume"
                        square
                      />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-3">
                  <PriceChart series={data.series} />
                </CardContent>
              </Card>

              <MarketSummary data={data} />
            </section>

            {/* Intelligence layer */}
            <section className="grid gap-4 lg:grid-cols-2">
              <MicrostructurePanel />

              <SignalsPanel />
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function MarketSummary({ data }: { data: MarketAnalyticsResult }) {
  return (
    <Card className="border-primary/25 bg-[#071426]/75 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Market summary</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <SummaryRow
          label="First price"
          value={`₹${data.firstPrice.toFixed(2)}`}
        />

        <SummaryRow
          label="Last price"
          value={`₹${data.lastPrice.toFixed(2)}`}
        />

        <SummaryRow
          label="Return"
          value={`${data.returnPercentage >= 0 ? "+" : ""}${data.returnPercentage.toFixed(3)}%`}
          positive={data.returnPercentage >= 0}
        />

        <SummaryRow
          label="Volatility"
          value={`${(data.volatility * 100).toFixed(3)}%`}
        />

        <SummaryRow
          label="Average volume"
          value={data.averageVolume.toLocaleString("en-IN")}
        />

        <SummaryRow
          label="Observations"
          value={data.observationCount.toLocaleString("en-IN")}
        />

        <Separator className="my-4" />

        <div className="rounded-lg border border-primary/20 bg-[#050c16]/70 p-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md border border-primary/20 bg-primary/10">
              <Gauge className="size-4 text-primary" />
            </div>

            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-primary">
                Engine status
              </div>

              <div className="mt-1 flex items-center gap-2 text-xs font-medium">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                Analysis complete
              </div>
            </div>
          </div>

          <p className="mt-2 text-[11px] text-muted-foreground">
            C++20 market analytics
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function MicrostructurePanel() {
  return (
    <Card className="border-primary/25 bg-[#071426]/75 shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm uppercase tracking-[0.08em]">
            Market microstructure
          </CardTitle>

          <ChartNoAxesCombined className="size-5 text-primary/70" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
          <MicrostructureRow label="Spread" />
          <MicrostructureRow label="Depth imbalance" />
          <MicrostructureRow label="Microprice" />
          <MicrostructureRow label="Liquidity" />
          <MicrostructureRow label="OFI" />
          <MicrostructureRow label="Trade intensity" />
        </div>

        <div className="mt-4 rounded-md border border-dashed border-border/70 bg-background/30 p-3 text-[11px] text-muted-foreground">
          Level-2/order-book data is not available in the current OHLCV dataset.
        </div>
      </CardContent>
    </Card>
  );
}

function SignalsPanel() {
  return (
    <Card className="border-primary/25 bg-[#071426]/75 shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm uppercase tracking-[0.08em]">
            Recent signals
          </CardTitle>

          <Signal className="size-5 text-primary/70" />
        </div>
      </CardHeader>

      <CardContent className="flex min-h-[150px] items-center justify-center">
        <div className="text-center">
          <BrainCircuit className="mx-auto size-8 text-muted-foreground/50" />

          <div className="mt-3 text-sm font-medium">No signals available</div>

          <p className="mt-1 text-xs text-muted-foreground">
            Signal generation will be connected to the quant engine.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function MicrostructureRow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 py-2 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>

      <span className="text-sm font-medium text-muted-foreground">—</span>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 pb-2.5 last:border-0 last:pb-0">
      <span className="text-xs text-muted-foreground">{label}</span>

      <span
        className={[
          "text-sm font-medium tabular-nums",
          positive ? "text-emerald-400" : "text-foreground",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}

function ControlBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </div>

      {children}
    </div>
  );
}

function LegendDot({
  label,
  className,
  square,
}: {
  label: string;
  className: string;
  square?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <span
        className={[
          "size-2",
          square ? "rounded-sm" : "rounded-full",
          className,
        ].join(" ")}
      />

      {label}
    </div>
  );
}

function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }

  return value.toLocaleString("en-IN");
}
