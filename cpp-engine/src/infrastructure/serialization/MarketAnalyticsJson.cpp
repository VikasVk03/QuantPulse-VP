#include "quantpulse/infrastructure/serialization/MarketAnalyticsJson.hpp"

#include <nlohmann/json.hpp>

#include <string>
#include <utility>

namespace quantpulse::infrastructure::serialization
{

    namespace
    {

        using Json = nlohmann::json;

    } // namespace

    std::string MarketAnalyticsJson::serialize(
        const quantpulse::application::analytics::MarketAnalyticsReport &report)
    {
        Json series = Json::array();

        for (const auto &point : report.series)
        {
            series.push_back({{"timestamp", point.timestamp},
                              {"open", point.open},
                              {"high", point.high},
                              {"low", point.low},
                              {"close", point.close},
                              {"volume", point.volume}});
        }

        Json root = {
            {"symbol", report.symbol},
            {"observationCount", report.observationCount},
            {"firstPrice", report.firstPrice},
            {"lastPrice", report.lastPrice},
            {"totalVolume", report.totalVolume},
            {"averageVolume", report.averageVolume},
            {"returnPercentage", report.returnPercentage},
            {"volatility", report.volatility},
            {"series", std::move(series)}};

        return root.dump();
    }

} // namespace quantpulse::infrastructure::serialization
