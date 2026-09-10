import { describe, expect, it } from "vitest";

import {
    validateMarketBars,
} from "../../../src/shared/validation/market-data.validation.js";

describe("validateMarketBars", () => {
    const validBar = {
        timestamp: "2026-09-10T00:00:00.000Z",
        symbol: "RELIANCE",
        open: 1450,
        high: 1475,
        low: 1440,
        close: 1465,
        volume: 125000,
    };

    it("accepts a valid market bar", () => {
        const result = validateMarketBars([
            validBar,
        ]);

        expect(result.success).toBe(true);
        expect(result.errors).toEqual([]);

        expect(result.data).toEqual([
            {
                timestamp: new Date(
                    "2026-09-10T00:00:00.000Z",
                ),
                symbol: "RELIANCE",
                open: 1450,
                high: 1475,
                low: 1440,
                close: 1465,
                volume: 125000,
            },
        ]);
    });

    it("rejects a non-array body", () => {
        const result = validateMarketBars({});

        expect(result.success).toBe(false);

        expect(result.errors).toContain(
            "Request body must be an array of market bars",
        );
    });

    it("rejects an empty array", () => {
        const result = validateMarketBars([]);

        expect(result.success).toBe(false);

        expect(result.errors).toContain(
            "Market bar array must not be empty",
        );
    });

    it("rejects invalid numeric fields", () => {
        const result = validateMarketBars([
            {
                ...validBar,
                open: "1450",
                volume: NaN,
            },
        ]);

        expect(result.success).toBe(false);

        expect(result.errors).toContain(
            "Bar 0: open must be a finite number",
        );

        expect(result.errors).toContain(
            "Bar 0: volume must be a finite number",
        );
    });

    it("rejects invalid OHLC relationships", () => {
        const result = validateMarketBars([
            {
                ...validBar,
                high: 1400,
                low: 1450,
            },
        ]);

        expect(result.success).toBe(false);

        expect(result.errors).toContain(
            "Bar 0: high must be greater than or equal to low",
        );
    });

    it("normalizes symbols and trims values", () => {
        const result = validateMarketBars([
            {
                ...validBar,
                symbol: " reliance ",
            },
        ]);

        expect(result.success).toBe(true);

        expect(result.data?.[0]?.symbol).toBe(
            "RELIANCE",
        );
    });
});
