import React, { useState, useEffect } from "react";
import { api } from "../../lib/apiClient";
import {
  Server,
  Key,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  Globe,
  Lock,
  RefreshCw,
  X,
} from "lucide-react";

export interface ProviderItem {
  type: string;
  name: string;
  isActive: boolean;
  status: {
    isConnected: boolean;
    latencyMs: number;
    hasCustomKey: boolean;
    error?: string;
  };
  config?: {
    apiKey?: string;
    customEndpoint?: string;
    environment?: string;
  };
}

interface ProviderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProviderChanged?: (activeType: string) => void;
}

export const ProviderSettingsModal: React.FC<ProviderSettingsModalProps> = ({
  isOpen,
  onClose,
  onProviderChanged,
}) => {
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [selectedType, setSelectedType] = useState<string>("simulated");
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

  const fetchProviders = async () => {
    try {
      const json = await api.providers.list();
      if (json.success) {
        setProviders(json.data.providers);
        setSelectedType(json.data.activeProvider || "simulated");
      }
    } catch {}
  };

  useEffect(() => {
    if (isOpen) {
      fetchProviders();
      setTestResult(null);
      setStatusMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
          json.data.message || "Provider activated successfully.",
        );
        await fetchProviders();
        onProviderChanged?.(selectedType);
        setTimeout(() => {
          onClose();
        }, 1200);
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
        onProviderChanged?.(type);
      }
    } catch {}
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#091522] border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0c1b2c]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Market Data Providers & API Connectors
              </h2>
              <p className="text-xs text-slate-400">
                Configure built-in exchange feeds or connect external broker API
                keys for real-time streaming
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Provider Selector Cards */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 block">
              Select Data Feed Provider
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {providers.map((p) => {
                const isSelected = selectedType === p.type;
                const isLiveActive = p.isActive;
                return (
                  <button
                    key={p.type}
                    type="button"
                    onClick={() => {
                      setSelectedType(p.type);
                      setTestResult(null);
                    }}
                    className={`p-3 rounded-xl border text-left transition relative flex flex-col justify-between ${
                      isSelected
                        ? "bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-950/50"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-slate-200">
                          {p.name}
                        </span>
                        {isLiveActive && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            p.status.isConnected
                              ? "bg-emerald-400 animate-pulse"
                              : "bg-slate-600"
                          }`}
                        />
                        {p.type === "simulated"
                          ? "Sub-2ms Simulated Exchange"
                          : p.status.hasCustomKey
                            ? "Custom Key Configured"
                            : "API Key Required"}
                      </div>
                    </div>
                    {p.status.latencyMs > 0 && (
                      <div className="text-[10px] font-mono text-slate-400 mt-2">
                        {p.status.latencyMs}ms latency
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Configuration Form for Selected Provider */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-sm text-slate-200">
                  {currentProvider?.name} Settings
                </span>
              </div>
              <span className="text-xs text-slate-400">
                {selectedType === "simulated"
                  ? "Zero Configuration Needed"
                  : "Dynamic External Bridge"}
              </span>
            </div>

            {selectedType === "simulated" ? (
              <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-lg text-xs text-emerald-300 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Built-in High-Frequency Simulated Exchange Active
                </p>
                <p className="text-emerald-400/80">
                  Operates out-of-the-box with sub-millisecond realistic order
                  book depth, trades, microprice, and Volatility Squeeze market
                  conditions.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-300 font-medium mb-1 block">
                    API Key / Access Token
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={
                        currentProvider?.config?.apiKey ||
                        "Enter your vendor API key..."
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                    <Lock className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
                  </div>
                </div>

                {selectedType === "zerodha" || selectedType === "upstox" ? (
                  <div>
                    <label className="text-xs text-slate-300 font-medium mb-1 block">
                      API Secret / App Secret
                    </label>
                    <input
                      type="password"
                      value={apiSecret}
                      onChange={(e) => setApiSecret(e.target.value)}
                      placeholder="Enter API secret..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                ) : null}

                {selectedType === "custom_webhook" ? (
                  <div>
                    <label className="text-xs text-slate-300 font-medium mb-1 block">
                      Custom Endpoint URL
                    </label>
                    <input
                      type="text"
                      value={customEndpoint}
                      onChange={(e) => setCustomEndpoint(e.target.value)}
                      placeholder="https://your-exchange-bridge.internal/v1/market"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                ) : null}

                <div className="flex items-center gap-4 text-xs">
                  <span className="text-slate-400">Environment:</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="env"
                      checked={environment === "live"}
                      onChange={() => setEnvironment("live")}
                      className="text-cyan-500 focus:ring-0"
                    />
                    <span className="text-slate-300">Live Production</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="env"
                      checked={environment === "sandbox"}
                      onChange={() => setEnvironment("sandbox")}
                      className="text-cyan-500 focus:ring-0"
                    />
                    <span className="text-slate-300">Sandbox / Paper</span>
                  </label>
                </div>
              </div>
            )}

            {/* Test Result Message */}
            {testResult && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
                  testResult.success
                    ? "bg-emerald-950/40 border-emerald-700 text-emerald-300"
                    : "bg-red-950/40 border-red-700 text-red-300"
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span>
                  {testResult.message}
                  {testResult.latencyMs !== undefined && (
                    <span className="ml-2 font-mono">
                      ({testResult.latencyMs}ms latency)
                    </span>
                  )}
                </span>
              </div>
            )}

            {statusMessage && (
              <div className="p-3 bg-cyan-950/40 border border-cyan-700 rounded-lg text-xs text-cyan-300">
                {statusMessage}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#0c1b2c] flex items-center justify-between">
          <button
            type="button"
            onClick={() => handleQuickSwitch("simulated")}
            className="px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset to Simulator
          </button>

          <div className="flex items-center gap-3">
            {selectedType !== "simulated" && (
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-700 hover:bg-cyan-900/60 transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                Test Connection
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveAndActivate}
              disabled={isLoading}
              className="px-5 py-2 rounded-lg text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              Activate Data Feed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
