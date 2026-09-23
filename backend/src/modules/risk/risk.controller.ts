import type { Request, Response } from "express";
import { RiskService } from "./risk.service.js";

export class RiskController {
  private service: RiskService;

  constructor(service = new RiskService()) {
    this.service = service;
  }

  public getSummary = (_req: Request, res: Response): void => {
    const data = this.service.getRiskSummary();
    res.json({ success: true, data });
  };
}
