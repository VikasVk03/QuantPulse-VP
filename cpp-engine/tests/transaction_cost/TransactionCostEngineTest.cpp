#include "quantpulse/domain/transaction_cost/TransactionCostEngine.hpp"

#include <gtest/gtest.h>

#include <limits>
#include <stdexcept>

namespace
{

    using quantpulse::domain::transaction_cost::
        TransactionCostConfig;

    using quantpulse::domain::transaction_cost::
        TransactionCostEngine;

    class TransactionCostEngineTest
        : public ::testing::Test
    {
    };

} // namespace

TEST_F(
    TransactionCostEngineTest,
    CalculatesZeroCostTransaction)
{
    const auto result =
        TransactionCostEngine::calculate(
            100.0,
            50.0);

    EXPECT_DOUBLE_EQ(
        result.notionalValue,
        5000.0);

    EXPECT_DOUBLE_EQ(
        result.fixedCommissionCost,
        0.0);

    EXPECT_DOUBLE_EQ(
        result.percentageCommissionCost,
        0.0);

    EXPECT_DOUBLE_EQ(
        result.spreadCost,
        0.0);

    EXPECT_DOUBLE_EQ(
        result.slippageCost,
        0.0);

    EXPECT_DOUBLE_EQ(
        result.totalCost,
        0.0);
}

TEST_F(
    TransactionCostEngineTest,
    CalculatesFixedCommission)
{
    TransactionCostConfig config;

    config.fixedCommission =
        10.0;

    const auto result =
        TransactionCostEngine::calculate(
            100.0,
            50.0,
            config);

    EXPECT_DOUBLE_EQ(
        result.fixedCommissionCost,
        10.0);

    EXPECT_DOUBLE_EQ(
        result.totalCost,
        10.0);
}

TEST_F(
    TransactionCostEngineTest,
    CalculatesPercentageCommission)
{
    TransactionCostConfig config;

    config.commissionRate =
        0.001;

    const auto result =
        TransactionCostEngine::calculate(
            100.0,
            50.0,
            config);

    EXPECT_DOUBLE_EQ(
        result.notionalValue,
        5000.0);

    EXPECT_DOUBLE_EQ(
        result.percentageCommissionCost,
        5.0);

    EXPECT_DOUBLE_EQ(
        result.totalCost,
        5.0);
}

TEST_F(
    TransactionCostEngineTest,
    CalculatesSpreadCost)
{
    TransactionCostConfig config;

    config.spreadFraction =
        0.002;

    const auto result =
        TransactionCostEngine::calculate(
            100.0,
            50.0,
            config);

    /*
     * 5000 * 0.002 * 0.5 = 5
     */
    EXPECT_DOUBLE_EQ(
        result.spreadCost,
        5.0);

    EXPECT_DOUBLE_EQ(
        result.totalCost,
        5.0);
}

TEST_F(
    TransactionCostEngineTest,
    CalculatesSlippageCost)
{
    TransactionCostConfig config;

    config.slippageFraction =
        0.001;

    const auto result =
        TransactionCostEngine::calculate(
            100.0,
            50.0,
            config);

    /*
     * 5000 * 0.001 = 5
     */
    EXPECT_DOUBLE_EQ(
        result.slippageCost,
        5.0);

    EXPECT_DOUBLE_EQ(
        result.totalCost,
        5.0);
}

TEST_F(
    TransactionCostEngineTest,
    CalculatesCombinedTransactionCosts)
{
    TransactionCostConfig config;

    config.fixedCommission =
        10.0;

    config.commissionRate =
        0.001;

    config.spreadFraction =
        0.002;

    config.slippageFraction =
        0.001;

    const auto result =
        TransactionCostEngine::calculate(
            100.0,
            50.0,
            config);

    /*
     * Notional:
     *
     * 100 * 50 = 5000
     *
     * Fixed commission:
     *
     * 10
     *
     * Percentage commission:
     *
     * 5000 * 0.001 = 5
     *
     * Spread:
     *
     * 5000 * 0.002 * 0.5 = 5
     *
     * Slippage:
     *
     * 5000 * 0.001 = 5
     *
     * Total:
     *
     * 10 + 5 + 5 + 5 = 25
     */
    EXPECT_DOUBLE_EQ(
        result.totalCost,
        25.0);
}

