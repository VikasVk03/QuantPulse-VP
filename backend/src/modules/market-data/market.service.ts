import { runMarketAnalysis } from "../../infrastructure/cpp-engine/QuantEngineClient.js";

export async function analyzeMarketData(filePath: string) {
  return (
    runMarketAnalysis as unknown as (
      path: string,
    ) => ReturnType<typeof runMarketAnalysis>
  )(filePath);
}
