import React from "react";
import { Activity } from "lucide-react";
import { PipelineStage } from "./PipelineStage";
import type { PipelineStage as PipelineStageType } from "../data-lab.types";

interface PipelineProgressProps {
  stages: PipelineStageType[];
  status?: "completed" | "failed" | "running";
}

export function PipelineProgress({ stages, status }: PipelineProgressProps) {
  const completedCount = stages.filter((s) => s.status === "completed").length;
  const totalCount = stages.length;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
            <Activity className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">
              Pipeline Execution Trace
            </h3>
            <p className="text-xs text-slate-400">
              Real-time multi-stage ETL verification and quantitative
              normalization
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">
            Stages: <strong className="text-sky-300">{completedCount}</strong> /{" "}
            {totalCount}
          </span>
          <div className="h-2 w-24 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={[
                "h-full transition-all duration-500",
                status === "failed"
                  ? "bg-rose-500"
                  : "bg-gradient-to-r from-sky-400 to-indigo-500",
              ].join(" ")}
              style={{
                width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {stages.map((stage, idx) => (
          <PipelineStage key={stage.name} stage={stage} index={idx} />
        ))}
      </div>
    </div>
  );
}
