import { Router } from "express";
import { RealTimeController } from "./realtime.controller.js";

export const createRealTimeRoutes = (
  controller = new RealTimeController(),
): Router => {
  const router = Router();
  router.get("/stream", controller.stream);
  return router;
};
