import type { Request, Response } from "express";
import {
  BacktestingService,
  type BacktestParams,
} from "./backtesting.service.js";

export class BacktestingController {
  private service: BacktestingService;

  constructor(service = new BacktestingService()) {
    this.service = service;
  }

  public runBacktest = (req: Request, res: Response): void => {
    try {
      const params: BacktestParams = req.body || {};
      const result = this.service.runBacktest(params);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res
        .status(400)
        .json({ success: false, error: err?.message || "Backtest failed" });
    }
  };

  public getStrategies = (_req: Request, res: Response): void => {
    const data = this.service.getStrategies();
    res.json({ success: true, data });
  };
}
