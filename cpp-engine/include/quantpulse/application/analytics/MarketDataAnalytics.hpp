#pragma once

#include "quantpulse/domain/market_data/MarketBar.hpp"

#include <cstddef>
#include <string>
#include <vector>

namespace quantpulse::application::analytics
{

    struct MarketSeriesPoint
    {
        std::int64_t timestamp = 0;
        double open = 0.0;
        double high = 0.0;
        double low = 0.0;
        double close = 0.0;
        double volume = 0.0;
    };
    struct MarketAnalyticsReport
    {
        std::string symbol;

        std::size_t observationCount = 0;

        double firstPrice = 0.0;
        double lastPrice = 0.0;

        double totalVolume = 0.0;
        double averageVolume = 0.0;

        double returnPercentage = 0.0;
        double volatility = 0.0;

        std::vector<MarketSeriesPoint> series;
    };

    class MarketDataAnalytics
    {
    public:
        static MarketAnalyticsReport analyze(
            const std::string &symbol,
            const std::vector<
                quantpulse::domain::market_data::MarketBar> &
                bars);
    };

} // namespace quantpulse::application::analytics
