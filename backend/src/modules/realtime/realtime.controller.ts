import type { Request, Response } from "express";
import { RealTimeStreamService } from "./realtime.service.js";

export class RealTimeController {
  private service: RealTimeStreamService;

  constructor(
    service: RealTimeStreamService = RealTimeStreamService.getInstance(),
  ) {
    this.service = service;
  }

  public stream = (req: Request, res: Response): void => {
    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    res.flushHeaders?.();

    const symbol = req.query.symbol as string | undefined;
    this.service.addClient(res, symbol);
  };
}
