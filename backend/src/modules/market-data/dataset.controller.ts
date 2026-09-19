import type { Request, Response } from "express";

import { DatasetService } from "./dataset.service.js";
import {
    validateCreateDatasetInput,
} from "../../shared/validation/dataset.validation.js";

const getRouteParam = (
    value: string | string[] | undefined,
): string | null => {
    if (typeof value !== "string" || value.length === 0) {
        return null;
    }

    return value;
};

export class DatasetController {
    constructor(
        private readonly service: DatasetService,
    ) { }

    getAll = async (
        _req: Request,
        res: Response,
    ): Promise<void> => {
        const datasets = await this.service.getAll();

        res.status(200).json({
            success: true,
            data: datasets,
        });
    };

    getById = async (
        req: Request,
        res: Response,
    ): Promise<void> => {
        const id = getRouteParam(req.params.id);

        if (!id) {
            res.status(400).json({
                success: false,
                error: "Dataset ID is required",
            });

            return;
        }

        const dataset = await this.service.getById(id);

        if (!dataset) {
            res.status(404).json({
                success: false,
                error: "Dataset not found",
            });

            return;
        }

        res.status(200).json({
            success: true,
            data: dataset,
        });
    };

    create = async (
        req: Request,
        res: Response,
    ): Promise<void> => {
        const validation = validateCreateDatasetInput(req.body);

        if (!validation.success || !validation.data) {
            res.status(400).json({
                success: false,
                error: "Invalid dataset payload",
                details: validation.errors,
            });

            return;
        }

        const dataset = await this.service.create(
            validation.data,
        );

        res.status(201).json({
            success: true,
            data: dataset,
        });
    };

    delete = async (
        req: Request,
        res: Response,
    ): Promise<void> => {
        const id = getRouteParam(req.params.id);

        if (!id) {
            res.status(400).json({
                success: false,
                error: "Dataset ID is required",
            });

            return;
        }

        const deleted = await this.service.deleteById(id);

        if (!deleted) {
            res.status(404).json({
                success: false,
                error: "Dataset not found",
            });

            return;
        }

        res.status(204).send();
    };
}
