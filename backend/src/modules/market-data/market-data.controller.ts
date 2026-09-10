import type { Request, Response } from "express";

import type {
    MarketBarQuery,
} from "../../infrastructure/database/repositories/MarketDataRepository.js";

import {
    validateMarketBars,
} from "../../shared/validation/market-data.validation.js";

import { MarketDataService } from "./market-data.service.js";

const getRouteParam = (
    value: string | string[] | undefined,
): string | null => {
    if (
        typeof value !== "string" ||
        value.length === 0
    ) {
        return null;
    }

    return value;
};

export class MarketDataController {
    constructor(
        private readonly service: MarketDataService,
    ) { }

    getBars = async (
        req: Request,
        res: Response,
    ): Promise<void> => {
        const datasetId = getRouteParam(
            req.params.datasetId,
        );

        if (!datasetId) {
            res.status(400).json({
                success: false,
                error: "Dataset ID is required",
            });

            return;
        }

        const symbol = req.query.symbol;

        const startTime = this.parseDate(
            req.query.startTime,
        );

        const endTime = this.parseDate(
            req.query.endTime,
        );

        if (
            req.query.startTime !== undefined &&
            !startTime
        ) {
            res.status(400).json({
                success: false,
                error: "Invalid startTime",
            });

            return;
        }

        if (
            req.query.endTime !== undefined &&
            !endTime
        ) {
            res.status(400).json({
                success: false,
                error: "Invalid endTime",
            });

            return;
        }

        const limit = this.parseLimit(
            req.query.limit,
        );

        if (
            req.query.limit !== undefined &&
            limit === null
        ) {
            res.status(400).json({
                success: false,
                error: "Invalid limit",
            });

            return;
        }

        const query: MarketBarQuery = {
            datasetId,
            ...(typeof symbol === "string"
                ? { symbol }
                : {}),
            ...(startTime !== undefined
                ? { startTime }
                : {}),
            ...(endTime !== undefined
                ? { endTime }
                : {}),
            ...(limit !== null
                ? { limit }
                : {}),
        };

        const bars =
            await this.service.getBars(query);

        res.status(200).json({
            success: true,
            data: bars,
        });
    };

    insertBars = async (
        req: Request,
        res: Response,
    ): Promise<void> => {
        const datasetId = getRouteParam(
            req.params.datasetId,
        );

        if (!datasetId) {
            res.status(400).json({
                success: false,
                error: "Dataset ID is required",
            });

            return;
        }

        const validation =
            validateMarketBars(req.body);

        if (
            !validation.success ||
            !validation.data
        ) {
            res.status(400).json({
                success: false,
                error: "Invalid market bar payload",
                details: validation.errors,
            });

            return;
        }

        try {
            const inserted =
                await this.service.insertBars(
                    datasetId,
                    validation.data,
                );

            res.status(201).json({
                success: true,
                data: {
                    inserted,
                },
            });
        } catch (error) {
            if (
                error instanceof Error &&
                error.message === "Dataset not found"
            ) {
                res.status(404).json({
                    success: false,
                    error: "Dataset not found",
                });

                return;
            }

            throw error;
        }
    };

    private parseDate(
        value: unknown,
    ): Date | undefined {
        if (value === undefined) {
            return undefined;
        }

        if (typeof value !== "string") {
            return undefined;
        }

        const date = new Date(value);

        return Number.isNaN(date.getTime())
            ? undefined
            : date;
    }

    private parseLimit(
        value: unknown,
    ): number | null {
        if (value === undefined) {
            return null;
        }

        if (typeof value !== "string") {
            return null;
        }

        const limit = Number(value);

        if (
            !Number.isInteger(limit) ||
            limit <= 0 ||
            limit > 10_000
        ) {
            return null;
        }

        return limit;
    }
}
