/**
 * QuantPulse Frontend Unified Logger & HTTP Interceptor
 * Formats API requests, responses, errors, and real-time SSE stream events clearly in DevTools.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogColors {
  tag: string;
  level: string;
  badge: string;
}

const STYLES = {
  timestamp: "color: #94a3b8; font-size: 10px; font-family: monospace;",
  reqBadge:
    "background: #0284c7; color: #ffffff; font-weight: bold; padding: 2px 5px; border-radius: 3px; font-size: 10px;",
  resSuccessBadge:
    "background: #059669; color: #ffffff; font-weight: bold; padding: 2px 5px; border-radius: 3px; font-size: 10px;",
  resWarnBadge:
    "background: #d97706; color: #ffffff; font-weight: bold; padding: 2px 5px; border-radius: 3px; font-size: 10px;",
  resErrorBadge:
    "background: #dc2626; color: #ffffff; font-weight: bold; padding: 2px 5px; border-radius: 3px; font-size: 10px;",
  sseBadge:
    "background: #7c3aed; color: #ffffff; font-weight: bold; padding: 2px 5px; border-radius: 3px; font-size: 10px;",
  url: "color: #38bdf8; font-family: monospace; font-weight: 600;",
  duration: "color: #a78bfa; font-family: monospace; font-size: 11px;",
  dataText: "color: #cbd5e1; font-size: 11px;",
};

function formatTime(): string {
  const now = new Date();
  return (
    now.toTimeString().split(" ")[0] +
    "." +
    String(now.getMilliseconds()).padStart(3, "0")
  );
}

class ClientLogger {
  // Silent in browser console as requested; all telemetry logs print in terminal server
  public req(_method: string, _url: string, _payload?: unknown): void {}
  public res(
    _method: string,
    _url: string,
    _status: number,
    _durationMs: number,
    _data?: unknown,
  ): void {}
  public err(
    _method: string,
    _url: string,
    _error: unknown,
    _durationMs?: number,
  ): void {}
  public sse(_event: string, _data: unknown): void {}
  public info(_tag: string, _message: string, _data?: unknown): void {}
  public warn(_tag: string, _message: string, _data?: unknown): void {}
  public error(_tag: string, _message: string, _error?: unknown): void {}
}

export const logger = new ClientLogger();

/**
 * Instrumented fetch wrapper that transparently logs requests, responses, and errors.
 */
export async function loggedFetch(
  input: string,
  init?: RequestInit,
): Promise<Response> {
  const method = (init?.method || "GET").toUpperCase();
  const startTime = performance.now();

  let parsedPayload: unknown;
  if (init?.body && typeof init.body === "string") {
    try {
      parsedPayload = JSON.parse(init.body);
    } catch {
      parsedPayload = init.body;
    }
  }

  logger.req(method, input, parsedPayload);

  try {
    const response = await fetch(input, init);
    const duration = performance.now() - startTime;

    // Clone response so we can inspect JSON without consuming body stream for caller
    const cloned = response.clone();
    cloned
      .json()
      .then((data) => {
        logger.res(method, input, response.status, duration, data);
      })
      .catch(() => {
        logger.res(method, input, response.status, duration);
      });

    return response;
  } catch (error) {
    const duration = performance.now() - startTime;
    logger.err(method, input, error, duration);
    throw error;
  }
}
