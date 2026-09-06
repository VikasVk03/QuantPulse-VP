import { spawn } from "node:child_process";

export interface MarketAnalyticsResult {
  symbol: string;
  observationCount: number;
  firstPrice: number;
  lastPrice: number;
  totalVolume: number;
  averageVolume: number;
  returnPercentage: number;
  volatility: number;
}

const CPP_ENGINE_PATH =
  process.env.QUANTPULSE_ENGINE_PATH ??
  "../cpp-engine/build-release/quantpulse_cli";

export function runMarketAnalysis(
  filePath: string,
): Promise<MarketAnalyticsResult> {
  return new Promise((resolve, reject) => {
    const process = spawn(CPP_ENGINE_PATH, ["analyze", filePath]);

    let stdout = "";
    let stderr = "";

    process.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
    });

    process.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    process.on("error", (error) => {
      reject(error);
    });

    process.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `C++ engine exited with code ${code}`));
        return;
      }

      try {
        const result = JSON.parse(stdout.trim()) as MarketAnalyticsResult;

        if (
          typeof result.symbol !== "string" ||
          !Number.isFinite(result.observationCount) ||
          !Number.isFinite(result.firstPrice) ||
          !Number.isFinite(result.lastPrice) ||
          !Number.isFinite(result.totalVolume) ||
          !Number.isFinite(result.averageVolume) ||
          !Number.isFinite(result.returnPercentage) ||
          !Number.isFinite(result.volatility)
        ) {
          throw new Error("C++ engine returned an invalid market analysis.");
        }

        resolve(result);
      } catch (error) {
        reject(
          new Error(
            `Failed to parse C++ engine response: ${
              error instanceof Error ? error.message : String(error)
            }`,
          ),
        );
      }
    });
  });
}
