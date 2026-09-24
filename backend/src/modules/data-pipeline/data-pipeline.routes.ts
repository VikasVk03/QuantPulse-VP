import { Router } from "express";

import { MongoDatasetRepository } from "../../infrastructure/database/repositories/MongoDatasetRepository.js";
import { MongoMarketDataRepository } from "../../infrastructure/database/repositories/MongoMarketDataRepository.js";
import { DataPipelineService } from "./data-pipeline.service.js";
import { DataPipelineController } from "./data-pipeline.controller.js";

export const createDataPipelineRoutes = (): Router => {
  const router = Router();

  const datasetRepository = new MongoDatasetRepository();
  const marketDataRepository = new MongoMarketDataRepository();
  const service = new DataPipelineService(
    datasetRepository,
    marketDataRepository,
  );
  const controller = new DataPipelineController(service);

  router.post("/upload", controller.upload);
  router.get("/:pipelineId", controller.getStatus);
  router.get("/:pipelineId/result", controller.getResult);

  return router;
};
