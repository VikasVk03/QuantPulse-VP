import { useState } from "react";

import { fetchMarketAnalysis } from "../../features/market/market.api";

import type { MarketAnalyticsResult } from "../../features/market/market.types";

import { MetricCard } from "./MetricCard";
import { PriceChart } from "./PriceChart";

export function MarketDashboard() {
  const [data, setData] = useState<MarketAnalyticsResult | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchMarketAnalysis();

      setData(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to analyze market data.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="dashboard">
      <section className="page-heading">
        <div>
          <h1>Market Analysis</h1>

          <p>Analyze historical market data using the QuantPulse C++ engine.</p>
        </div>
      </section>

      <section className="controls">
        <div className="instrument-control">
          <label htmlFor="instrument">Instrument</label>

          <select id="instrument" defaultValue="RELIANCE">
            <option value="RELIANCE">RELIANCE</option>
          </select>
        </div>

        <button
          className="analyze-button"
          onClick={handleAnalyze}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </section>

      {error && <div className="error-banner">{error}</div>}

      {!data && !loading && !error && (
        <section className="empty-state">
          <div className="empty-icon">Q</div>

          <h2>Ready to analyze</h2>

          <p>Select an instrument and run the QuantPulse market analysis.</p>
        </section>
      )}

      {data && (
        <>
          <section className="metrics-grid">
            <MetricCard
              label="Last Price"
              value={`₹${data.lastPrice.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}`}
              detail={`${data.returnPercentage >= 0 ? "+" : ""}${data.returnPercentage.toFixed(2)}%`}
              positive={data.returnPercentage >= 0}
            />

            <MetricCard
              label="First Price"
              value={`₹${data.firstPrice.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}`}
            />

            <MetricCard
              label="Return"
              value={`${data.returnPercentage >= 0 ? "+" : ""}${data.returnPercentage.toFixed(2)}%`}
              positive={data.returnPercentage >= 0}
            />

            <MetricCard
              label="Volatility"
              value={`${(data.volatility * 100).toFixed(3)}%`}
            />

            <MetricCard
              label="Total Volume"
              value={`${(data.totalVolume / 1_000_000).toFixed(2)}M`}
              detail={data.totalVolume.toLocaleString("en-IN")}
            />

            <MetricCard
              label="Average Volume"
              value={`${(data.averageVolume / 1_000).toFixed(1)}K`}
              detail={data.averageVolume.toLocaleString("en-IN")}
            />

            <MetricCard
              label="Observations"
              value={data.observationCount.toString()}
            />
          </section>

          <section className="analysis-grid">
            <PriceChart series={data.series} />

            <div className="details-card">
              <h2>Analysis Details</h2>

              <div className="detail-row">
                <span>Symbol</span>
                <strong>{data.symbol}</strong>
              </div>

              <div className="detail-row">
                <span>Observations</span>
                <strong>{data.observationCount}</strong>
              </div>

              <div className="detail-row">
                <span>First Price</span>
                <strong>₹{data.firstPrice.toFixed(2)}</strong>
              </div>

              <div className="detail-row">
                <span>Last Price</span>
                <strong>₹{data.lastPrice.toFixed(2)}</strong>
              </div>

              <div className="detail-row">
                <span>Return</span>
                <strong>{data.returnPercentage.toFixed(2)}%</strong>
              </div>

              <div className="detail-row">
                <span>Volatility</span>
                <strong>{(data.volatility * 100).toFixed(3)}%</strong>
              </div>

              <div className="detail-row">
                <span>Total Volume</span>
                <strong>{data.totalVolume.toLocaleString("en-IN")}</strong>
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
