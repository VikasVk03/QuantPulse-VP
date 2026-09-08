#include "quantpulse/application/analytics/MarketDataAnalytics.hpp"
#include "quantpulse/infrastructure/market_data/CsvMarketDataReader.hpp"
#include "quantpulse/infrastructure/serialization/MarketAnalyticsJson.hpp"

#include <exception>
#include <iostream>
#include <string>

int main(int argc, char *argv[])
{
    if (argc != 3 || std::string(argv[1]) != "analyze")
    {
        std::cerr
            << "Usage: quantpulse_cli analyze <market-data.csv>\n";

        return 1;
    }

    try
    {
        const std::string filePath = argv[2];

        const auto dataset =
            quantpulse::infrastructure::market_data::
                CsvMarketDataReader::read(filePath);

        const auto report =
            quantpulse::application::analytics::
                MarketDataAnalytics::analyze(
                    dataset.symbol,
                    dataset.bars);

        std::cout
            << quantpulse::infrastructure::serialization::
                   MarketAnalyticsJson::serialize(report)
            << '\n';

        return 0;
    }
    catch (const std::exception &error)
    {
        std::cerr
            << "QuantPulse error: "
            << error.what()
            << '\n';

        return 1;
    }
}
