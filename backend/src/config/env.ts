import "dotenv/config";

export const config = {
    cppEnginePath:
        process.env.QUANTPULSE_ENGINE_PATH ??
        (process.platform === "win32"
            ? "../cpp-engine/build-release/Release/quantpulse_cli.exe"
            : "../cpp-engine/build-release/quantpulse_cli"),
    port: Number(process.env.PORT) || 8000,
};
