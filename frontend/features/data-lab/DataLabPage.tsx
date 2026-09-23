import React, { useState } from "react";
import {
  Activity,
  AlertCircle,
  Cpu,
  Database,
  FileSpreadsheet,
  Layers,
  Sparkles,
} from "lucide-react";
import { DatasetUpload } from "./components/DatasetUpload";
import { PipelineProgress } from "./components/PipelineProgress";
import { ValidationSummary } from "./components/ValidationSummary";
import { DatasetReadyCard } from "./components/DatasetReadyCard";
import { DatasetPreview } from "./components/DatasetPreview";
import { uploadDataset } from "./data-lab.api";
import type {
  PipelineResult,
  PipelineStage,
  UploadDatasetRequest,
} from "./data-lab.types";

interface DataLabPageProps {
  onNavigateToTerminal?: (datasetId?: string) => void;
}

const DEFAULT_STAGES: PipelineStage[] = [
  { name: "ingestion", status: "pending" },
  { name: "schema_detection", status: "pending" },
  { name: "validation", status: "pending" },
  { name: "normalization", status: "pending" },
  { name: "timestamp_normalization", status: "pending" },
  { name: "symbol_normalization", status: "pending" },
  { name: "deduplication", status: "pending" },
  { name: "persistence", status: "pending" },
];

export function DataLabPage({ onNavigateToTerminal }: DataLabPageProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [displayStages, setDisplayStages] =
    useState<PipelineStage[]>(DEFAULT_STAGES);

  const handleProcess = async (request: UploadDatasetRequest) => {
    setIsProcessing(true);
    setError(null);
    setResult(null);

    // Initial running animation
    setDisplayStages((prev) =>
      prev.map((s, idx) =>
        idx === 0 ? { ...s, status: "running" } : { ...s, status: "pending" },
      ),
    );

    try {
      const pipelineResult = await uploadDataset(request);
      setResult(pipelineResult);
      setDisplayStages(pipelineResult.stages);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Pipeline execution failed";
      setError(errorMsg);
      setDisplayStages((prev) =>
        prev.map((s) =>
          s.status === "running"
            ? { ...s, status: "failed", error: errorMsg }
            : s,
        ),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setDisplayStages(DEFAULT_STAGES);
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 md:px-6 py-8 space-y-8">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400 mb-1">
            <Layers className="size-3.5" />
            <span>Quantitative Data Infrastructure</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Data Lab
            <span className="text-xs font-mono font-medium rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 px-3 py-0.5">
              ETL Pipeline v1.0
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Import market datasets, verify schema conformity, execute
            deterministic deduplication, and persist canonical OHLCV bars for
            the C++20 quantitative engine.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2">
            <Database className="size-4 text-emerald-400" />
            <div>
              <div className="font-semibold text-slate-200">MongoDB</div>
              <div className="text-[10px] text-slate-500">
                Repository Active
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2">
            <Cpu className="size-4 text-purple-400" />
            <div>
              <div className="font-semibold text-slate-200">C++20 Engine</div>
              <div className="text-[10px] text-slate-500">
                CLI & Direct Link
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300 flex items-start gap-3 shadow-lg">
          <AlertCircle className="size-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold">Pipeline Execution Failed</div>
            <div className="text-xs text-rose-200/90 font-mono">{error}</div>
          </div>
        </div>
      )}

      {/* Main Workflow Area */}
      <div className="space-y-8">
        {!result && (
          <DatasetUpload
            onProcess={handleProcess}
            isProcessing={isProcessing}
          />
        )}

        {(isProcessing || result) && (
          <PipelineProgress stages={displayStages} status={result?.status} />
        )}

        {result && (
          <>
            <ValidationSummary result={result} />
            <DatasetReadyCard
              result={result}
              onReset={handleReset}
              onNavigateToTerminal={onNavigateToTerminal}
            />
            {result.preview && result.preview.length > 0 && (
              <DatasetPreview
                rows={result.preview}
                totalRows={result.processedRows}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
