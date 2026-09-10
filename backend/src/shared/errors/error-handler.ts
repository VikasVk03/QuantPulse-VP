import type {
    ErrorRequestHandler,
} from "express";

import { AppError } from "./AppError.js";

export const errorHandler: ErrorRequestHandler = (
    error,
    _req,
    res,
    _next,
): void => {
    if (error instanceof AppError) {
        res.status(error.statusCode).json({
            success: false,
            error: error.message,
        });

        return;
    }

    console.error("Unhandled application error:", error);

    res.status(500).json({
        success: false,
        error: "Internal server error",
    });
};
