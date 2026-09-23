import { Router } from "express";
import { LiveMarketController } from "./live-market.controller.js";

export const createLiveMarketRoutes = (
  controller = new LiveMarketController(),
): Router => {
  const router = Router();
  router.get("/orderbook/:symbol", controller.getOrderBook);
  router.get("/trades/:symbol", controller.getTrades);
  return router;
};
