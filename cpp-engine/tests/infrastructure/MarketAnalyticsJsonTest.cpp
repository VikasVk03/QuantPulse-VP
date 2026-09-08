#include "quantpulse/infrastructure/serialization/MarketAnalyticsJson.hpp"

#include <gtest/gtest.h>

namespace
{

    using quantpulse::application::analytics::
        MarketAnalyticsReport;
    using quantpulse::infrastructure::serialization::
        MarketAnalyticsJson;

    TEST(MarketAnalyticsJsonTest, SerializesOhlcvFields)
    {
        MarketAnalyticsReport report{
            .symbol = "RELIANCE",
            .observationCount = 1,
            .firstPrice = 103.0,
            .lastPrice = 103.0,
            .totalVolume = 1000.0,
            .averageVolume = 1000.0,
            .returnPercentage = 0.0,
            .volatility = 0.0,
            .series = {{.timestamp = 1,
                        .open = 100.0,
                        .high = 105.0,
                        .low = 99.0,
                        .close = 103.0,
                        .volume = 1000.0}}};

        const auto json = MarketAnalyticsJson::serialize(report);

        EXPECT_NE(json.find("\"open\":100.000000"),
                  std::string::npos);
        EXPECT_NE(json.find("\"high\":105.000000"),
                  std::string::npos);
        EXPECT_NE(json.find("\"low\":99.000000"),
                  std::string::npos);
        EXPECT_NE(json.find("\"close\":103.000000"),
                  std::string::npos);
        EXPECT_NE(json.find("\"volume\":1000.000000"),
                  std::string::npos);
    }

    TEST(MarketAnalyticsJsonTest, EscapesSymbol)
    {
        MarketAnalyticsReport report{
            .symbol = "A\"B\\C\nD",
            .series = {}};

        const auto json = MarketAnalyticsJson::serialize(report);

        EXPECT_NE(json.find("\"symbol\":\"A\\\"B\\\\C\\nD\""),
                  std::string::npos);
    }

} // namespace
