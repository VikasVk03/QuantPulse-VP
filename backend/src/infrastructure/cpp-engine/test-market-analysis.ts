import { runMarketAnalysis } from "./QuantEngineClient.js";

const result = await runMarketAnalysis(
  "../data/samples/reliance-market-bar-v1.csv",
);

console.log(JSON.stringify(result, null, 2));
