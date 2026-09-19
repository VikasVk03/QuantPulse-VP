import type { MarketBarInput } from "../../infrastructure/database/repositories/MarketDataRepository.js";

export interface MarketBarValidationResult {
    success: boolean;
    data?: MarketBarInput[];
    errors: string[];
}

export const validateMarketBars = (
    body: unknown,
): MarketBarValidationResult => {
    if (!Array.isArray(body)) {
        return {
            success: false,
            errors: [
                "Request body must be an array of market bars",
            ],
        };
    }

    if (body.length === 0) {
        return {
            success: false,
            errors: [
                "Market bar array must not be empty",
            ],
        };
    }

    const errors: string[] = [];
    const bars: MarketBarInput[] = [];

    body.forEach((item, index) => {
        if (
            typeof item !== "object" ||
            item === null ||
            Array.isArray(item)
        ) {
            errors.push(`Bar ${index}: must be an object`);
            return;
        }

        const bar = item as Record<string, unknown>;

        const timestamp =
            typeof bar.timestamp === "string"
                ? new Date(bar.timestamp)
                : null;

        const symbol =
            typeof bar.symbol === "string"
                ? bar.symbol.trim()
                : "";

        const numericFields = [
            "open",
            "high",
            "low",
            "close",
            "volume",
        ] as const;

        if (
            timestamp === null ||
            Number.isNaN(timestamp.getTime())
        ) {
            errors.push(
                `Bar ${index}: timestamp must be a valid ISO date string`,
            );
        }

        if (!symbol) {
            errors.push(
                `Bar ${index}: symbol is required`,
            );
        }

        for (const field of numericFields) {
            if (
                typeof bar[field] !== "number" ||
                !Number.isFinite(bar[field])
            ) {
                errors.push(
                    `Bar ${index}: ${field} must be a finite number`,
                );
            }
        }

        const numericValuesValid =
            numericFields.every(
                (field) =>
                    typeof bar[field] === "number" &&
                    Number.isFinite(bar[field]),
            );

        if (
            timestamp !== null &&
            !Number.isNaN(timestamp.getTime()) &&
            symbol &&
            numericValuesValid
        ) {
            const open = bar.open as number;
            const high = bar.high as number;
            const low = bar.low as number;
            const close = bar.close as number;
            const volume = bar.volume as number;

            const barErrors: string[] = [];

            if (open <= 0) {
                barErrors.push("open must be greater than zero");
            }

            if (high <= 0) {
                barErrors.push("high must be greater than zero");
            }

            if (low <= 0) {
                barErrors.push("low must be greater than zero");
            }

            if (close <= 0) {
                barErrors.push("close must be greater than zero");
            }

            if (volume < 0) {
                barErrors.push("volume must be non-negative");
            }

            if (high < low) {
                barErrors.push(
                    "high must be greater than or equal to low",
                );
            }

            if (open < low || open > high) {
                barErrors.push(
                    "open must be between low and high",
                );
            }

            if (close < low || close > high) {
                barErrors.push(
                    "close must be between low and high",
                );
            }

            for (const error of barErrors) {
                errors.push(`Bar ${index}: ${error}`);
            }

            if (barErrors.length === 0) {
                bars.push({
                    timestamp,
                    symbol: symbol.toUpperCase(),
                    open,
                    high,
                    low,
                    close,
                    volume,
                });
            }
        }
    });

    if (errors.length > 0) {
        return {
            success: false,
            errors,
        };
    }

    return {
        success: true,
        data: bars,
        errors: [],
    };
};
