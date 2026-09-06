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
             << "\"volatility\":" << report.volatility
             << "}";

        return json.str();
    }

} // namespace quantpulse::infrastructure::serialization