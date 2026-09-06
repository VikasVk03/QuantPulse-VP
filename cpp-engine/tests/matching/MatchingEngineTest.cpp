#include "quantpulse/domain/matching/MatchingEngine.hpp"

#include <gtest/gtest.h>

#include <stdexcept>

using quantpulse::domain::matching::MatchingEngine;
using quantpulse::domain::matching::MatchRequest;
using quantpulse::domain::matching::OrderSide;
using quantpulse::domain::order_book::OrderBookEngine;

TEST(MatchingEngineTest, BuysAgainstBestAsk)
{
    OrderBookEngine book;

    book.updateAsk(101.0, 10.0);
    book.updateAsk(102.0, 20.0);

    MatchingEngine engine;

    const auto result =
        engine.match(
            book,
            MatchRequest{
                OrderSide::Buy,
                5.0});

    EXPECT_DOUBLE_EQ(
        result.requestedQuantity,
        5.0);

    EXPECT_DOUBLE_EQ(
        result.filledQuantity,
        5.0);

    EXPECT_DOUBLE_EQ(
        result.remainingQuantity,
        0.0);

    EXPECT_DOUBLE_EQ(
        result.averageFillPrice,
        101.0);

    ASSERT_EQ(result.fills.size(), 1U);

    EXPECT_DOUBLE_EQ(
        result.fills[0].price,
        101.0);

    EXPECT_DOUBLE_EQ(
        result.fills[0].quantity,
        5.0);
}

TEST(MatchingEngineTest, SellsAgainstBestBid)
{
    OrderBookEngine book;

    book.updateBid(100.0, 10.0);
    book.updateBid(99.0, 20.0);

    MatchingEngine engine;

    const auto result =
        engine.match(
            book,
            MatchRequest{
                OrderSide::Sell,
                4.0});

    EXPECT_DOUBLE_EQ(
        result.filledQuantity,
        4.0);

    EXPECT_DOUBLE_EQ(
        result.remainingQuantity,
        0.0);

    EXPECT_DOUBLE_EQ(
        result.averageFillPrice,
        100.0);

    ASSERT_EQ(result.fills.size(), 1U);

    EXPECT_DOUBLE_EQ(
        result.fills[0].price,
        100.0);

    EXPECT_DOUBLE_EQ(
        result.fills[0].quantity,
        4.0);
}

TEST(MatchingEngineTest, PartialFillWhenLiquidityIsInsufficient)
{
    OrderBookEngine book;

    book.updateAsk(101.0, 10.0);

    MatchingEngine engine;

    const auto result =
        engine.match(
            book,
            MatchRequest{
                OrderSide::Buy,
                25.0});

    EXPECT_DOUBLE_EQ(
        result.requestedQuantity,
        25.0);

    EXPECT_DOUBLE_EQ(
        result.filledQuantity,
        10.0);

    EXPECT_DOUBLE_EQ(
        result.remainingQuantity,
        15.0);

    EXPECT_DOUBLE_EQ(
        result.averageFillPrice,
        101.0);
}

TEST(MatchingEngineTest, PartialSellWhenLiquidityIsInsufficient)
{
    OrderBookEngine book;

    book.updateBid(100.0, 8.0);

    MatchingEngine engine;

    const auto result =
        engine.match(
            book,
            MatchRequest{
                OrderSide::Sell,
                20.0});

    EXPECT_DOUBLE_EQ(
        result.filledQuantity,
        8.0);

    EXPECT_DOUBLE_EQ(
        result.remainingQuantity,
        12.0);

    EXPECT_DOUBLE_EQ(
        result.averageFillPrice,
        100.0);
}

TEST(MatchingEngineTest, ExactFillConsumesAvailableLiquidity)
{
    OrderBookEngine book;

    book.updateAsk(101.0, 10.0);

    MatchingEngine engine;

    const auto result =
        engine.match(
            book,
            MatchRequest{
                OrderSide::Buy,
                10.0});

    EXPECT_DOUBLE_EQ(
        result.filledQuantity,
        10.0);

    EXPECT_DOUBLE_EQ(
        result.remainingQuantity,
        0.0);
}

TEST(MatchingEngineTest, BuyUsesLowestAsk)
{
    OrderBookEngine book;

    book.updateAsk(103.0, 10.0);
    book.updateAsk(101.0, 10.0);
    book.updateAsk(102.0, 10.0);

    MatchingEngine engine;

    const auto result =
        engine.match(
            book,
            MatchRequest{
                OrderSide::Buy,
                5.0});

    EXPECT_DOUBLE_EQ(
        result.averageFillPrice,
        101.0);
}

TEST(MatchingEngineTest, SellUsesHighestBid)
{
    OrderBookEngine book;

    book.updateBid(98.0, 10.0);
    book.updateBid(100.0, 10.0);
    book.updateBid(99.0, 10.0);

    MatchingEngine engine;

    const auto result =
        engine.match(
            book,
            MatchRequest{
                OrderSide::Sell,
                5.0});

    EXPECT_DOUBLE_EQ(
        result.averageFillPrice,
        100.0);
}

TEST(MatchingEngineTest, RejectsZeroQuantity)
{
    OrderBookEngine book;
    MatchingEngine engine;

    EXPECT_THROW(
        engine.match(
            book,
            MatchRequest{
                OrderSide::Buy,
                0.0}),
        std::invalid_argument);
}

TEST(MatchingEngineTest, RejectsNegativeQuantity)
{
    OrderBookEngine book;
    MatchingEngine engine;

    EXPECT_THROW(
        engine.match(
            book,
            MatchRequest{
                OrderSide::Sell,
                -1.0}),
        std::invalid_argument);
}

