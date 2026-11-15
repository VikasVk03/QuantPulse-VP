import type { Request, Response } from "express";
import { WatchlistService } from "./watchlist.service.js";

export class WatchlistController {
  private service: WatchlistService;

  constructor(service = new WatchlistService()) {
    this.service = service;
  }

  public getWatchlist = (_req: Request, res: Response): void => {
    const data = this.service.getWatchlist();
    res.json({ success: true, data });
  };

  public addToWatchlist = (req: Request, res: Response): void => {
    const { symbol, name, note } = req.body || {};
    if (!symbol) {
      res.status(400).json({ success: false, error: "Symbol is required" });
      return;
    }
    const item = this.service.addToWatchlist({ symbol, name, note });
    res.status(201).json({ success: true, data: item });
  };

  public removeFromWatchlist = (req: Request, res: Response): void => {
    const symbolParam = req.params.symbol;
    const symbol = Array.isArray(symbolParam) ? symbolParam[0] : symbolParam;
    if (!symbol) {
      res.status(400).json({ success: false, error: "Symbol is required" });
      return;
    }
    const removed = this.service.removeFromWatchlist(symbol);
    res.json({ success: true, removed });
  };

  public getAlerts = (_req: Request, res: Response): void => {
    const data = this.service.getAlerts();
    res.json({ success: true, data });
  };

  public createAlert = (req: Request, res: Response): void => {
    const alertData = req.body || {};
    if (!alertData.symbol) {
      res.status(400).json({ success: false, error: "Symbol is required" });
      return;
    }
    const alert = this.service.createAlert(alertData);
    res.status(201).json({ success: true, data: alert });
  };

  public deleteAlert = (req: Request, res: Response): void => {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    if (!id) {
      res.status(400).json({ success: false, error: "Alert id is required" });
      return;
    }
    const deleted = this.service.deleteAlert(id);
    res.json({ success: true, deleted });
  };

  public dismissAlert = (req: Request, res: Response): void => {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    if (!id) {
      res.status(400).json({ success: false, error: "Alert id is required" });
      return;
    }
    const alert = this.service.dismissAlert(id);
    res.json({ success: true, data: alert });
  };
}
