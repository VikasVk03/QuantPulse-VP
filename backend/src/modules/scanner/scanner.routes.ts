import { Router } from "express";
import { ScannerController } from "./scanner.controller.js";

export const createScannerRoutes = (
  controller = new ScannerController(),
): Router => {
  const router = Router();
  router.get("/opportunities", controller.getOpportunities);
  return router;
};
