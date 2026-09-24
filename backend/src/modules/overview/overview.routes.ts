import { Router } from "express";
import { OverviewController } from "./overview.controller.js";

export const createOverviewRoutes = (
  controller = new OverviewController(),
): Router => {
  const router = Router();
  router.get("/market-status", controller.getMarketStatus);
  router.get("/signals", controller.getSignals);
  router.get("/sectors", controller.getSectors);
  router.get("/telemetry", controller.getTelemetry);
  return router;
};
