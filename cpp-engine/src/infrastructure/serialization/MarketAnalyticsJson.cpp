#include "quantpulse/infrastructure/serialization/MarketAnalyticsJson.hpp"

#include <iomanip>
#include <sstream>

namespace quantpulse::infrastructure::serialization
{

    std::string MarketAnalyticsJson::serialize(
        const quantpulse::application::analytics::MarketAnalyticsReport &report)
    {
        std::ostringstream json;

        json << std::fixed << std::setprecision(6);

        json << "{"
             << "\"symbol\":\"" << report.symbol << "\","
             << "\"observationCount\":" << report.observationCount << ","
             << "\"firstPrice\":" << report.firstPrice << ","
             << "\"lastPrice\":" << report.lastPrice << ","
             << "\"totalVolume\":" << report.totalVolume << ","
             << "\"averageVolume\":" << report.averageVolume << ","
             << "\"returnPercentage\":" << report.returnPercentage << ","
             << "\"volatility\":" << report.volatility << ","
             << "\"series\":[";

        for (std::size_t i = 0; i < report.series.size(); ++i)
        {
            const auto &point = report.series[i];

            if (i > 0)
            {
                json << ",";
            }

            json << "{"
                 << "\"timestamp\":" << point.timestamp << ","
                 << "\"price\":" << point.price << ","
                 << "\"volume\":" << point.volume
                 << "}";
        }

        json << "]}";

        return json.str();
    }

} // namespace quantpulse::infrastructure::serialization