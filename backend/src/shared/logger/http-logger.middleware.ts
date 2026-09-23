import type { Request, Response, NextFunction } from "express";
import { logger } from "./logger.js";

export function httpLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  // Summarize body briefly without sensitive tokens
  let bodySummary: string | undefined;
  if (req.body && typeof req.body === "object") {
    const keys = Object.keys(req.body);
    if (keys.length > 0) {
      const sanitized: Record<string, unknown> = {};
      for (const k of keys) {
        if (k.toLowerCase().includes("secret") || k.toLowerCase().includes("token") || k.toLowerCase().includes("key")) {
          sanitized[k] = "••••••••";
        } else if (Array.isArray(req.body[k])) {
          sanitized[k] = `[${req.body[k].length} items]`;
        } else if (typeof req.body[k] === "string" && req.body[k].length > 40) {
          sanitized[k] = `${req.body[k].slice(0, 40)}...`;
        } else {
          sanitized[k] = req.body[k];
        }
      }
      bodySummary = JSON.stringify(sanitized);
    }
  }

  logger.httpRequest(
    req.method,
    req.path || req.originalUrl,
    req.query as Record<string, unknown>,
    bodySummary,
  );

  let bytesWritten = 0;
  const originalWrite = res.write;
  const originalEnd = res.end;

  res.write = function (chunk: any, ...args: any[]): boolean {
    if (chunk) {
      bytesWritten += Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(String(chunk));
    }
    return (originalWrite as any).apply(res, [chunk, ...args]);
  };

  res.end = function (chunk: any, ...args: any[]): Response {
    if (chunk) {
      bytesWritten += Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(String(chunk));
    }
    const duration = Date.now() - startTime;
    logger.httpResponse(
      req.method,
      req.path || req.originalUrl,
      res.statusCode,
      duration,
      bytesWritten,
    );
    return (originalEnd as any).apply(res, [chunk, ...args]);
  };

  next();
}
