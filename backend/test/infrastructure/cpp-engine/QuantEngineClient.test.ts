import { EventEmitter } from "node:events";

import { describe, expect, it, vi } from "vitest";

const { spawnMock } = vi.hoisted(() => ({
    spawnMock: vi.fn(),
}));

vi.mock("node:child_process", () => ({
    spawn: spawnMock,
}));

import {
    runMarketAnalysis,
    validateMarketAnalyticsResult,
} from "../../../src/infrastructure/cpp-engine/QuantEngineClient.js";

const validResult = {
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

function createChildProcess() {
    const child = new EventEmitter() as EventEmitter & {
        stdout: EventEmitter;
        stderr: EventEmitter;
    };

    child.stdout = new EventEmitter();
    child.stderr = new EventEmitter();
    return child;
}

describe("validateMarketAnalyticsResult", () => {
    it("accepts a valid MarketBar analytics response", () => {
        expect(validateMarketAnalyticsResult(validResult)).toEqual(validResult);
    });

    it("rejects a missing series", () => {
        const result = { ...validResult, series: undefined };
        expect(() => validateMarketAnalyticsResult(result)).toThrow(
            "invalid market analysis",
        );
    });

    it("rejects an invalid numeric metric", () => {
        const result = { ...validResult, volatility: "0" };
        expect(() => validateMarketAnalyticsResult(result)).toThrow(
            "invalid market analysis",
        );
    });

    it("rejects an invalid series point", () => {
        const result = {
            ...validResult,
            series: [{ ...validResult.series[0], close: Number.NaN }],
        };
        expect(() => validateMarketAnalyticsResult(result)).toThrow(
            "invalid market series point",
        );
    });
});

describe("runMarketAnalysis", () => {
    it("parses the C++ JSON response", async () => {
        const child = createChildProcess();
        spawnMock.mockReturnValueOnce(child);

        const resultPromise = runMarketAnalysis("sample.csv");
        child.stdout.emit("data", Buffer.from(JSON.stringify(validResult)));
        child.emit("close", 0);

        await expect(resultPromise).resolves.toEqual(validResult);
        expect(spawnMock).toHaveBeenCalledWith(
            expect.stringContaining("quantpulse_cli"),
            ["analyze", "sample.csv"],
        );
    });

    it("rejects malformed JSON", async () => {
        const child = createChildProcess();
        spawnMock.mockReturnValueOnce(child);

        const resultPromise = runMarketAnalysis("sample.csv");
        child.stdout.emit("data", Buffer.from("not-json"));
        child.emit("close", 0);

        await expect(resultPromise).rejects.toThrow("Failed to parse C++ engine response");
    });

    it("rejects C++ process failures", async () => {
        const child = createChildProcess();
        spawnMock.mockReturnValueOnce(child);

        const resultPromise = runMarketAnalysis("sample.csv");
        child.stderr.emit("data", Buffer.from("engine failed"));
        child.emit("close", 1);

        await expect(resultPromise).rejects.toThrow("engine failed");
    });
});
