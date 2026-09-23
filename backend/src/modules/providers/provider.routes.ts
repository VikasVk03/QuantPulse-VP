import { Router } from "express";
import { ProviderController } from "./provider.controller.js";

export const createProviderRoutes = (
  controller = new ProviderController(),
): Router => {
  const router = Router();

  router.get("/", controller.getProviders);
  router.post("/configure", controller.configureProvider);
  router.post("/config", controller.configureProvider);
  router.post("/test", controller.testProvider);
  router.post("/switch", controller.switchProvider);

  return router;
};
