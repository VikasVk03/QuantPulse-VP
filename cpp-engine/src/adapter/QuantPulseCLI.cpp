#include "quantpulse/application/analytics/MarketDataAnalytics.hpp"
#include "quantpulse/infrastructure/market_data/CsvMarketDataReader.hpp"
#include "quantpulse/infrastructure/serialization/MarketAnalyticsJson.hpp"
#include "quantpulse/infrastructure/serialization/MarketAnalyticsRequestJson.hpp"

#include <exception>
#include <iostream>
#include <iterator>
#include <string>

int main(int argc, char *argv[])
{
    if (argc == 2 && std::string(argv[1]) == "analyze-json")
    {
        try
        {
            const std::string input(
                (std::istreambuf_iterator<char>(std::cin)),
                std::istreambuf_iterator<char>());

            const auto request =
                quantpulse::infrastructure::serialization::
                    MarketAnalyticsRequestJson::parse(input);

            const auto report =
                quantpulse::application::analytics::
                    MarketDataAnalytics::analyze(
                        request.symbol,
                        request.bars);

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

    if (argc == 3 && std::string(argv[1]) == "analyze")
    {
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

    std::cerr
        << "Usage: quantpulse_cli analyze <market-data.csv> | quantpulse_cli analyze-json\n";

    return 1;
}
