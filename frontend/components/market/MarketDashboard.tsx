import { useEffect, useState, useCallback } from "react";
import {
  Activity,
  BarChart3,
  BrainCircuit,
  ChartNoAxesCombined,
  Database,
  Gauge,
  Layers,
  Play,
  Plus,
  RefreshCw,
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

import {
  fetchDatasets,
  fetchDatasetAnalytics,
  fetchMarketAnalysis,
} from "@/features/market/market.api";
import type {
  DatasetListItem,
  MarketAnalyticsResult,
} from "@/features/market/market.types";

import { MetricCard } from "./MetricCard";
import { PriceChart } from "./PriceChart";

interface MarketDashboardProps {
  initialDatasetId?: string | null;
  onNavigateToDataLab?: () => void;
}

export function MarketDashboard({
  initialDatasetId,
  onNavigateToDataLab,
}: MarketDashboardProps) {
  const [datasets, setDatasets] = useState<DatasetListItem[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(
    initialDatasetId ?? null,
  );
  const [data, setData] = useState<MarketAnalyticsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnalysisForDataset = useCallback(async (datasetId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchDatasetAnalytics(datasetId);
      setData(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load market analysis for dataset.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSampleAnalysis = useCallback(async () => {
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
  }, []);

  // Fetch dataset list on mount
  useEffect(() => {
    async function init() {
      const list = await fetchDatasets();
      setDatasets(list);

      const targetId =
        initialDatasetId && list.some((d) => d.id === initialDatasetId)
          ? initialDatasetId
          : list.length > 0
            ? list[0]!.id
            : null;

      if (targetId) {
        setSelectedDatasetId(targetId);
        void loadAnalysisForDataset(targetId);
      } else {
        setSelectedDatasetId("sample");
        void loadSampleAnalysis();
      }
    }

    void init();
  }, [initialDatasetId, loadAnalysisForDataset, loadSampleAnalysis]);

  const handleDatasetChange = (value: string | null) => {
    if (!value) return;
    setSelectedDatasetId(value);
    if (value === "sample") {
      void loadSampleAnalysis();
    } else {
      void loadAnalysisForDataset(value);
    }
  };

  const handleRefresh = () => {
    if (selectedDatasetId && selectedDatasetId !== "sample") {
      void loadAnalysisForDataset(selectedDatasetId);
    } else {
      void loadSampleAnalysis();
    }
  };

  const activeDataset = datasets.find((d) => d.id === selectedDatasetId);

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
                MARKET TERMINAL
              </Badge>

              <span className="text-xs text-muted-foreground">
                QuantPulse Analytics Engine
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-white flex items-center gap-3">
              Market Analysis
              {activeDataset && (
                <span className="text-xs font-mono font-normal rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-300 px-2.5 py-1">
                  {activeDataset.symbol} • {activeDataset.name}
                </span>
              )}
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Quantitative market intelligence and risk analytics powered by the
              C++20 engine.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-4 py-2.5 sm:block">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />

                <span className="text-xs font-semibold text-emerald-300">
                  C++20 ENGINE READY
                </span>
              </div>

              <div className="mt-0.5 text-[10px] text-muted-foreground">
                {activeDataset
                  ? `${activeDataset.barCount || data?.observationCount || 0} Bars Loaded`
                  : "C++20 Analytics Engine"}
              </div>
            </div>

            {onNavigateToDataLab && (
              <Button
                variant="outline"
                size="default"
                className="gap-2 border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white"
                onClick={onNavigateToDataLab}
              >
                <Plus className="size-3.5" />
                <span>Import Dataset</span>
              </Button>
            )}

            <Button
              size="default"
              className="gap-2 bg-primary shadow-[0_0_24px_rgba(59,130,246,0.16)]"
              onClick={handleRefresh}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="size-3.5 animate-spin" />
              ) : (
                <Play className="size-3.5 fill-current" />
              )}
              {loading ? "Analyzing..." : "Re-Analyze"}
            </Button>
          </div>
        </section>

        {/* Controls */}
        <Card className="border-primary/30 bg-[#071426]/80 shadow-none">
          <CardContent className="p-3">
            <div className="grid gap-3 md:grid-cols-[1.5fr_120px_140px_1fr]">
              <ControlBlock label="Active Dataset / Instrument">
                <Select
                  value={
                    selectedDatasetId ||
                    (datasets.length > 0 ? datasets[0]!.id : "sample")
                  }
                  onValueChange={handleDatasetChange}
                >
                  <SelectTrigger className="h-9 border-border/70 bg-[#091827]">
                    <SelectValue placeholder="Select dataset" />
                  </SelectTrigger>

                  <SelectContent>
                    {datasets.map((ds) => (
                      <SelectItem key={ds.id} value={ds.id}>
                        {ds.symbol} — {ds.name} ({ds.barCount || "?"} bars)
                      </SelectItem>
                    ))}
                    <SelectItem value="sample">
                      RELIANCE (Built-in Sample)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </ControlBlock>

              <ControlBlock label="Timeframe">
                <Select defaultValue={activeDataset?.timeframe || "1d"}>
                  <SelectTrigger className="h-9 border-border/70 bg-[#091827]">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="1m">1m</SelectItem>
                    <SelectItem value="5m">5m</SelectItem>
                    <SelectItem value="15m">15m</SelectItem>
                    <SelectItem value="1h">1h</SelectItem>
                    <SelectItem value="1d">1d</SelectItem>
                  </SelectContent>
                </Select>
              </ControlBlock>

              <ControlBlock label="Engine Backend">
                <div className="flex h-9 items-center rounded-md border border-border/70 bg-[#091827] px-3 text-xs font-medium text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-400 mr-2" />
                  C++20 Native
                </div>
              </ControlBlock>

              <div className="hidden items-center justify-end gap-3 pr-2 text-xs text-muted-foreground md:flex">
                <span>
                  {data?.observationCount
                    ? `${data.observationCount} OHLCV bars`
                    : "Market Bars"}
                </span>
                <span className="size-1 rounded-full bg-border" />
                <span>C++ Analytics</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-destructive/40 bg-destructive/5 shadow-none">
            <CardContent className="p-4 text-sm text-destructive flex items-center justify-between">
              <span>{error}</span>
              {onNavigateToDataLab && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onNavigateToDataLab}
                  className="text-xs"
                >
                  Go to Data Lab
                </Button>
              )}
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
                        Price & Volume
                      </CardTitle>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Historical closing price and traded volume computed via
                        C++20 engine.
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

              <MarketSummary data={data} datasetName={activeDataset?.name} />
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

function MarketSummary({
  data,
  datasetName,
}: {
  data: MarketAnalyticsResult;
  datasetName?: string;
}) {
  return (
    <Card className="border-primary/25 bg-[#071426]/75 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Market Summary</CardTitle>
        {datasetName && (
          <p className="text-xs text-muted-foreground font-mono truncate">
            {datasetName}
          </p>
        )}
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
                Engine Status
              </div>

              <div className="mt-1 flex items-center gap-2 text-xs font-medium text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                C++20 Analysis Complete
              </div>
            </div>
          </div>

          <p className="mt-2 text-[11px] text-muted-foreground">
            Market analytics calculated natively in C++
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
            Market Microstructure
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
            Recent Signals
          </CardTitle>

          <Signal className="size-5 text-primary/70" />
        </div>
      </CardHeader>

      <CardContent className="flex min-h-[150px] items-center justify-center">
        <div className="text-center">
          <BrainCircuit className="mx-auto size-8 text-muted-foreground/50" />

          <div className="mt-3 text-sm font-medium">No active signals</div>

          <p className="mt-1 text-xs text-muted-foreground">
            Signal generation module ready for strategy execution.
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
