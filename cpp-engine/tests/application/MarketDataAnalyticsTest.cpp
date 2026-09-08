#include "quantpulse/application/analytics/MarketDataAnalytics.hpp"

#include <gtest/gtest.h>

#include <stdexcept>
#include <vector>

namespace quantpulse::application::analytics
{

    TEST(MarketDataAnalyticsTest, CalculatesBasicMarketMetrics)
    {
        const std::vector<
            quantpulse::domain::market_data::MarketBar>
            bars{
                {.timestamp = 1,
                 .symbol = "TEST",
                 .open = 99.0,
                 .high = 101.0,
                 .low = 98.0,
                 .close = 100.0,
                 .volume = 1000.0},
                {.timestamp = 2,
                 .symbol = "TEST",
                 .open = 100.0,
                 .high = 111.0,
                 .low = 99.0,
                 .close = 110.0,
                 .volume = 2000.0},
                {.timestamp = 3,
                 .symbol = "TEST",
                 .open = 109.0,
                 .high = 112.0,
                 .low = 104.0,
                 .close = 105.0,
                 .volume = 3000.0}};

        const auto report =
            MarketDataAnalytics::analyze(
                "TEST", bars);

        EXPECT_EQ(report.symbol, "TEST");
        EXPECT_EQ(report.observationCount, 3);

        EXPECT_DOUBLE_EQ(report.firstPrice, 100.0);
        EXPECT_DOUBLE_EQ(report.lastPrice, 105.0);

        EXPECT_DOUBLE_EQ(report.totalVolume, 6000.0);
        EXPECT_DOUBLE_EQ(report.averageVolume, 2000.0);

        EXPECT_DOUBLE_EQ(report.returnPercentage, 5.0);

        EXPECT_GT(report.volatility, 0.0);

        EXPECT_EQ(report.series.size(), 3);
        EXPECT_DOUBLE_EQ(report.series[0].open, 99.0);
        EXPECT_DOUBLE_EQ(report.series[0].high, 101.0);
        EXPECT_DOUBLE_EQ(report.series[0].low, 98.0);
        EXPECT_DOUBLE_EQ(report.series[0].close, 100.0);
        EXPECT_DOUBLE_EQ(report.series[0].volume, 1000.0);
    }

    TEST(MarketDataAnalyticsTest, RejectsEmptySymbol)
    {
        const std::vector<
            quantpulse::domain::market_data::MarketBar>
            bars{
                {.timestamp = 1,
                 .symbol = "TEST",
                 .open = 100.0,
                 .high = 100.0,
                 .low = 100.0,
                 .close = 100.0,
                 .volume = 100.0}};

        EXPECT_THROW(
            MarketDataAnalytics::analyze("", bars),
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
