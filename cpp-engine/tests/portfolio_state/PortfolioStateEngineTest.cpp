#include "quantpulse/domain/portfolio_state/PortfolioStateEngine.hpp"

#include <gtest/gtest.h>

#include <limits>
#include <stdexcept>

namespace
{

    using quantpulse::domain::portfolio_state::
        PortfolioSnapshot;

    using quantpulse::domain::portfolio_state::
        PortfolioState;

    using quantpulse::domain::portfolio_state::
        PortfolioStateEngine;

    TEST(
        PortfolioStateEngineTest,
        InitializesEmptyPortfolio)
    {
        const auto state =
            PortfolioStateEngine::initialize(
                100000.0);

        EXPECT_DOUBLE_EQ(
            state.cash,
            100000.0);

        EXPECT_DOUBLE_EQ(
            state.quantity,
            0.0);

        EXPECT_DOUBLE_EQ(
            state.averageEntryPrice,
            0.0);

        EXPECT_DOUBLE_EQ(
            state.realizedPnL,
            0.0);
    }

    TEST(
        PortfolioStateEngineTest,
        BuyReducesCashAndIncreasesQuantity)
    {
        const auto state =
            PortfolioStateEngine::initialize(
                100000.0);

        const auto updated =
            PortfolioStateEngine::buy(
                state,
                100.0,
                500.0);

        EXPECT_DOUBLE_EQ(
            updated.cash,
            50000.0);

        EXPECT_DOUBLE_EQ(
            updated.quantity,
            100.0);

        EXPECT_DOUBLE_EQ(
            updated.averageEntryPrice,
            500.0);

        EXPECT_DOUBLE_EQ(
            updated.realizedPnL,
            0.0);
    }

    TEST(
        PortfolioStateEngineTest,
        MultipleBuysUpdateWeightedAveragePrice)
    {
        auto state =
            PortfolioStateEngine::initialize(
                100000.0);

        state =
            PortfolioStateEngine::buy(
                state,
                100.0,
                100.0);

        state =
            PortfolioStateEngine::buy(
                state,
                100.0,
                200.0);

        EXPECT_DOUBLE_EQ(
            state.quantity,
            200.0);

        EXPECT_DOUBLE_EQ(
            state.averageEntryPrice,
            150.0);
    }

    TEST(
        PortfolioStateEngineTest,
        PartialSellUpdatesCashAndRealizedPnL)
    {
        auto state =
            PortfolioStateEngine::initialize(
                100000.0);

        state =
            PortfolioStateEngine::buy(
                state,
                100.0,
                100.0);

        const auto updated =
            PortfolioStateEngine::sell(
                state,
                40.0,
                150.0);

        EXPECT_DOUBLE_EQ(
            updated.cash,
            96000.0);

        EXPECT_DOUBLE_EQ(
            updated.quantity,
            60.0);

        EXPECT_DOUBLE_EQ(
            updated.averageEntryPrice,
            100.0);

        EXPECT_DOUBLE_EQ(
            updated.realizedPnL,
            2000.0);
    }

    TEST(
        PortfolioStateEngineTest,
        FullSellResetsEntryPrice)
    {
        auto state =
            PortfolioStateEngine::initialize(
                100000.0);

        state =
            PortfolioStateEngine::buy(
                state,
                100.0,
                100.0);

        const auto updated =
            PortfolioStateEngine::sell(
                state,
                100.0,
                120.0);

        EXPECT_DOUBLE_EQ(
            updated.quantity,
            0.0);

        EXPECT_DOUBLE_EQ(
            updated.averageEntryPrice,
            0.0);

        EXPECT_DOUBLE_EQ(
            updated.realizedPnL,
            2000.0);
    }

    TEST(
        PortfolioStateEngineTest,
        CalculatesPortfolioSnapshot)
    {
        auto state =
            PortfolioStateEngine::initialize(
                100000.0);

        state =
            PortfolioStateEngine::buy(
                state,
                100.0,
                100.0);

        const auto snapshot =
            PortfolioStateEngine::snapshot(
                state,
                120.0);

        EXPECT_DOUBLE_EQ(
            snapshot.marketValue,
            12000.0);

        EXPECT_DOUBLE_EQ(
            snapshot.unrealizedPnL,
            2000.0);

        EXPECT_DOUBLE_EQ(
            snapshot.totalEquity,
            102000.0);
    }

