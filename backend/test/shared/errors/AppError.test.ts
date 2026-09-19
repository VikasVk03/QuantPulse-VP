import { describe, expect, it } from "vitest";

import { AppError } from "../../../src/shared/errors/AppError.js";

describe("AppError", () => {
    it("stores the status code and message", () => {
        const error = new AppError(
            404,
            "Dataset not found",
        );

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe(
            "Dataset not found",
        );
        expect(error.name).toBe("AppError");
    });
});
