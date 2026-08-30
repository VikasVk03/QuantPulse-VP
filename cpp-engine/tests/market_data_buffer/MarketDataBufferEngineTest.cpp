#include "quantpulse/domain/market_data_buffer/MarketDataBufferEngine.hpp"

#include <gtest/gtest.h>

#include <limits>
#include <stdexcept>

namespace
{

    using quantpulse::domain::market_data::
        MarketObservation;

    using quantpulse::domain::market_data_buffer::
        MarketDataBufferEngine;

    MarketObservation createObservation(
        std::int64_t timestamp,
        double price = 100.0,
        double bid = 99.5,
        double ask = 100.5,
        double volume = 1000.0)
    {
        return MarketObservation{
            timestamp,
            price,
            bid,
            ask,
            volume};
    }

    TEST(
        MarketDataBufferEngineTest,
        CreatesEmptyBuffer)
    {
        MarketDataBufferEngine buffer(
            3);

        EXPECT_TRUE(
            buffer.empty());

        EXPECT_EQ(
            buffer.size(),
            0U);

        EXPECT_EQ(
            buffer.capacity(),
            3U);
    }

    TEST(
        MarketDataBufferEngineTest,
        StoresSingleObservation)
    {
        MarketDataBufferEngine buffer(
            3);

        buffer.push(
            createObservation(
                1000));

        EXPECT_FALSE(
            buffer.empty());

        EXPECT_EQ(
            buffer.size(),
            1U);

        const auto &latest =
            buffer.latest();

        EXPECT_EQ(
            latest.timestamp,
            1000);

        EXPECT_DOUBLE_EQ(
            latest.price,
            100.0);
    }

    TEST(
        MarketDataBufferEngineTest,
        StoresMultipleObservations)
    {
        MarketDataBufferEngine buffer(
            3);

        buffer.push(
            createObservation(
                1000));

        buffer.push(
            createObservation(
                2000,
                110.0));

        buffer.push(
            createObservation(
                3000,
                120.0));

        EXPECT_EQ(
            buffer.size(),
            3U);

        EXPECT_EQ(
            buffer.at(0).timestamp,
            1000);

        EXPECT_EQ(
            buffer.at(1).timestamp,
            2000);

        EXPECT_EQ(
            buffer.at(2).timestamp,
            3000);
    }

    TEST(
        MarketDataBufferEngineTest,
        LatestReturnsNewestObservation)
    {
        MarketDataBufferEngine buffer(
            3);

        buffer.push(
            createObservation(
                1000));

        buffer.push(
            createObservation(
                2000,
                110.0));

        const auto &latest =
            buffer.latest();

        EXPECT_EQ(
            latest.timestamp,
            2000);

        EXPECT_DOUBLE_EQ(
            latest.price,
            110.0);
    }

    TEST(
        MarketDataBufferEngineTest,
        RemovesOldestObservationWhenFull)
    {
        MarketDataBufferEngine buffer(
            3);

        buffer.push(
            createObservation(
                1000));

        buffer.push(
            createObservation(
                2000));

        buffer.push(
            createObservation(
                3000));

        buffer.push(
            createObservation(
                4000));

        EXPECT_EQ(
            buffer.size(),
            3U);

        EXPECT_EQ(
            buffer.at(0).timestamp,
            2000);

        EXPECT_EQ(
            buffer.at(1).timestamp,
            3000);

        EXPECT_EQ(
            buffer.at(2).timestamp,
            4000);
    }

    TEST(
        MarketDataBufferEngineTest,
        LatestUpdatesAfterCapacityOverflow)
    {
        MarketDataBufferEngine buffer(
            2);

        buffer.push(
            createObservation(
                1000));

        buffer.push(
            createObservation(
                2000));

        buffer.push(
            createObservation(
                3000,
                150.0));

        EXPECT_EQ(
            buffer.size(),
            2U);

        EXPECT_EQ(
            buffer.latest().timestamp,
            3000);

        EXPECT_DOUBLE_EQ(
            buffer.latest().price,
            150.0);
    }

    TEST(
        MarketDataBufferEngineTest,
        ClearsAllObservations)
    {
        MarketDataBufferEngine buffer(
            3);

        buffer.push(
            createObservation(
                1000));

        buffer.push(
            createObservation(
                2000));

        buffer.clear();

        EXPECT_TRUE(
            buffer.empty());

        EXPECT_EQ(
            buffer.size(),
            0U);
    }

    TEST(
        MarketDataBufferEngineTest,
        CanReuseBufferAfterClear)
    {
        MarketDataBufferEngine buffer(
            3);

        buffer.push(
            createObservation(
                1000));

        buffer.clear();

        buffer.push(
            createObservation(
                2000));

        EXPECT_EQ(
            buffer.size(),
            1U);

        EXPECT_EQ(
            buffer.latest().timestamp,
            2000);
    }

    TEST(
        MarketDataBufferEngineTest,
        RejectsZeroCapacity)
    {
        EXPECT_THROW(
            MarketDataBufferEngine(
                0),
            std::invalid_argument);
    }

    TEST(
        MarketDataBufferEngineTest,
        RejectsLatestFromEmptyBuffer)
    {
        MarketDataBufferEngine buffer(
            3);

        EXPECT_THROW(
            buffer.latest(),
            std::runtime_error);
    }

    TEST(
        MarketDataBufferEngineTest,
        RejectsInvalidIndex)
    {
        MarketDataBufferEngine buffer(
            3);

        buffer.push(
            createObservation(
                1000));

        EXPECT_THROW(
            buffer.at(
                1),
            std::out_of_range);
    }

