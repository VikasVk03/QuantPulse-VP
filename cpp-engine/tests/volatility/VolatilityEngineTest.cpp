#include "quantpulse/domain/volatility/VolatilityEngine.hpp"

#include <gtest/gtest.h>

#include <cmath>
#include <limits>
#include <stdexcept>
#include <vector>

using quantpulse::domain::volatility::VolatilityEngine;

// ============================================================
// Historical Volatility
// ============================================================

TEST(VolatilityEngineTest, CalculatesAnnualizedHistoricalVolatility)
{
    const std::vector<double> returns{
        0.01,
        -0.02,
        0.015,
        0.005};

    const double expected =
        std::sqrt(0.000725 / 3.0) * std::sqrt(252.0);

    EXPECT_NEAR(
        VolatilityEngine::historicalVolatility(
            returns,
            252.0),
        expected,
        1e-12);
}

TEST(VolatilityEngineTest, CalculatesVolatilityWithCustomPeriodsPerYear)
{
    const std::vector<double> returns{
        0.01,
        -0.02,
        0.015,
        0.005};

    const double expected =
        std::sqrt(0.000725 / 3.0) * std::sqrt(12.0);

    EXPECT_NEAR(
        VolatilityEngine::historicalVolatility(
            returns,
            12.0),
        expected,
        1e-12);
}

// ============================================================
// Validation
// ============================================================

TEST(VolatilityEngineTest, ThrowsForEmptyReturns)
{
    const std::vector<double> returns;

    EXPECT_THROW(
        VolatilityEngine::historicalVolatility(
            returns,
            252.0),
        std::invalid_argument);
}

TEST(VolatilityEngineTest, ThrowsForSingleReturn)
{
    const std::vector<double> returns{
        0.01};

    EXPECT_THROW(
        VolatilityEngine::historicalVolatility(
            returns,
            252.0),
        std::invalid_argument);
}

TEST(VolatilityEngineTest, ThrowsForZeroPeriodsPerYear)
{
    const std::vector<double> returns{
        0.01,
        0.02};

    EXPECT_THROW(
        VolatilityEngine::historicalVolatility(
            returns,
            0.0),
        std::invalid_argument);
}

TEST(VolatilityEngineTest, ThrowsForNegativePeriodsPerYear)
{
    const std::vector<double> returns{
        0.01,
        0.02};

    EXPECT_THROW(
        VolatilityEngine::historicalVolatility(
            returns,
            -252.0),
        std::invalid_argument);
}

TEST(VolatilityEngineTest, ThrowsForNaNReturn)
{
    const std::vector<double> returns{
        0.01,
        std::numeric_limits<double>::quiet_NaN()};

    EXPECT_THROW(
        VolatilityEngine::historicalVolatility(
            returns,
            252.0),
        std::invalid_argument);
}

TEST(VolatilityEngineTest, ThrowsForInfiniteReturn)
{
    const std::vector<double> returns{
        0.01,
        std::numeric_limits<double>::infinity()};

    EXPECT_THROW(
        VolatilityEngine::historicalVolatility(
            returns,
            252.0),
        std::invalid_argument);
}

TEST(VolatilityEngineTest, CalculatesZeroVolatility)
{
    const std::vector<double> returns{
        0.01,
        0.01,
        0.01,
        0.01};

    EXPECT_DOUBLE_EQ(
        VolatilityEngine::historicalVolatility(
            returns,
            252.0),
        0.0);
}

TEST(VolatilityEngineTest, ScalesWithSquareRootOfPeriods)
{
    const std::vector<double> returns{
        0.01,
        -0.02,
        0.015,
        0.005};

    const double daily =
        VolatilityEngine::historicalVolatility(
            returns,
            1.0);

    const double annual =
        VolatilityEngine::historicalVolatility(
            returns,
            252.0);

    EXPECT_NEAR(
        annual,
        daily * std::sqrt(252.0),
        1e-12);
}