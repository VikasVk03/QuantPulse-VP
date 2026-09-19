import { describe, expect, it } from "vitest";

import {
    validateCreateDatasetInput,
} from "../../../src/shared/validation/dataset.validation.js";

describe("validateCreateDatasetInput", () => {
    it("accepts a valid dataset payload", () => {
        const result = validateCreateDatasetInput({
            name: "Reliance Market Bars",
            symbol: "RELIANCE",
            timeframe: "1d",
            source: "NSE",
            description: "Development market-bar dataset",
        });

        expect(result.success).toBe(true);

        expect(result.data).toEqual({
            name: "Reliance Market Bars",
            symbol: "RELIANCE",
            timeframe: "1d",
            source: "NSE",
            description: "Development market-bar dataset",
        });

        expect(result.errors).toEqual([]);
    });

    it("rejects a non-object body", () => {
        const result = validateCreateDatasetInput(
            "invalid",
        );

        expect(result.success).toBe(false);

        expect(result.errors).toContain(
            "Request body must be a JSON object",
        );
    });

    it("rejects missing required fields", () => {
        const result = validateCreateDatasetInput({});

        expect(result.success).toBe(false);

        expect(result.errors).toEqual([
            "Dataset name is required",
            "Dataset symbol is required",
            "Dataset timeframe is required",
            "Dataset source is required",
        ]);
    });

    it("rejects invalid field types", () => {
        const result = validateCreateDatasetInput({
            name: 123,
            symbol: null,
            timeframe: true,
            source: [],
            description: 456,
        });

        expect(result.success).toBe(false);

        expect(result.errors).toEqual([
            "Dataset name is required",
            "Dataset symbol is required",
            "Dataset timeframe is required",
            "Dataset source is required",
            "Dataset description must be a string",
        ]);
    });

    it("accepts an omitted description", () => {
        const result = validateCreateDatasetInput({
            name: "Reliance Market Bars",
            symbol: "RELIANCE",
            timeframe: "1d",
            source: "NSE",
        });

        expect(result.success).toBe(true);

        expect(result.data).toEqual({
            name: "Reliance Market Bars",
            symbol: "RELIANCE",
            timeframe: "1d",
            source: "NSE",
        });
    });

    it("trims string values", () => {
        const result = validateCreateDatasetInput({
            name: "  Reliance Market Bars  ",
            symbol: "  RELIANCE  ",
            timeframe: " 1d ",
            source: " NSE ",
            description: " Development dataset ",
        });

        expect(result.success).toBe(true);

        expect(result.data).toEqual({
            name: "Reliance Market Bars",
            symbol: "RELIANCE",
            timeframe: "1d",
            source: "NSE",
            description: "Development dataset",
        });
    });
});
