import React from "react";
import { Database, Table } from "lucide-react";
import type { DatasetPreviewRow } from "../data-lab.types";

interface DatasetPreviewProps {
  rows?: DatasetPreviewRow[];
  totalRows: number;
}

export function DatasetPreview({ rows = [], totalRows }: DatasetPreviewProps) {
  if (rows.length === 0) return null;

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Table className="size-4 text-sky-400" />
          <h3 className="text-sm font-bold text-slate-100">
            Canonical Dataset Preview
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Showing <strong className="text-slate-200">{rows.length}</strong> of{" "}
          <strong className="text-slate-200">
            {totalRows.toLocaleString()}
          </strong>{" "}
          bars
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800/80">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 font-mono text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Timestamp (UTC)</th>
              <th className="px-4 py-3">Symbol</th>
              <th className="px-4 py-3 text-right">Open</th>
              <th className="px-4 py-3 text-right">High</th>
              <th className="px-4 py-3 text-right">Low</th>
              <th className="px-4 py-3 text-right">Close</th>
              <th className="px-4 py-3 text-right">Volume</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-[12px]">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-2.5 text-slate-300 whitespace-nowrap">
                  {formatDate(row.timestamp)}
                </td>
                <td className="px-4 py-2.5 font-semibold text-sky-300">
                  {row.symbol}
                </td>
                <td className="px-4 py-2.5 text-right text-slate-200">
                  {Number(row.open).toFixed(2)}
                </td>
                <td className="px-4 py-2.5 text-right text-emerald-400">
                  {Number(row.high).toFixed(2)}
                </td>
                <td className="px-4 py-2.5 text-right text-rose-400">
                  {Number(row.low).toFixed(2)}
                </td>
                <td className="px-4 py-2.5 text-right font-bold text-slate-100">
                  {Number(row.close).toFixed(2)}
                </td>
                <td className="px-4 py-2.5 text-right text-slate-400">
                  {Number(row.volume).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
