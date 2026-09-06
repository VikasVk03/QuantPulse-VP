#include "quantpulse/application/analytics/MarketDataAnalytics.hpp"

#include "quantpulse/domain/returns/ReturnsEngine.hpp"
#include "quantpulse/domain/volatility/VolatilityEngine.hpp"

#include <utility>
#include <stdexcept>
#include <vector>

namespace quantpulse::application::analytics
{

    MarketAnalyticsReport MarketDataAnalytics::analyze(
        const std::string &symbol,
        const std::vector<
            quantpulse::domain::market_data::MarketObservation> &
            observations)
    {
        if (symbol.empty())
        {
            throw std::invalid_argument(
                "Symbol cannot be empty");
        }

        if (observations.empty())
        {
            throw std::invalid_argument(
                "Cannot analyze empty market data");
        }

        std::vector<double> prices;
        prices.reserve(observations.size());

        double totalVolume = 0.0;

        std::vector<MarketSeriesPoint> series;
        series.reserve(observations.size());

        for (const auto &observation : observations)
        {
            prices.push_back(observation.price);
            totalVolume += observation.volume;

            series.push_back(
                MarketSeriesPoint{
                    .timestamp = observation.timestamp,
                    .price = observation.price,
                    .volume = observation.volume});
        }

        const double firstPrice = prices.front();
        const double lastPrice = prices.back();

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
            .observationCount = observations.size(),
            .firstPrice = firstPrice,
            .lastPrice = lastPrice,
            .totalVolume = totalVolume,
            .averageVolume =
                totalVolume /
                static_cast<double>(observations.size()),
            .returnPercentage = returnPercentage,
            .volatility = volatility,
            .series = std::move(series)};
    }

} // namespace quantpulse::application::analytics