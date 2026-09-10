import "dotenv/config";

const parsePort = (value: string | undefined): number => {
    const port = Number(value);

    if (!Number.isInteger(port) || port <= 0 || port > 65535) {
        return 8000;
    }

    return port;
};

export const config = {
    nodeEnv: process.env.NODE_ENV ?? "development",

    port: parsePort(process.env.PORT),

    cppEnginePath:
        process.env.QUANTPULSE_ENGINE_PATH ??
        (process.platform === "win32"
            ? "../cpp-engine/build-release/Release/quantpulse_cli.exe"
            : "../cpp-engine/build-release/quantpulse_cli"),

    mongodb: {
        uri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017",
        databaseName:
            process.env.MONGODB_DATABASE ?? "quantpulse",
    },
};
