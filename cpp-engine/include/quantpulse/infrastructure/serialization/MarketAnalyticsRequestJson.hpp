#pragma once

#include "quantpulse/domain/market_data/MarketBar.hpp"

#include <string>
#include <vector>

namespace quantpulse::infrastructure::serialization
{

    struct MarketAnalyticsRequest
    {
        std::string symbol;

        std::vector<
            quantpulse::domain::market_data::MarketBar>
            bars;
    };

    class MarketAnalyticsRequestJson
    {
    public:
        static MarketAnalyticsRequest parse(
            const std::string &json);
    };

} // namespace quantpulse::infrastructure::serialization
