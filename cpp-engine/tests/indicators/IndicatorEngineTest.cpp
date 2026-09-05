#include "quantpulse/domain/indicators/IndicatorEngine.hpp"

#include <gtest/gtest.h>

#include <cmath>
#include <limits>
#include <vector>

using quantpulse::domain::indicators::IndicatorEngine;

TEST(IndicatorEngineTest, CalculatesSimpleMovingAverage)
{
    const std::vector<double> prices{
        100.0, 102.0, 104.0, 106.0, 108.0};

    EXPECT_DOUBLE_EQ(
        IndicatorEngine::simpleMovingAverage(prices, 3),
        106.0);
}

TEST(IndicatorEngineTest, SimpleMovingAverageUsesLatestPeriod)
{
    const std::vector<double> prices{
        10.0, 20.0, 30.0, 40.0, 50.0};

    EXPECT_DOUBLE_EQ(
        IndicatorEngine::simpleMovingAverage(prices, 2),
        45.0);
}

TEST(IndicatorEngineTest, CalculatesExponentialMovingAverage)
{
    const std::vector<double> prices{
        10.0, 20.0, 30.0};

    const double result =
        IndicatorEngine::exponentialMovingAverage(prices, 2);

    EXPECT_NEAR(result, 25.5555555556, 1e-9);
}

TEST(IndicatorEngineTest, RSIIs100WhenThereAreOnlyGains)
{
    const std::vector<double> prices{
        100.0, 101.0, 102.0, 103.0, 104.0, 105.0};

    EXPECT_DOUBLE_EQ(
        IndicatorEngine::relativeStrengthIndex(prices, 3),
        100.0);
}

TEST(IndicatorEngineTest, RSIIs0WhenThereAreOnlyLosses)
{
    const std::vector<double> prices{
        105.0, 104.0, 103.0, 102.0, 101.0, 100.0};

    EXPECT_DOUBLE_EQ(
        IndicatorEngine::relativeStrengthIndex(prices, 3),
        0.0);
}

TEST(IndicatorEngineTest, RSIProducesExpectedValue)
{
    const std::vector<double> prices{
        100.0,
        102.0,
        101.0,
        103.0,
        104.0,
        102.0,
        105.0};

    const double result =
        IndicatorEngine::relativeStrengthIndex(prices, 3);

    EXPECT_NEAR(result, 73.9644970414, 1e-9);
}

TEST(IndicatorEngineTest, CalculatesMomentum)
{
    const std::vector<double> prices{
        100.0, 102.0, 105.0, 110.0};

    EXPECT_DOUBLE_EQ(
        IndicatorEngine::momentum(prices, 2),
        8.0);
}

TEST(IndicatorEngineTest, MomentumCanBeNegative)
{
    const std::vector<double> prices{
        110.0, 108.0, 105.0, 100.0};

    EXPECT_DOUBLE_EQ(
        IndicatorEngine::momentum(prices, 2),
        -8.0);
}

TEST(IndicatorEngineTest, RejectsEmptyPrices)
{
    EXPECT_THROW(
        (void)IndicatorEngine::simpleMovingAverage({}, 3),
        std::invalid_argument);
}

TEST(IndicatorEngineTest, RejectsZeroPeriod)
{
    const std::vector<double> prices{
        100.0, 101.0, 102.0};

    EXPECT_THROW(
        (void)IndicatorEngine::simpleMovingAverage(prices, 0),
        std::invalid_argument);
}

TEST(IndicatorEngineTest, RejectsInsufficientData)
{
    const std::vector<double> prices{
        100.0, 101.0};

    EXPECT_THROW(
        (void)IndicatorEngine::simpleMovingAverage(prices, 3),
        std::invalid_argument);
}

TEST(IndicatorEngineTest, RejectsNonFinitePrices)
{
    const std::vector<double> prices{
        100.0,
        std::numeric_limits<double>::quiet_NaN(),
        102.0};

    EXPECT_THROW(
        (void)IndicatorEngine::simpleMovingAverage(prices, 2),
        std::invalid_argument);
}

TEST(IndicatorEngineTest, RejectsInfinitePrices)
{
    const std::vector<double> prices{
        100.0,
        std::numeric_limits<double>::infinity(),
        102.0};

    EXPECT_THROW(
        (void)IndicatorEngine::exponentialMovingAverage(prices, 2),
        std::invalid_argument);
}

TEST(IndicatorEngineTest, RSIRequiresMoreDataThanPeriod)
{
    const std::vector<double> prices{
        100.0, 101.0, 102.0};

    EXPECT_THROW(
        (void)IndicatorEngine::relativeStrengthIndex(prices, 3),
        std::invalid_argument);
}

TEST(IndicatorEngineTest, MomentumRequiresMoreDataThanPeriod)
{
    const std::vector<double> prices{
        100.0, 101.0, 102.0};

    EXPECT_THROW(
        (void)IndicatorEngine::momentum(prices, 3),
        std::invalid_argument);
}