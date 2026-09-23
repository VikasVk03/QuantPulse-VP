import { ProviderService } from "../providers/provider.service.js";
import type {
  OrderBookSnapshot,
  TradeTick,
} from "../providers/provider.types.js";

export class LiveMarketService {
  private providerService: ProviderService;

  constructor(providerService = ProviderService.getInstance()) {
    this.providerService = providerService;
  }

  public async getOrderBook(symbol: string): Promise<OrderBookSnapshot> {
    return this.providerService.getOrderBook(symbol);
  }

  public async getRecentTrades(
    symbol: string,
    limit = 25,
  ): Promise<TradeTick[]> {
    return this.providerService.getRecentTrades(symbol, limit);
  }
}
