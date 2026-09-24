import React from "react";
import {
  CheckCircle2,
  Clock,
  Database,
  FileCheck2,
  FileSearch,
  Filter,
  Layers,
  Loader2,
  SlidersHorizontal,
  XCircle,
} from "lucide-react";
import type { PipelineStage as PipelineStageType } from "../data-lab.types";

interface PipelineStageProps {
  stage: PipelineStageType;
  index: number;
}

const STAGE_CONFIG: Record<
  string,
  { label: string; description: string; icon: React.ReactNode }
> = {
  ingestion: {
    label: "Data Ingestion",
    description: "Format detection & multi-part stream parsing",
    icon: <Layers className="size-4" />,
  },
  schema_detection: {
    label: "Schema Detection",
    description: "Header mapping & OHLCV structure verification",
    icon: <FileSearch className="size-4" />,
  },
  validation: {
    label: "Data Validation",
    description: "Numeric integrity & OHLC relationship assertions",
    icon: <FileCheck2 className="size-4" />,
  },
  normalization: {
    label: "Normalization",
    description: "Canonical type casting & whitespace sanitization",
    icon: <SlidersHorizontal className="size-4" />,
  },
  timestamp_normalization: {
    label: "Timestamp Mapping",
    description: "Epoch & ISO 8601 UTC chronological conversion",
    icon: <Clock className="size-4" />,
  },
  symbol_normalization: {
    label: "Symbol Standardisation",
    description: "Uppercase alignment & asset symbol resolution",
    icon: <FileSearch className="size-4" />,
  },
  deduplication: {
    label: "Deduplication",
    description: "Unique (symbol + timestamp) boundary deduplication",
    icon: <Filter className="size-4" />,
  },
  persistence: {
    label: "Persistence",
    description: "Database storage & C++ engine availability",
    icon: <Database className="size-4" />,
  },
};

export function PipelineStage({ stage, index }: PipelineStageProps) {
  const config = STAGE_CONFIG[stage.name] || {
    label: stage.name.replace(/_/g, " "),
    description: "Pipeline processing stage",
    icon: <Layers className="size-4" />,
  };

  const getStatusBadge = () => {
    switch (stage.status) {
      case "completed":
        return (
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
            <CheckCircle2 className="size-3.5" />
            <span>Passed</span>
          </div>
        );
      case "running":
        return (
          <div className="flex items-center gap-1 text-[11px] font-semibold text-sky-400 animate-pulse">
            <Loader2 className="size-3.5 animate-spin" />
            <span>Processing</span>
          </div>
        );
      case "failed":
        return (
          <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-400">
            <XCircle className="size-3.5" />
            <span>Failed</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
            <div className="size-2 rounded-full bg-slate-600" />
            <span>Pending</span>
          </div>
        );
    }
  };

  const getContainerStyles = () => {
    switch (stage.status) {
      case "completed":
        return "border-emerald-500/30 bg-emerald-500/[0.03]";
      case "running":
        return "border-sky-500/40 bg-sky-500/[0.06] ring-1 ring-sky-500/30 shadow-[0_0_20px_rgba(56,189,248,0.15)]";
      case "failed":
        return "border-rose-500/40 bg-rose-500/[0.05]";
      default:
        return "border-slate-800 bg-slate-900/30 opacity-60";
    }
  };

  return (
    <div
      className={[
        "relative rounded-xl border p-4 transition-all duration-300",
        getContainerStyles(),
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={[
              "flex size-8 shrink-0 items-center justify-center rounded-lg border",
              stage.status === "completed"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : stage.status === "running"
                  ? "border-sky-500/40 bg-sky-500/20 text-sky-400 animate-pulse"
                  : stage.status === "failed"
                    ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                    : "border-slate-700 bg-slate-800/50 text-slate-500",
            ].join(" ")}
          >
            {config.icon}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-400">
                0{index + 1}
              </span>
              <span className="text-sm font-semibold text-slate-200">
                {config.label}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {config.description}
            </p>
          </div>
        </div>

        <div>{getStatusBadge()}</div>
      </div>

      {(stage.inputRows !== undefined || stage.outputRows !== undefined) && (
        <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2.5 text-[11px] text-slate-400 font-mono">
          <span>
            Input:{" "}
            <strong className="text-slate-200">
              {stage.inputRows?.toLocaleString() ?? "-"}
            </strong>
          </span>
          <span>
            Output:{" "}
            <strong className="text-slate-200">
              {stage.outputRows?.toLocaleString() ?? "-"}
            </strong>
          </span>
        </div>
      )}

      {stage.error && (
        <div className="mt-2.5 rounded-md bg-rose-500/10 border border-rose-500/20 p-2 text-[11px] text-rose-300 font-mono">
          {stage.error}
        </div>
      )}
    </div>
  );
}
