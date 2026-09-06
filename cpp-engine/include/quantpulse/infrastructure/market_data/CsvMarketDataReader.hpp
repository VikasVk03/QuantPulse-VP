#pragma once

#include "quantpulse/domain/market_data/MarketDataEngine.hpp"

#include <string>
#include <vector>

namespace quantpulse::infrastructure::market_data
{

    struct MarketDataset
    {
        std::string symbol;

        std::vector<
            quantpulse::domain::market_data::MarketObservation>
            observations;
    };

    class CsvMarketDataReader
    {
    public:
        static MarketDataset read(
            const std::string &filePath);
    };

} // namespace quantpulse::infrastructure::market_data