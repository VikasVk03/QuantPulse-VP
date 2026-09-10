import type { CreateDatasetInput } from "../../infrastructure/database/repositories/DatasetRepository.js";

export interface DatasetValidationResult {
    success: boolean;
    data?: CreateDatasetInput;
    errors: string[];
}

export const validateCreateDatasetInput = (
    body: unknown,
): DatasetValidationResult => {
    if (
        typeof body !== "object" ||
        body === null ||
        Array.isArray(body)
    ) {
        return {
            success: false,
            errors: ["Request body must be a JSON object"],
        };
    }

    const input = body as Record<string, unknown>;

    const errors: string[] = [];

    if (
        typeof input.name !== "string" ||
        input.name.trim().length === 0
    ) {
        errors.push("Dataset name is required");
    }

    if (
        typeof input.symbol !== "string" ||
        input.symbol.trim().length === 0
    ) {
        errors.push("Dataset symbol is required");
    }

    if (
        typeof input.timeframe !== "string" ||
        input.timeframe.trim().length === 0
    ) {
        errors.push("Dataset timeframe is required");
    }

    if (
        typeof input.source !== "string" ||
        input.source.trim().length === 0
    ) {
        errors.push("Dataset source is required");
    }

    if (
        input.description !== undefined &&
        typeof input.description !== "string"
    ) {
        errors.push("Dataset description must be a string");
    }

    if (errors.length > 0) {
        return {
            success: false,
            errors,
        };
    }

    return {
        success: true,
        data: {
            name: (input.name as string).trim(),
            symbol: (input.symbol as string).trim(),
            timeframe: (input.timeframe as string).trim(),
            source: (input.source as string).trim(),
            ...(input.description !== undefined
                ? {
                    description: (input.description as string).trim(),
                }
                : {}),
        },
        errors: [],
    };
};
