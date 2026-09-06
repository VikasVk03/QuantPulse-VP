#include "quantpulse/domain/order_flow/OrderFlowEngine.hpp"

#include <gtest/gtest.h>

#include <limits>
#include <stdexcept>

namespace quantpulse::domain::order_flow
{

    TEST(OrderFlowEngineTest, CalculatesQuantityChangeAtUnchangedBidAndAsk)
    {
        const TopOfBook previous{
            .bidPrice = 100.0,
            .bidQuantity = 10.0,
            .askPrice = 101.0,
            .askQuantity = 10.0};

        const TopOfBook current{
            .bidPrice = 100.0,
            .bidQuantity = 20.0,
            .askPrice = 101.0,
            .askQuantity = 5.0};

        const auto result = OrderFlowEngine::calculate(previous, current);

        EXPECT_DOUBLE_EQ(result.bidContribution, 10.0);
        EXPECT_DOUBLE_EQ(result.askContribution, 5.0);
        EXPECT_DOUBLE_EQ(result.ofi, 15.0);
    }

    TEST(OrderFlowEngineTest, CalculatesPositiveBidContributionWhenBidPriceIncreases)
    {
        const TopOfBook previous{
            .bidPrice = 100.0,
            .bidQuantity = 10.0,
            .askPrice = 101.0,
            .askQuantity = 10.0};

        const TopOfBook current{
            .bidPrice = 101.0,
            .bidQuantity = 8.0,
            .askPrice = 102.0,
            .askQuantity = 10.0};

        const auto result = OrderFlowEngine::calculate(previous, current);

        EXPECT_DOUBLE_EQ(result.bidContribution, 8.0);
        EXPECT_DOUBLE_EQ(result.askContribution, 10.0);
        EXPECT_DOUBLE_EQ(result.ofi, 18.0);
    }

    TEST(OrderFlowEngineTest, CalculatesNegativeBidContributionWhenBidPriceDecreases)
    {
        const TopOfBook previous{
            .bidPrice = 100.0,
            .bidQuantity = 10.0,
            .askPrice = 101.0,
            .askQuantity = 10.0};

        const TopOfBook current{
            .bidPrice = 99.0,
            .bidQuantity = 8.0,
            .askPrice = 101.0,
            .askQuantity = 10.0};

        const auto result = OrderFlowEngine::calculate(previous, current);

        EXPECT_DOUBLE_EQ(result.bidContribution, -10.0);
        EXPECT_DOUBLE_EQ(result.askContribution, 0.0);
        EXPECT_DOUBLE_EQ(result.ofi, -10.0);
    }

    TEST(OrderFlowEngineTest, CalculatesNegativeAskContributionWhenAskPriceDecreases)
    {
        const TopOfBook previous{
            .bidPrice = 100.0,
            .bidQuantity = 10.0,
            .askPrice = 101.0,
            .askQuantity = 10.0};

        const TopOfBook current{
            .bidPrice = 100.0,
            .bidQuantity = 10.0,
            .askPrice = 100.0,
            .askQuantity = 8.0};

        const auto result = OrderFlowEngine::calculate(previous, current);

        EXPECT_DOUBLE_EQ(result.bidContribution, 0.0);
        EXPECT_DOUBLE_EQ(result.askContribution, -8.0);
        EXPECT_DOUBLE_EQ(result.ofi, -8.0);
    }

    TEST(OrderFlowEngineTest, CalculatesPositiveAskContributionWhenAskPriceIncreases)
    {
        const TopOfBook previous{
            .bidPrice = 100.0,
            .bidQuantity = 10.0,
            .askPrice = 101.0,
            .askQuantity = 10.0};

        const TopOfBook current{
            .bidPrice = 100.0,
            .bidQuantity = 10.0,
            .askPrice = 102.0,
            .askQuantity = 8.0};

        const auto result = OrderFlowEngine::calculate(previous, current);

        EXPECT_DOUBLE_EQ(result.bidContribution, 0.0);
        EXPECT_DOUBLE_EQ(result.askContribution, 10.0);
        EXPECT_DOUBLE_EQ(result.ofi, 10.0);
    }

