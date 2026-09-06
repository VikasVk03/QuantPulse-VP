#include "quantpulse/domain/execution/ExecutionEngine.hpp"

#include <gtest/gtest.h>

namespace
{
    using quantpulse::domain::execution::
        ExecutionEngine;

    using quantpulse::domain::execution::
        ExecutionStatus;

    using quantpulse::domain::execution::
        OrderSide;

    using quantpulse::domain::matching::
        MatchRequest;

    using quantpulse::domain::matching::
        MatchingEngine;

    using quantpulse::domain::matching::
        MatchResult;

    using quantpulse::domain::strategy::
        StrategyAction;

    using quantpulse::domain::order_book::
        OrderBookEngine;

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

    TEST(
        ExecutionEngineTest,
        ProcessesFullyFilledMatch)
    {
        MatchResult matchResult{};

        matchResult.requestedQuantity =
            25.0;

        matchResult.filledQuantity =
            25.0;

        matchResult.remainingQuantity =
            0.0;

        matchResult.averageFillPrice =
            101.6;

        const auto result =
            ExecutionEngine::process(
                matchResult);

        EXPECT_DOUBLE_EQ(
            result.requestedQuantity,
            25.0);

        EXPECT_DOUBLE_EQ(
            result.executedQuantity,
            25.0);

        EXPECT_DOUBLE_EQ(
            result.remainingQuantity,
            0.0);

        EXPECT_DOUBLE_EQ(
            result.averageExecutionPrice,
            101.6);

        EXPECT_EQ(
            result.status,
            ExecutionStatus::Filled);
    }

    TEST(
        ExecutionEngineTest,
        ProcessesPartiallyFilledMatch)
    {
        MatchResult matchResult{};

        matchResult.requestedQuantity =
            50.0;

        matchResult.filledQuantity =
            30.0;

        matchResult.remainingQuantity =
            20.0;

        matchResult.averageFillPrice =
            101.66666666666667;

        const auto result =
            ExecutionEngine::process(
                matchResult);

        EXPECT_DOUBLE_EQ(
            result.requestedQuantity,
            50.0);

        EXPECT_DOUBLE_EQ(
            result.executedQuantity,
            30.0);

        EXPECT_DOUBLE_EQ(
            result.remainingQuantity,
            20.0);

        EXPECT_DOUBLE_EQ(
            result.averageExecutionPrice,
            101.66666666666667);

        EXPECT_EQ(
            result.status,
            ExecutionStatus::PartiallyFilled);
    }

    TEST(
        ExecutionEngineTest,
        ProcessesUnfilledMatch)
    {
        MatchResult matchResult{};

        matchResult.requestedQuantity =
            50.0;

        matchResult.filledQuantity =
            0.0;

        matchResult.remainingQuantity =
            50.0;

        matchResult.averageFillPrice =
            0.0;

        const auto result =
            ExecutionEngine::process(
                matchResult);

        EXPECT_DOUBLE_EQ(
            result.requestedQuantity,
            50.0);

        EXPECT_DOUBLE_EQ(
            result.executedQuantity,
            0.0);

        EXPECT_DOUBLE_EQ(
            result.remainingQuantity,
            50.0);

        EXPECT_DOUBLE_EQ(
            result.averageExecutionPrice,
            0.0);

        EXPECT_EQ(
            result.status,
            ExecutionStatus::NoExecution);
    }

    TEST(
        ExecutionEngineTest,
        ProcessesMultiLevelMatchingResult)
    {
        OrderBookEngine book;

        book.updateAsk(
            101.0,
            10.0);

        book.updateAsk(
            102.0,
            20.0);

        MatchingEngine matchingEngine;

        const auto matchResult =
            matchingEngine.match(
                book,
                MatchRequest{
                    quantpulse::domain::matching::OrderSide::Buy,
                    25.0});

        const auto executionReport =
            ExecutionEngine::process(
                matchResult);

        EXPECT_DOUBLE_EQ(
            executionReport.requestedQuantity,
            25.0);

        EXPECT_DOUBLE_EQ(
            executionReport.executedQuantity,
            25.0);

        EXPECT_DOUBLE_EQ(
            executionReport.remainingQuantity,
            0.0);

        EXPECT_DOUBLE_EQ(
            executionReport.averageExecutionPrice,
            101.6);

        EXPECT_EQ(
            executionReport.status,
            ExecutionStatus::Filled);
    }

} // namespace