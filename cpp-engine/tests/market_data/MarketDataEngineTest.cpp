#include "quantpulse/domain/market_data/MarketDataEngine.hpp"

#include <gtest/gtest.h>

#include <limits>
#include <stdexcept>

namespace
{

    using quantpulse::domain::market_data::
        MarketDataEngine;

    using quantpulse::domain::market_data::
        MarketObservation;

    TEST(
        MarketDataEngineTest,
        InitiallyHasNoData)
    {
        MarketDataEngine engine;

        EXPECT_FALSE(
            engine.hasData());
    }

    TEST(
        MarketDataEngineTest,
        StoresFirstValidObservation)
    {
        MarketDataEngine engine;

        const MarketObservation observation{
            1000,
            100.0,
            99.5,
            100.5,
            1000.0};

        engine.update(
            observation);

        EXPECT_TRUE(
            engine.hasData());

        const auto &latest =
            engine.latest();

        EXPECT_EQ(
            latest.timestamp,
            1000);

        EXPECT_DOUBLE_EQ(
            latest.price,
            100.0);

        EXPECT_DOUBLE_EQ(
            latest.bid,
            99.5);

        EXPECT_DOUBLE_EQ(
            latest.ask,
            100.5);

        EXPECT_DOUBLE_EQ(
            latest.volume,
            1000.0);
    }

    TEST(
        MarketDataEngineTest,
        UpdatesLatestObservation)
    {
        MarketDataEngine engine;

        engine.update(
            MarketObservation{
                1000,
                100.0,
                99.5,
                100.5,
                1000.0});

        engine.update(
            MarketObservation{
                2000,
                110.0,
                109.5,
                110.5,
                2000.0});

        const auto &latest =
            engine.latest();

        EXPECT_EQ(
            latest.timestamp,
            2000);

        EXPECT_DOUBLE_EQ(
            latest.price,
            110.0);

        EXPECT_DOUBLE_EQ(
            latest.bid,
            109.5);

        EXPECT_DOUBLE_EQ(
            latest.ask,
            110.5);

        EXPECT_DOUBLE_EQ(
            latest.volume,
            2000.0);
    }

    TEST(
        MarketDataEngineTest,
        AllowsZeroBidAndAsk)
    {
        MarketDataEngine engine;

        engine.update(
            MarketObservation{
                1000,
                100.0,
                0.0,
                0.0,
                100.0});

        EXPECT_TRUE(
            engine.hasData());

        EXPECT_DOUBLE_EQ(
            engine.latest().bid,
            0.0);

        EXPECT_DOUBLE_EQ(
            engine.latest().ask,
            0.0);
    }

    TEST(
        MarketDataEngineTest,
        AllowsZeroVolume)
    {
        MarketDataEngine engine;

        engine.update(
            MarketObservation{
                1000,
                100.0,
                99.0,
                101.0,
                0.0});

        EXPECT_DOUBLE_EQ(
            engine.latest().volume,
            0.0);
    }

    TEST(
        MarketDataEngineTest,
        AllowsAskEqualToBid)
    {
        MarketDataEngine engine;

        engine.update(
            MarketObservation{
                1000,
                100.0,
                100.0,
                100.0,
                500.0});

        EXPECT_DOUBLE_EQ(
            engine.latest().bid,
            engine.latest().ask);
    }

    TEST(
        MarketDataEngineTest,
        RejectsLatestWhenNoDataExists)
    {
        MarketDataEngine engine;

        EXPECT_THROW(
            engine.latest(),
            std::runtime_error);
    }

    TEST(
        MarketDataEngineTest,
        RejectsZeroPrice)
    {
        MarketDataEngine engine;

        EXPECT_THROW(
            engine.update(
                MarketObservation{
                    1000,
                    0.0,
                    99.0,
                    101.0,
                    100.0}),
            std::invalid_argument);
    }

    TEST(
        MarketDataEngineTest,
        RejectsNegativePrice)
    {
        MarketDataEngine engine;

        EXPECT_THROW(
            engine.update(
                MarketObservation{
                    1000,
                    -100.0,
                    99.0,
                    101.0,
                    100.0}),
            std::invalid_argument);
    }

