import type { Request } from "express";
import { AppError } from "../../../shared/errors/AppError.js";

export interface ParsedMultipartBody {
  fields: Record<string, string>;
  file?:
    | {
        filename: string;
        data: Buffer;
        contentType?: string | undefined;
      }
    | undefined;
}

export async function parseIncomingUpload(
  req: Request,
): Promise<ParsedMultipartBody> {
  const contentType = req.headers["content-type"] ?? "";

  if (contentType.includes("multipart/form-data")) {
    const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
    if (!boundaryMatch) {
      throw new AppError(400, "Missing boundary in multipart/form-data header");
    }
    const boundary = boundaryMatch[1] ?? boundaryMatch[2]!;

    const rawBuffer = await getRawBodyBuffer(req);
    return parseMultipartBuffer(rawBuffer, boundary.trim());
  }

  // Direct JSON upload
  if (
    contentType.includes("application/json") ||
    typeof req.body === "object"
  ) {
    const bodyObj =
      typeof req.body === "object" && req.body !== null ? req.body : {};
    const fields: Record<string, string> = {};

    if (typeof bodyObj.name === "string") fields.name = bodyObj.name;
    if (typeof bodyObj.symbol === "string") fields.symbol = bodyObj.symbol;
    if (typeof bodyObj.timeframe === "string")
      fields.timeframe = bodyObj.timeframe;
    if (typeof bodyObj.source === "string") fields.source = bodyObj.source;
    if (typeof bodyObj.description === "string")
      fields.description = bodyObj.description;

    let fileData: Buffer | undefined;
    let filename = "dataset.json";

    if (typeof bodyObj.fileContent === "string") {
      fileData = Buffer.from(bodyObj.fileContent, "utf-8");
      if (typeof bodyObj.fileName === "string") filename = bodyObj.fileName;
    } else if (bodyObj.bars || Array.isArray(bodyObj)) {
      fileData = Buffer.from(JSON.stringify(bodyObj), "utf-8");
    }

    return {
      fields,
      file: fileData
        ? {
            filename,
            data: fileData,
            contentType: "application/json",
          }
        : undefined,
    };
  }

  // Direct raw CSV or plain text upload
  if (contentType.includes("text/csv") || contentType.includes("text/plain")) {
    const rawBuffer = await getRawBodyBuffer(req);
    return {
      fields: {},
      file: {
        filename: "dataset.csv",
        data: rawBuffer,
        contentType: "text/csv",
      },
    };
  }

  throw new AppError(
    400,
    "Unsupported content type. Please upload multipart/form-data, application/json, or text/csv.",
  );
}

function getRawBodyBuffer(req: Request): Promise<Buffer> {
  if (Buffer.isBuffer(req.body)) {
    return Promise.resolve(req.body);
  }
  if (typeof req.body === "string") {
    return Promise.resolve(Buffer.from(req.body, "utf-8"));
  }

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", (err) => reject(err));
  });
}

function parseMultipartBuffer(
  buffer: Buffer,
  boundary: string,
): ParsedMultipartBody {
  const fields: Record<string, string> = {};
  let file: ParsedMultipartBody["file"];

  const boundaryDelimiter = Buffer.from(`--${boundary}`);
  let startIndex = buffer.indexOf(boundaryDelimiter);

  while (startIndex !== -1) {
    const nextIndex = buffer.indexOf(
      boundaryDelimiter,
      startIndex + boundaryDelimiter.length,
    );

    if (nextIndex === -1) break;

    const partBuffer = buffer.subarray(
      startIndex + boundaryDelimiter.length,
      nextIndex,
    );

    startIndex = nextIndex;

    const headerEnd = partBuffer.indexOf("\r\n\r\n");
    if (headerEnd === -1) continue;

    const headerStr = partBuffer.subarray(0, headerEnd).toString("utf-8");
    let bodyBuffer = partBuffer.subarray(headerEnd + 4);

    // Strip trailing \r\n from part body
    if (
      bodyBuffer.length >= 2 &&
      bodyBuffer[bodyBuffer.length - 2] === 13 &&
      bodyBuffer[bodyBuffer.length - 1] === 10
    ) {
      bodyBuffer = bodyBuffer.subarray(0, bodyBuffer.length - 2);
    }

    const dispositionMatch = headerStr.match(
      /Content-Disposition:\s*form-data;\s*name="([^"]+)"(?:;\s*filename="([^"]*)")?/i,
    );

    if (!dispositionMatch) continue;

    const name = dispositionMatch[1]!;
    const filename = dispositionMatch[2];

    if (filename !== undefined) {
      const ctMatch = headerStr.match(/Content-Type:\s*([^\r\n]+)/i);
      const partContentType = ctMatch ? ctMatch[1]!.trim() : undefined;

      file = {
        filename: filename.trim() || "uploaded_file",
        data: bodyBuffer,
        contentType: partContentType,
      };
    } else {
      fields[name] = bodyBuffer.toString("utf-8").trim();
    }
  }

  return { fields, file };
}
