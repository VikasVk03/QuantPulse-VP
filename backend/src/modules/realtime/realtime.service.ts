import type { Response } from "express";
import { ProviderService } from "../providers/provider.service.js";
import { logger } from "../../shared/logger/logger.js";

export interface StreamEvent {
  type: "tick" | "orderbook" | "trade" | "signal" | "heartbeat";
  data: any;
  timestamp: number;
}

export class RealTimeStreamService {
  private static instance: RealTimeStreamService;
  private clients: Set<Response> = new Set();
  private timer: NodeJS.Timeout | null = null;
  private providerService: ProviderService;
  private activeSymbol = "RELIANCE";

  private constructor(providerService = ProviderService.getInstance()) {
    this.providerService = providerService;
    this.startStreamingLoop();
  }

  public static getInstance(): RealTimeStreamService {
    if (!RealTimeStreamService.instance) {
      RealTimeStreamService.instance = new RealTimeStreamService();
    }
    return RealTimeStreamService.instance;
  }

  public addClient(res: Response, symbol?: string): void {
    if (symbol) {
      this.activeSymbol = symbol.toUpperCase();
    }

    this.clients.add(res);
    logger.info("SSE:CONNECT", `Client connected to real-time stream (symbol: ${this.activeSymbol}, total clients: ${this.clients.size})`);

    // Send initial snapshot immediately
    void this.sendInitialSnapshot(res);

    res.on("close", () => {
      this.clients.delete(res);
      logger.info("SSE:DISCONNECT", `Client disconnected (remaining clients: ${this.clients.size})`);
    });
  }

  public removeClient(res: Response): void {
    this.clients.delete(res);
  }

  public getConnectedClientsCount(): number {
    return this.clients.size;
  }

  public setFocusSymbol(symbol: string): void {
    this.activeSymbol = symbol.toUpperCase();
  }

  private async sendInitialSnapshot(res: Response): Promise<void> {
    try {
      const quotes = await this.providerService.getQuotes([
        "RELIANCE",
        "TCS",
        "INFY",
        "HDFCBANK",
        "NIFTY50",
      ]);
      const orderbook = await this.providerService.getOrderBook(
        this.activeSymbol,
      );
      const trades = await this.providerService.getRecentTrades(
        this.activeSymbol,
        5,
      );

      this.sendEventToClient(res, {
        type: "tick",
        data: quotes,
        timestamp: Date.now(),
      });

      this.sendEventToClient(res, {
        type: "orderbook",
        data: orderbook,
        timestamp: Date.now(),
      });

      this.sendEventToClient(res, {
        type: "trade",
        data: trades,
        timestamp: Date.now(),
      });
    } catch {
      // client may have closed prematurely
    }
  }

  private startStreamingLoop(): void {
    if (this.timer) return;

    let cycle = 0;
    this.timer = setInterval(async () => {
      if (this.clients.size === 0) return;

      cycle++;
      const now = Date.now();

      try {
        // Broadcast quote ticks every 1.5s
        if (cycle % 3 === 0) {
          const quotes = await this.providerService.getQuotes([
            "RELIANCE",
            "TCS",
            "INFY",
            "HDFCBANK",
            "NIFTY50",
            "INDIAVIX",
          ]);
          this.broadcast({
            type: "tick",
            data: quotes,
            timestamp: now,
          });
        }

        // Broadcast order book depth update every 1s
        if (cycle % 2 === 0) {
          const orderbook = await this.providerService.getOrderBook(
            this.activeSymbol,
          );
          this.broadcast({
            type: "orderbook",
            data: orderbook,
            timestamp: now,
          });
        }

        // Broadcast new trade execution tick every 1.5s
        if (cycle % 3 === 1) {
          const trades = await this.providerService.getRecentTrades(
            this.activeSymbol,
            1,
          );
          if (trades.length > 0) {
            this.broadcast({
              type: "trade",
              data: trades[0],
              timestamp: now,
            });
          }
        }

        // Heartbeat keep-alive every 15s
        if (cycle % 30 === 0) {
          this.broadcast({
            type: "heartbeat",
            data: {
              status: "alive",
              provider: this.providerService.getActiveProviderType(),
            },
            timestamp: now,
          });
        }
      } catch {
        // gracefully handle transient provider error
      }
    }, 500);
  }

  public broadcast(event: StreamEvent): void {
    const payload = `event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`;
    for (const client of this.clients) {
      try {
        client.write(payload);
      } catch {
        this.clients.delete(client);
      }
    }
  }

  private sendEventToClient(client: Response, event: StreamEvent): void {
    try {
      client.write(
        `event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`,
      );
    } catch {
      this.clients.delete(client);
    }
  }
}
