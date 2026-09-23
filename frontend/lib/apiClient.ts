import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { env } from "../config/env";
import { logger } from "./logger";

/**
 * Metadata attached to Axios config for request tracking and timing
 */
interface CustomRequestConfig extends InternalAxiosRequestConfig {
  metadata?: {
    startTime: number;
  };
}

/**
 * Standard QuantPulse Axios API Client
 * Configured with baseURL, 15s timeout, and unified console telemetry interceptors.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request Interceptor: Attach timing and log outgoing API request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const customConfig = config as CustomRequestConfig;
    customConfig.metadata = { startTime: performance.now() };

    const method = (config.method || "GET").toUpperCase();
    const url = config.url || "";
    logger.req(method, url, config.data);

    return config;
  },
  (error) => {
    logger.err("REQUEST", error?.config?.url || "unknown", error);
    return Promise.reject(error);
  },
);

// Response Interceptor: Compute latency and log response / error
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const customConfig = response.config as CustomRequestConfig;
    const startTime = customConfig.metadata?.startTime || performance.now();
    const durationMs = performance.now() - startTime;
    const method = (response.config.method || "GET").toUpperCase();
    const url = response.config.url || "";

    logger.res(method, url, response.status, durationMs, response.data);
    return response;
  },
  (error) => {
    const customConfig = (error.config || {}) as CustomRequestConfig;
    const startTime = customConfig.metadata?.startTime || performance.now();
    const durationMs = performance.now() - startTime;
    const method = (error.config?.method || "GET").toUpperCase();
    const url = error.config?.url || "unknown";

    logger.err(method, url, error, durationMs);
    return Promise.reject(error);
  },
);

/**
 * Strongly typed API helper functions for standard endpoints:
 * - /api/overview
 * - /api/data-lab
 * - /api/providers
 * - /api/scanner
 * - /api/risk
 * - /api/backtesting
 * - /api/live-market
 * - /api/datasets
 * - /api/analytics
 */
export const api = {
  // Generic Axios methods
  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config).then((res) => res.data),

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config).then((res) => res.data),

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, data, config).then((res) => res.data),

  delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config).then((res) => res.data),

  // Market Overview Domain
  overview: {
    getMarketStatus: () => api.get("/api/overview/market-status"),
    getSignals: () => api.get("/api/overview/signals"),
    getSectors: () => api.get("/api/overview/sectors"),
    getTelemetry: () => api.get("/api/overview/telemetry"),
  },

  // Data Lab / Data Pipeline Domain
  dataLab: {
    upload: (formData: FormData) =>
      apiClient
        .post("/api/data-lab/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((res) => res.data),
    getStatus: (pipelineId: string) =>
      api.get(`/api/data-lab/${encodeURIComponent(pipelineId)}`),
    getResult: (pipelineId: string) =>
      api.get(`/api/data-lab/${encodeURIComponent(pipelineId)}/result`),
  },

  // Datasets Domain
  datasets: {
    list: () => api.get("/api/datasets"),
    getById: (datasetId: string) =>
      api.get(`/api/datasets/${encodeURIComponent(datasetId)}`),
    getBars: (datasetId: string, limit = 500, offset = 0) =>
      api.get(
        `/api/datasets/${encodeURIComponent(datasetId)}/bars?limit=${limit}&offset=${offset}`,
      ),
    getSummary: (datasetId: string) =>
      api.get(`/api/datasets/${encodeURIComponent(datasetId)}/summary`),
  },

  // Market Analytics Domain
  analytics: {
    getDatasetAnalytics: (datasetId: string) =>
      api.get(`/api/analytics/datasets/${encodeURIComponent(datasetId)}`),
    analyzeBars: (payload: { symbol: string; bars: any[] }) =>
      api.post("/api/analytics/bars", payload),
  },

  // External Market Providers Domain
  providers: {
    list: () => api.get("/api/providers"),
    test: (config: any) => api.post("/api/providers/test", config),
    saveConfig: (config: any) => api.post("/api/providers/config", config),
    switchFeed: (providerType: string) =>
      api.post("/api/providers/switch", { providerType }),
  },

  // Opportunity Scanner Domain
  scanner: {
    getOpportunities: () => api.get("/api/scanner/opportunities"),
    getStats: () => api.get("/api/scanner/stats"),
  },

  // Risk Intelligence Domain
  risk: {
    getSurface: () => api.get("/api/risk/surface"),
    getLimits: () => api.get("/api/risk/limits"),
  },

  // Research & Backtesting Domain
  backtesting: {
    getStrategies: () => api.get("/api/backtesting/strategies"),
    run: (params: any) => api.post("/api/backtesting/run", params),
    getResult: (id: string) =>
      api.get(`/api/backtesting/results/${encodeURIComponent(id)}`),
  },

  // Live Market Domain
  liveMarket: {
    getDepth: (symbol: string) =>
      api.get(`/api/live-market/depth?symbol=${encodeURIComponent(symbol)}`),
    getTrades: (symbol: string, limit = 20) =>
      api.get(
        `/api/live-market/trades?symbol=${encodeURIComponent(symbol)}&limit=${limit}`,
      ),
    getMicrostructure: (symbol: string) =>
      api.get(
        `/api/live-market/microstructure?symbol=${encodeURIComponent(symbol)}`,
      ),
  },
};
