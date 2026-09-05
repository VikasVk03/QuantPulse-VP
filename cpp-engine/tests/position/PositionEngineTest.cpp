#include "quantpulse/domain/position/PositionEngine.hpp"

#include <gtest/gtest.h>

#include <limits>
#include <stdexcept>

namespace
{

    using quantpulse::domain::position::PositionEngine;

    TEST(
        PositionEngineTest,
        InitializesFlatPosition)
    {
        PositionEngine engine;

        EXPECT_TRUE(
            engine.isFlat());

        EXPECT_DOUBLE_EQ(
            engine.state().quantity,
            0.0);

        EXPECT_DOUBLE_EQ(
            engine.state().averageEntryPrice,
            0.0);

        EXPECT_DOUBLE_EQ(
            engine.state().realizedPnL,
            0.0);
    }

    TEST(
        PositionEngineTest,
        BuyCreatesLongPosition)
    {
        PositionEngine engine;

        engine.buy(
            100.0,
            100.0);

        EXPECT_DOUBLE_EQ(
            engine.state().quantity,
            100.0);

        EXPECT_DOUBLE_EQ(
            engine.state().averageEntryPrice,
            100.0);

        EXPECT_DOUBLE_EQ(
            engine.state().realizedPnL,
            0.0);
    }

    TEST(
        PositionEngineTest,
        MultipleBuysCalculateWeightedAverage)
    {
        PositionEngine engine;

        engine.buy(
            100.0,
            100.0);

        engine.buy(
            200.0,
            110.0);

        EXPECT_DOUBLE_EQ(
            engine.state().quantity,
            300.0);

        EXPECT_DOUBLE_EQ(
            engine.state().averageEntryPrice,
            106.66666666666667);
    }

    TEST(
        PositionEngineTest,
        SellCalculatesRealizedPnL)
    {
        PositionEngine engine;

        engine.buy(
            100.0,
            100.0);

        engine.sell(
            40.0,
            120.0);

        EXPECT_DOUBLE_EQ(
            engine.state().quantity,
            60.0);

        EXPECT_DOUBLE_EQ(
            engine.state().averageEntryPrice,
            100.0);

        EXPECT_DOUBLE_EQ(
            engine.state().realizedPnL,
            800.0);
    }

    TEST(
        PositionEngineTest,
        LosingSellProducesNegativeRealizedPnL)
    {
        PositionEngine engine;

        engine.buy(
            100.0,
            100.0);

        engine.sell(
            25.0,
            80.0);

        EXPECT_DOUBLE_EQ(
            engine.state().quantity,
            75.0);

        EXPECT_DOUBLE_EQ(
            engine.state().realizedPnL,
            -500.0);
    }

    TEST(
        PositionEngineTest,
        FullSellFlattensPosition)
    {
        PositionEngine engine;

        engine.buy(
            100.0,
            100.0);

        engine.sell(
            100.0,
            120.0);

        EXPECT_TRUE(
            engine.isFlat());

        EXPECT_DOUBLE_EQ(
            engine.state().quantity,
            0.0);

        EXPECT_DOUBLE_EQ(
            engine.state().averageEntryPrice,
            0.0);

        EXPECT_DOUBLE_EQ(
            engine.state().realizedPnL,
            2000.0);
    }

    TEST(
        PositionEngineTest,
        SnapshotCalculatesUnrealizedPnL)
    {
        PositionEngine engine;

        engine.buy(
            100.0,
            100.0);

        const auto snapshot =
            engine.snapshot(
                120.0);

        EXPECT_DOUBLE_EQ(
            snapshot.quantity,
            100.0);

        EXPECT_DOUBLE_EQ(
            snapshot.averageEntryPrice,
            100.0);

        EXPECT_DOUBLE_EQ(
            snapshot.marketPrice,
            120.0);

        EXPECT_DOUBLE_EQ(
            snapshot.marketValue,
            12000.0);

        EXPECT_DOUBLE_EQ(
            snapshot.unrealizedPnL,
            2000.0);

        EXPECT_DOUBLE_EQ(
            snapshot.realizedPnL,
            0.0);

        EXPECT_DOUBLE_EQ(
            snapshot.totalPnL,
            2000.0);
    }

