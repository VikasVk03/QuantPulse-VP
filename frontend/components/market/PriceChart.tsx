import { useEffect, useRef } from "react";
import {
  ColorType,
  createChart,
  HistogramSeries,
  LineSeries,
  type IChartApi,
  type Time,
} from "lightweight-charts";

import type { MarketSeriesPoint } from "@/features/market/market.types";

interface PriceChartProps {
  series: MarketSeriesPoint[];
}

export function PriceChart({ series }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current || series.length === 0) {
      return;
    }

    const container = containerRef.current;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: 420,

      layout: {
        background: {
          type: ColorType.Solid,
          color: "#0f1b2d",
        },
        textColor: "#8fa8c7",
        attributionLogo: true,
      },

      grid: {
        vertLines: {
          color: "#1c2d44",
        },
        horzLines: {
          color: "#1c2d44",
        },
      },

      rightPriceScale: {
        borderColor: "#263a54",
        scaleMargins: {
          top: 0.08,
          bottom: 0.25,
        },
      },

      timeScale: {
        borderColor: "#263a54",
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 2,
        barSpacing: 12,
      },

      crosshair: {
        vertLine: {
          color: "#5d8fd8",
          width: 1,
          style: 3,
          labelBackgroundColor: "#1d4f91",
        },
        horzLine: {
          color: "#5d8fd8",
          width: 1,
          style: 3,
          labelBackgroundColor: "#1d4f91",
        },
      },

      localization: {
        priceFormatter: (price: number) => `₹${price.toFixed(2)}`,
      },
    });

    chartRef.current = chart;

    const priceSeries = chart.addSeries(LineSeries, {
      color: "#4c9aff",
      lineWidth: 2,

      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,

      lastValueVisible: true,
      priceLineVisible: true,

      priceFormat: {
        type: "price",
        precision: 2,
        minMove: 0.01,
      },
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: "volume",
      },

      priceScaleId: "volume",

      color: "rgba(76, 154, 255, 0.35)",

      lastValueVisible: false,
      priceLineVisible: false,
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.78,
        bottom: 0,
      },
    });

    priceSeries.setData(
      series.map((point) => ({
        time: point.timestamp as Time,
        value: point.price,
      })),
    );

    volumeSeries.setData(
      series.map((point) => ({
        time: point.timestamp as Time,
        value: point.volume,
      })),
    );

    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver(() => {
      chart.applyOptions({
        width: container.clientWidth,
      });
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [series]);

  return (
    <div
      ref={containerRef}
      className="h-[105] w-full overflow-hidden rounded-md border border-border/50 bg-[#0f1b2d]"
    />
  );
}
