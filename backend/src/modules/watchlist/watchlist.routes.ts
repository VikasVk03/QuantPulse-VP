import { Router } from "express";
import { WatchlistController } from "./watchlist.controller.js";

export const createWatchlistRoutes = (
  controller = new WatchlistController(),
): Router => {
  const router = Router();

  router.get("/", controller.getWatchlist);
  router.post("/", controller.addToWatchlist);
  router.delete("/:symbol", controller.removeFromWatchlist);

  return router;
};

export const createAlertsRoutes = (
  controller = new WatchlistController(),
): Router => {
  const router = Router();

  router.get("/", controller.getAlerts);
  router.post("/", controller.createAlert);
  router.post("/:id/dismiss", controller.dismissAlert);
  router.delete("/:id", controller.deleteAlert);

  return router;
};
