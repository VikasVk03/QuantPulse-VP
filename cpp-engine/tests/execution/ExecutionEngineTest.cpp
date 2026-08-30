#include "quantpulse/domain/execution/ExecutionEngine.hpp"

#include <gtest/gtest.h>

namespace
{

    using quantpulse::domain::execution::
        ExecutionEngine;

    using quantpulse::domain::execution::
        OrderSide;

    using quantpulse::domain::strategy::
        StrategyAction;

    TEST(
        ExecutionEngineTest,
        HoldProducesNoOrder)
    {
        const auto result =
            ExecutionEngine::evaluate(
                StrategyAction::Hold);

        EXPECT_EQ(
            result.orderSide,
            OrderSide::None);

        EXPECT_FALSE(
            result.shouldExecute);
    }

    TEST(
        ExecutionEngineTest,
        EnterLongProducesBuyOrder)
    {
        const auto result =
            ExecutionEngine::evaluate(
                StrategyAction::EnterLong);

        EXPECT_EQ(
            result.orderSide,
            OrderSide::Buy);

        EXPECT_TRUE(
            result.shouldExecute);
    }

    TEST(
        ExecutionEngineTest,
        ExitLongProducesSellOrder)
    {
        const auto result =
            ExecutionEngine::evaluate(
                StrategyAction::ExitLong);

        EXPECT_EQ(
            result.orderSide,
            OrderSide::Sell);

        EXPECT_TRUE(
            result.shouldExecute);
    }

} // namespace