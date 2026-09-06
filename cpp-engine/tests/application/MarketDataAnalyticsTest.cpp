#include "quantpulse/application/analytics/MarketDataAnalytics.hpp"

#include <gtest/gtest.h>

#include <stdexcept>
#include <vector>

namespace quantpulse::application::analytics
{

    TEST(MarketDataAnalyticsTest, CalculatesBasicMarketMetrics)
    {
        const std::vector<
            quantpulse::domain::market_data::MarketObservation>
            observations{
                {.timestamp = 1,
                 .price = 100.0,
                 .bid = 0.0,
                 .ask = 0.0,
                 .volume = 1000.0},
                {.timestamp = 2,
                 .price = 110.0,
                 .bid = 0.0,
                 .ask = 0.0,
                 .volume = 2000.0},
                {.timestamp = 3,
                 .price = 105.0,
                 .bid = 0.0,
                 .ask = 0.0,
                 .volume = 3000.0}};

        const auto report =
            MarketDataAnalytics::analyze(
                "TEST",
                observations);

        EXPECT_EQ(report.symbol, "TEST");
        EXPECT_EQ(report.observationCount, 3);

        EXPECT_DOUBLE_EQ(report.firstPrice, 100.0);
        EXPECT_DOUBLE_EQ(report.lastPrice, 105.0);

        EXPECT_DOUBLE_EQ(report.totalVolume, 6000.0);
        EXPECT_DOUBLE_EQ(report.averageVolume, 2000.0);

        EXPECT_DOUBLE_EQ(report.returnPercentage, 5.0);

        EXPECT_GT(report.volatility, 0.0);
    }

    TEST(MarketDataAnalyticsTest, RejectsEmptySymbol)
    {
        const std::vector<
            quantpulse::domain::market_data::MarketObservation>
            observations{
                {.timestamp = 1,
                 .price = 100.0,
                 .bid = 0.0,
                 .ask = 0.0,
                 .volume = 100.0}};

        EXPECT_THROW(
            MarketDataAnalytics::analyze("", observations),
            std::invalid_argument);
    }

    TEST(MarketDataAnalyticsTest, RejectsEmptyObservations)
    {
        EXPECT_THROW(
            MarketDataAnalytics::analyze(
                "TEST",
                {}),
            std::invalid_argument);
    }

} // namespace quantpulse::application::analytics