    TEST(
        MarketDataBufferEngineTest,
        RejectsAccessFromEmptyBuffer)
    {
        MarketDataBufferEngine buffer(
            3);

        EXPECT_THROW(
            buffer.at(
                0),
            std::out_of_range);
    }

    TEST(
        MarketDataBufferEngineTest,
        RejectsEqualTimestamp)
    {
        MarketDataBufferEngine buffer(
            3);

        buffer.push(
            createObservation(
                1000));

        EXPECT_THROW(
            buffer.push(
                createObservation(
                    1000)),
            std::invalid_argument);
    }

    TEST(
        MarketDataBufferEngineTest,
        RejectsOlderTimestamp)
    {
        MarketDataBufferEngine buffer(
            3);

        buffer.push(
            createObservation(
                2000));

        EXPECT_THROW(
            buffer.push(
                createObservation(
                    1000)),
            std::invalid_argument);
    }

    TEST(
        MarketDataBufferEngineTest,
        RejectsZeroPrice)
    {
        MarketDataBufferEngine buffer(
            3);

        EXPECT_THROW(
            buffer.push(
                createObservation(
                    1000,
                    0.0)),
            std::invalid_argument);
    }

    TEST(
        MarketDataBufferEngineTest,
        RejectsNegativePrice)
    {
        MarketDataBufferEngine buffer(
            3);

        EXPECT_THROW(
            buffer.push(
                createObservation(
                    1000,
                    -100.0)),
            std::invalid_argument);
    }

    TEST(
        MarketDataBufferEngineTest,
        RejectsNegativeBid)
    {
        MarketDataBufferEngine buffer(
            3);

        EXPECT_THROW(
            buffer.push(
                createObservation(
                    1000,
                    100.0,
                    -1.0)),
            std::invalid_argument);
    }

    TEST(
        MarketDataBufferEngineTest,
        RejectsNegativeAsk)
    {
        MarketDataBufferEngine buffer(
            3);

        EXPECT_THROW(
            buffer.push(
                createObservation(
                    1000,
                    100.0,
                    99.0,
                    -1.0)),
            std::invalid_argument);
    }

    TEST(
        MarketDataBufferEngineTest,
        RejectsAskBelowBid)
    {
        MarketDataBufferEngine buffer(
            3);

        EXPECT_THROW(
            buffer.push(
                createObservation(
                    1000,
                    100.0,
                    101.0,
                    99.0)),
            std::invalid_argument);
    }

    TEST(
        MarketDataBufferEngineTest,
        RejectsNegativeVolume)
    {
        MarketDataBufferEngine buffer(
            3);

        EXPECT_THROW(
            buffer.push(
                createObservation(
                    1000,
                    100.0,
                    99.0,
                    101.0,
                    -100.0)),
            std::invalid_argument);
    }

    TEST(
        MarketDataBufferEngineTest,
        AllowsZeroBidAndAsk)
    {
        MarketDataBufferEngine buffer(
            3);

        buffer.push(
            createObservation(
                1000,
                100.0,
                0.0,
                0.0,
                100.0));

        EXPECT_DOUBLE_EQ(
            buffer.latest().bid,
            0.0);

        EXPECT_DOUBLE_EQ(
            buffer.latest().ask,
            0.0);
    }

    TEST(
        MarketDataBufferEngineTest,
        AllowsZeroVolume)
    {
        MarketDataBufferEngine buffer(
            3);

        buffer.push(
            createObservation(
                1000,
                100.0,
                99.0,
                101.0,
                0.0));

        EXPECT_DOUBLE_EQ(
            buffer.latest().volume,
            0.0);
    }

    TEST(
        MarketDataBufferEngineTest,
        AllowsAskEqualToBid)
    {
        MarketDataBufferEngine buffer(
            3);

        buffer.push(
            createObservation(
                1000,
                100.0,
                100.0,
                100.0));

        EXPECT_DOUBLE_EQ(
            buffer.latest().bid,
            buffer.latest().ask);
    }

    TEST(
        MarketDataBufferEngineTest,
        RejectsNonFinitePrice)
    {
        MarketDataBufferEngine buffer(
            3);

        EXPECT_THROW(
            buffer.push(
                createObservation(
                    1000,
                    std::numeric_limits<double>::
                        infinity())),
            std::invalid_argument);

        EXPECT_THROW(
            buffer.push(
                createObservation(
                    2000,
                    std::numeric_limits<double>::
                        quiet_NaN())),
            std::invalid_argument);
    }

    TEST(
        MarketDataBufferEngineTest,
        RejectsNonFiniteBid)
    {
        MarketDataBufferEngine buffer(
            3);

        EXPECT_THROW(
            buffer.push(
                createObservation(
                    1000,
                    100.0,
                    std::numeric_limits<double>::
                        infinity())),
            std::invalid_argument);
    }

    TEST(
        MarketDataBufferEngineTest,
        RejectsNonFiniteAsk)
    {
        MarketDataBufferEngine buffer(
            3);

        EXPECT_THROW(
            buffer.push(
                createObservation(
                    1000,
                    100.0,
                    99.0,
                    std::numeric_limits<double>::
                        quiet_NaN())),
            std::invalid_argument);
    }

    TEST(
        MarketDataBufferEngineTest,
        RejectsNonFiniteVolume)
    {
        MarketDataBufferEngine buffer(
            3);

        EXPECT_THROW(
            buffer.push(
                createObservation(
                    1000,
                    100.0,
                    99.0,
                    101.0,
                    std::numeric_limits<double>::
                        infinity())),
            std::invalid_argument);
    }

} // namespace