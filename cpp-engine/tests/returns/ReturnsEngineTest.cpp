#include "quantpulse/domain/returns/ReturnsEngine.hpp"

#include <gtest/gtest.h>

#include <cmath>
#include <stdexcept>
#include <vector>
#include <limits>

using quantpulse::domain::returns::ReturnsEngine;

// ============================================================
// * Simple Return
// ============================================================

TEST(ReturnsEngineTest, CalculatesSimpleReturn)
{
    EXPECT_NEAR(
        ReturnsEngine::simpleReturn(100.0, 105.0),
        0.05,
        1e-12);
}

TEST(ReturnsEngineTest, CalculatesNegativeSimpleReturn)
{
    EXPECT_NEAR(
        ReturnsEngine::simpleReturn(100.0, 95.0),
        -0.05,
        1e-12);
}

TEST(ReturnsEngineTest, CalculatesZeroSimpleReturn)
{
    EXPECT_DOUBLE_EQ(
        ReturnsEngine::simpleReturn(100.0, 100.0), 0);
}

// ============================================================
// * Log Return
// ============================================================

TEST(ReturnsEngineTest, CalculatesLogReturn)
{
    const double expected = std::log(105.0 / 100.0);

    EXPECT_DOUBLE_EQ(ReturnsEngine::logReturn(100.0, 105.0), expected);
}

TEST(ReturnsEngineTest, CalculatesNegativeLogReturn)
{
    const double expected = std::log(95.0 / 100.0);

    EXPECT_DOUBLE_EQ(ReturnsEngine::logReturn(100.0, 95.0), expected);
}

// ============================================================
// * Simple Return Series
// ============================================================

TEST(ReturnsEngineTest, CalculatesSimpleReturnSeries)
{
    const std::vector<double> prices{
        100.0,
        105.0,
        110.0};

    const auto returns = ReturnsEngine::simpleReturns(prices);

    ASSERT_EQ(returns.size(), 2);

    EXPECT_NEAR(returns[0], 0.05, 1e-12);

    EXPECT_NEAR(returns[1], 110.0 / 105.0 - 1.0, 1e-12);
}

// ============================================================
// * Log Return Series
// ============================================================

TEST(ReturnsEngineTest, CalculatesLogReturnSeries)
{
    const std::vector<double> prices{
        100.0,
        105.0,
        110.0};

    const auto returns = ReturnsEngine::logReturns(prices);

    ASSERT_EQ(returns.size(), 2);

    EXPECT_NEAR(
        returns[0],
        std::log(105.0 / 100.0),
        1e-12);

    EXPECT_NEAR(
        returns[1],
        std::log(110.0 / 105.0),
        1e-12);
}

// ============================================================
// * Cumulative Return
// ============================================================

TEST(ReturnsEngineTest, CalculatesCumulativeReturn)
{
    const std::vector<double> returns{
        0.10,
        -0.05};

    EXPECT_NEAR(
        ReturnsEngine::cumulativeReturn(returns),
        0.045,
        1e-12);
}

TEST(ReturnsEngineTest, CumulativeReturnsOfSingleReturn)
{
    const std::vector<double> returns{
        0.10};

    EXPECT_NEAR(
        ReturnsEngine::cumulativeReturn(returns),
        0.10,
        1e-12);
}

TEST(ReturnsEngineTest, AllowsCompleteLoss)
{
    const std::vector<double> returns{
        -1.0};

    EXPECT_DOUBLE_EQ(
        ReturnsEngine::cumulativeReturn(returns),
        -1.0);
}

TEST(ReturnsEngineTest, ThrowsForReturnLessThanNegativeOne)
{
    const std::vector<double> returns{
        -1.01};

    EXPECT_THROW(
        ReturnsEngine::cumulativeReturn(returns),
        std::invalid_argument);
}

TEST(ReturnsEngineTest, ThrowsForNaNCumulativeReturn)
{
    const std::vector<double> returns{
        std::numeric_limits<double>::quiet_NaN()};

    EXPECT_THROW(
        ReturnsEngine::cumulativeReturn(returns),
        std::invalid_argument);
}

TEST(ReturnsEngineTest, ThrowsForInfiniteCumulativeReturn)
{
    const std::vector<double> returns{
        std::numeric_limits<double>::infinity()};

    EXPECT_THROW(
        ReturnsEngine::cumulativeReturn(returns),
        std::invalid_argument);
}

// ============================================================
// * Validation
// ============================================================

TEST(ReturnsEngineTest, ThrowsForZeroPreviousPrice)
{
    EXPECT_THROW(
        (void)ReturnsEngine::simpleReturn(0.0, 100.0),
        std::invalid_argument);
}

TEST(ReturnsEngineTest, ThrowsForNegativePreviousPrice)
{
    EXPECT_THROW(
        (void)ReturnsEngine::simpleReturn(-100.0, 105.0),
        std::invalid_argument);
}

TEST(ReturnsEngineTest, ThrowsForZeroCurrentPrice)
{
    EXPECT_THROW(
        (void)ReturnsEngine::simpleReturn(100.0, 0.0),
        std::invalid_argument);
}

TEST(ReturnsEngineTest, ThrowsForNegativeCurrentPrice)
{
    EXPECT_THROW(
        (void)ReturnsEngine::simpleReturn(100.0, -105.0),
        std::invalid_argument);
}

TEST(ReturnsEngineTest, ThrowsForLogReturnWithInvalidPrice)
{
    EXPECT_THROW(
        (void)ReturnsEngine::logReturn(100.0, 0.0),
        std::invalid_argument);
}

TEST(ReturnsEngineTest, ThrowsForPriceSeriesWithLessThanTwoPrices)
{
    const std::vector<double> prices{
        100.0};

    EXPECT_THROW(
        ReturnsEngine::simpleReturns(prices),
        std::invalid_argument);
}

TEST(ReturnsEngineTest, ThrowsForEmptyPriceSeries)
{
    const std::vector<double> prices;

    EXPECT_THROW(
        ReturnsEngine::simpleReturns(prices),
        std::invalid_argument);
}

TEST(ReturnsEngineTest, ThrowsForEmptyLogPriceSeries)
{
    const std::vector<double> prices;

    EXPECT_THROW(
        ReturnsEngine::logReturns(prices),
        std::invalid_argument);
}

TEST(ReturnsEngineTest, ThrowsForNaNPreviousPrice)
{
    EXPECT_THROW(
        (void)ReturnsEngine::simpleReturn(
            std::numeric_limits<double>::quiet_NaN(),
            100.0),
        std::invalid_argument);
}

TEST(ReturnsEngineTest, ThrowsForInfinitePreviousPrice)
{
    EXPECT_THROW(
        (void)ReturnsEngine::simpleReturn(
            std::numeric_limits<double>::infinity(),
            100.0),
        std::invalid_argument);
}

TEST(ReturnsEngineTest, ThrowsForNaNCurrentPrice)
{
    EXPECT_THROW(
        (void)ReturnsEngine::simpleReturn(
            100.0,
            std::numeric_limits<double>::quiet_NaN()),
        std::invalid_argument);
}

TEST(ReturnsEngineTest, ThrowsForInfiniteCurrentPrice)
{
    EXPECT_THROW(
        (void)ReturnsEngine::simpleReturn(
            100.0,
            std::numeric_limits<double>::infinity()),
        std::invalid_argument);
}