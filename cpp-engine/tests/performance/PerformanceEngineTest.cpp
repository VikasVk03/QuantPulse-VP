#include "quantpulse/domain/performance/PerformanceEngine.hpp"

#include <gtest/gtest.h>

#include <cmath>
#include <limits>
#include <stdexcept>
#include <vector>

namespace quantpulse::domain::performance
{

    TEST(PerformanceEngineTest, CalculatesTotalReturn)
    {
        const std::vector<double> equityCurve{
            100.0,
            110.0,
            120.0};

        const auto result =
            PerformanceEngine::evaluate(
                equityCurve,
                252.0,
                0.0,
                {});

        EXPECT_DOUBLE_EQ(
            result.totalReturn,
            0.2);
    }

    TEST(PerformanceEngineTest, CalculatesMaximumDrawdown)
    {
        const std::vector<double> equityCurve{
            100.0,
            120.0,
            90.0,
            110.0};

        const auto result =
            PerformanceEngine::evaluate(
                equityCurve,
                252.0,
                0.0,
                {});

        EXPECT_NEAR(
            result.maximumDrawdown,
            -0.25,
            1e-9);
    }

    TEST(PerformanceEngineTest, CalculatesTradeStatistics)
    {
        const std::vector<double> equityCurve{
            100.0,
            105.0};

        const std::vector<double> tradeReturns{
            0.10,
            -0.05,
            0.20,
            -0.10};

        const auto result =
            PerformanceEngine::evaluate(
                equityCurve,
                252.0,
                0.0,
                tradeReturns);

        EXPECT_EQ(
            result.numberOfTrades,
            4);

        EXPECT_EQ(
            result.winningTrades,
            2);

        EXPECT_EQ(
            result.losingTrades,
            2);

        EXPECT_DOUBLE_EQ(
            result.winRate,
            0.5);

        EXPECT_DOUBLE_EQ(
            result.averageTradeReturn,
            0.0375);

        EXPECT_DOUBLE_EQ(
            result.bestTradeReturn,
            0.20);

        EXPECT_DOUBLE_EQ(
            result.worstTradeReturn,
            -0.10);
    }

    TEST(PerformanceEngineTest, CalculatesProfitFactor)
    {
        const std::vector<double> equityCurve{
            100.0,
            110.0};

        const std::vector<double> tradeReturns{
            0.20,
            0.10,
            -0.05,
            -0.10};

        const auto result =
            PerformanceEngine::evaluate(
                equityCurve,
                252.0,
                0.0,
                tradeReturns);

        /*
         * Gross profit = 0.30
         * Gross loss = 0.15
         *
         * Profit factor = 2.0
         */

        EXPECT_DOUBLE_EQ(
            result.profitFactor,
            2.0);
    }

    TEST(PerformanceEngineTest, HandlesNoTrades)
    {
        const std::vector<double> equityCurve{
            100.0,
            105.0};

        const auto result =
            PerformanceEngine::evaluate(
                equityCurve,
                252.0,
                0.0,
                {});

        EXPECT_EQ(
            result.numberOfTrades,
            0);

        EXPECT_EQ(
            result.winningTrades,
            0);

        EXPECT_EQ(
            result.losingTrades,
            0);

        EXPECT_DOUBLE_EQ(
            result.winRate,
            0.0);

        EXPECT_DOUBLE_EQ(
            result.profitFactor,
            0.0);

        EXPECT_DOUBLE_EQ(
            result.averageTradeReturn,
            0.0);

        EXPECT_DOUBLE_EQ(
            result.bestTradeReturn,
            0.0);

        EXPECT_DOUBLE_EQ(
            result.worstTradeReturn,
            0.0);
    }

    TEST(PerformanceEngineTest, HandlesAllWinningTrades)
    {
        const std::vector<double> equityCurve{
            100.0,
            110.0};

        const std::vector<double> tradeReturns{
            0.10,
            0.20,
            0.05};

        const auto result =
            PerformanceEngine::evaluate(
                equityCurve,
                252.0,
                0.0,
                tradeReturns);

        EXPECT_EQ(
            result.winningTrades,
            3);

        EXPECT_EQ(
            result.losingTrades,
            0);

        EXPECT_DOUBLE_EQ(
            result.winRate,
            1.0);

        EXPECT_TRUE(
            std::isinf(
                result.profitFactor));
    }

    TEST(PerformanceEngineTest, HandlesFlatEquityCurve)
    {
        const std::vector<double> equityCurve{
            100.0,
            100.0,
            100.0};

        const auto result =
            PerformanceEngine::evaluate(
                equityCurve,
                252.0,
                0.0,
                {});

        EXPECT_DOUBLE_EQ(
            result.totalReturn,
            0.0);

        EXPECT_DOUBLE_EQ(
            result.volatility,
            0.0);

        EXPECT_DOUBLE_EQ(
            result.sharpeRatio,
            0.0);

        EXPECT_DOUBLE_EQ(
            result.sortinoRatio,
            0.0);

        EXPECT_DOUBLE_EQ(
            result.maximumDrawdown,
            0.0);
    }

