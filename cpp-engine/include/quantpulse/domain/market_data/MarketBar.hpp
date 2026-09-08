#pragma once

#include <cstdint>
#include <string>

namespace quantpulse::domain::market_data
{

    struct MarketBar
    {
        std::int64_t timestamp = 0;
        std::string symbol;
        double open = 0.0;
        double high = 0.0;
        double low = 0.0;
        double close = 0.0;
        double volume = 0.0;
    };

} // namespace quantpulse::domain::market_data
