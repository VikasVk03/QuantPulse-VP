#include "quantpulse/domain/backtest/BacktestEngine.hpp"

#include <gtest/gtest.h>

#include <cmath>
#include <limits>
#include <stdexcept>
#include <vector>

using quantpulse::domain::backtest::BacktestEngine;
using quantpulse::domain::backtest::MarketObservation;

TEST(
    BacktestEngineTest,
    PreservesCapitalWhenAlwaysFlat)
{
    const std::vector<MarketObservation> observations{
        {100.0, 0.0},
        {105.0, 0.0},
        {110.0, 0.0}};

    const auto result =
        BacktestEngine::run(
            observations,
            10000.0,
            0.5,
            0.001);

    EXPECT_DOUBLE_EQ(
        result.initialCapital,
        10000.0);

    EXPECT_DOUBLE_EQ(
        result.finalCapital,
        10000.0);

    EXPECT_DOUBLE_EQ(
        result.totalReturn,
        0.0);

    EXPECT_EQ(
        result.numberOfTrades,
        0U);
}

TEST(
    BacktestEngineTest,
    ProfitsFromLongPosition)
{
    const std::vector<MarketObservation> observations{
        {100.0, 1.0},
        {110.0, 1.0},
        {120.0, 1.0}};

    const auto result =
        BacktestEngine::run(
            observations,
            10000.0,
            0.5,
            0.0);

    EXPECT_NEAR(
        result.finalCapital,
        12000.0,
        1e-12);

    EXPECT_NEAR(
        result.totalReturn,
        0.20,
        1e-12);

    EXPECT_EQ(
        result.numberOfTrades,
        1U);
}

TEST(
    BacktestEngineTest,
    ExitsLongPositionWhenSignalFalls)
{
    const std::vector<MarketObservation> observations{
        {100.0, 1.0},
        {110.0, 1.0},
        {120.0, 0.0}};

    const auto result =
        BacktestEngine::run(
            observations,
            10000.0,
            0.5,
            0.0);

    EXPECT_NEAR(
        result.finalCapital,
        12000.0,
        1e-12);

    EXPECT_EQ(
        result.numberOfTrades,
        2U);
}

TEST(
    BacktestEngineTest,
    CalculatesTransactionCosts)
{
    const std::vector<MarketObservation> observations{
        {100.0, 1.0},
        {100.0, 0.0}};

    const auto result =
        BacktestEngine::run(
            observations,
            10000.0,
            0.5,
            0.01);

    EXPECT_LT(
        result.finalCapital,
        10000.0);

    EXPECT_EQ(
        result.numberOfTrades,
        2U);
}

TEST(
    BacktestEngineTest,
    BuildsEquityCurve)
{
    const std::vector<MarketObservation> observations{
        {100.0, 0.0},
        {101.0, 1.0},
        {102.0, 1.0},
        {103.0, 0.0}};

    const auto result =
        BacktestEngine::run(
            observations,
            10000.0,
            0.5,
            0.0);

    ASSERT_EQ(
        result.equityCurve.size(),
        observations.size());

    EXPECT_DOUBLE_EQ(
        result.equityCurve.front(),
        10000.0);

    EXPECT_DOUBLE_EQ(
        result.equityCurve.back(),
        result.finalCapital);
}

TEST(
    BacktestEngineTest,
    CalculatesMaximumDrawdown)
{
    const std::vector<MarketObservation> observations{
        {100.0, 1.0},
        {120.0, 1.0},
        {90.0, 1.0}};

    const auto result =
        BacktestEngine::run(
            observations,
            10000.0,
            0.5,
            0.0);

    EXPECT_NEAR(
        result.maximumDrawdown,
        -0.25,
        1e-12);
}

TEST(
    BacktestEngineTest,
    CalculatesSharpeRatioForVariableEquity)
{
    const std::vector<MarketObservation> observations{
        {100.0, 0.0},
        {100.0, 1.0},
        {110.0, 1.0},
        {100.0, 0.0}};

    const auto result =
        BacktestEngine::run(
            observations,
            10000.0,
            0.5,
            0.0);

    EXPECT_TRUE(
        std::isfinite(result.sharpeRatio));
}

TEST(
    BacktestEngineTest,
    ReturnsZeroSharpeForConstantEquity)
{
    const std::vector<MarketObservation> observations{
        {100.0, 0.0},
        {101.0, 0.0},
        {102.0, 0.0}};

    const auto result =
        BacktestEngine::run(
            observations,
            10000.0,
            0.5,
            0.0);

    EXPECT_DOUBLE_EQ(
        result.sharpeRatio,
        0.0);
}

TEST(
    BacktestEngineTest,
    ThrowsForEmptyObservations)
{
    EXPECT_THROW(
        BacktestEngine::run(
            {},
            10000.0,
            0.5,
            0.0),
        std::invalid_argument);
}

TEST(
    BacktestEngineTest,
    ThrowsForInvalidInitialCapital)
{
    const std::vector<MarketObservation> observations{
        {100.0, 1.0}};

    EXPECT_THROW(
        BacktestEngine::run(
            observations,
            0.0,
            0.5,
            0.0),
        std::invalid_argument);
}

TEST(
    BacktestEngineTest,
    ThrowsForNegativeTransactionCost)
{
    const std::vector<MarketObservation> observations{
        {100.0, 1.0}};

    EXPECT_THROW(
        BacktestEngine::run(
            observations,
            10000.0,
            0.5,
            -0.01),
        std::invalid_argument);
}

TEST(
    BacktestEngineTest,
    ThrowsForInvalidPrice)
{
    const std::vector<MarketObservation> observations{
        {0.0, 1.0}};

    EXPECT_THROW(
        BacktestEngine::run(
            observations,
            10000.0,
            0.5,
            0.0),
        std::invalid_argument);
}

TEST(
    BacktestEngineTest,
    ThrowsForNaNSignal)
{
    const std::vector<MarketObservation> observations{
        {100.0,
         std::numeric_limits<double>::quiet_NaN()}};

    EXPECT_THROW(
        BacktestEngine::run(
            observations,
            10000.0,
            0.5,
            0.0),
        std::invalid_argument);
}