import { useEffect, useState, useRef, useCallback } from "react";
import { getApiUrl } from "../config/env";
import { logger } from "../lib/logger";

export interface StreamQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  volume: number;
  timestamp: number;
}

export interface StreamOrderBookLevel {
  price: number;
  quantity: number;
  total: number;
  orderCount?: number;
}

export interface StreamOrderBook {
  symbol: string;
  bids: StreamOrderBookLevel[];
  asks: StreamOrderBookLevel[];
  spread: number;
  spreadBps: number;
  midPrice: number;
  microprice: number;
  depthImbalance: number;
  timestamp: number;
}

export interface StreamTrade {
  id: string;
  symbol: string;
  price: number;
  quantity: number;
  side: "BUY" | "SELL";
  timestamp: number;
}

export interface UseRealTimeMarketStreamOptions {
  symbol?: string;
  enabled?: boolean;
}

export function useRealTimeMarketStream(
  options: UseRealTimeMarketStreamOptions = {},
) {
  const { symbol = "RELIANCE", enabled = true } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");
  const [quotes, setQuotes] = useState<Record<string, StreamQuote>>({});
  const [orderBook, setOrderBook] = useState<StreamOrderBook | null>(null);
  const [recentTrades, setRecentTrades] = useState<StreamTrade[]>([]);
  const [activeProvider, setActiveProvider] = useState<string>("simulated");
  const [lastTickAt, setLastTickAt] = useState<number>(Date.now());
  const eventSourceRef = useRef<EventSource | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    if (!enabled) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    setConnectionStatus("connecting");
    const streamUrl = getApiUrl(`/api/realtime/stream?symbol=${encodeURIComponent(symbol)}`);
    const es = new EventSource(streamUrl);
    eventSourceRef.current = es;

    es.onopen = () => {
      setIsConnected(true);
      setConnectionStatus("connected");
      logger.info("SSE", `⚡ Connected to live market stream: ${streamUrl}`);
    };

    es.addEventListener("tick", (e: MessageEvent) => {
      try {
        const raw = JSON.parse(e.data);
        const list: StreamQuote[] = Array.isArray(raw) ? raw : [raw];
        setQuotes((prev) => {
          const next = { ...prev };
          for (const q of list) {
            next[q.symbol] = q;
          }
          return next;
        });
        setLastTickAt(Date.now());
        logger.sse("tick", list);
      } catch {}
    });

    es.addEventListener("orderbook", (e: MessageEvent) => {
      try {
        const book: StreamOrderBook = JSON.parse(e.data);
        if (!symbol || book.symbol.toUpperCase() === symbol.toUpperCase()) {
          setOrderBook(book);
        }
        setLastTickAt(Date.now());
        logger.sse("orderbook", { symbol: book.symbol, midPrice: book.midPrice, spread: book.spread });
      } catch {}
    });

    es.addEventListener("trade", (e: MessageEvent) => {
      try {
        const raw = JSON.parse(e.data);
        const incoming: StreamTrade[] = Array.isArray(raw) ? raw : [raw];
        setRecentTrades((prev) => {
          const combined = [...incoming, ...prev].slice(0, 30);
          return combined;
        });
        setLastTickAt(Date.now());
        logger.sse("trade", incoming);
      } catch {}
    });

    es.addEventListener("heartbeat", (e: MessageEvent) => {
      try {
        const hb = JSON.parse(e.data);
        if (hb.provider) {
          setActiveProvider(hb.provider);
        }
      } catch {}
    });

    es.onerror = () => {
      setIsConnected(false);
      setConnectionStatus("disconnected");
      logger.warn("SSE", "Stream connection lost. Retrying in 3 seconds...");
      es.close();
      // Retry in 3s
      retryTimeoutRef.current = setTimeout(() => {
        if (enabled) {
          connect();
        }
      }, 3000);
    };
  }, [enabled, symbol]);

  useEffect(() => {
    connect();
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [connect]);

  return {
    isConnected,
    connectionStatus,
    quotes,
    orderBook,
    recentTrades,
    activeProvider,
    lastTickAt,
    reconnect: connect,
  };
}
