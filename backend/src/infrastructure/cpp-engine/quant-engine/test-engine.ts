import { runSharpeRatio } from "./quant-engine.service.js";

const result = await runSharpeRatio(
  [0.01, 0.02, -0.01, 0.015],
  0.002,
);

console.log({
  operation: "sharpeRatio",
  value: result,
});