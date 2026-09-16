#include "quantpulse/infrastructure/serialization/MarketAnalyticsRequestJson.hpp"

#include <nlohmann/json.hpp>

#include <cmath>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>

namespace quantpulse::infrastructure::serialization
{

    namespace
    {

        using Json = nlohmann::json;

        double requireFiniteNumber(
            const Json &object,
            const char *field)
        {
            if (!object.contains(field) ||
                !object[field].is_number())
            {
                throw std::invalid_argument(
                    std::string("Missing or invalid field: ") +
                    field);
            }

            const double value =
                object[field].get<double>();

            if (!std::isfinite(value))
            {
                throw std::invalid_argument(
                    std::string("Field must be finite: ") +
                    field);
            }

            return value;
        }

        std::int64_t requireTimestamp(
            const Json &object)
        {
            if (!object.contains("timestamp") ||
                !object["timestamp"].is_number_integer())
            {
                throw std::invalid_argument(
                    "Missing or invalid field: timestamp");
            }

            return object["timestamp"].get<std::int64_t>();
        }

        std::string requireString(
            const Json &object,
            const char *field)
        {
            if (!object.contains(field) ||
                !object[field].is_string())
            {
                throw std::invalid_argument(
                    std::string("Missing or invalid field: ") +
                    field);
            }

            const std::string value =
                object[field].get<std::string>();

            if (value.empty())
            {
                throw std::invalid_argument(
                    std::string("Field cannot be empty: ") +
                    field);
            }

            return value;
        }

    } // namespace

    MarketAnalyticsRequest
    MarketAnalyticsRequestJson::parse(
        const std::string &json)
    {
        if (json.empty())
        {
            throw std::invalid_argument(
                "Market analytics request cannot be empty.");
        }

        Json root;

        try
        {
            root = Json::parse(json);
        }
        catch (const Json::parse_error &error)
        {
            throw std::invalid_argument(
                std::string("Invalid JSON request: ") +
                error.what());
        }

        if (!root.is_object())
        {
            throw std::invalid_argument(
                "Market analytics request must be a JSON object.");
        }

        const std::string symbol =
            requireString(root, "symbol");

        if (!root.contains("bars") ||
            !root["bars"].is_array())
        {
            throw std::invalid_argument(
                "Missing or invalid field: bars");
        }

        const auto &jsonBars = root["bars"];

        if (jsonBars.empty())
        {
            throw std::invalid_argument(
                "Market analytics request contains no bars.");
        }

        std::vector<
            quantpulse::domain::market_data::MarketBar>
            bars;

        bars.reserve(jsonBars.size());

        std::int64_t previousTimestamp = 0;
        bool hasPreviousTimestamp = false;

        for (const auto &jsonBar : jsonBars)
        {
            if (!jsonBar.is_object())
            {
                throw std::invalid_argument(
                    "Each market bar must be a JSON object.");
            }

            quantpulse::domain::market_data::MarketBar bar;

            bar.timestamp =
                requireTimestamp(jsonBar);

            if (hasPreviousTimestamp &&
                bar.timestamp <= previousTimestamp)
            {
                throw std::invalid_argument(
                    "Market bar timestamps must be strictly increasing.");
            }

            previousTimestamp = bar.timestamp;
            hasPreviousTimestamp = true;
            
            bar.symbol =
                requireString(jsonBar, "symbol");

            if (bar.symbol != symbol)
            {
                throw std::invalid_argument(
                    "Market bar symbol does not match request symbol.");
            }

            bar.open =
                requireFiniteNumber(jsonBar, "open");

            bar.high =
                requireFiniteNumber(jsonBar, "high");

            bar.low =
                requireFiniteNumber(jsonBar, "low");

            bar.close =
                requireFiniteNumber(jsonBar, "close");

            bar.volume =
                requireFiniteNumber(jsonBar, "volume");

            bars.push_back(std::move(bar));

            if (bar.high < bar.low)
            {
                throw std::invalid_argument(
                    "Market bar high cannot be lower than low.");
            }

            if (bar.open < bar.low || bar.open > bar.high)
            {
                throw std::invalid_argument(
                    "Market bar open must be between low and high.");
            }

            if (bar.close < bar.low || bar.close > bar.high)
            {
                throw std::invalid_argument(
                    "Market bar close must be between low and high.");
            }

            if (bar.volume < 0.0)
            {
                throw std::invalid_argument(
                    "Market bar volume cannot be negative.");
            }
        }

        return MarketAnalyticsRequest{
            .symbol = symbol,
            .bars = std::move(bars),
        };
    }

} // namespace quantpulse::infrastructure::serialization
