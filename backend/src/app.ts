import express from "express";
import cors from "cors";

import { createDatasetRoutes } from "./modules/market-data/dataset.routes.js";
import marketRoutes from "./modules/market-data/market.routes.js";
import { createMarketDataRoutes } from "./modules/market-data/market-data.routes.js";
import { createAnalyticsRoutes } from "./modules/analytics/analytics.routes.js";
import { createDataPipelineRoutes } from "./modules/data-pipeline/data-pipeline.routes.js";

import { errorHandler } from "./shared/errors/error-handler.js";

const createApp = () => {
  const app = express();

  app.use(cors());

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  app.get("/", (_req, res) => {
    res.json({
      status: "OK",
      service: "QuantPulse Backend",
    });
  });

  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: "quantpulse-backend",
    });
  });

  app.use("/api/market", marketRoutes);

  app.use("/api/datasets", createDatasetRoutes());

  app.use("/api/market-data", createMarketDataRoutes());

  app.use("/api/analytics", createAnalyticsRoutes());

  app.use("/api/data-pipeline", createDataPipelineRoutes());

  app.use(errorHandler);

  return app;
};

export default createApp;
