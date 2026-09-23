import type {
  PipelineResult,
  UploadDatasetApiResponse,
  UploadDatasetRequest,
} from "./data-lab.types";

const API_BASE_URL =
  typeof window !== "undefined" && window.location.port === "5173"
    ? "http://localhost:8000"
    : "";

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

  const response = await fetch(`${API_BASE_URL}/api/data-pipeline/upload`, {
    method: "POST",
    body: formData,
  });

  const result = (await response.json()) as UploadDatasetApiResponse;

  if (!response.ok || !result.success) {
    throw new Error(
      result.error || `Upload failed with status code ${response.status}`,
    );
  }

  return result.data;
}

export async function getPipelineStatus(
  pipelineId: string,
): Promise<PipelineResult> {
  const response = await fetch(
    `${API_BASE_URL}/api/data-pipeline/${encodeURIComponent(pipelineId)}`,
  );

  const result = (await response.json()) as UploadDatasetApiResponse;

  if (!response.ok || !result.success) {
    throw new Error(
      result.error || `Failed to fetch pipeline status (${response.status})`,
    );
  }

  return result.data;
}

export async function getPipelineResult(
  pipelineId: string,
): Promise<PipelineResult> {
  const response = await fetch(
    `${API_BASE_URL}/api/data-pipeline/${encodeURIComponent(pipelineId)}/result`,
  );

  const result = (await response.json()) as UploadDatasetApiResponse;

  if (!response.ok || !result.success) {
    throw new Error(
      result.error || `Failed to fetch pipeline result (${response.status})`,
    );
  }

  return result.data;
}
