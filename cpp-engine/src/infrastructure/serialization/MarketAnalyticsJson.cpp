#include "quantpulse/infrastructure/serialization/MarketAnalyticsJson.hpp"

#include <iomanip>
#include <sstream>
#include <string>

namespace quantpulse::infrastructure::serialization
{

    namespace
    {

        std::string escapeJsonString(
            const std::string &value)
        {
            std::ostringstream escaped;

            for (const unsigned char character : value)
            {
                switch (character)
                {
                case '"':
                    escaped << "\\\"";
                    break;
                case '\\':
                    escaped << "\\\\";
                    break;
                case '\b':
                    escaped << "\\b";
                    break;
                case '\f':
                    escaped << "\\f";
                    break;
                case '\n':
                    escaped << "\\n";
                    break;
                case '\r':
                    escaped << "\\r";
                    break;
                case '\t':
                    escaped << "\\t";
                    break;
                default:
                    if (character < 0x20)
                    {
                        escaped << "\\u00"
                                << std::hex
                                << std::setw(2)
                                << std::setfill('0')
                                << static_cast<int>(character)
                                << std::dec
                                << std::setfill(' ');
                    }
                    else
                    {
                        escaped << character;
                    }
                    break;
                }
            }

            return escaped.str();
        }

    } // namespace

    std::string MarketAnalyticsJson::serialize(
        const quantpulse::application::analytics::MarketAnalyticsReport &report)
    {
        std::ostringstream json;

        json << std::fixed << std::setprecision(6);

        json << "{"
             << "\"symbol\":\"" << escapeJsonString(report.symbol) << "\","
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
                 << "\"open\":" << point.open << ","
                 << "\"high\":" << point.high << ","
                 << "\"low\":" << point.low << ","
                 << "\"close\":" << point.close << ","
                 << "\"volume\":" << point.volume
                 << "}";
        }

        json << "]}";

        return json.str();
    }

} // namespace quantpulse::infrastructure::serialization
