import React, { useState } from "react";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { FileDropZone } from "./FileDropZone";
import type { UploadDatasetRequest } from "../data-lab.types";

interface DatasetUploadProps {
  onProcess: (request: UploadDatasetRequest) => Promise<void>;
  isProcessing: boolean;
}

export function DatasetUpload({ onProcess, isProcessing }: DatasetUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [timeframe, setTimeframe] = useState("1d");
  const [source, setSource] = useState("user-upload");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    await onProcess({
      file,
      name: name.trim() || undefined,
      symbol: symbol.trim() || undefined,
      timeframe: timeframe.trim() || undefined,
      source: source.trim() || undefined,
      description: description.trim() || undefined,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-6"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="size-4 text-sky-400" />
            Import Market Dataset
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Upload raw OHLCV market bars for visible ETL processing and
            quantitative readiness.
          </p>
        </div>
      </div>

      <FileDropZone
        file={file}
        onFileSelect={(selected) => {
          setFile(selected);
          if (selected && !name) {
            const baseName = selected.name.replace(/\.[^/.]+$/, "");
            setName(baseName);
          }
        }}
        disabled={isProcessing}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Dataset Name <span className="text-slate-500">(Optional)</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Reliance Daily 2026"
            disabled={isProcessing}
            className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Symbol Override <span className="text-slate-500">(Optional)</span>
          </label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="e.g. RELIANCE"
            disabled={isProcessing}
            className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-slate-200 uppercase placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Timeframe
          </label>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            disabled={isProcessing}
            className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-slate-200 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all"
          >
            <option value="1m">1 Minute (1m)</option>
            <option value="5m">5 Minutes (5m)</option>
            <option value="15m">15 Minutes (15m)</option>
            <option value="1h">1 Hour (1h)</option>
            <option value="1d">1 Day (1d)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Data Source
          </label>
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="e.g. user-upload"
            disabled={isProcessing}
            className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Description <span className="text-slate-500">(Optional)</span>
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Historical NSE daily bars for quant backtesting"
            disabled={isProcessing}
            className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={!file || isProcessing}
          className={[
            "inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-indigo-500/40 cursor-pointer disabled:pointer-events-none disabled:opacity-50",
            isProcessing ? "opacity-75" : "",
          ].join(" ")}
        >
          {isProcessing ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Executing Pipeline...</span>
            </>
          ) : (
            <>
              <span>Process Dataset</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
