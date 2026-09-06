import type { Request, Response } from "express";

import { analyzeMarketData } from "./market.service.js";

export async function analyzeMarket(req: Request, res: Response) {
  try {
    const filePath = typeof req.query.file === "string" ? req.query.file : "";

    if (!filePath) {
      res.status(400).json({
        success: false,
        error: "Query parameter 'file' is required.",
      });

      return;
    }

    const result = await analyzeMarketData(filePath);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Market analysis failed:", error);

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Market analysis failed.",
    });
  }
}
