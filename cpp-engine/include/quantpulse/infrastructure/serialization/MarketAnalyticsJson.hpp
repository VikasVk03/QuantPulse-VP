#pragma once

#include "quantpulse/application/analytics/MarketDataAnalytics.hpp"

#include <string>

namespace quantpulse::infrastructure::serialization
{

    class MarketAnalyticsJson
    {
    public:
        static std::string serialize(
            const quantpulse::application::analytics::MarketAnalyticsReport &report);
    };

} // namespace quantpulse::infrastructure::serialization