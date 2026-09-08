import { describe, expect, it, vi } from "vitest";

const { runMarketAnalysisMock } = vi.hoisted(() => ({
    runMarketAnalysisMock: vi.fn(),
}));

vi.mock("../../../src/infrastructure/cpp-engine/QuantEngineClient.js", () => ({
    runMarketAnalysis: runMarketAnalysisMock,
}));

import { analyzeMarketData } from "../../../src/modules/market-data/market.service.js";

const result = {
    symbol: "RELIANCE",
    observationCount: 1,
    firstPrice: 1399.5,
    lastPrice: 1399.5,
    totalVolume: 125000,
    averageVolume: 125000,
    returnPercentage: 0,
    volatility: 0,
    series: [
        {
            timestamp: 1785748500,
            open: 1398.2,
            high: 1400.1,
            low: 1397.8,
            close: 1399.5,
            volume: 125000,
        },
    ],
};

describe("analyzeMarketData", () => {
    it("delegates to the C++ engine client", async () => {
        runMarketAnalysisMock.mockResolvedValueOnce(result);

        await expect(analyzeMarketData("sample.csv")).resolves.toEqual(result);
        expect(runMarketAnalysisMock).toHaveBeenCalledWith("sample.csv");
    });

    it("propagates engine failures", async () => {
        runMarketAnalysisMock.mockRejectedValueOnce(new Error("engine failed"));

        await expect(analyzeMarketData("sample.csv")).rejects.toThrow(
            "engine failed",
        );
    });
});
