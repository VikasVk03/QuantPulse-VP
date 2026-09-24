import { config as appConfig } from "../../config/env.js";
import { logger } from "../../shared/logger/logger.js";
import { ExternalMarketDataProvider } from "./external.provider.js";
import type {
  IMarketDataProvider,
  OrderBookSnapshot,
  ProviderConfig,
  ProviderStatus,
  ProviderType,
  QuoteTick,
  TradeTick,
} from "./provider.types.js";
import { SimulatedMarketDataProvider } from "./simulated.provider.js";

export class ProviderService {
  private static instance: ProviderService;
  private providers: Map<ProviderType, IMarketDataProvider> = new Map();
  private configs: Map<ProviderType, ProviderConfig> = new Map();
  private activeProviderType: ProviderType = "simulated";

  private constructor() {
    this.registerProvider(new SimulatedMarketDataProvider());
    this.registerProvider(
      new ExternalMarketDataProvider("alphavantage", "Alpha Vantage"),
    );
    this.registerProvider(
      new ExternalMarketDataProvider("polygon", "Polygon.io"),
    );
    this.registerProvider(
      new ExternalMarketDataProvider("binance", "Binance Spot"),
    );
    this.registerProvider(
      new ExternalMarketDataProvider("zerodha", "Zerodha Kite Connect"),
    );
    this.registerProvider(
      new ExternalMarketDataProvider("upstox", "Upstox Pro API"),
    );
    this.registerProvider(
      new ExternalMarketDataProvider(
        "custom_webhook",
        "Custom Exchange Webhook",
      ),
    );

    // Default configurations seeded from env variables
    this.configs.set("simulated", {
      providerType: "simulated",
      name: "Built-in High-Frequency Simulator",
      enabled: true,
      environment: "live",
    });

    if (appConfig.providers.alphavantage.apiKey) {
      this.configs.set("alphavantage", {
        providerType: "alphavantage",
        name: "Alpha Vantage",
        enabled: true,
        apiKey: appConfig.providers.alphavantage.apiKey,
        environment: "live",
      });
    }

    if (appConfig.providers.polygon.apiKey) {
      this.configs.set("polygon", {
        providerType: "polygon",
        name: "Polygon.io",
        enabled: true,
        apiKey: appConfig.providers.polygon.apiKey,
        environment: "live",
      });
    }

    if (appConfig.providers.binance.apiKey) {
      this.configs.set("binance", {
        providerType: "binance",
        name: "Binance Spot",
        enabled: true,
        apiKey: appConfig.providers.binance.apiKey,
        apiSecret: appConfig.providers.binance.apiSecret,
        environment: "live",
      });
    }

    if (appConfig.providers.zerodha.apiKey) {
      this.configs.set("zerodha", {
        providerType: "zerodha",
        name: "Zerodha Kite Connect",
        enabled: true,
        apiKey: appConfig.providers.zerodha.apiKey,
        apiSecret: appConfig.providers.zerodha.apiSecret,
        environment: "live",
      });
    }

    if (appConfig.providers.upstox.apiKey) {
      this.configs.set("upstox", {
        providerType: "upstox",
        name: "Upstox Pro API",
        enabled: true,
        apiKey: appConfig.providers.upstox.apiKey,
        apiSecret: appConfig.providers.upstox.apiSecret,
        environment: "live",
      });
    }

    if (appConfig.providers.customWebhook.url) {
      this.configs.set("custom_webhook", {
        providerType: "custom_webhook",
        name: "Custom Exchange Webhook",
        enabled: true,
        customEndpoint: appConfig.providers.customWebhook.url,
        apiKey: appConfig.providers.customWebhook.apiKey,
        environment: "live",
      });
    }

    // Connect default provider configured in env
    this.activeProviderType = appConfig.providers.defaultProvider;
    const initialProvider =
      this.providers.get(this.activeProviderType) ||
      this.providers.get("simulated")!;
    const initialConfig = this.configs.get(this.activeProviderType);
    logger.info(
      "PROVIDER:INIT",
      `Platform initialized with active feed: "${this.activeProviderType}". Configured providers with keys: [${Array.from(this.configs.keys()).join(", ")}]`,
    );
    void initialProvider.connect(initialConfig);
  }

  public static getInstance(): ProviderService {
    if (!ProviderService.instance) {
      ProviderService.instance = new ProviderService();
    }
    return ProviderService.instance;
  }

  public registerProvider(provider: IMarketDataProvider): void {
    this.providers.set(provider.type, provider);
  }

  public getActiveProvider(): IMarketDataProvider {
    const provider = this.providers.get(this.activeProviderType);
    if (!provider) {
      return this.providers.get("simulated")!;
    }
    return provider;
  }

