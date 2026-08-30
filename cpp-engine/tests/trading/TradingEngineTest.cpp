#include "quantpulse/domain/trading/TradingEngine.hpp"

#include <gtest/gtest.h>

#include <limits>
#include <stdexcept>

namespace
{

    using quantpulse::domain::execution::
        OrderSide;

    using quantpulse::domain::strategy::
        Position;

    using quantpulse::domain::strategy::
        StrategyAction;

    using quantpulse::domain::trading::
        TradingConfig;

    using quantpulse::domain::trading::
        TradingEngine;

    using quantpulse::domain::trading::
        TradingRequest;

    TradingRequest createValidRequest()
    {
        return TradingRequest{
            0.50,           // signal
            Position::Flat, // currentPosition

            100000.0, // capital

            100.0, // entryPrice
            95.0,  // stopPrice

            500.0, // potentialLoss
            0.05   // currentDrawdown
        };
    }

    TradingConfig createValidConfig()
    {
        TradingConfig config{};

        config.entryThreshold =
            0.25;

        config.exitThreshold =
            -0.25;

        return config;
    }

} // namespace

TEST(
    TradingEngineTest,
    HoldProducesNoExecution)
{
    auto request =
        createValidRequest();

    request.signal = 0.0;

    const auto result =
        TradingEngine::evaluate(
            request,
            createValidConfig());

    EXPECT_EQ(
        result.strategyDecision.action,
        StrategyAction::Hold);

    EXPECT_EQ(
        result.strategyDecision.nextPosition,
        Position::Flat);

    EXPECT_DOUBLE_EQ(
        result.positionSizing.positionValue,
        0.0);

    EXPECT_DOUBLE_EQ(
        result.positionSizing.quantity,
        0.0);

    EXPECT_DOUBLE_EQ(
        result.positionSizing.allocatedCapital,
        0.0);

    EXPECT_TRUE(
        result.riskDecision.allowed);

    EXPECT_FALSE(
        result.executionDecision.shouldExecute);

    EXPECT_EQ(
        result.executionDecision.orderSide,
        OrderSide::None);
}

TEST(
    TradingEngineTest,
    ValidLongEntryExecutesBuyOrder)
{
    const auto result =
        TradingEngine::evaluate(
            createValidRequest(),
            createValidConfig());

    EXPECT_EQ(
        result.strategyDecision.action,
        StrategyAction::EnterLong);

    EXPECT_EQ(
        result.strategyDecision.nextPosition,
        Position::Long);

    EXPECT_TRUE(
        result.riskDecision.allowed);

    EXPECT_TRUE(
        result.executionDecision.shouldExecute);

    EXPECT_EQ(
        result.executionDecision.orderSide,
        OrderSide::Buy);
}

TEST(
    TradingEngineTest,
    ValidLongExitExecutesSellOrder)
{
    auto request =
        createValidRequest();

    request.signal =
        -0.50;

    request.currentPosition =
        Position::Long;

    const auto result =
        TradingEngine::evaluate(
            request,
            createValidConfig());

    EXPECT_EQ(
        result.strategyDecision.action,
        StrategyAction::ExitLong);

    EXPECT_EQ(
        result.strategyDecision.nextPosition,
        Position::Flat);

    EXPECT_TRUE(
        result.riskDecision.allowed);

    EXPECT_TRUE(
        result.executionDecision.shouldExecute);

    EXPECT_EQ(
        result.executionDecision.orderSide,
        OrderSide::Sell);
}

TEST(
    TradingEngineTest,
    PositionLimitRejectionBlocksExecution)
{
    auto request =
        createValidRequest();

    TradingConfig config =
        createValidConfig();

    config.sizingConfig
        .allocationFraction =
        0.50;

    config.sizingConfig
        .maximumAllocationFraction =
        1.0;

    config.riskManagementConfig
        .maximumPositionFraction =
        0.20;

    const auto result =
        TradingEngine::evaluate(
            request,
            config);

    EXPECT_FALSE(
        result.riskDecision.allowed);

    EXPECT_TRUE(
        result.riskDecision
            .positionLimitExceeded);

    EXPECT_FALSE(
        result.executionDecision
            .shouldExecute);

    EXPECT_EQ(
        result.executionDecision.orderSide,
        OrderSide::None);
}

TEST(
    TradingEngineTest,
    DrawdownLimitRejectionBlocksExecution)
{
    auto request =
        createValidRequest();

    request.currentDrawdown =
        0.20;

    TradingConfig config =
        createValidConfig();

    config.riskManagementConfig
        .maximumDrawdownFraction =
        0.15;

    const auto result =
        TradingEngine::evaluate(
            request,
            config);

    EXPECT_FALSE(
        result.riskDecision.allowed);

    EXPECT_TRUE(
        result.riskDecision
            .drawdownLimitExceeded);

    EXPECT_FALSE(
        result.executionDecision
            .shouldExecute);
}

