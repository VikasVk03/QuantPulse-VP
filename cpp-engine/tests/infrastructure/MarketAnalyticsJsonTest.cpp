#include "quantpulse/infrastructure/serialization/MarketAnalyticsJson.hpp"

#include <gtest/gtest.h>
#include <nlohmann/json.hpp>

#include <string>
#include <vector>

namespace quantpulse::infrastructure::serialization
{

    namespace
    {

        using Json = nlohmann::json;

        quantpulse::application::analytics::MarketAnalyticsReport
        createReport()
        {
            using quantpulse::application::analytics::MarketAnalyticsReport;

            MarketAnalyticsReport report;

            report.symbol = "TEST";
            report.observationCount = 2;
            report.firstPrice = 100.0;
            report.lastPrice = 110.0;
            report.totalVolume = 3000.0;
            report.averageVolume = 1500.0;
            report.returnPercentage = 10.0;
            report.volatility = 0.05;

            report.series = {
                {.timestamp = 1,
                 .open = 99.0,
                 .high = 101.0,
                 .low = 98.0,
                 .close = 100.0,
                 .volume = 1000.0},

                {.timestamp = 2,
                 .open = 100.0,
                 .high = 111.0,
                 .low = 99.0,
                 .close = 110.0,
                 .volume = 2000.0}};

            return report;
        }

    } // namespace

    TEST(MarketAnalyticsJsonTest, SerializesReport)
    {
        const auto report = createReport();

        const std::string json =
            MarketAnalyticsJson::serialize(report);

        const Json root =
            Json::parse(json);

        EXPECT_EQ(root["symbol"], "TEST");
        EXPECT_EQ(root["observationCount"], 2);

        EXPECT_DOUBLE_EQ(
            root["firstPrice"].get<double>(),
            100.0);

        EXPECT_DOUBLE_EQ(
            root["lastPrice"].get<double>(),
            110.0);

        EXPECT_DOUBLE_EQ(
            root["totalVolume"].get<double>(),
            3000.0);

        EXPECT_DOUBLE_EQ(
            root["averageVolume"].get<double>(),
            1500.0);

        EXPECT_DOUBLE_EQ(
            root["returnPercentage"].get<double>(),
            10.0);

        EXPECT_DOUBLE_EQ(
            root["volatility"].get<double>(),
            0.05);
    }

    TEST(MarketAnalyticsJsonTest, SerializesSeries)
    {
        const auto report = createReport();

        const Json root =
            Json::parse(
                MarketAnalyticsJson::serialize(report));

        ASSERT_TRUE(root.contains("series"));
        ASSERT_TRUE(root["series"].is_array());

        ASSERT_EQ(root["series"].size(), 2);

        const auto &first =
            root["series"][0];

        EXPECT_EQ(first["timestamp"], 1);

        EXPECT_DOUBLE_EQ(
            first["open"].get<double>(),
            99.0);

        EXPECT_DOUBLE_EQ(
            first["high"].get<double>(),
            101.0);

        EXPECT_DOUBLE_EQ(
            first["low"].get<double>(),
            98.0);

        EXPECT_DOUBLE_EQ(
            first["close"].get<double>(),
            100.0);

        EXPECT_DOUBLE_EQ(
            first["volume"].get<double>(),
            1000.0);
    }

    TEST(MarketAnalyticsJsonTest, SerializesEmptySeries)
    {
        auto report = createReport();

        report.series.clear();

        const Json root =
            Json::parse(
                MarketAnalyticsJson::serialize(report));

        ASSERT_TRUE(root.contains("series"));
        ASSERT_TRUE(root["series"].is_array());
        EXPECT_TRUE(root["series"].empty());
    }

    TEST(MarketAnalyticsJsonTest, EscapesSpecialCharacters)
    {
        auto report = createReport();

        report.symbol = "TEST\"SYMBOL";

        const std::string json =
            MarketAnalyticsJson::serialize(report);

        Json parsed;

        EXPECT_NO_THROW(
            parsed = Json::parse(json));

        EXPECT_EQ(
            parsed["symbol"].get<std::string>(),
            "TEST\"SYMBOL");
    }

} // namespace quantpulse::infrastructure::serialization
