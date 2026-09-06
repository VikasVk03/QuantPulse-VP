#pragma once

#include "quantpulse/domain/market_data/MarketDataEngine.hpp"

#include <cstddef>
#include <string>
#include <vector>

namespace quantpulse::infrastructure::market_data
{

    class CsvMarketDataReader
    {
    public:
        static std::vector<
            quantpulse::domain::market_data::MarketObservation>
        read(const std::string &filePath);

    private:
        static quantpulse::domain::market_data::MarketObservation
        parseLine(
            const std::string &line,
            std::size_t lineNumber);
    };

} // namespace quantpulse::infrastructure::market_data