    TEST(OrderFlowEngineTest, ReturnsZeroForUnchangedBook)
    {
        const TopOfBook book{
            .bidPrice = 100.0,
            .bidQuantity = 10.0,
            .askPrice = 101.0,
            .askQuantity = 10.0};

        const auto result = OrderFlowEngine::calculate(book, book);

        EXPECT_DOUBLE_EQ(result.bidContribution, 0.0);
        EXPECT_DOUBLE_EQ(result.askContribution, 0.0);
        EXPECT_DOUBLE_EQ(result.ofi, 0.0);
    }

    TEST(OrderFlowEngineTest, HandlesBidAndAskChangesTogether)
    {
        const TopOfBook previous{
            .bidPrice = 100.0,
            .bidQuantity = 10.0,
            .askPrice = 102.0,
            .askQuantity = 10.0};

        const TopOfBook current{
            .bidPrice = 101.0,
            .bidQuantity = 8.0,
            .askPrice = 103.0,
            .askQuantity = 6.0};

        const auto result = OrderFlowEngine::calculate(previous, current);

        EXPECT_DOUBLE_EQ(result.bidContribution, 8.0);
        EXPECT_DOUBLE_EQ(result.askContribution, 10.0);
        EXPECT_DOUBLE_EQ(result.ofi, 18.0);
    }

    TEST(OrderFlowEngineTest, RejectsNonPositiveBidPrice)
    {
        const TopOfBook previous{
            .bidPrice = 0.0,
            .bidQuantity = 10.0,
            .askPrice = 101.0,
            .askQuantity = 10.0};

        const TopOfBook current{
            .bidPrice = 100.0,
            .bidQuantity = 10.0,
            .askPrice = 101.0,
            .askQuantity = 10.0};

        EXPECT_THROW(
            OrderFlowEngine::calculate(previous, current),
            std::invalid_argument);
    }

    TEST(OrderFlowEngineTest, RejectsNonPositiveAskPrice)
    {
        const TopOfBook previous{
            .bidPrice = 100.0,
            .bidQuantity = 10.0,
            .askPrice = 0.0,
            .askQuantity = 10.0};

        const TopOfBook current{
            .bidPrice = 100.0,
            .bidQuantity = 10.0,
            .askPrice = 101.0,
            .askQuantity = 10.0};

        EXPECT_THROW(
            OrderFlowEngine::calculate(previous, current),
            std::invalid_argument);
    }

    TEST(OrderFlowEngineTest, RejectsNegativeQuantity)
    {
        const TopOfBook previous{
            .bidPrice = 100.0,
            .bidQuantity = -1.0,
            .askPrice = 101.0,
            .askQuantity = 10.0};

        const TopOfBook current{
            .bidPrice = 100.0,
            .bidQuantity = 10.0,
            .askPrice = 101.0,
            .askQuantity = 10.0};

        EXPECT_THROW(
            OrderFlowEngine::calculate(previous, current),
            std::invalid_argument);
    }

    TEST(OrderFlowEngineTest, RejectsCrossedBook)
    {
        const TopOfBook previous{
            .bidPrice = 102.0,
            .bidQuantity = 10.0,
            .askPrice = 101.0,
            .askQuantity = 10.0};

        const TopOfBook current{
            .bidPrice = 100.0,
            .bidQuantity = 10.0,
            .askPrice = 101.0,
            .askQuantity = 10.0};

        EXPECT_THROW(
            OrderFlowEngine::calculate(previous, current),
            std::invalid_argument);
    }

    TEST(OrderFlowEngineTest, RejectsNonFiniteValues)
    {
        const TopOfBook previous{
            .bidPrice = std::numeric_limits<double>::quiet_NaN(),
            .bidQuantity = 10.0,
            .askPrice = 101.0,
            .askQuantity = 10.0};

        const TopOfBook current{
            .bidPrice = 100.0,
            .bidQuantity = 10.0,
            .askPrice = 101.0,
            .askQuantity = 10.0};

        EXPECT_THROW(
            OrderFlowEngine::calculate(previous, current),
            std::invalid_argument);
    }

} // namespace quantpulse::domain::order_flow