    TEST(
        MarketDataEngineTest,
        RejectsNegativeBid)
    {
        MarketDataEngine engine;

        EXPECT_THROW(
            engine.update(
                MarketObservation{
                    1000,
                    100.0,
                    -99.0,
                    101.0,
                    100.0}),
            std::invalid_argument);
    }

    TEST(
        MarketDataEngineTest,
        RejectsNegativeAsk)
    {
        MarketDataEngine engine;

        EXPECT_THROW(
            engine.update(
                MarketObservation{
                    1000,
                    100.0,
                    99.0,
                    -101.0,
                    100.0}),
            std::invalid_argument);
    }

    TEST(
        MarketDataEngineTest,
        RejectsNegativeVolume)
    {
        MarketDataEngine engine;

        EXPECT_THROW(
            engine.update(
                MarketObservation{
                    1000,
                    100.0,
                    99.0,
                    101.0,
                    -100.0}),
            std::invalid_argument);
    }

    TEST(
        MarketDataEngineTest,
        RejectsAskBelowBid)
    {
        MarketDataEngine engine;

        EXPECT_THROW(
            engine.update(
                MarketObservation{
                    1000,
                    100.0,
                    101.0,
                    99.0,
                    100.0}),
            std::invalid_argument);
    }

    TEST(
        MarketDataEngineTest,
        RejectsEqualTimestamp)
    {
        MarketDataEngine engine;

        engine.update(
            MarketObservation{
                1000,
                100.0,
                99.0,
                101.0,
                100.0});

        EXPECT_THROW(
            engine.update(
                MarketObservation{
                    1000,
                    101.0,
                    100.0,
                    102.0,
                    200.0}),
            std::invalid_argument);
    }

    TEST(
        MarketDataEngineTest,
        RejectsOlderTimestamp)
    {
        MarketDataEngine engine;

        engine.update(
            MarketObservation{
                2000,
                100.0,
                99.0,
                101.0,
                100.0});

        EXPECT_THROW(
            engine.update(
                MarketObservation{
                    1000,
                    101.0,
                    100.0,
                    102.0,
                    200.0}),
            std::invalid_argument);
    }

    TEST(
        MarketDataEngineTest,
        RejectsNonFinitePrice)
    {
        MarketDataEngine engine;

        EXPECT_THROW(
            engine.update(
                MarketObservation{
                    1000,
                    std::numeric_limits<double>::
                        infinity(),
                    99.0,
                    101.0,
                    100.0}),
            std::invalid_argument);

        EXPECT_THROW(
            engine.update(
                MarketObservation{
                    2000,
                    std::numeric_limits<double>::
                        quiet_NaN(),
                    99.0,
                    101.0,
                    100.0}),
            std::invalid_argument);
    }

    TEST(
        MarketDataEngineTest,
        RejectsNonFiniteBid)
    {
        MarketDataEngine engine;

        EXPECT_THROW(
            engine.update(
                MarketObservation{
                    1000,
                    100.0,
                    std::numeric_limits<double>::
                        infinity(),
                    101.0,
                    100.0}),
            std::invalid_argument);
    }

    TEST(
        MarketDataEngineTest,
        RejectsNonFiniteAsk)
    {
        MarketDataEngine engine;

        EXPECT_THROW(
            engine.update(
                MarketObservation{
                    1000,
                    100.0,
                    99.0,
                    std::numeric_limits<double>::
                        quiet_NaN(),
                    100.0}),
            std::invalid_argument);
    }

    TEST(
        MarketDataEngineTest,
        RejectsNonFiniteVolume)
    {
        MarketDataEngine engine;

        EXPECT_THROW(
            engine.update(
                MarketObservation{
                    1000,
                    100.0,
                    99.0,
                    101.0,
                    std::numeric_limits<double>::
                        infinity()}),
            std::invalid_argument);
    }

} // namespace