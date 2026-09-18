#include "quantpulse/application/analytics/MarketDataAnalytics.hpp"

#include "quantpulse/domain/returns/ReturnsEngine.hpp"
#include "quantpulse/domain/volatility/VolatilityEngine.hpp"

#include <cmath>
#include <stdexcept>
#include <utility>
#include <vector>

namespace quantpulse::application::analytics
{

    MarketAnalyticsReport MarketDataAnalytics::analyze(
        const std::string &symbol,
        const std::vector<
            quantpulse::domain::market_data::MarketBar> &
            bars)
    {
        if (symbol.empty())
        {
            throw std::invalid_argument(
                "Symbol cannot be empty");
        }

        if (bars.empty())
        {
            throw std::invalid_argument(
                "Cannot analyze empty market data");
        }

        std::vector<double> prices;
        prices.reserve(bars.size());

        std::vector<MarketSeriesPoint> series;
        series.reserve(bars.size());

        double totalVolume = 0.0;

        std::int64_t previousTimestamp = 0;
        bool firstBar = true;

        for (const auto &bar : bars)
        {
            if (bar.symbol != symbol)
            {
                throw std::invalid_argument(
                    "Market bar symbol does not match requested symbol");
            }

            if (!std::isfinite(bar.open) ||
                !std::isfinite(bar.high) ||
                !std::isfinite(bar.low) ||
                !std::isfinite(bar.close) ||
                !std::isfinite(bar.volume))
            {
                throw std::invalid_argument(
                    "Market bar contains non-finite values");
            }

            if (bar.high < bar.low)
            {
                throw std::invalid_argument(
                    "Market bar high cannot be lower than low");
            }

            if (bar.open < bar.low ||
                bar.open > bar.high)
            {
                throw std::invalid_argument(
                    "Market bar open must be within high-low range");
            }

            if (bar.close < bar.low ||
                bar.close > bar.high)
            {
                throw std::invalid_argument(
                    "Market bar close must be within high-low range");
            }

            if (bar.volume < 0.0)
            {
                throw std::invalid_argument(
                    "Market bar volume cannot be negative");
            }

            if (!firstBar &&
                bar.timestamp <= previousTimestamp)
            {
                throw std::invalid_argument(
                    "Market bar timestamps must be strictly increasing");
            }

            previousTimestamp = bar.timestamp;
            firstBar = false;

            prices.push_back(bar.close);
            totalVolume += bar.volume;

            series.push_back(
                MarketSeriesPoint{
                    .timestamp = bar.timestamp,
                    .open = bar.open,
                    .high = bar.high,
                    .low = bar.low,
                    .close = bar.close,
                    .volume = bar.volume});
        }

        const double firstPrice = prices.front();
        const double lastPrice = prices.back();

        if (firstPrice == 0.0)
        {
            throw std::invalid_argument(
                "First price cannot be zero");
        }

        const double returnPercentage =
            ((lastPrice - firstPrice) / firstPrice) * 100.0;

        double volatility = 0.0;

        if (prices.size() >= 2)
        {
            const auto returns =
                quantpulse::domain::returns::ReturnsEngine::
                    simpleReturns(prices);

            if (returns.size() >= 2)
            {
                volatility =
                    quantpulse::domain::volatility::VolatilityEngine::
                        historicalVolatility(
                            returns,
                            252.0);
            }
        }

        return MarketAnalyticsReport{
            .symbol = symbol,
            .observationCount = bars.size(),
            .firstPrice = firstPrice,
            .lastPrice = lastPrice,
            .totalVolume = totalVolume,
            .averageVolume =
                totalVolume /
                static_cast<double>(bars.size()),
            .returnPercentage = returnPercentage,
            .volatility = volatility,
            .series = std::move(series)};
    }

} // namespace quantpulse::application::analytics