  public getActiveProviderType(): ProviderType {
    return this.activeProviderType;
  }

  public getAllProviders(): Array<{
    type: ProviderType;
    name: string;
    isActive: boolean;
    status: ProviderStatus;
    config?: Omit<ProviderConfig, "apiSecret" | "accessToken"> | undefined;
  }> {
    const list: Array<{
      type: ProviderType;
      name: string;
      isActive: boolean;
      status: ProviderStatus;
      config?: Omit<ProviderConfig, "apiSecret" | "accessToken"> | undefined;
    }> = [];

    for (const [type, provider] of this.providers.entries()) {
      const cfg = this.configs.get(type);
      const safeConfig = cfg
        ? {
            providerType: cfg.providerType,
            name: cfg.name,
            enabled: cfg.enabled,
            apiKey: cfg.apiKey
              ? `${cfg.apiKey.slice(0, 4)}••••••••`
              : undefined,
            customEndpoint: cfg.customEndpoint,
            environment: cfg.environment,
          }
        : undefined;

      list.push({
        type,
        name: provider.name,
        isActive: this.activeProviderType === type,
        status: provider.getStatus(),
        config: safeConfig,
      });
    }

    return list;
  }

  public async configureProvider(config: ProviderConfig): Promise<{
    success: boolean;
    message: string;
    activeProvider: ProviderType;
  }> {
    const provider = this.providers.get(config.providerType);
    if (!provider) {
      throw new Error(`Unsupported provider type: ${config.providerType}`);
    }

    this.configs.set(config.providerType, config);

    if (config.enabled) {
      await provider.connect(config);
      this.activeProviderType = config.providerType;
      logger.info(
        "PROVIDER:ACTIVATE",
        `Market data provider switched to "${provider.name}" (${config.providerType}) [env: ${config.environment || "live"}]`,
      );
      return {
        success: true,
        message: `Activated ${provider.name} as current market data provider.`,
        activeProvider: this.activeProviderType,
      };
    } else {
      if (this.activeProviderType === config.providerType) {
        this.activeProviderType = "simulated";
        const sim = this.providers.get("simulated")!;
        await sim.connect();
      }
      logger.info(
        "PROVIDER:DEACTIVATE",
        `Disabled "${provider.name}". Defaulted back to Built-in Simulator`,
      );
      return {
        success: true,
        message: `Provider ${provider.name} saved. Switched to Built-in Simulator.`,
        activeProvider: this.activeProviderType,
      };
    }
  }

  public async testProvider(config: ProviderConfig): Promise<{
    success: boolean;
    message: string;
    latencyMs: number;
  }> {
    const provider = this.providers.get(config.providerType);
    if (!provider) {
      throw new Error(`Unsupported provider type: ${config.providerType}`);
    }
    logger.info(
      "PROVIDER:TEST",
      `Testing connection to "${provider.name}" (${config.providerType})...`,
    );
    const result = await provider.testConnection(config);
    logger.info(
      "PROVIDER:TEST_RESULT",
      `Test for "${provider.name}": success=${result.success}, latency=${result.latencyMs}ms`,
    );
    return result;
  }

  public async switchProvider(type: ProviderType): Promise<{
    success: boolean;
    activeProvider: ProviderType;
    name: string;
  }> {
    const provider = this.providers.get(type);
    if (!provider) {
      throw new Error(`Unknown provider: ${type}`);
    }

    const cfg = this.configs.get(type);
    const connected = await provider.connect(cfg);
    if (!connected && type !== "simulated") {
      logger.error(
        "PROVIDER:SWITCH_FAILED",
        `Failed to connect to ${provider.name}`,
      );
      throw new Error(
        `Could not connect to ${provider.name}. Verify your API key or credentials.`,
      );
    }

    this.activeProviderType = type;
    logger.info(
      "PROVIDER:SWITCHED",
      `Active feed switched to "${provider.name}" (${type})`,
    );
    return {
      success: true,
      activeProvider: this.activeProviderType,
      name: provider.name,
    };
  }

  public async setActiveProvider(type: ProviderType): Promise<{
    success: boolean;
    activeProvider: ProviderType;
    name: string;
  }> {
    return this.switchProvider(type);
  }

  public async getQuotes(symbols: string[]): Promise<QuoteTick[]> {
    return this.getActiveProvider().getQuotes(symbols);
  }

  public async getOrderBook(symbol: string): Promise<OrderBookSnapshot> {
    return this.getActiveProvider().getOrderBook(symbol);
  }

  public async getRecentTrades(
    symbol: string,
    limit = 20,
  ): Promise<TradeTick[]> {
    return this.getActiveProvider().getRecentTrades(symbol, limit);
  }
}
