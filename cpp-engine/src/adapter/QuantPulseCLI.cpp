#include "quantpulse/application/analytics/MarketDataAnalytics.hpp"
#include "quantpulse/infrastructure/market_data/CsvMarketDataReader.hpp"

#include <exception>
#include <iomanip>
#include <iostream>
#include <string>

int main(int argc, char *argv[])
{
    if (argc != 3 ||
        std::string(argv[1]) != "analyze")
    {
        std::cerr
            << "Usage: quantpulse_cli analyze <market-data.csv>\n";

        return 1;
    }

    const std::string filePath = argv[2];

    try
    {
        const auto observations =
            quantpulse::infrastructure::market_data::
                CsvMarketDataReader::read(filePath);

        const auto report =
            quantpulse::application::analytics::
                MarketDataAnalytics::analyze(
                    "RELIANCE",
                    observations);

        std::cout
            << "\n"
            << "========================================\n"
            << "       QUANTPULSE MARKET ANALYSIS       \n"
            << "========================================\n"
            << "Symbol              "
            << report.symbol << '\n'
            << "Observations        "
            << report.observationCount << '\n'
            << "First Price         "
            << std::fixed
            << std::setprecision(2)
            << report.firstPrice << '\n'
            << "Last Price          "
            << report.lastPrice << '\n'
            << "Return (%)          "
            << report.returnPercentage << '\n'
            << "Total Volume        "
            << report.totalVolume << '\n'
            << "Average Volume      "
            << report.averageVolume << '\n'
            << "Volatility          "
            << report.volatility << '\n'
            << "========================================\n"
            << '\n';

        return 0;
    }
    catch (const std::exception &exception)
    {
        std::cerr
            << "QuantPulse error: "
            << exception.what()
            << '\n';

        return 1;
    }
}