import React, { useRef, useState } from "react";
import { FileCode, FileSpreadsheet, UploadCloud, X } from "lucide-react";

interface FileDropZoneProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
}

export function FileDropZone({
  file,
  onFileSelect,
  disabled = false,
}: FileDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selected = e.dataTransfer.files[0]!;
      validateAndSelect(selected);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0]!;
      validateAndSelect(selected);
    }
  };

  const validateAndSelect = (selected: File) => {
    const name = selected.name.toLowerCase();
    if (name.endsWith(".csv") || name.endsWith(".json")) {
      onFileSelect(selected);
    } else {
      alert("Only CSV (.csv) and JSON (.json) files are supported.");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.json"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />

      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          className={[
            "group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all cursor-pointer",
            isDragOver
              ? "border-sky-500 bg-sky-500/10 scale-[1.01]"
              : "border-slate-700 bg-slate-900/40 hover:border-slate-500 hover:bg-slate-900/60",
            disabled ? "opacity-50 cursor-not-allowed" : "",
          ].join(" ")}
        >
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-sky-500/10 text-sky-400 group-hover:scale-110 group-hover:bg-sky-500/20 transition-all">
            <UploadCloud className="size-7" />
          </div>

          <div className="text-sm font-semibold text-slate-200">
            Click to upload or drag & drop market data
          </div>

          <div className="mt-1 text-xs text-slate-400">
            Supported formats:{" "}
            <span className="font-mono text-sky-300">.CSV</span>,{" "}
            <span className="font-mono text-indigo-300">.JSON</span>
          </div>

          <div className="mt-3 inline-flex items-center gap-2 rounded-md bg-slate-800/80 px-2.5 py-1 text-[11px] text-slate-300">
            Canonical OHLCV schema: timestamp, symbol, open, high, low, close,
            volume
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-xl border border-slate-700/80 bg-slate-900/80 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
              {file.name.toLowerCase().endsWith(".json") ? (
                <FileCode className="size-5" />
              ) : (
                <FileSpreadsheet className="size-5" />
              )}
            </div>

            <div>
              <div className="text-sm font-semibold text-slate-200">
                {file.name}
              </div>
              <div className="text-xs text-slate-400">
                {formatFileSize(file.size)} •{" "}
                {file.name.split(".").pop()?.toUpperCase()}
              </div>
            </div>
          </div>

          {!disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFileSelect(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-colors"
              title="Remove file"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
