import { api } from "../../lib/apiClient";
import type {
  PipelineResult,
  UploadDatasetApiResponse,
  UploadDatasetRequest,
} from "./data-lab.types";

export async function uploadDataset(
  request: UploadDatasetRequest,
): Promise<PipelineResult> {
  const formData = new FormData();
  formData.append("file", request.file);

  if (request.name) formData.append("name", request.name);
  if (request.symbol) formData.append("symbol", request.symbol);
  if (request.timeframe) formData.append("timeframe", request.timeframe);
  if (request.source) formData.append("source", request.source);
  if (request.description) formData.append("description", request.description);

  const result = (await api.dataLab.upload(
    formData,
  )) as UploadDatasetApiResponse;

  if (!result || !result.success) {
    throw new Error(result?.error || "Upload failed");
  }

  return result.data;
}

export async function getPipelineStatus(
  pipelineId: string,
): Promise<PipelineResult> {
  const result = (await api.dataLab.getStatus(
    pipelineId,
  )) as UploadDatasetApiResponse;

  if (!result || !result.success) {
    throw new Error(
      result?.error || `Failed to fetch pipeline status for ${pipelineId}`,
    );
  }

  return result.data;
}

export async function getPipelineResult(
  pipelineId: string,
): Promise<PipelineResult> {
  const result = (await api.dataLab.getResult(
    pipelineId,
  )) as UploadDatasetApiResponse;

  if (!result || !result.success) {
    throw new Error(
      result?.error || `Failed to fetch pipeline result for ${pipelineId}`,
    );
  }

  return result.data;
}
