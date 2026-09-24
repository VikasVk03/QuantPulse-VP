import type { Request, Response } from "express";
import { OverviewService } from "./overview.service.js";

export class OverviewController {
  private service: OverviewService;

  constructor(service = new OverviewService()) {
    this.service = service;
  }

  public getMarketStatus = (_req: Request, res: Response): void => {
    const data = this.service.getMarketStatus();
    res.json({ success: true, data });
  };

  public getSignals = (_req: Request, res: Response): void => {
    const data = this.service.getSignals();
    res.json({ success: true, data });
  };

  public getSectors = (_req: Request, res: Response): void => {
    const data = this.service.getSectors();
    res.json({ success: true, data });
  };

  public getTelemetry = (_req: Request, res: Response): void => {
    const data = this.service.getEngineTelemetry();
    res.json({ success: true, data });
  };
}
