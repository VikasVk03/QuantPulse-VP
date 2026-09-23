export const env = {
  /**
   * API Base URL for REST endpoints.
   * Defaults to empty string (which uses relative path /api/... via Vite proxy or same-origin),
   * or reads VITE_API_BASE_URL if explicitly provided in frontend .env.
   */
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, ""),

  /**
   * WebSocket / Real-time stream URL override if separate from REST.
   */
  realTimeBaseUrl: (import.meta.env.VITE_REALTIME_BASE_URL ?? "").replace(
    /\/+$/,
    "",
  ),

  /**
   * Default stock symbol loaded on initial session.
   */
  defaultSymbol: import.meta.env.VITE_DEFAULT_SYMBOL ?? "RELIANCE",

  /**
   * Current app environment mode.
   */
  mode: import.meta.env.MODE ?? "development",
  isDev: import.meta.env.DEV ?? true,
};

/**
 * Helper to build standard API URLs cleanly without hardcoded ports.
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${env.apiBaseUrl}${cleanPath}`;
}