TEST_F(
    TransactionCostEngineTest,
    CalculatesLargeTransaction)
{
    TransactionCostConfig config;

    config.commissionRate =
        0.0005;

    const auto result =
        TransactionCostEngine::calculate(
            10000.0,
            250.0,
            config);

    EXPECT_DOUBLE_EQ(
        result.notionalValue,
        2500000.0);

    EXPECT_DOUBLE_EQ(
        result.percentageCommissionCost,
        1250.0);

    EXPECT_DOUBLE_EQ(
        result.totalCost,
        1250.0);
}

TEST_F(
    TransactionCostEngineTest,
    RejectsZeroQuantity)
{
    EXPECT_THROW(
        (void)
            TransactionCostEngine::calculate(
                0.0,
                50.0),
        std::invalid_argument);
}

TEST_F(
    TransactionCostEngineTest,
    RejectsNegativeQuantity)
{
    EXPECT_THROW(
        (void)
            TransactionCostEngine::calculate(
                -10.0,
                50.0),
        std::invalid_argument);
}

TEST_F(
    TransactionCostEngineTest,
    RejectsZeroExecutionPrice)
{
    EXPECT_THROW(
        (void)
            TransactionCostEngine::calculate(
                100.0,
                0.0),
        std::invalid_argument);
}

TEST_F(
    TransactionCostEngineTest,
    RejectsNegativeExecutionPrice)
{
    EXPECT_THROW(
        (void)
            TransactionCostEngine::calculate(
                100.0,
                -50.0),
        std::invalid_argument);
}

TEST_F(
    TransactionCostEngineTest,
    RejectsNonFiniteInputs)
{
    EXPECT_THROW(
        (void)
            TransactionCostEngine::calculate(
                std::numeric_limits<double>::
                    infinity(),
                50.0),
        std::invalid_argument);

    EXPECT_THROW(
        (void)
            TransactionCostEngine::calculate(
                100.0,
                std::numeric_limits<double>::
                    quiet_NaN()),
        std::invalid_argument);
}

TEST_F(
    TransactionCostEngineTest,
    RejectsNegativeFixedCommission)
{
    TransactionCostConfig config;

    config.fixedCommission =
        -1.0;

    EXPECT_THROW(
        (void)
            TransactionCostEngine::calculate(
                100.0,
                50.0,
                config),
        std::invalid_argument);
}

TEST_F(
    TransactionCostEngineTest,
    RejectsNegativeCommissionRate)
{
    TransactionCostConfig config;

    config.commissionRate =
        -0.001;

    EXPECT_THROW(
        (void)
            TransactionCostEngine::calculate(
                100.0,
                50.0,
                config),
        std::invalid_argument);
}

TEST_F(
    TransactionCostEngineTest,
    RejectsNegativeSpreadFraction)
{
    TransactionCostConfig config;

    config.spreadFraction =
        -0.001;

    EXPECT_THROW(
        (void)
            TransactionCostEngine::calculate(
                100.0,
                50.0,
                config),
        std::invalid_argument);
}

TEST_F(
    TransactionCostEngineTest,
    RejectsNegativeSlippageFraction)
{
    TransactionCostConfig config;

    config.slippageFraction =
        -0.001;

    EXPECT_THROW(
        (void)
            TransactionCostEngine::calculate(
                100.0,
                50.0,
                config),
        std::invalid_argument);
}

TEST_F(
    TransactionCostEngineTest,
    RejectsNonFiniteConfiguration)
{
    TransactionCostConfig config;

    config.commissionRate =
        std::numeric_limits<double>::
            infinity();

    EXPECT_THROW(
        (void)
            TransactionCostEngine::calculate(
                100.0,
                50.0,
                config),
        std::invalid_argument);
}

TEST_F(
    TransactionCostEngineTest,
    RejectsNonFiniteNotionalValue)
{
    EXPECT_THROW(
        (void)
            TransactionCostEngine::calculate(
                std::numeric_limits<double>::
                    max(),
                2.0),
        std::invalid_argument);
}