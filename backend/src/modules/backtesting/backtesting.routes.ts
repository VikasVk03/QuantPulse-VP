import { Router } from "express";
import { BacktestingController } from "./backtesting.controller.js";

export const createBacktestingRoutes = (
  controller = new BacktestingController(),
): Router => {
  const router = Router();
  router.post("/run", controller.runBacktest);
  router.get("/strategies", controller.getStrategies);
  return router;
};
