import { Router } from "express";

import { analyzeMarket } from "./market.controller.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    module: "market-data",
    status: "ok",
    endpoints: {
      analyze: "/api/market/analyze",
    },
  });
});

router.get("/analyze", analyzeMarket);

export default router;
