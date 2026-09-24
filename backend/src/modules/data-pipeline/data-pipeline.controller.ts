import type { Request, Response } from "express";
import { DataPipelineService } from "./data-pipeline.service.js";
import { parseIncomingUpload } from "./parsers/multipart.parser.js";
import { AppError } from "../../shared/errors/AppError.js";

const getRouteParam = (value: string | string[] | undefined): string | null => {
  if (typeof value !== "string" || value.length === 0) {
    return null;
  }
  return value;
};

export class DataPipelineController {
  constructor(private readonly service: DataPipelineService) {}

  upload = async (req: Request, res: Response): Promise<void> => {
    try {
      const parsed = await parseIncomingUpload(req);

      if (!parsed.file) {
        res.status(400).json({
          success: false,
          error: "No market data file provided in request",
        });
        return;
      }

      const result = await this.service.processUpload({
        fileBuffer: parsed.file.data,
        fileName: parsed.file.filename,
        contentType: parsed.file.contentType,
        metadata: {
          name: parsed.fields.name || undefined,
          symbol: parsed.fields.symbol || undefined,
          timeframe: parsed.fields.timeframe || undefined,
          source: parsed.fields.source || undefined,
          description: parsed.fields.description || undefined,
        },
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
        return;
      }

      const errorMsg =
        error instanceof Error ? error.message : "Upload processing failed";

      res.status(500).json({
        success: false,
        error: errorMsg,
      });
    }
  };

  getStatus = async (req: Request, res: Response): Promise<void> => {
    const pipelineId = getRouteParam(req.params.pipelineId);

    if (!pipelineId) {
      res.status(400).json({
        success: false,
        error: "Pipeline ID is required",
      });
      return;
    }

    const result = this.service.getPipelineStatus(pipelineId);

    if (!result) {
      res.status(404).json({
        success: false,
        error: "Pipeline execution not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  };

  getResult = async (req: Request, res: Response): Promise<void> => {
    const pipelineId = getRouteParam(req.params.pipelineId);

    if (!pipelineId) {
      res.status(400).json({
        success: false,
        error: "Pipeline ID is required",
      });
      return;
    }

    const result = this.service.getPipelineResult(pipelineId);

    if (!result) {
      res.status(404).json({
        success: false,
        error: "Pipeline result not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  };
}
