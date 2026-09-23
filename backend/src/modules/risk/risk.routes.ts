import { Router } from "express";
import { RiskController } from "./risk.controller.js";

export const createRiskRoutes = (controller = new RiskController()): Router => {
  const router = Router();
  router.get("/", controller.getSummary);
  router.get("/summary", controller.getSummary);
  return router;
};
