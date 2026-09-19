import { Router } from "express";

import { MongoMarketDataRepository } from "../../infrastructure/database/repositories/MongoMarketDataRepository.js";

import { MarketDataController } from "./market-data.controller.js";
import { MarketDataService } from "./market-data.service.js";
import { MongoDatasetRepository } from "../../infrastructure/database/repositories/MongoDatasetRepository.js";

export const createMarketDataRoutes = (): Router => {
    const router = Router();

    const repository =
        new MongoMarketDataRepository();

    const datasetRepository =
        new MongoDatasetRepository();

    const service =
        new MarketDataService(
            repository,
            datasetRepository,
        );

    const controller =
        new MarketDataController(service);

    router.get(
        "/datasets/:datasetId/bars",
        controller.getBars,
    );

    router.post(
        "/datasets/:datasetId/bars",
        controller.insertBars,
    );

    return router;
};
