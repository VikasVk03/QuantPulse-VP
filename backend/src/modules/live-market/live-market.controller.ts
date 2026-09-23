import type { Request, Response } from "express";
import { LiveMarketService } from "./live-market.service.js";

export class LiveMarketController {
  private service: LiveMarketService;

  constructor(service = new LiveMarketService()) {
    this.service = service;
  }

  public getOrderBook = async (req: Request, res: Response): Promise<void> => {
    try {
      const symbol = String(req.params.symbol || "RELIANCE").toUpperCase();
      const snapshot = await this.service.getOrderBook(symbol);
      res.json({ success: true, data: snapshot });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err?.message || "Failed to fetch order book",
      });
    }
  };

  public getTrades = async (req: Request, res: Response): Promise<void> => {
    try {
      const symbol = String(req.params.symbol || "RELIANCE").toUpperCase();
      const limit = Number(req.query.limit) || 25;
      const trades = await this.service.getRecentTrades(symbol, limit);
      res.json({ success: true, data: trades });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err?.message || "Failed to fetch trades",
      });
    }
  };
}