TEST(MatchingEngineTest, RejectsNonFiniteQuantity)
{
    OrderBookEngine book;
    MatchingEngine engine;

    EXPECT_THROW(
        engine.match(
            book,
            MatchRequest{
                OrderSide::Buy,
                std::numeric_limits<double>::infinity()}),
        std::invalid_argument);
}

TEST(MatchingEngineTest, BuyAgainstEmptyAskBookThrows)
{
    OrderBookEngine book;
    MatchingEngine engine;

    EXPECT_THROW(
        (void)engine.match(
            book,
            MatchRequest{
                OrderSide::Buy,
                5.0}),
        std::out_of_range);
}

TEST(MatchingEngineTest, SellAgainstEmptyBidBookThrows)
{
    OrderBookEngine book;
    MatchingEngine engine;

    EXPECT_THROW(
        (void)engine.match(
            book,
            MatchRequest{
                OrderSide::Sell,
                5.0}),
        std::out_of_range);
}

TEST(MatchingEngineTest, ZeroLiquidityIsRemovedFromBook)
{
    OrderBookEngine book;

    book.updateAsk(101.0, 10.0);
    book.updateAsk(101.0, 0.0);

    MatchingEngine engine;

    EXPECT_THROW(
        (void)engine.match(
            book,
            MatchRequest{
                OrderSide::Buy,
                5.0}),
        std::out_of_range);
}

TEST(MatchingEngineTest, ResultContainsSingleTopOfBookFill)
{
    OrderBookEngine book;

    book.updateAsk(101.0, 50.0);

    MatchingEngine engine;

    const auto result =
        engine.match(
            book,
            MatchRequest{
                OrderSide::Buy,
                20.0});

    ASSERT_EQ(
        result.fills.size(),
        1U);

    EXPECT_DOUBLE_EQ(
        result.fills.front().price,
        101.0);

    EXPECT_DOUBLE_EQ(
        result.fills.front().quantity,
        20.0);
}

TEST(MatchingEngineTest, BuyConsumesMultipleAskLevels)
{
    OrderBookEngine book;

    book.updateAsk(101.0, 10.0);
    book.updateAsk(102.0, 20.0);
    book.updateAsk(103.0, 30.0);

    MatchingEngine engine;

    const auto result =
        engine.match(
            book,
            MatchRequest{
                OrderSide::Buy,
                25.0});

    EXPECT_DOUBLE_EQ(
        result.requestedQuantity,
        25.0);

    EXPECT_DOUBLE_EQ(
        result.filledQuantity,
        25.0);

    EXPECT_DOUBLE_EQ(
        result.remainingQuantity,
        0.0);

    EXPECT_DOUBLE_EQ(
        result.averageFillPrice,
        101.6);

    ASSERT_EQ(
        result.fills.size(),
        2U);

    EXPECT_DOUBLE_EQ(
        result.fills[0].price,
        101.0);

    EXPECT_DOUBLE_EQ(
        result.fills[0].quantity,
        10.0);

    EXPECT_DOUBLE_EQ(
        result.fills[1].price,
        102.0);

    EXPECT_DOUBLE_EQ(
        result.fills[1].quantity,
        15.0);
}

TEST(MatchingEngineTest, SellConsumesMultipleBidLevels)
{
    OrderBookEngine book;

    book.updateBid(100.0, 10.0);
    book.updateBid(99.0, 20.0);
    book.updateBid(98.0, 30.0);

    MatchingEngine engine;

    const auto result =
        engine.match(
            book,
            MatchRequest{
                OrderSide::Sell,
                25.0});

    EXPECT_DOUBLE_EQ(
        result.requestedQuantity,
        25.0);

    EXPECT_DOUBLE_EQ(
        result.filledQuantity,
        25.0);

    EXPECT_DOUBLE_EQ(
        result.remainingQuantity,
        0.0);

    EXPECT_DOUBLE_EQ(
        result.averageFillPrice,
        99.4);

    ASSERT_EQ(
        result.fills.size(),
        2U);

    EXPECT_DOUBLE_EQ(
        result.fills[0].price,
        100.0);

    EXPECT_DOUBLE_EQ(
        result.fills[0].quantity,
        10.0);

    EXPECT_DOUBLE_EQ(
        result.fills[1].price,
        99.0);

    EXPECT_DOUBLE_EQ(
        result.fills[1].quantity,
        15.0);
}

TEST(MatchingEngineTest, BuyPartiallyFillsAcrossMultipleAskLevels)
{
    OrderBookEngine book;

    book.updateAsk(101.0, 10.0);
    book.updateAsk(102.0, 20.0);

    MatchingEngine engine;

    const auto result =
        engine.match(
            book,
            MatchRequest{
                OrderSide::Buy,
                50.0});

    EXPECT_DOUBLE_EQ(
        result.filledQuantity,
        30.0);

    EXPECT_DOUBLE_EQ(
        result.remainingQuantity,
        20.0);

    EXPECT_DOUBLE_EQ(
        result.averageFillPrice,
        101.66666666666667);

    ASSERT_EQ(
        result.fills.size(),
        2U);
}

TEST(MatchingEngineTest, SellPartiallyFillsAcrossMultipleBidLevels)
{
    OrderBookEngine book;

    book.updateBid(100.0, 10.0);
    book.updateBid(99.0, 20.0);

    MatchingEngine engine;

    const auto result =
        engine.match(
            book,
            MatchRequest{
                OrderSide::Sell,
                50.0});

    EXPECT_DOUBLE_EQ(
        result.filledQuantity,
        30.0);

    EXPECT_DOUBLE_EQ(
        result.remainingQuantity,
        20.0);

    EXPECT_DOUBLE_EQ(
        result.averageFillPrice,
        99.33333333333333);

    ASSERT_EQ(
        result.fills.size(),
        2U);
}