    TEST(
        PortfolioStateEngineTest,
        SnapshotIncludesRealizedPnL)
    {
        auto state =
            PortfolioStateEngine::initialize(
                100000.0);

        state =
            PortfolioStateEngine::buy(
                state,
                100.0,
                100.0);

        state =
            PortfolioStateEngine::sell(
                state,
                50.0,
                120.0);

        const auto snapshot =
            PortfolioStateEngine::snapshot(
                state,
                110.0);

        EXPECT_DOUBLE_EQ(
            snapshot.realizedPnL,
            1000.0);

        EXPECT_DOUBLE_EQ(
            snapshot.unrealizedPnL,
            500.0);
    }

    TEST(
        PortfolioStateEngineTest,
        RejectsInsufficientCash)
    {
        const auto state =
            PortfolioStateEngine::initialize(
                1000.0);

        EXPECT_THROW(
            PortfolioStateEngine::buy(
                state,
                100.0,
                100.0),
            std::invalid_argument);
    }

    TEST(
        PortfolioStateEngineTest,
        RejectsInsufficientQuantity)
    {
        auto state =
            PortfolioStateEngine::initialize(
                100000.0);

        state =
            PortfolioStateEngine::buy(
                state,
                10.0,
                100.0);

        EXPECT_THROW(
            PortfolioStateEngine::sell(
                state,
                20.0,
                100.0),
            std::invalid_argument);
    }

    TEST(
        PortfolioStateEngineTest,
        RejectsInvalidInitialCapital)
    {
        EXPECT_THROW(
            PortfolioStateEngine::initialize(
                0.0),
            std::invalid_argument);

        EXPECT_THROW(
            PortfolioStateEngine::initialize(
                -1000.0),
            std::invalid_argument);
    }

    TEST(
        PortfolioStateEngineTest,
        RejectsInvalidBuyInputs)
    {
        const auto state =
            PortfolioStateEngine::initialize(
                100000.0);

        EXPECT_THROW(
            PortfolioStateEngine::buy(
                state,
                0.0,
                100.0),
            std::invalid_argument);

        EXPECT_THROW(
            PortfolioStateEngine::buy(
                state,
                10.0,
                0.0),
            std::invalid_argument);
    }

    TEST(
        PortfolioStateEngineTest,
        RejectsInvalidSellInputs)
    {
        auto state =
            PortfolioStateEngine::initialize(
                100000.0);

        state =
            PortfolioStateEngine::buy(
                state,
                10.0,
                100.0);

        EXPECT_THROW(
            PortfolioStateEngine::sell(
                state,
                0.0,
                100.0),
            std::invalid_argument);

        EXPECT_THROW(
            PortfolioStateEngine::sell(
                state,
                5.0,
                0.0),
            std::invalid_argument);
    }

    TEST(
        PortfolioStateEngineTest,
        RejectsInvalidMarketPrice)
    {
        const auto state =
            PortfolioStateEngine::initialize(
                100000.0);

        EXPECT_THROW(
            PortfolioStateEngine::snapshot(
                state,
                0.0),
            std::invalid_argument);
    }

    TEST(
        PortfolioStateEngineTest,
        RejectsNonFiniteInputs)
    {
        const double nan =
            std::numeric_limits<double>::quiet_NaN();

        const double infinity =
            std::numeric_limits<double>::infinity();

        EXPECT_THROW(
            PortfolioStateEngine::initialize(
                nan),
            std::invalid_argument);

        const auto state =
            PortfolioStateEngine::initialize(
                100000.0);

        EXPECT_THROW(
            PortfolioStateEngine::buy(
                state,
                infinity,
                100.0),
            std::invalid_argument);

        EXPECT_THROW(
            PortfolioStateEngine::snapshot(
                state,
                nan),
            std::invalid_argument);
    }

    TEST(
        PortfolioStateEngineTest,
        RejectsInvalidPortfolioState)
    {
        const PortfolioState invalidState{
            1000.0,
            0.0,
            100.0,
            0.0};

        EXPECT_THROW(
            PortfolioStateEngine::snapshot(
                invalidState,
                100.0),
            std::invalid_argument);
    }

} // namespace