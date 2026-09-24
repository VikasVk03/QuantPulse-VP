#include "quantpulse/infrastructure/serialization/MarketAnalyticsRequestJson.hpp"

#include <gtest/gtest.h>

using quantpulse::infrastructure::serialization::
    MarketAnalyticsRequestJson;

TEST(MarketAnalyticsRequestJsonTest, ParsesValidRequest)
{
    const std::string json = R"({
        "symbol": "AAPL",
        "bars": [
            {
                "timestamp": 1000,
                "symbol": "AAPL",
                "open": 100.0,
                "high": 110.0,
                "low": 95.0,
                "close": 105.0,
                "volume": 10000.0
            },
            {
                "timestamp": 2000,
                "symbol": "AAPL",
                "open": 105.0,
                "high": 115.0,
                "low": 100.0,
                "close": 112.0,
                "volume": 12000.0
            }
        ]
    })";

    const auto request =
        MarketAnalyticsRequestJson::parse(json);

    EXPECT_EQ(request.symbol, "AAPL");
    ASSERT_EQ(request.bars.size(), 2);

    EXPECT_EQ(request.bars[0].timestamp, 1000);
    EXPECT_DOUBLE_EQ(request.bars[0].open, 100.0);
    EXPECT_DOUBLE_EQ(request.bars[0].high, 110.0);
    EXPECT_DOUBLE_EQ(request.bars[0].low, 95.0);
    EXPECT_DOUBLE_EQ(request.bars[0].close, 105.0);
    EXPECT_DOUBLE_EQ(request.bars[0].volume, 10000.0);
}

TEST(MarketAnalyticsRequestJsonTest, RejectsEmptyRequest)
{
    EXPECT_THROW(
        MarketAnalyticsRequestJson::parse(""),
        std::invalid_argument);
}

TEST(MarketAnalyticsRequestJsonTest, RejectsInvalidJson)
{
    EXPECT_THROW(
        MarketAnalyticsRequestJson::parse("{invalid"),
        std::invalid_argument);
}

TEST(MarketAnalyticsRequestJsonTest, RejectsMissingSymbol)
{
    const std::string json = R"({
        "bars": []
    })";

    EXPECT_THROW(
        MarketAnalyticsRequestJson::parse(json),
        std::invalid_argument);
}

TEST(MarketAnalyticsRequestJsonTest, RejectsEmptyBars)
{
    const std::string json = R"({
        "symbol": "AAPL",
        "bars": []
    })";

    EXPECT_THROW(
        MarketAnalyticsRequestJson::parse(json),
        std::invalid_argument);
}

TEST(MarketAnalyticsRequestJsonTest, RejectsSymbolMismatch)
{
    const std::string json = R"({
        "symbol": "AAPL",
        "bars": [
            {
                "timestamp": 1000,
                "symbol": "MSFT",
                "open": 100.0,
                "high": 110.0,
                "low": 95.0,
                "close": 105.0,
                "volume": 10000.0
            }
        ]
    })";

    EXPECT_THROW(
        MarketAnalyticsRequestJson::parse(json),
        std::invalid_argument);
}

TEST(MarketAnalyticsRequestJsonTest, RejectsInvalidHighLow)
{
    const std::string json = R"({
        "symbol": "AAPL",
        "bars": [
            {
                "timestamp": 1000,
                "symbol": "AAPL",
                "open": 100.0,
                "high": 90.0,
                "low": 95.0,
                "close": 100.0,
                "volume": 10000.0
            }
        ]
    })";

    EXPECT_THROW(
        MarketAnalyticsRequestJson::parse(json),
        std::invalid_argument);
}

TEST(MarketAnalyticsRequestJsonTest, RejectsNegativeVolume)
{
    const std::string json = R"({
        "symbol": "AAPL",
        "bars": [
            {
                "timestamp": 1000,
                "symbol": "AAPL",
                "open": 100.0,
                "high": 110.0,
                "low": 95.0,
                "close": 105.0,
                "volume": -100.0
            }
        ]
    })";

    EXPECT_THROW(
        MarketAnalyticsRequestJson::parse(json),
        std::invalid_argument);
}

TEST(MarketAnalyticsRequestJsonTest, RejectsNonIncreasingTimestamps)
{
    const std::string json = R"({
        "symbol": "AAPL",
        "bars": [
            {
                "timestamp": 2000,
                "symbol": "AAPL",
                "open": 100.0,
                "high": 110.0,
                "low": 95.0,
                "close": 105.0,
                "volume": 10000.0
            },
            {
                "timestamp": 1000,
                "symbol": "AAPL",
                "open": 105.0,
                "high": 115.0,
                "low": 100.0,
                "close": 112.0,
                "volume": 12000.0
            }
        ]
    })";

    EXPECT_THROW(
        MarketAnalyticsRequestJson::parse(json),
        std::invalid_argument);
}

TEST(MarketAnalyticsRequestJsonTest, ParsesValidRequestWithoutSymbolInBars)
{
    const std::string json = R"({
        "symbol": "RELIANCE",
        "bars": [
            {
                "timestamp": 1785748500000,
                "open": 1398.2,
                "high": 1400.1,
                "low": 1397.8,
                "close": 1399.5,
                "volume": 125000.0
            }
        ]
    })";

    const auto request =
        MarketAnalyticsRequestJson::parse(json);

    EXPECT_EQ(request.symbol, "RELIANCE");
    ASSERT_EQ(request.bars.size(), 1);
    EXPECT_EQ(request.bars[0].symbol, "RELIANCE");
    EXPECT_EQ(request.bars[0].timestamp, 1785748500000);
    EXPECT_DOUBLE_EQ(request.bars[0].open, 1398.2);
    EXPECT_DOUBLE_EQ(request.bars[0].high, 1400.1);
    EXPECT_DOUBLE_EQ(request.bars[0].low, 1397.8);
    EXPECT_DOUBLE_EQ(request.bars[0].close, 1399.5);
    EXPECT_DOUBLE_EQ(request.bars[0].volume, 125000.0);
}
