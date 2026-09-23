import React, { useState, useMemo } from "react";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Database,
  Filter,
  Search,
  Table,
} from "lucide-react";
import type { DatasetPreviewRow } from "../data-lab.types";

interface DatasetPreviewProps {
  rows?: DatasetPreviewRow[];
  totalRows: number;
}

type SortField =
  | "timestamp"
  | "symbol"
  | "open"
  | "high"
  | "low"
  | "close"
  | "volume";
type SortDirection = "asc" | "desc";

export function DatasetPreview({ rows = [], totalRows }: DatasetPreviewProps) {
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

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

  // Filter rows by search term
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    const term = searchTerm.toLowerCase().trim();

    return rows.filter((r) => {
      const symbolMatch = r.symbol?.toLowerCase().includes(term);
      const dateMatch = String(r.timestamp).toLowerCase().includes(term);
      const priceMatch =
        String(r.close).includes(term) ||
        String(r.open).includes(term) ||
        String(r.high).includes(term) ||
        String(r.low).includes(term);

      return symbolMatch || dateMatch || priceMatch;
    });
  }, [rows, searchTerm]);

  // Sort rows
  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      let valA: string | number = a[sortField] ?? "";
      let valB: string | number = b[sortField] ?? "";

      if (sortField === "timestamp") {
        const timeA = new Date(valA).getTime();
        const timeB = new Date(valB).getTime();
        return sortDirection === "asc" ? timeA - timeB : timeB - timeA;
      }

      if (typeof valA === "number" || typeof valB === "number") {
        const numA = Number(valA) || 0;
        const numB = Number(valB) || 0;
        return sortDirection === "asc" ? numA - numB : numB - numA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return sortDirection === "asc"
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA);
    });
  }, [filteredRows, sortField, sortDirection]);

  // Compute pagination
  const effectivePageSize = pageSize === -1 ? sortedRows.length : pageSize;
  const totalPages = Math.max(
    1,
    Math.ceil(sortedRows.length / (effectivePageSize || 1)),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedRows = useMemo(() => {
    if (pageSize === -1) return sortedRows;
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return sortedRows.slice(startIndex, startIndex + pageSize);
  }, [sortedRows, safeCurrentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(e.target.value);
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const startRow =
    sortedRows.length === 0
      ? 0
      : (safeCurrentPage - 1) *
          (pageSize === -1 ? sortedRows.length : pageSize) +
        1;
  const endRow =
    pageSize === -1
      ? sortedRows.length
      : Math.min(safeCurrentPage * pageSize, sortedRows.length);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-5">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Table className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Canonical Dataset Records
              <span className="rounded-full bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 text-[10px] font-mono text-sky-300">
                {sortedRows.length.toLocaleString()} of{" "}
                {totalRows.toLocaleString()} rows
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Cleaned, validated, and deduplicated OHLCV market bars.
            </p>
          </div>
        </div>

        {/* Search & Page Size Select */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search date or price..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="h-8.5 w-44 sm:w-56 rounded-lg border border-slate-700/80 bg-slate-950/80 pl-8.5 pr-3 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-sky-500/80 focus:ring-1 focus:ring-sky-500/50 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="h-8.5 rounded-lg border border-slate-700/80 bg-slate-950/80 px-2.5 text-xs font-mono font-medium text-slate-200 outline-none focus:border-sky-500/80 cursor-pointer"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="250">250</option>
              <option value="-1">All ({rows.length})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/40">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/90 font-mono text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 select-none">
            <tr>
              <th
                onClick={() => handleSort("timestamp")}
                className="px-4 py-3 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Timestamp (UTC)</span>
                  <ArrowUpDown className="size-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort("symbol")}
                className="px-4 py-3 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Symbol</span>
                  <ArrowUpDown className="size-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort("open")}
                className="px-4 py-3 text-right cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Open</span>
                  <ArrowUpDown className="size-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort("high")}
                className="px-4 py-3 text-right cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>High</span>
                  <ArrowUpDown className="size-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort("low")}
                className="px-4 py-3 text-right cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Low</span>
                  <ArrowUpDown className="size-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort("close")}
                className="px-4 py-3 text-right cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Close</span>
                  <ArrowUpDown className="size-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort("volume")}
                className="px-4 py-3 text-right cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Volume</span>
                  <ArrowUpDown className="size-3 text-slate-500" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-[12px]">
            {paginatedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No records matching your search query.
                </td>
              </tr>
            ) : (
              paginatedRows.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-800/30 transition-colors"
                >
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 text-xs text-slate-400 font-mono">
        <div>
          Showing rows <strong className="text-slate-200">{startRow}</strong> to{" "}
          <strong className="text-slate-200">{endRow}</strong> of{" "}
          <strong className="text-slate-200">
            {sortedRows.length.toLocaleString()}
          </strong>{" "}
          records
        </div>

        {pageSize !== -1 && totalPages > 1 && (
          <div className="flex items-center gap-1.5 select-none">
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              disabled={safeCurrentPage === 1}
              className="flex size-7.5 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/80 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
              title="First Page"
            >
              <ChevronsLeft className="size-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              className="flex size-7.5 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/80 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="size-3.5" />
            </button>

            <div className="px-3 py-1 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-800 rounded-lg">
              Page {safeCurrentPage} of {totalPages}
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages}
              className="flex size-7.5 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/80 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="size-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage(totalPages)}
              disabled={safeCurrentPage === totalPages}
              className="flex size-7.5 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/80 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
              title="Last Page"
            >
              <ChevronsRight className="size-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
