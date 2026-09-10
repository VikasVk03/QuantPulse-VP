import { Router } from "express";

import { MongoDatasetRepository } from "../../infrastructure/database/repositories/MongoDatasetRepository.js";

import { DatasetController } from "./dataset.controller.js";
import { DatasetService } from "./dataset.service.js";

export const createDatasetRoutes = (): Router => {
    const router = Router();

    const repository = new MongoDatasetRepository();
    const service = new DatasetService(repository);
    const controller = new DatasetController(service);

    router.get("/", controller.getAll);

    router.get("/:id", controller.getById);

    router.post("/", controller.create);

    router.delete("/:id", controller.delete);

    return router;
};
