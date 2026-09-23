import React, { useState, useEffect } from "react";
import {
  Globe,
  Key,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  Lock,
  RefreshCw,
  Terminal,
  Activity,
  Radio,
  ExternalLink,
  Sliders,
  Cpu,
  Server,
  Code2,
} from "lucide-react";
import { useRealTimeMarketStream } from "../../hooks/useRealTimeMarketStream";
import { api } from "../../lib/apiClient";
import { logger } from "../../lib/logger";

export interface ProviderItem {
  type: string;
  name: string;
  isActive: boolean;
  status: {
    isConnected: boolean;
    latencyMs: number;
    hasCustomKey: boolean;
    activeSymbols?: string[];
    error?: string;
  };
  config?: {
    apiKey?: string;
    customEndpoint?: string;
    environment?: string;
  };
}

interface ProvidersPageProps {
  onProviderActivated?: (providerType: string) => void;
}

export function ProvidersPage({ onProviderActivated }: ProvidersPageProps) {
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [selectedType, setSelectedType] = useState<string>("alphavantage");
  const [apiKey, setApiKey] = useState<string>("");
  const [apiSecret, setApiSecret] = useState<string>("");
  const [customEndpoint, setCustomEndpoint] = useState<string>("");
  const [environment, setEnvironment] = useState<"sandbox" | "live">("live");

  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
  } | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Live SSE stream diagnostics
  const { isConnected, quotes, activeProvider, lastTickAt } =
    useRealTimeMarketStream();

  const fetchProviders = async () => {
    try {
      const json = await api.providers.list();
      if (json.success) {
        setProviders(json.data.providers);
        if (json.data.activeProvider) {
          setSelectedType(json.data.activeProvider);
        }
      }
    } catch (err) {
      logger.error("PROVIDERS", "Failed to fetch provider list", err);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const currentProvider = providers.find((p) => p.type === selectedType);

  const handleTestConnection = async () => {
    setIsLoading(true);
    setTestResult(null);
    try {
      const json = await api.providers.test({
        providerType: selectedType,
        name: currentProvider?.name || selectedType,
        enabled: true,
        apiKey: apiKey.trim() || undefined,
        apiSecret: apiSecret.trim() || undefined,
        customEndpoint: customEndpoint.trim() || undefined,
        environment,
      });
      if (json.success) {
        setTestResult(json.data);
      } else {
        setTestResult({
          success: false,
          message: json.error || "Connection test failed.",
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message:
          err?.response?.data?.error ||
          err?.message ||
          "Failed to reach backend.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAndActivate = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const json = await api.providers.saveConfig({
        providerType: selectedType,
        name: currentProvider?.name || selectedType,
        enabled: true,
        apiKey: apiKey.trim() || undefined,
        apiSecret: apiSecret.trim() || undefined,
        customEndpoint: customEndpoint.trim() || undefined,
        environment,
      });
      if (json.success) {
        setStatusMessage(
          json.data.message ||
            `Activated ${currentProvider?.name || selectedType} as current market data feed.`,
        );
        await fetchProviders();
        onProviderActivated?.(selectedType);
      } else {
        setStatusMessage(`Error: ${json.error}`);
      }
    } catch (err: any) {
      setStatusMessage(
        `Error: ${err?.response?.data?.error || err?.message || "Failed to save configuration."}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSwitch = async (type: string) => {
    setIsLoading(true);
    try {
      const json = await api.providers.switchFeed(type);
      if (json.success) {
        setSelectedType(type);
        await fetchProviders();
        onProviderActivated?.(type);
      }
    } catch {}
    setIsLoading(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
            <Radio
              className={`size-3.5 ${isConnected ? "text-emerald-400 animate-pulse" : "text-amber-400"}`}
            />
            <span>Market Data Connectors • External Exchange APIs</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            API Keys & Data Providers
            <span className="text-xs font-mono font-medium rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 px-3 py-0.5">
              Feed: {activeProvider.toUpperCase()}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure external stock exchange API keys (Alpha Vantage,
            Polygon.io, Binance, Indian Brokers) or use the native C++
            high-frequency simulator.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleQuickSwitch("simulated")}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition cursor-pointer"
          >
            <RefreshCw className="size-3.5" />
            <span>Switch to Simulator</span>
          </button>
        </div>
      </div>

      {/* Grid: Provider Selector Cards */}
      <div>
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 block">
          Available Exchange Feeds & Connectors
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {(providers.length > 0
            ? providers
            : [
                {
                  type: "alphavantage",
                  name: "Alpha Vantage",
                  isActive: true,
                  status: {
                    isConnected: true,
                    latencyMs: 24,
                    hasCustomKey: true,
                  },
                },
                {
                  type: "polygon",
                  name: "Polygon.io",
                  isActive: false,
                  status: {
                    isConnected: false,
                    latencyMs: 0,
                    hasCustomKey: false,
                  },
                },
                {
                  type: "binance",
                  name: "Binance Spot",
                  isActive: false,
                  status: {
                    isConnected: false,
                    latencyMs: 0,
                    hasCustomKey: false,
                  },
                },
                {
                  type: "simulated",
                  name: "Built-in Simulator",
                  isActive: false,
                  status: {
                    isConnected: true,
                    latencyMs: 1.2,
                    hasCustomKey: false,
                  },
                },
              ]
          ).map((p) => {
            const isSelected = selectedType === p.type;
            const isLiveActive = p.isActive;
            return (
              <button
                key={p.type}
                type="button"
                onClick={() => {
                  setSelectedType(p.type);
                  setTestResult(null);
                  setStatusMessage(null);
                }}
                className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? "bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-950/60 ring-1 ring-cyan-500/50"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-slate-100">
                      {p.name}
                    </span>
                    {isLiveActive && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                        LIVE FEED
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        p.status.isConnected
                          ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                          : "bg-slate-600"
                      }`}
                    />
                    <span>
                      {p.type === "simulated"
                        ? "Sub-2ms Deterministic Simulator"
                        : p.status.hasCustomKey
                          ? "API Key Configured in Env/UI"
                          : "API Key Required"}
                    </span>
                  </div>
                </div>

                {p.status.latencyMs > 0 && (
                  <div className="text-[11px] font-mono text-cyan-400 mt-3 flex items-center justify-between border-t border-slate-800/60 pt-2">
                    <span>Latency:</span>
                    <span className="font-bold">{p.status.latencyMs}ms</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form & Live Feed Telemetry */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Left: Configuration Form */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-100">
                  {currentProvider?.name || selectedType} Configuration
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedType === "alphavantage"
                    ? "Connects to Alpha Vantage REST & Real-time Global Quote Endpoints"
                    : selectedType === "simulated"
                      ? "Operates natively with sub-millisecond Level-2 depth"
                      : "Configure credentials to stream real exchange data"}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-medium rounded-full bg-slate-800 px-3 py-1 text-slate-300">
              Provider ID: {selectedType}
            </span>
          </div>

          {selectedType === "simulated" ? (
            <div className="p-5 bg-emerald-950/20 border border-emerald-800/40 rounded-xl text-xs text-emerald-300 space-y-2">
              <p className="font-bold text-sm flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Built-in High-Frequency Simulator Ready
              </p>
              <p className="text-emerald-400/80 leading-relaxed">
                The built-in market simulator runs natively inside the platform.
                It generates microsecond-level realistic order book depth,
                trades, microprices, and OFI flow with zero external
                dependencies or API rate limits.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Alpha Vantage Help Card */}
              {selectedType === "alphavantage" && (
                <div className="p-4 bg-cyan-950/30 border border-cyan-800/40 rounded-xl text-xs text-cyan-200 space-y-1.5">
                  <p className="font-semibold text-cyan-300 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    Alpha Vantage Live API Integration
                  </p>
                  <p className="text-cyan-300/80">
                    You can provide your key in{" "}
                    <code className="bg-slate-900 px-1 py-0.5 rounded text-white">
                      ALPHA_VANTAGE_API_KEY
                    </code>{" "}
                    within{" "}
                    <code className="bg-slate-900 px-1 py-0.5 rounded text-white">
                      backend/.env
                    </code>{" "}
                    or enter it below to activate live global market quotes
                    immediately.
                  </p>
                </div>
              )}

              <div>
                <label className="text-xs text-slate-300 font-semibold uppercase tracking-wider mb-1.5 block">
                  API Key / Access Token
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={
                      currentProvider?.config?.apiKey ||
                      "Enter vendor API key..."
                    }
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono transition"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
                </div>
              </div>

              {(selectedType === "zerodha" ||
                selectedType === "upstox" ||
                selectedType === "binance") && (
                <div>
                  <label className="text-xs text-slate-300 font-semibold uppercase tracking-wider mb-1.5 block">
                    API Secret / App Secret
                  </label>
                  <input
                    type="password"
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    placeholder="Enter API secret / app secret..."
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono transition"
                  />
                </div>
              )}

              {selectedType === "custom_webhook" && (
                <div>
                  <label className="text-xs text-slate-300 font-semibold uppercase tracking-wider mb-1.5 block">
                    Custom Webhook URL Endpoint
                  </label>
                  <input
                    type="text"
                    value={customEndpoint}
                    onChange={(e) => setCustomEndpoint(e.target.value)}
                    placeholder="https://your-exchange-bridge.internal/v1/market"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono transition"
                  />
                </div>
              )}

              <div className="flex items-center gap-5 text-xs pt-1">
                <span className="text-slate-400 font-semibold">
                  Environment Mode:
                </span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="env"
                    checked={environment === "live"}
                    onChange={() => setEnvironment("live")}
                    className="text-cyan-500 focus:ring-0"
                  />
                  <span className="text-slate-300 font-medium">
                    Live Production
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="env"
                    checked={environment === "sandbox"}
                    onChange={() => setEnvironment("sandbox")}
                    className="text-cyan-500 focus:ring-0"
                  />
                  <span className="text-slate-300 font-medium">
                    Sandbox / Paper
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Test Result Message Box */}
          {testResult && (
            <div
              className={`p-4 rounded-xl text-xs flex items-center gap-3 border ${
                testResult.success
                  ? "bg-emerald-950/40 border-emerald-700 text-emerald-300"
                  : "bg-red-950/40 border-red-700 text-red-300"
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              )}
              <div>
                <div className="font-semibold">{testResult.message}</div>
                {testResult.latencyMs !== undefined && (
                  <div className="text-[11px] font-mono text-emerald-400/80 mt-0.5">
                    Round-trip latency: {testResult.latencyMs}ms
                  </div>
                )}
              </div>
            </div>
          )}

          {statusMessage && (
            <div className="p-4 bg-cyan-950/40 border border-cyan-700 rounded-xl text-xs text-cyan-300 font-medium">
              {statusMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            {selectedType !== "simulated" && (
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isLoading}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-700/80 hover:bg-cyan-900/60 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Test Live Connection</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveAndActivate}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 shadow-lg shadow-cyan-500/20 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Save & Activate Feed</span>
            </button>
          </div>
        </div>

        {/* Right: Live Stream Diagnostic Telemetry */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
                  Live Feed Telemetry
                </h3>
              </div>
              <span
                className={`size-2 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}
              />
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400 text-[11px]">
                  Stream Status:
                </span>
                <span
                  className={`font-bold ${isConnected ? "text-emerald-400" : "text-amber-400"}`}
                >
                  {isConnected ? "CONNECTED (SSE)" : "CONNECTING..."}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400 text-[11px]">
                  Active Provider:
                </span>
                <span className="font-bold text-cyan-400 uppercase">
                  {activeProvider}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400 text-[11px]">
                  Last Tick Received:
                </span>
                <span className="text-slate-200">
                  {new Date(lastTickAt).toLocaleTimeString()}
                </span>
              </div>
            </div>

            {/* Live Quotes Mini Board */}
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                Streaming Market Ticks
              </div>
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 font-mono text-xs">
                {Object.values(quotes).map((q) => (
                  <div
                    key={q.symbol}
                    className="flex items-center justify-between py-1 px-2 rounded bg-slate-950/40 border border-slate-800/40"
                  >
                    <span className="font-bold text-slate-200">{q.symbol}</span>
                    <span className="text-slate-300">
                      ₹{q.price.toFixed(2)}
                    </span>
                    <span
                      className={`font-bold text-[11px] ${q.changePercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                    >
                      {q.changePercent >= 0 ? "+" : ""}
                      {q.changePercent.toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-[11px] text-slate-400 font-mono">
            💡 All API requests, responses, and C++ engine operations are
            transparently logged to your backend console and browser DevTools.
          </div>
        </div>
      </div>
    </div>
  );
}
