#include "quantpulse/domain/order_book/OrderBookEngine.hpp"

#include <gtest/gtest.h>

#include <limits>
#include <stdexcept>

using quantpulse::domain::order_book::OrderBookEngine;

TEST(OrderBookEngineTest, InitiallyEmpty)
{
    OrderBookEngine book;

    EXPECT_EQ(book.bidLevelCount(), 0U);
    EXPECT_EQ(book.askLevelCount(), 0U);
}

TEST(OrderBookEngineTest, AddsBidLevel)
{
    OrderBookEngine book;

    book.updateBid(100.0, 10.0);

    EXPECT_EQ(book.bidLevelCount(), 1U);
    EXPECT_DOUBLE_EQ(book.bestBid(), 100.0);
}

TEST(OrderBookEngineTest, AddsAskLevel)
{
    OrderBookEngine book;

    book.updateAsk(101.0, 12.0);

    EXPECT_EQ(book.askLevelCount(), 1U);
    EXPECT_DOUBLE_EQ(book.bestAsk(), 101.0);
}

TEST(OrderBookEngineTest, BestBidUsesHighestPrice)
{
    OrderBookEngine book;

    book.updateBid(100.0, 10.0);
    book.updateBid(102.0, 5.0);
    book.updateBid(101.0, 8.0);

    EXPECT_DOUBLE_EQ(book.bestBid(), 102.0);
}

TEST(OrderBookEngineTest, BestAskUsesLowestPrice)
{
    OrderBookEngine book;

    book.updateAsk(103.0, 10.0);
    book.updateAsk(101.0, 5.0);
    book.updateAsk(102.0, 8.0);

    EXPECT_DOUBLE_EQ(book.bestAsk(), 101.0);
}

TEST(OrderBookEngineTest, CalculatesSpread)
{
    OrderBookEngine book;

    book.updateBid(100.0, 10.0);
    book.updateAsk(101.0, 10.0);

    EXPECT_DOUBLE_EQ(
        book.spread(),
        1.0);
}

TEST(OrderBookEngineTest, CalculatesMidPrice)
{
    OrderBookEngine book;

    book.updateBid(100.0, 10.0);
    book.updateAsk(102.0, 10.0);

    EXPECT_DOUBLE_EQ(
        book.midPrice(),
        101.0);
}

TEST(OrderBookEngineTest, UpdatesExistingBid)
{
    OrderBookEngine book;

    book.updateBid(100.0, 10.0);
    book.updateBid(100.0, 25.0);

    EXPECT_EQ(book.bidLevelCount(), 1U);
    EXPECT_DOUBLE_EQ(book.bidDepth(1), 25.0);
}

TEST(OrderBookEngineTest, UpdatesExistingAsk)
{
    OrderBookEngine book;

    book.updateAsk(101.0, 10.0);
    book.updateAsk(101.0, 30.0);

    EXPECT_EQ(book.askLevelCount(), 1U);
    EXPECT_DOUBLE_EQ(book.askDepth(1), 30.0);
}

TEST(OrderBookEngineTest, ZeroQuantityRemovesBid)
{
    OrderBookEngine book;

    book.updateBid(100.0, 10.0);
    book.updateBid(100.0, 0.0);

    EXPECT_EQ(book.bidLevelCount(), 0U);
}

TEST(OrderBookEngineTest, ZeroQuantityRemovesAsk)
{
    OrderBookEngine book;

    book.updateAsk(101.0, 10.0);
    book.updateAsk(101.0, 0.0);

    EXPECT_EQ(book.askLevelCount(), 0U);
}

TEST(OrderBookEngineTest, ExplicitlyRemovesBid)
{
    OrderBookEngine book;

    book.updateBid(100.0, 10.0);
    book.removeBid(100.0);

    EXPECT_EQ(book.bidLevelCount(), 0U);
}

TEST(OrderBookEngineTest, ExplicitlyRemovesAsk)
{
    OrderBookEngine book;

    book.updateAsk(101.0, 10.0);
    book.removeAsk(101.0);

    EXPECT_EQ(book.askLevelCount(), 0U);
}

TEST(OrderBookEngineTest, CalculatesBidDepth)
{
    OrderBookEngine book;

    book.updateBid(102.0, 5.0);
    book.updateBid(101.0, 10.0);
    book.updateBid(100.0, 20.0);

    EXPECT_DOUBLE_EQ(
        book.bidDepth(2),
        15.0);
}

TEST(OrderBookEngineTest, CalculatesAskDepth)
{
    OrderBookEngine book;

    book.updateAsk(101.0, 5.0);
    book.updateAsk(102.0, 10.0);
    book.updateAsk(103.0, 20.0);

    EXPECT_DOUBLE_EQ(
        book.askDepth(2),
        15.0);
}

TEST(OrderBookEngineTest, DepthReturnsAllLevelsWhenRequestedMoreThanAvailable)
{
    OrderBookEngine book;

    book.updateBid(100.0, 10.0);
    book.updateBid(99.0, 20.0);

    EXPECT_DOUBLE_EQ(
        book.bidDepth(100),
        30.0);
}

TEST(OrderBookEngineTest, RejectsInvalidBidPrice)
{
    OrderBookEngine book;

    EXPECT_THROW(
        book.updateBid(0.0, 10.0),
        std::invalid_argument);

    EXPECT_THROW(
        book.updateBid(
            std::numeric_limits<double>::quiet_NaN(),
            10.0),
        std::invalid_argument);
}

TEST(OrderBookEngineTest, RejectsInvalidAskPrice)
{
    OrderBookEngine book;

    EXPECT_THROW(
        book.updateAsk(-1.0, 10.0),
        std::invalid_argument);
}

TEST(OrderBookEngineTest, RejectsNegativeBidQuantity)
{
    OrderBookEngine book;

    EXPECT_THROW(
        book.updateBid(100.0, -1.0),
        std::invalid_argument);
}

TEST(OrderBookEngineTest, RejectsNegativeAskQuantity)
{
    OrderBookEngine book;

    EXPECT_THROW(
        book.updateAsk(101.0, -1.0),
        std::invalid_argument);
}

TEST(OrderBookEngineTest, RejectsNonFiniteQuantity)
{
    OrderBookEngine book;

    EXPECT_THROW(
        book.updateBid(
            100.0,
            std::numeric_limits<double>::infinity()),
        std::invalid_argument);
}

TEST(OrderBookEngineTest, BestBidOnEmptyBookThrows)
{
    OrderBookEngine book;

    EXPECT_THROW(
        (void)book.bestBid(),
        std::out_of_range);
}

TEST(OrderBookEngineTest, BestAskOnEmptyBookThrows)
{
    OrderBookEngine book;

    EXPECT_THROW(
        (void)book.bestAsk(),
        std::out_of_range);
}

TEST(OrderBookEngineTest, ClearRemovesBothSides)
{
    OrderBookEngine book;

    book.updateBid(100.0, 10.0);
    book.updateAsk(101.0, 10.0);

    book.clear();

    EXPECT_EQ(book.bidLevelCount(), 0U);
    EXPECT_EQ(book.askLevelCount(), 0U);
}