import type { Request, Response } from "express";
import { ScannerService } from "./scanner.service.js";

export class ScannerController {
  private service: ScannerService;

  constructor(service = new ScannerService()) {
    this.service = service;
  }

  public getOpportunities = (_req: Request, res: Response): void => {
    const data = this.service.getOpportunities();
    res.json({ success: true, data });
  };
}
