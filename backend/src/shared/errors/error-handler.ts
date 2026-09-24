import type {
    ErrorRequestHandler,
} from "express";

import { AppError } from "./AppError.js";
import { logger } from "../logger/logger.js";

export const errorHandler: ErrorRequestHandler = (
    error,
    req,
    res,
    _next,
): void => {
    if (error instanceof AppError) {
        logger.warn("HTTP:ERROR", `[${error.statusCode}] ${req.method} ${req.path} - ${error.message}`);
        res.status(error.statusCode).json({
            success: false,
            error: error.message,
        });

        return;
    }

    logger.error("HTTP:UNHANDLED", `[500] ${req.method} ${req.path} - ${error instanceof Error ? error.message : String(error)}`, error);

    res.status(500).json({
        success: false,
        error: "Internal server error",
    });
};
