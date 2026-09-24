export type LogLevel = "debug" | "info" | "warn" | "error";

interface LogPayload {
  [key: string]: unknown;
}

class Logger {
  private isColorSupported(): boolean {
    return (
      typeof process !== "undefined" &&
      process.stdout &&
      process.stdout.isTTY !== false
    );
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private colorize(text: string, colorCode: string): string {
    if (!this.isColorSupported()) return text;
    return `\x1b[${colorCode}m${text}\x1b[0m`;
  }

  private formatTag(tag: string, color: string): string {
    return this.colorize(`[${tag}]`, color);
  }

  public debug(tag: string, message: string, payload?: LogPayload): void {
    if (process.env.NODE_ENV === "test" && !process.env.DEBUG) return;
    const ts = this.colorize(this.formatTimestamp(), "90");
    const tagStr = this.formatTag(tag, "36"); // Cyan
    const levelStr = this.formatTag("DEBUG", "35"); // Magenta
    console.debug(`${ts} ${levelStr} ${tagStr} ${message}`, payload ? JSON.stringify(payload) : "");
  }

  public info(tag: string, message: string, payload?: LogPayload): void {
    if (process.env.NODE_ENV === "test" && !process.env.DEBUG) return;
    const ts = this.colorize(this.formatTimestamp(), "90");
    const tagStr = this.formatTag(tag, "32"); // Green
    const levelStr = this.formatTag("INFO", "34"); // Blue
    console.info(`${ts} ${levelStr} ${tagStr} ${message}`, payload ? JSON.stringify(payload) : "");
  }

  public warn(tag: string, message: string, payload?: LogPayload): void {
    const ts = this.colorize(this.formatTimestamp(), "90");
    const tagStr = this.formatTag(tag, "33"); // Yellow
    const levelStr = this.formatTag("WARN", "33"); // Yellow
    console.warn(`${ts} ${levelStr} ${tagStr} ${message}`, payload ? JSON.stringify(payload) : "");
  }

  public error(tag: string, message: string, errorOrPayload?: unknown): void {
    const ts = this.colorize(this.formatTimestamp(), "90");
    const tagStr = this.formatTag(tag, "31"); // Red
    const levelStr = this.formatTag("ERROR", "41;97"); // White on Red
    let errDetails = "";
    if (errorOrPayload instanceof Error) {
      errDetails = `\n${errorOrPayload.stack || errorOrPayload.message}`;
    } else if (errorOrPayload) {
      errDetails = ` ${JSON.stringify(errorOrPayload)}`;
    }
    console.error(`${ts} ${levelStr} ${tagStr} ${message}${errDetails}`);
  }

  // HTTP Request Logger
  public httpRequest(method: string, path: string, query?: Record<string, unknown>, bodySummary?: string): void {
    if (process.env.NODE_ENV === "test" && !process.env.DEBUG) return;
    const ts = this.colorize(this.formatTimestamp(), "90");
    const tagStr = this.formatTag("HTTP:REQ", "35");
    const methodStr = this.colorize(method.padEnd(6), "33;1");
    const queryStr = query && Object.keys(query).length > 0 ? ` ?${new URLSearchParams(query as any).toString()}` : "";
    const bodyStr = bodySummary ? ` | body: ${bodySummary}` : "";
    console.info(`${ts} ${tagStr} ${methodStr} ${path}${queryStr}${bodyStr}`);
  }

  // HTTP Response Logger
  public httpResponse(method: string, path: string, status: number, durationMs: number, bytesSent?: number): void {
    if (process.env.NODE_ENV === "test" && !process.env.DEBUG) return;
    const ts = this.colorize(this.formatTimestamp(), "90");
    const tagStr = this.formatTag("HTTP:RES", "32");
    const statusColor = status < 400 ? "32" : status < 500 ? "33" : "31";
    const statusStr = this.colorize(String(status), `${statusColor};1`);
    const durationStr = this.colorize(`${durationMs.toFixed(1)}ms`, "36");
    const bytesStr = bytesSent !== undefined ? ` (${(bytesSent / 1024).toFixed(1)} KB)` : "";
    console.info(`${ts} ${tagStr} ${statusStr} ${method} ${path} in ${durationStr}${bytesStr}`);
  }

  // C++ Engine Logger
  public cppRequest(command: string, details: { symbol?: string; barCount?: number; path?: string }): void {
    if (process.env.NODE_ENV === "test" && !process.env.DEBUG) return;
    const ts = this.colorize(this.formatTimestamp(), "90");
    const tagStr = this.formatTag("CPP-ENGINE:REQ", "36;1");
    const info = details.symbol
      ? `symbol: ${details.symbol} (${details.barCount ?? 0} bars)`
      : details.path || "";
    console.info(`${ts} ${tagStr} ⚙️ Executing [quantpulse_cli ${command}] -> ${info}`);
  }

  public cppResponse(command: string, durationMs: number, details: { symbol?: string; bytesReceived?: number; observationCount?: number }): void {
    if (process.env.NODE_ENV === "test" && !process.env.DEBUG) return;
    const ts = this.colorize(this.formatTimestamp(), "90");
    const tagStr = this.formatTag("CPP-ENGINE:RES", "32;1");
    const durationStr = this.colorize(`${durationMs.toFixed(2)}ms`, "36");
    const obs = details.observationCount !== undefined ? ` | observations: ${details.observationCount}` : "";
    const size = details.bytesReceived !== undefined ? ` | size: ${(details.bytesReceived / 1024).toFixed(1)} KB` : "";
    console.info(`${ts} ${tagStr} ✅ Completed [${command}] in ${durationStr}${obs}${size}`);
  }

  public cppError(command: string, error: unknown, durationMs?: number): void {
    const ts = this.colorize(this.formatTimestamp(), "90");
    const tagStr = this.formatTag("CPP-ENGINE:ERR", "31;1");
    const durationStr = durationMs !== undefined ? ` after ${durationMs.toFixed(2)}ms` : "";
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`${ts} ${tagStr} ❌ Failed [${command}]${durationStr}: ${msg}`);
  }
}

export const logger = new Logger();