TEST(
    TradingEngineTest,
    RiskLimitRejectionBlocksExecution)
{
    auto request =
        createValidRequest();

    request.potentialLoss =
        2000.0;

    TradingConfig config =
        createValidConfig();

    config.riskManagementConfig
        .maximumRiskPerTradeFraction =
        0.01;

    const auto result =
        TradingEngine::evaluate(
            request,
            config);

    EXPECT_FALSE(
        result.riskDecision.allowed);

    EXPECT_TRUE(
        result.riskDecision
            .riskLimitExceeded);

    EXPECT_FALSE(
        result.executionDecision
            .shouldExecute);
}

TEST(
    TradingEngineTest,
    MultipleRiskLimitsBlockExecution)
{
    auto request =
        createValidRequest();

    request.currentDrawdown =
        0.20;

    request.potentialLoss =
        2000.0;

    TradingConfig config =
        createValidConfig();

    config.sizingConfig
        .allocationFraction =
        0.50;

    config.riskManagementConfig
        .maximumPositionFraction =
        0.20;

    const auto result =
        TradingEngine::evaluate(
            request,
            config);

    EXPECT_FALSE(
        result.riskDecision.allowed);

    EXPECT_TRUE(
        result.riskDecision
            .positionLimitExceeded);

    EXPECT_TRUE(
        result.riskDecision
            .drawdownLimitExceeded);

    EXPECT_TRUE(
        result.riskDecision
            .riskLimitExceeded);

    EXPECT_FALSE(
        result.executionDecision
            .shouldExecute);
}

TEST(
    TradingEngineTest,
    PositionSizingResultFlowsCorrectly)
{
    const auto result =
        TradingEngine::evaluate(
            createValidRequest(),
            createValidConfig());

    /*
     * Default sizing configuration:
     *
     * allocationFraction = 0.10
     *
     * capital = 100000
     *
     * position value = 10000
     *
     * quantity = 10000 / 100
     *          = 100
     */
    EXPECT_DOUBLE_EQ(
        result.positionSizing.positionValue,
        10000.0);

    EXPECT_DOUBLE_EQ(
        result.positionSizing.allocatedCapital,
        10000.0);

    EXPECT_DOUBLE_EQ(
        result.positionSizing.quantity,
        100.0);
}

TEST(
    TradingEngineTest,
    StrategyStateTransitionIsPreserved)
{
    auto request =
        createValidRequest();

    request.currentPosition =
        Position::Flat;

    request.signal =
        0.50;

    const auto result =
        TradingEngine::evaluate(
            request,
            createValidConfig());

    EXPECT_EQ(
        result.strategyDecision.nextPosition,
        Position::Long);
}

TEST(
    TradingEngineTest,
    RejectsInvalidSignal)
{
    auto request =
        createValidRequest();

    request.signal =
        std::numeric_limits<double>::quiet_NaN();

    EXPECT_THROW(
        TradingEngine::evaluate(
            request,
            createValidConfig()),
        std::invalid_argument);
}

TEST(
    TradingEngineTest,
    RejectsInvalidCapitalForTrade)
{
    auto request =
        createValidRequest();

    request.capital =
        0.0;

    EXPECT_THROW(
        TradingEngine::evaluate(
            request,
            createValidConfig()),
        std::invalid_argument);
}

TEST(
    TradingEngineTest,
    RejectsInvalidEntryPriceForTrade)
{
    auto request =
        createValidRequest();

    request.entryPrice =
        0.0;

    EXPECT_THROW(
        TradingEngine::evaluate(
            request,
            createValidConfig()),
        std::invalid_argument);
}

TEST(
    TradingEngineTest,
    RejectsInvalidStopPriceForTrade)
{
    auto request =
        createValidRequest();

    request.stopPrice =
        -1.0;

    EXPECT_THROW(
        TradingEngine::evaluate(
            request,
            createValidConfig()),
        std::invalid_argument);
}

TEST(
    TradingEngineTest,
    RejectsInvalidEntryThreshold)
{
    TradingConfig config =
        createValidConfig();

    config.entryThreshold =
        std::numeric_limits<double>::infinity();

    EXPECT_THROW(
        TradingEngine::evaluate(
            createValidRequest(),
            config),
        std::invalid_argument);
}

TEST(
    TradingEngineTest,
    RejectsExitThresholdGreaterThanEntryThreshold)
{
    TradingConfig config =
        createValidConfig();

    config.entryThreshold =
        0.10;

    config.exitThreshold =
        0.20;

    EXPECT_THROW(
        TradingEngine::evaluate(
            createValidRequest(),
            config),
        std::invalid_argument);
}