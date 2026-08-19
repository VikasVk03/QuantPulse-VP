import { spawn } from "node:child_process";

const CPP_ENGINE_PATH =
  process.env.QUANTPULSE_ENGINE_PATH ??
  "../cpp-engine/build-release/quantpulse_cli";

export function runSharpeRatio(
  returns: number[],
  riskFreeRate: number,
): Promise<number> {
  return new Promise((resolve, reject) => {
    const process = spawn(CPP_ENGINE_PATH);

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
        reject(
          new Error(
            stderr || `C++ engine exited with code ${code}`,
          ),
        );
        return;
      }

      const value = Number(stdout.trim());

      if (!Number.isFinite(value)) {
        reject(
          new Error("C++ engine returned an invalid result."),
        );
        return;
      }

      resolve(value);
    });

    process.stdin.write(
      returns.join(" "),
    );

    process.stdin.end();
  });
}