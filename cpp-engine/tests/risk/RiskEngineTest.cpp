#include "quantpulse/domain/risk/RiskEngine.hpp"

#include <gtest/gtest.h>

#include <cmath>
#include <limits>
#include <stdexcept>
#include <vector>

using quantpulse::domain::risk::RiskEngine;

// ============================================================
// Sharpe Ratio
// ============================================================

TEST(RiskEngineTest, CalculatesSharpeRatio)
{
    const std::vector<double> returns{
        0.02,
        0.04,
        0.03,
        0.05};

    const double riskFreeRate = 0.01;

    const double meanExcessReturn =
        (0.01 + 0.03 + 0.02 + 0.04) / 4.0;

    const double expectedStandardDeviation =
        std::sqrt(
            (
                std::pow(0.01 - meanExcessReturn, 2) +
                std::pow(0.03 - meanExcessReturn, 2) +
                std::pow(0.02 - meanExcessReturn, 2) +
                std::pow(0.04 - meanExcessReturn, 2)) /
            3.0);

    const double expected =
        meanExcessReturn / expectedStandardDeviation;

    EXPECT_NEAR(
        RiskEngine::sharpeRatio(
            returns,
            riskFreeRate),
        expected,
        1e-12);
}

TEST(RiskEngineTest, CalculatesNegativeSharpeRatio)
{
    const std::vector<double> returns{
        0.01,
        0.02,
        0.015,
        0.005};

    const double riskFreeRate = 0.02;

    EXPECT_LT(
        RiskEngine::sharpeRatio(
            returns,
            riskFreeRate),
        0.0);
}

TEST(RiskEngineTest, ThrowsForZeroSharpeStandardDeviation)
{
    const std::vector<double> returns{
        0.02,
        0.02,
        0.02,
        0.02};

    EXPECT_THROW(
        RiskEngine::sharpeRatio(
            returns,
            0.01),
        std::invalid_argument);
}

// ============================================================
// Maximum Drawdown
// ============================================================

TEST(RiskEngineTest, CalculatesMaximumDrawdown)
{
    const std::vector<double> returns{
        0.10,
        -0.05,
        -0.10,
        0.20};

    EXPECT_NEAR(
        RiskEngine::maximumDrawdown(returns),
        -0.145,
        1e-12);
}

TEST(RiskEngineTest, ReturnsZeroForMonotonicallyIncreasingReturns)
{
    const std::vector<double> returns{
        0.10,
        0.05,
        0.20};

    EXPECT_DOUBLE_EQ(
        RiskEngine::maximumDrawdown(returns),
        0.0);
}

TEST(RiskEngineTest, ThrowsForCompleteLoss)
{
    const std::vector<double> returns{
        0.10,
        -1.0};

    EXPECT_THROW(
        RiskEngine::maximumDrawdown(returns),
        std::invalid_argument);
}

// ============================================================
// Downside Deviation
// ============================================================

TEST(RiskEngineTest, CalculatesDownsideDeviation)
{
    const std::vector<double> returns{
        0.02,
        -0.01,
        -0.03,
        0.04};

    const double targetReturn = 0.0;

    const double expected =
        std::sqrt(
            (
                0.0 +
                0.0001 +
                0.0009 +
                0.0) /
            4.0);

    EXPECT_NEAR(
        RiskEngine::downsideDeviation(
            returns,
            targetReturn),
        expected,
        1e-12);
}

// ============================================================
// Validation
// ============================================================

TEST(RiskEngineTest, ThrowsForEmptySharpeInput)
{
    const std::vector<double> returns;

    EXPECT_THROW(
        RiskEngine::sharpeRatio(
            returns,
            0.01),
        std::invalid_argument);
}

TEST(RiskEngineTest, ThrowsForEmptyDrawdownInput)
{
    const std::vector<double> returns;

    EXPECT_THROW(
        RiskEngine::maximumDrawdown(returns),
        std::invalid_argument);
}

TEST(RiskEngineTest, ThrowsForEmptyDownsideDeviationInput)
{
    const std::vector<double> returns;

    EXPECT_THROW(
        RiskEngine::downsideDeviation(
            returns,
            0.0),
        std::invalid_argument);
}

TEST(RiskEngineTest, ThrowsForNaNReturn)
{
    const std::vector<double> returns{
        0.01,
        std::numeric_limits<double>::quiet_NaN()};

    EXPECT_THROW(
        RiskEngine::sharpeRatio(
            returns,
            0.0),
        std::invalid_argument);
}

TEST(RiskEngineTest, ThrowsForInfiniteReturn)
{
    const std::vector<double> returns{
        0.01,
        std::numeric_limits<double>::infinity()};

    EXPECT_THROW(
        RiskEngine::maximumDrawdown(returns),
        std::invalid_argument);
}