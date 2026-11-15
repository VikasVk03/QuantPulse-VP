import { useEffect, useRef, useState, useMemo } from "react";
import {
  CandlestickSeries,
  ColorType,
  createChart,
  HistogramSeries,
  LineSeries,
  type IChartApi,
  type Time,
} from "lightweight-charts";
import { CandlestickChart, LineChart, Layers, SlidersHorizontal } from "lucide-react";

import type { MarketSeriesPoint } from "@/features/market/market.types";

interface PriceChartProps {
  series: MarketSeriesPoint[];
  height?: number;
}

export function PriceChart({ series, height = 360 }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);

  // User Interactive Chart Controls
  const [chartType, setChartType] = useState<"candles" | "line">("candles");
  const [showVWAP, setShowVWAP] = useState<boolean>(true);
  const [showEMA, setShowEMA] = useState<boolean>(true);
  const [showSMA, setShowSMA] = useState<boolean>(false);
  const [showBB, setShowBB] = useState<boolean>(false);

  // Clean, sort and deduplicate series by timestamp
  const processedSeries = useMemo(() => {
    if (!series || series.length === 0) return [];

    const sorted = [...series].sort((a, b) => a.timestamp - b.timestamp);
    const unique: MarketSeriesPoint[] = [];
    let lastTime = -1;

    for (const pt of sorted) {
      const t = pt.timestamp > 1e11 ? Math.floor(pt.timestamp / 1000) : pt.timestamp;
      if (t !== lastTime) {
        unique.push(pt);
        lastTime = t;
      }
    }
    return unique;
  }, [series]);

  useEffect(() => {
    if (!containerRef.current || processedSeries.length === 0) {
      return;
    }

    const container = containerRef.current;
    // Clear any previous chart canvas inside container
    container.innerHTML = "";

    const chart = createChart(container, {
      width: container.clientWidth,
      height: height,

      layout: {
        background: {
          type: ColorType.Solid,
          color: "#09121f",
        },
        textColor: "#94a3b8",
        attributionLogo: false,
      },

      grid: {
        vertLines: {
          color: "rgba(30, 41, 59, 0.4)",
        },
        horzLines: {
          color: "rgba(30, 41, 59, 0.4)",
        },
      },

      rightPriceScale: {
        borderColor: "#1e293b",
        scaleMargins: {
          top: 0.08,
          bottom: 0.22,
        },
      },

      timeScale: {
        borderColor: "#1e293b",
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 3,
        barSpacing: 10,
      },

      crosshair: {
        vertLine: {
          color: "#38bdf8",
          width: 1,
          style: 3,
          labelBackgroundColor: "#0284c7",
        },
        horzLine: {
          color: "#38bdf8",
          width: 1,
          style: 3,
          labelBackgroundColor: "#0284c7",
        },
      },

      localization: {
        priceFormatter: (price: number) => `₹${price.toFixed(2)}`,
      },
    });

    chartRef.current = chart;

    // 1. Primary Price Series (Candles or Line)
    if (chartType === "candles") {
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#10b981",
        downColor: "#f43f5e",
        borderVisible: false,
        wickUpColor: "#10b981",
        wickDownColor: "#f43f5e",
        priceFormat: { type: "price", precision: 2, minMove: 0.01 },
      });

      const candleData = processedSeries.map((point) => {
        const time = (point.timestamp > 1e11
          ? Math.floor(point.timestamp / 1000)
          : point.timestamp) as Time;
        const close = point.close ?? point.price ?? 0;
        const open = point.open ?? point.price ?? close;
        let high = point.high ?? Math.max(open, close);
        let low = point.low ?? Math.min(open, close);
        if (high < Math.max(open, close)) high = Math.max(open, close);
        if (low > Math.min(open, close)) low = Math.min(open, close);

        return { time, open, high, low, close };
      });

      candleSeries.setData(candleData);
    } else {
      const lineSeries = chart.addSeries(LineSeries, {
        color: "#38bdf8",
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        priceFormat: { type: "price", precision: 2, minMove: 0.01 },
      });

      const lineData = processedSeries.map((point) => ({
        time: (point.timestamp > 1e11
          ? Math.floor(point.timestamp / 1000)
          : point.timestamp) as Time,
        value: point.close ?? point.price ?? 0,
      }));

      lineSeries.setData(lineData);
    }

    // 2. Volume Sub-Panel
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
      lastValueVisible: false,
      priceLineVisible: false,
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.82, bottom: 0 },
    });

    const volumeData = processedSeries.map((pt, idx) => {
      const time = (pt.timestamp > 1e11
        ? Math.floor(pt.timestamp / 1000)
        : pt.timestamp) as Time;
      const close = pt.close ?? pt.price ?? 0;
      const open =
        pt.open ??
        (idx > 0
          ? (processedSeries[idx - 1].close ?? processedSeries[idx - 1].price ?? close)
          : close);
      const isUp = close >= open;

      return {
        time,
        value: pt.volume || 0,
        color: isUp ? "rgba(16, 185, 129, 0.35)" : "rgba(244, 63, 94, 0.35)",
      };
    });

    volumeSeries.setData(volumeData);

    // 3. Technical Indicator Overlays
    // (a) VWAP Overlay (Amber Line)
    if (showVWAP) {
      const vwapSeries = chart.addSeries(LineSeries, {
        color: "#f59e0b",
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: true,
        title: "VWAP",
      });

      let cumulativeTPV = 0;
      let cumulativeVol = 0;
      const vwapData = processedSeries.map((pt) => {
        const time = (pt.timestamp > 1e11
          ? Math.floor(pt.timestamp / 1000)
          : pt.timestamp) as Time;
        const close = pt.close ?? pt.price ?? 0;
        const high = pt.high ?? close;
        const low = pt.low ?? close;
        const typicalPrice = (high + low + close) / 3;
        const vol = pt.volume > 0 ? pt.volume : 1;
        cumulativeTPV += typicalPrice * vol;
        cumulativeVol += vol;

        return {
          time,
          value: Number((cumulativeTPV / cumulativeVol).toFixed(2)),
        };
      });

      vwapSeries.setData(vwapData);
    }

    // (b) EMA 20 Overlay (Purple Line)
    if (showEMA) {
      const emaSeries = chart.addSeries(LineSeries, {
        color: "#a855f7",
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: true,
        title: "EMA 20",
      });

      const k = 2 / (20 + 1);
      let prevEMA = 0;
      const emaData: { time: Time; value: number }[] = [];

      for (let i = 0; i < processedSeries.length; i++) {
        const pt = processedSeries[i];
        const time = (pt.timestamp > 1e11
          ? Math.floor(pt.timestamp / 1000)
          : pt.timestamp) as Time;
        const price = pt.close ?? pt.price ?? 0;

        if (i === 0) {
          prevEMA = price;
        } else {
          prevEMA = price * k + prevEMA * (1 - k);
        }

        if (i >= 5) {
          emaData.push({ time, value: Number(prevEMA.toFixed(2)) });
        }
      }

      emaSeries.setData(emaData);
    }

    // (c) SMA 50 Overlay (Cyan Line)
    if (showSMA) {
      const smaSeries = chart.addSeries(LineSeries, {
        color: "#06b6d4",
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: true,
        title: "SMA 50",
      });

      const windowSize = Math.min(50, Math.max(5, Math.floor(processedSeries.length / 3)));
      let sum = 0;
      const smaData: { time: Time; value: number }[] = [];

      for (let i = 0; i < processedSeries.length; i++) {
        const pt = processedSeries[i];
        const time = (pt.timestamp > 1e11
          ? Math.floor(pt.timestamp / 1000)
          : pt.timestamp) as Time;
        const price = pt.close ?? pt.price ?? 0;
        sum += price;

        if (i >= windowSize) {
          sum -=
            processedSeries[i - windowSize].close ??
            processedSeries[i - windowSize].price ??
            0;
          smaData.push({ time, value: Number((sum / windowSize).toFixed(2)) });
        } else if (i === windowSize - 1) {
          smaData.push({ time, value: Number((sum / windowSize).toFixed(2)) });
        }
      }

      smaSeries.setData(smaData);
    }

    // (d) Bollinger Bands (Upper, Middle, Lower)
    if (showBB) {
      const bbUpper = chart.addSeries(LineSeries, {
        color: "rgba(56, 189, 248, 0.7)",
        lineWidth: 1,
        lineStyle: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        title: "BB Upper",
      });
      const bbMiddle = chart.addSeries(LineSeries, {
        color: "rgba(99, 102, 241, 0.8)",
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
        title: "BB Mid",
      });
      const bbLower = chart.addSeries(LineSeries, {
        color: "rgba(56, 189, 248, 0.7)",
        lineWidth: 1,
        lineStyle: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        title: "BB Lower",
      });

      const bbPeriod = Math.min(20, Math.max(5, Math.floor(processedSeries.length / 4)));
      const upperData: { time: Time; value: number }[] = [];
      const midData: { time: Time; value: number }[] = [];
      const lowerData: { time: Time; value: number }[] = [];

      for (let i = bbPeriod - 1; i < processedSeries.length; i++) {
        const slice = processedSeries.slice(i - bbPeriod + 1, i + 1);
        const prices = slice.map((p) => p.close ?? p.price ?? 0);
        const mean = prices.reduce((a, b) => a + b, 0) / bbPeriod;
        const variance =
          prices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / bbPeriod;
        const std = Math.sqrt(variance);
        const time = (processedSeries[i].timestamp > 1e11
          ? Math.floor(processedSeries[i].timestamp / 1000)
          : processedSeries[i].timestamp) as Time;

        midData.push({ time, value: Number(mean.toFixed(2)) });
        upperData.push({ time, value: Number((mean + 2 * std).toFixed(2)) });
        lowerData.push({ time, value: Number((mean - 2 * std).toFixed(2)) });
      }

      bbUpper.setData(upperData);
      bbMiddle.setData(midData);
      bbLower.setData(lowerData);
    }

    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver(() => {
      chart.applyOptions({
        width: container.clientWidth,
        height: height,
      });
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [processedSeries, height, chartType, showVWAP, showEMA, showSMA, showBB]);

  return (
    <div className="w-full flex flex-col rounded-xl border border-slate-800 bg-[#09121f] overflow-hidden shadow-2xl">
      {/* Chart Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 bg-slate-950/70 px-4 py-2 text-xs">
        {/* Left: Mode Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setChartType("candles")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              chartType === "candles"
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <CandlestickChart className="size-3.5" />
            <span>Candles</span>
          </button>
          <button
            type="button"
            onClick={() => setChartType("line")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              chartType === "line"
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <LineChart className="size-3.5" />
            <span>Line</span>
          </button>
        </div>

        {/* Right: Technical Overlays Toggles */}
        <div className="flex items-center gap-1.5 font-mono">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 mr-1 flex items-center gap-1">
            <Layers className="size-3" /> Overlays:
          </span>

          <button
            type="button"
            onClick={() => setShowVWAP(!showVWAP)}
            className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold transition-all ${
              showVWAP
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "bg-slate-900/60 text-slate-500 border border-slate-800 hover:text-slate-300"
            }`}
          >
            <span className="size-1.5 rounded-full bg-amber-400" />
            <span>VWAP</span>
          </button>

          <button
            type="button"
            onClick={() => setShowEMA(!showEMA)}
            className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold transition-all ${
              showEMA
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                : "bg-slate-900/60 text-slate-500 border border-slate-800 hover:text-slate-300"
            }`}
          >
            <span className="size-1.5 rounded-full bg-purple-400" />
            <span>EMA 20</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSMA(!showSMA)}
            className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold transition-all ${
              showSMA
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "bg-slate-900/60 text-slate-500 border border-slate-800 hover:text-slate-300"
            }`}
          >
            <span className="size-1.5 rounded-full bg-cyan-400" />
            <span>SMA 50</span>
          </button>

          <button
            type="button"
            onClick={() => setShowBB(!showBB)}
            className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold transition-all ${
              showBB
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                : "bg-slate-900/60 text-slate-500 border border-slate-800 hover:text-slate-300"
            }`}
          >
            <span className="size-1.5 rounded-full bg-sky-400" />
            <span>Bollinger (20,2)</span>
          </button>
        </div>
      </div>

      {/* Lightweight-charts Canvas Mount */}
      <div
        ref={containerRef}
        style={{ height: `${height}px` }}
        className="w-full relative"
      />
    </div>
  );
}
