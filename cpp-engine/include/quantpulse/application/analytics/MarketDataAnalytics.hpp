#pragma once

#include "quantpulse/domain/market_data/MarketDataEngine.hpp"

#include <cstddef>
#include <string>
#include <vector>

namespace quantpulse::application::analytics
{

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
    };

    class MarketDataAnalytics
    {
    public:
        static MarketAnalyticsReport analyze(
            const std::string &symbol,
            const std::vector<
                quantpulse::domain::market_data::MarketObservation> &
                observations);
    };

} // namespace quantpulse::application::analytics