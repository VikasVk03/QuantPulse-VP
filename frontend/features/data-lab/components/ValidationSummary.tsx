import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  FileSpreadsheet,
  XCircle,
} from "lucide-react";
import type { PipelineResult } from "../data-lab.types";

interface ValidationSummaryProps {
  result: PipelineResult;
}

export function ValidationSummary({ result }: ValidationSummaryProps) {
  const { totalRows, processedRows, duplicateRows, warnings, errors } = result;

  const metrics = [
    {
      label: "Rows Received",
      value: totalRows.toLocaleString(),
      icon: <FileSpreadsheet className="size-4 text-sky-400" />,
      color: "text-slate-100",
      subtext: `From ${result.fileName}`,
    },
    {
      label: "Rows Accepted",
      value: processedRows.toLocaleString(),
      icon: <CheckCircle2 className="size-4 text-emerald-400" />,
      color: "text-emerald-300",
      subtext: "Persisted & clean",
    },
    {
      label: "Duplicates Removed",
      value: duplicateRows.toLocaleString(),
      icon: <Copy className="size-4 text-amber-400" />,
      color: "text-amber-300",
      subtext: "Unique (symbol+timestamp)",
    },
    {
      label: "Validation Errors",
      value: errors.length.toString(),
      icon: <XCircle className="size-4 text-rose-400" />,
      color: errors.length > 0 ? "text-rose-400" : "text-slate-400",
      subtext: errors.length === 0 ? "Zero errors" : "Critical rejections",
    },
    {
      label: "Warnings",
      value: warnings.length.toString(),
      icon: <AlertTriangle className="size-4 text-yellow-400" />,
      color: warnings.length > 0 ? "text-yellow-300" : "text-slate-400",
      subtext: warnings.length === 0 ? "No warnings" : "Handled",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-sm font-bold text-slate-100">
          Validation & Quality Summary
        </h3>
        <span className="text-[11px] font-mono text-slate-400">
          Format: {result.format.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3.5 space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">
                {metric.label}
              </span>
              {metric.icon}
            </div>
            <div className={`text-xl font-bold font-mono ${metric.color}`}>
              {metric.value}
            </div>
            <div className="text-[10px] text-slate-500">{metric.subtext}</div>
          </div>
        ))}
      </div>

      {warnings.length > 0 && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-300 space-y-1">
          <div className="font-semibold flex items-center gap-1.5">
            <AlertTriangle className="size-3.5" />
            <span>Pipeline Warnings ({warnings.length})</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] opacity-90">
            {warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {errors.length > 0 && (
        <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300 space-y-1">
          <div className="font-semibold flex items-center gap-1.5">
            <XCircle className="size-3.5" />
            <span>Pipeline Errors ({errors.length})</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] opacity-90">
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