    TEST(
        PositionEngineTest,
        SnapshotCombinesRealizedAndUnrealizedPnL)
    {
        PositionEngine engine;

        engine.buy(
            100.0,
            100.0);

        engine.sell(
            25.0,
            120.0);

        const auto snapshot =
            engine.snapshot(
                110.0);

        EXPECT_DOUBLE_EQ(
            snapshot.quantity,
            75.0);

        EXPECT_DOUBLE_EQ(
            snapshot.realizedPnL,
            500.0);

        EXPECT_DOUBLE_EQ(
            snapshot.unrealizedPnL,
            750.0);

        EXPECT_DOUBLE_EQ(
            snapshot.totalPnL,
            1250.0);
    }

    TEST(
        PositionEngineTest,
        RejectsSellFromFlatPosition)
    {
        PositionEngine engine;

        EXPECT_THROW(
            engine.sell(
                10.0,
                100.0),
            std::invalid_argument);
    }

    TEST(
        PositionEngineTest,
        RejectsSellGreaterThanPosition)
    {
        PositionEngine engine;

        engine.buy(
            100.0,
            100.0);

        EXPECT_THROW(
            engine.sell(
                101.0,
                100.0),
            std::invalid_argument);
    }

    TEST(
        PositionEngineTest,
        RejectsZeroQuantityBuy)
    {
        PositionEngine engine;

        EXPECT_THROW(
            engine.buy(
                0.0,
                100.0),
            std::invalid_argument);
    }

    TEST(
        PositionEngineTest,
        RejectsNegativeQuantityBuy)
    {
        PositionEngine engine;

        EXPECT_THROW(
            engine.buy(
                -1.0,
                100.0),
            std::invalid_argument);
    }

    TEST(
        PositionEngineTest,
        RejectsInvalidExecutionPrice)
    {
        PositionEngine engine;

        EXPECT_THROW(
            engine.buy(
                10.0,
                0.0),
            std::invalid_argument);

        EXPECT_THROW(
            engine.buy(
                10.0,
                -100.0),
            std::invalid_argument);
    }

    TEST(
        PositionEngineTest,
        RejectsNonFiniteInputs)
    {
        PositionEngine engine;

        EXPECT_THROW(
            engine.buy(
                std::numeric_limits<double>::infinity(),
                100.0),
            std::invalid_argument);

        EXPECT_THROW(
            engine.buy(
                10.0,
                std::numeric_limits<double>::quiet_NaN()),
            std::invalid_argument);

        EXPECT_THROW(
            engine.sell(
                std::numeric_limits<double>::infinity(),
                100.0),
            std::invalid_argument);
    }

    TEST(
        PositionEngineTest,
        RejectsInvalidMarketPrice)
    {
        PositionEngine engine;

        engine.buy(
            10.0,
            100.0);

        EXPECT_THROW(
            engine.snapshot(
                0.0),
            std::invalid_argument);

        EXPECT_THROW(
            engine.snapshot(
                std::numeric_limits<double>::quiet_NaN()),
            std::invalid_argument);
    }

    TEST(
        PositionEngineTest,
        ResetClearsPosition)
    {
        PositionEngine engine;

        engine.buy(
            100.0,
            100.0);

        engine.sell(
            50.0,
            120.0);

        engine.reset();

        EXPECT_TRUE(
            engine.isFlat());

        EXPECT_DOUBLE_EQ(
            engine.state().quantity,
            0.0);

        EXPECT_DOUBLE_EQ(
            engine.state().averageEntryPrice,
            0.0);

        EXPECT_DOUBLE_EQ(
            engine.state().realizedPnL,
            0.0);
    }

} // namespace