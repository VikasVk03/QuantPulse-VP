import React from "react";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Database,
  ExternalLink,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import type { PipelineResult } from "../data-lab.types";

interface DatasetReadyCardProps {
  result: PipelineResult;
  onReset: () => void;
  onNavigateToTerminal?: (datasetId?: string) => void;
}

export function DatasetReadyCard({
  result,
  onReset,
  onNavigateToTerminal,
}: DatasetReadyCardProps) {
  const dataset = result.dataset;
  const symbol = dataset?.symbol || "UNKNOWN";
  const timeframe = dataset?.timeframe || "1d";
  const datasetName = dataset?.name || result.fileName;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 via-slate-900/70 to-slate-950 p-6 backdrop-blur-xl shadow-2xl">
      <div className="absolute -right-12 -top-12 size-44 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="size-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Dataset Ready & Available
            </span>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-3">
              {datasetName}
              <span className="rounded-md border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-xs font-mono font-semibold text-sky-300">
                {symbol}
              </span>
              <span className="rounded-md border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-xs font-mono font-semibold text-purple-300">
                {timeframe}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Dataset ID:{" "}
              <span className="font-mono text-slate-300">
                {result.datasetId}
              </span>{" "}
              • {result.processedRows.toLocaleString()} market bars persisted to
              MongoDB.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
            <div className="flex items-center gap-1.5 text-emerald-300">
              <Activity className="size-3.5" />
              <span>C++20 Quant Engine: Ready</span>
            </div>
            <div className="flex items-center gap-1.5 text-sky-300">
              <Database className="size-3.5" />
              <span>Source: {dataset?.source || "user-upload"}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            <span>Import Another</span>
          </button>

          {onNavigateToTerminal && (
            <button
              type="button"
              onClick={() => onNavigateToTerminal(result.datasetId)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-500/20 hover:scale-[1.02] hover:shadow-emerald-500/35 transition-all cursor-pointer"
            >
              <span>View in Terminal</span>
              <ArrowRight className="size-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