    TEST(PerformanceEngineTest, CalculatesPositiveVolatility)
    {
        const std::vector<double> equityCurve{
            100.0,
            110.0,
            105.0,
            120.0,
            115.0};

        const auto result =
            PerformanceEngine::evaluate(
                equityCurve,
                252.0,
                0.0,
                {});

        EXPECT_GT(
            result.volatility,
            0.0);
    }

    TEST(PerformanceEngineTest, CalculatesSharpeRatio)
    {
        const std::vector<double> equityCurve{
            100.0,
            102.0,
            105.0,
            103.0,
            108.0,
            110.0};

        const auto result =
            PerformanceEngine::evaluate(
                equityCurve,
                252.0,
                0.0,
                {});

        EXPECT_TRUE(
            std::isfinite(
                result.sharpeRatio));
    }

    TEST(PerformanceEngineTest, CalculatesSortinoRatio)
    {
        const std::vector<double> equityCurve{
            100.0,
            105.0,
            102.0,
            110.0,
            108.0,
            115.0};

        const auto result =
            PerformanceEngine::evaluate(
                equityCurve,
                252.0,
                0.0,
                {});

        EXPECT_TRUE(
            std::isfinite(
                result.sortinoRatio));
    }

    TEST(PerformanceEngineTest, CalculatesAnnualizedReturn)
    {
        const std::vector<double> equityCurve{
            100.0,
            110.0};

        const auto result =
            PerformanceEngine::evaluate(
                equityCurve,
                1.0,
                0.0,
                {});

        EXPECT_NEAR(
            result.annualizedReturn,
            0.10,
            1e-9);
    }

    TEST(PerformanceEngineTest, CalculatesCalmarRatio)
    {
        const std::vector<double> equityCurve{
            100.0,
            120.0,
            90.0,
            110.0};

        const auto result =
            PerformanceEngine::evaluate(
                equityCurve,
                3.0,
                0.0,
                {});

        EXPECT_TRUE(
            std::isfinite(
                result.calmarRatio));
    }

    TEST(PerformanceEngineTest, ThrowsForEmptyEquityCurve)
    {
        EXPECT_THROW(
            PerformanceEngine::evaluate(
                {},
                252.0,
                0.0,
                {}),
            std::invalid_argument);
    }

    TEST(PerformanceEngineTest, ThrowsForZeroEquity)
    {
        const std::vector<double> equityCurve{
            100.0,
            0.0};

        EXPECT_THROW(
            PerformanceEngine::evaluate(
                equityCurve,
                252.0,
                0.0,
                {}),
            std::invalid_argument);
    }

    TEST(PerformanceEngineTest, ThrowsForNegativeEquity)
    {
        const std::vector<double> equityCurve{
            100.0,
            -10.0};

        EXPECT_THROW(
            PerformanceEngine::evaluate(
                equityCurve,
                252.0,
                0.0,
                {}),
            std::invalid_argument);
    }

    TEST(PerformanceEngineTest, ThrowsForInvalidPeriodsPerYear)
    {
        const std::vector<double> equityCurve{
            100.0,
            110.0};

        EXPECT_THROW(
            PerformanceEngine::evaluate(
                equityCurve,
                0.0,
                0.0,
                {}),
            std::invalid_argument);
    }

    TEST(PerformanceEngineTest, ThrowsForNegativePeriodsPerYear)
    {
        const std::vector<double> equityCurve{
            100.0,
            110.0};

        EXPECT_THROW(
            PerformanceEngine::evaluate(
                equityCurve,
                -252.0,
                0.0,
                {}),
            std::invalid_argument);
    }

    TEST(PerformanceEngineTest, ThrowsForInvalidRiskFreeRate)
    {
        const std::vector<double> equityCurve{
            100.0,
            110.0};

        EXPECT_THROW(
            PerformanceEngine::evaluate(
                equityCurve,
                252.0,
                std::numeric_limits<double>::quiet_NaN(),
                {}),
            std::invalid_argument);
    }

    TEST(PerformanceEngineTest, ThrowsForInvalidTradeReturn)
    {
        const std::vector<double> equityCurve{
            100.0,
            110.0};

        const std::vector<double> tradeReturns{
            0.10,
            std::numeric_limits<double>::quiet_NaN()};

        EXPECT_THROW(
            PerformanceEngine::evaluate(
                equityCurve,
                252.0,
                0.0,
                tradeReturns),
            std::invalid_argument);
    }

    TEST(PerformanceEngineTest, ThrowsForTradeReturnOfNegativeHundredPercent)
    {
        const std::vector<double> equityCurve{
            100.0,
            110.0};

        const std::vector<double> tradeReturns{
            -1.0};

        EXPECT_THROW(
            PerformanceEngine::evaluate(
                equityCurve,
                252.0,
                0.0,
                tradeReturns),
            std::invalid_argument);
    }

} // namespace quantpulse::domain::performance