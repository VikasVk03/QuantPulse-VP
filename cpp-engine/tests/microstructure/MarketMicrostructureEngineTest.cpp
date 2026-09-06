#include "quantpulse/domain/microstructure/MarketMicrostructureEngine.hpp"

#include <gtest/gtest.h>

#include <cmath>
#include <limits>
#include <stdexcept>
#include <vector>

using quantpulse::domain::microstructure::MarketMicrostructureEngine;

TEST(
    MarketMicrostructureEngineTest,
    CalculatesVWAP)
{
    const std::vector<double> prices{
        100.0,
        101.0,
        102.0};

    const std::vector<double> volumes{
        10.0,
        20.0,
        30.0};

    EXPECT_NEAR(
        MarketMicrostructureEngine::vwap(
            prices,
            volumes),
        101.33333333333333,
        1e-12);
}

TEST(
    MarketMicrostructureEngineTest,
    CalculatesVWAPForEqualVolumes)
{
    const std::vector<double> prices{
        100.0,
        101.0,
        102.0};

    const std::vector<double> volumes{
        10.0,
        10.0,
        10.0};

    EXPECT_NEAR(
        MarketMicrostructureEngine::vwap(
            prices,
            volumes),
        101.0,
        1e-12);
}

TEST(
    MarketMicrostructureEngineTest,
    CalculatesVWAPForSingleObservation)
{
    const std::vector<double> prices{
        105.0};

    const std::vector<double> volumes{
        50.0};

    EXPECT_NEAR(
        MarketMicrostructureEngine::vwap(
            prices,
            volumes),
        105.0,
        1e-12);
}

TEST(
    MarketMicrostructureEngineTest,
    CalculatesVWAPWithZeroVolumeObservation)
{
    const std::vector<double> prices{
        100.0,
        200.0};

    const std::vector<double> volumes{
        100.0,
        0.0};

    EXPECT_NEAR(
        MarketMicrostructureEngine::vwap(
            prices,
            volumes),
        100.0,
        1e-12);
}

TEST(
    MarketMicrostructureEngineTest,
    ThrowsForEmptyPrices)
{
    const std::vector<double> prices{};
    const std::vector<double> volumes{10.0};

    EXPECT_THROW(
        MarketMicrostructureEngine::vwap(
            prices,
            volumes),
        std::invalid_argument);
}

TEST(
    MarketMicrostructureEngineTest,
    ThrowsForEmptyVolumes)
{
    const std::vector<double> prices{100.0};
    const std::vector<double> volumes{};

    EXPECT_THROW(
        MarketMicrostructureEngine::vwap(
            prices,
            volumes),
        std::invalid_argument);
}

TEST(
    MarketMicrostructureEngineTest,
    ThrowsForDifferentSizedInputs)
{
    const std::vector<double> prices{
        100.0,
        101.0,
        102.0};

    const std::vector<double> volumes{
        10.0,
        20.0};

    EXPECT_THROW(
        MarketMicrostructureEngine::vwap(
            prices,
            volumes),
        std::invalid_argument);
}

TEST(
    MarketMicrostructureEngineTest,
    ThrowsForNegativeVolume)
{
    const std::vector<double> prices{
        100.0,
        101.0};

    const std::vector<double> volumes{
        10.0,
        -5.0};

    EXPECT_THROW(
        MarketMicrostructureEngine::vwap(
            prices,
            volumes),
        std::invalid_argument);
}

TEST(
    MarketMicrostructureEngineTest,
    ThrowsForZeroTotalVolume)
{
    const std::vector<double> prices{
        100.0,
        101.0};

    const std::vector<double> volumes{
        0.0,
        0.0};

    EXPECT_THROW(
        MarketMicrostructureEngine::vwap(
            prices,
            volumes),
        std::invalid_argument);
}

TEST(
    MarketMicrostructureEngineTest,
    ThrowsForNaNPrice)
{
    const std::vector<double> prices{
        100.0,
        std::numeric_limits<double>::quiet_NaN()};

    const std::vector<double> volumes{
        10.0,
        20.0};

    EXPECT_THROW(
        MarketMicrostructureEngine::vwap(
            prices,
            volumes),
        std::invalid_argument);
}

TEST(
    MarketMicrostructureEngineTest,
    ThrowsForInfiniteVolume)
{
    const std::vector<double> prices{
        100.0,
        101.0};

    const std::vector<double> volumes{
        10.0,
        std::numeric_limits<double>::infinity()};

    EXPECT_THROW(
        MarketMicrostructureEngine::vwap(
            prices,
            volumes),
        std::invalid_argument);
}

TEST(
    MarketMicrostructureEngineTest,
    CalculatesTWAP)
{
    const std::vector<double> prices{
        100.0,
        101.0,
        102.0};

    EXPECT_NEAR(
        MarketMicrostructureEngine::twap(
            prices),
        101.0,
        1e-12);
}

TEST(
    MarketMicrostructureEngineTest,
    CalculatesTWAPForUnevenPrices)
{
    const std::vector<double> prices{
        95.0,
        105.0,
        110.0,
        90.0};

    EXPECT_NEAR(
        MarketMicrostructureEngine::twap(
            prices),
        100.0,
        1e-12);
}

TEST(
    MarketMicrostructureEngineTest,
    CalculatesTWAPForSingleObservation)
{
    const std::vector<double> prices{
        105.0};

    EXPECT_NEAR(
        MarketMicrostructureEngine::twap(
            prices),
        105.0,
        1e-12);
}

TEST(
    MarketMicrostructureEngineTest,
    ThrowsForEmptyTWAPInput)
{
    const std::vector<double> prices{};

    EXPECT_THROW(
        MarketMicrostructureEngine::twap(
            prices),
        std::invalid_argument);
}

TEST(
    MarketMicrostructureEngineTest,
    ThrowsForNaNTWAPPrice)
{
    const std::vector<double> prices{
        100.0,
        std::numeric_limits<double>::quiet_NaN()};

    EXPECT_THROW(
        MarketMicrostructureEngine::twap(
            prices),
        std::invalid_argument);
}

TEST(
    MarketMicrostructureEngineTest,
    ThrowsForInfiniteTWAPPrice)
{
    const std::vector<double> prices{
        100.0,
        std::numeric_limits<double>::infinity()};

    EXPECT_THROW(
        MarketMicrostructureEngine::twap(
            prices),
        std::invalid_argument);
}

TEST(
    MarketMicrostructureEngineTest,
    CalculatesMidPrice)
{
    EXPECT_DOUBLE_EQ(
        MarketMicrostructureEngine::midPrice(
            100.0,
            102.0),
        101.0);
}

TEST(
    MarketMicrostructureEngineTest,
    CalculatesZeroSpread)
{
    EXPECT_DOUBLE_EQ(
        MarketMicrostructureEngine::bidAskSpread(
            100.0,
            100.0),
        0.0);
}

TEST(
    MarketMicrostructureEngineTest,
    CalculatesBidAskSpread)
{
    EXPECT_DOUBLE_EQ(
        MarketMicrostructureEngine::bidAskSpread(
            100.0,
            102.0),
        2.0);
}

TEST(
    MarketMicrostructureEngineTest,
    CalculatesRelativeSpread)
{
    const double expected =
        2.0 / 101.0;

    EXPECT_NEAR(
        MarketMicrostructureEngine::relativeSpread(
            100.0,
            102.0),
        expected,
        1e-12);
}

TEST(
    MarketMicrostructureEngineTest,
    ThrowsWhenAskIsBelowBid)
{
    EXPECT_THROW(
        MarketMicrostructureEngine::midPrice(
            102.0,
            100.0),
        std::invalid_argument);
}

TEST(
    MarketMicrostructureEngineTest,
    ThrowsForNegativeBid)
{
    EXPECT_THROW(
        MarketMicrostructureEngine::bidAskSpread(
            -100.0,
            102.0),
        std::invalid_argument);
}

TEST(
    MarketMicrostructureEngineTest,
    ThrowsForNegativeAsk)
{
    EXPECT_THROW(
        MarketMicrostructureEngine::bidAskSpread(
            100.0,
            -102.0),
        std::invalid_argument);
}

TEST(
    MarketMicrostructureEngineTest,
    ThrowsForNaNQuotePrice)
{
    EXPECT_THROW(
        MarketMicrostructureEngine::midPrice(
            std::numeric_limits<double>::quiet_NaN(),
            100.0),
        std::invalid_argument);
}

TEST(
    MarketMicrostructureEngineTest,
    ThrowsForInfinitePrice)
{
    EXPECT_THROW(
        MarketMicrostructureEngine::midPrice(
            100.0,
            std::numeric_limits<double>::infinity()),
        std::invalid_argument);
}

TEST(
    MarketMicrostructureEngineTest,
    ThrowsForRelativeSpreadWithZeroMidpoint)
{
    EXPECT_THROW(
        {
            const auto result =
                MarketMicrostructureEngine::relativeSpread(
                    0.0,
                    0.0);

            (void)result;
        },
        std::invalid_argument);
}

TEST(
    MarketMicrostructureEngineTest,
    CalculatesPositiveOrderImbalance)
{
    EXPECT_DOUBLE_EQ(
        MarketMicrostructureEngine::orderImbalance(
            700.0,
            300.0),
        0.4);
}

TEST(
    MarketMicrostructureEngineTest,
    CalculatesNegativeOrderImbalance)
{
    EXPECT_DOUBLE_EQ(
        MarketMicrostructureEngine::orderImbalance(
            300.0,
            700.0),
        -0.4);
}

TEST(
    MarketMicrostructureEngineTest,
    CalculatesZeroOrderImbalance)
{
    EXPECT_DOUBLE_EQ(
        MarketMicrostructureEngine::orderImbalance(
            500.0,
            500.0),
        0.0);
}

TEST(
    MarketMicrostructureEngineTest,
    CalculatesMaximumPositiveOrderImbalance)
{
    EXPECT_DOUBLE_EQ(
        MarketMicrostructureEngine::orderImbalance(
            100.0,
            0.0),
        1.0);
}

TEST(
    MarketMicrostructureEngineTest,
    CalculatesMaximumNegativeOrderImbalance)
{
    EXPECT_DOUBLE_EQ(
        MarketMicrostructureEngine::orderImbalance(
            0.0,
            100.0),
        -1.0);
}

TEST(
    MarketMicrostructureEngineTest,
    ThrowsForNegativeBidVolume)
{
    EXPECT_THROW(
        {
            const auto result =
                MarketMicrostructureEngine::orderImbalance(
                    -100.0,
                    50.0);

            (void)result;
        },
        std::invalid_argument);
}

TEST(
    MarketMicrostructureEngineTest,
    ThrowsForNegativeAskVolume)
{
    EXPECT_THROW(
        {
            const auto result =
                MarketMicrostructureEngine::orderImbalance(
                    100.0,
                    -50.0);

            (void)result;
        },
        std::invalid_argument);
}

TEST(
    MarketMicrostructureEngineTest,
    ThrowsForZeroTotalOrderVolume)
{
    EXPECT_THROW(
        {
            const auto result =
                MarketMicrostructureEngine::orderImbalance(
                    0.0,
                    0.0);

            (void)result;
        },
        std::invalid_argument);
}

TEST(
    MarketMicrostructureEngineTest,
    ThrowsForNaNOrderVolume)
{
    EXPECT_THROW(
        {
            const auto result =
                MarketMicrostructureEngine::orderImbalance(
                    std::numeric_limits<double>::quiet_NaN(),
                    100.0);

            (void)result;
        },
        std::invalid_argument);
}

TEST(
    MarketMicrostructureEngineTest,
    ThrowsForInfiniteOrderVolume)
{
    EXPECT_THROW(
        {
            const auto result =
                MarketMicrostructureEngine::orderImbalance(
                    100.0,
                    std::numeric_limits<double>::infinity());

            (void)result;
        },
        std::invalid_argument);
}

TEST(
    MarketMicrostructureEngineTest,
    CalculatesPositiveTradeImbalance)
{
    EXPECT_DOUBLE_EQ(
        MarketMicrostructureEngine::tradeImbalance(
            800.0,
            200.0),
        0.6);
}

TEST(
    MarketMicrostructureEngineTest,
    CalculatesNegativeTradeImbalance)
{
    EXPECT_DOUBLE_EQ(
        MarketMicrostructureEngine::tradeImbalance(
            200.0,
            800.0),
        -0.6);
}

TEST(
    MarketMicrostructureEngineTest,
    CalculatesZeroTradeImbalance)
{
    EXPECT_DOUBLE_EQ(
        MarketMicrostructureEngine::tradeImbalance(
            500.0,
            500.0),
        0.0);
}

TEST(
    MarketMicrostructureEngineTest,
    CalculatesMaximumPositiveTradeImbalance)
{
    EXPECT_DOUBLE_EQ(
        MarketMicrostructureEngine::tradeImbalance(
            100.0,
            0.0),
        1.0);
}

TEST(
    MarketMicrostructureEngineTest,
    CalculatesMaximumNegativeTradeImbalance)
{
    EXPECT_DOUBLE_EQ(
        MarketMicrostructureEngine::tradeImbalance(
            0.0,
            100.0),
        -1.0);
}

TEST(
    MarketMicrostructureEngineTest,
    ThrowsForNegativeBuyVolume)
{
    EXPECT_THROW(
        {
            const auto result =
                MarketMicrostructureEngine::tradeImbalance(
                    -100.0,
                    50.0);

            (void)result;
        },
        std::invalid_argument);
}

TEST(
    MarketMicrostructureEngineTest,
    ThrowsForNegativeSellVolume)
{
    EXPECT_THROW(
        {
            const auto result =
                MarketMicrostructureEngine::tradeImbalance(
                    100.0,
                    -50.0);

            (void)result;
        },
        std::invalid_argument);
}

TEST(
    MarketMicrostructureEngineTest,
    ThrowsForZeroTotalTradeVolume)
{
    EXPECT_THROW(
        {
            const auto result =
                MarketMicrostructureEngine::tradeImbalance(
                    0.0,
                    0.0);

            (void)result;
        },
        std::invalid_argument);
}

TEST(
    MarketMicrostructureEngineTest,
    ThrowsForNaNTradeVolume)
{
    EXPECT_THROW(
        {
            const auto result =
                MarketMicrostructureEngine::tradeImbalance(
                    std::numeric_limits<double>::quiet_NaN(),
                    100.0);

            (void)result;
        },
        std::invalid_argument);
}

TEST(
    MarketMicrostructureEngineTest,
    ThrowsForInfiniteTradeVolume)
{
    EXPECT_THROW(
        {
            const auto result =
                MarketMicrostructureEngine::tradeImbalance(
                    100.0,
                    std::numeric_limits<double>::infinity());

            (void)result;
        },
        std::invalid_argument);
}

TEST(
    MarketMicrostructureEngineTest,
    CalculatesPositivePriceImpact)
{
    EXPECT_NEAR(
        MarketMicrostructureEngine::priceImpact(
            100.0,
            101.0),
        0.01,
        1e-12);
}

TEST(
    MarketMicrostructureEngineTest,
    CalculatesNegativePriceImpact)
{
    EXPECT_NEAR(
        MarketMicrostructureEngine::priceImpact(
            100.0,
            99.0),
        -0.01,
        1e-12);
}

TEST(
    MarketMicrostructureEngineTest,
    CalculatesZeroPriceImpact)
{
    EXPECT_DOUBLE_EQ(
        MarketMicrostructureEngine::priceImpact(
            100.0,
            100.0),
        0.0);
}

TEST(
    MarketMicrostructureEngineTest,
    CalculatesSmallPriceImpact)
{
    EXPECT_NEAR(
        MarketMicrostructureEngine::priceImpact(
            100.0,
            100.05),
        0.0005,
        1e-12);
}

TEST(
    MarketMicrostructureEngineTest,
    ThrowsForZeroReferencePrice)
{
    EXPECT_THROW(
        {
            const auto result =
                MarketMicrostructureEngine::priceImpact(
                    0.0,
                    100.0);

            (void)result;
        },
        std::invalid_argument);
}

TEST(
    MarketMicrostructureEngineTest,
    ThrowsForNegativeReferencePrice)
{
    EXPECT_THROW(
        {
            const auto result =
                MarketMicrostructureEngine::priceImpact(
                    -100.0,
                    101.0);

            (void)result;
        },
        std::invalid_argument);
}

TEST(
    MarketMicrostructureEngineTest,
    ThrowsForNaNPriceImpactInput)
{
    EXPECT_THROW(
        {
            const auto result =
                MarketMicrostructureEngine::priceImpact(
                    std::numeric_limits<double>::quiet_NaN(),
                    100.0);

            (void)result;
        },
        std::invalid_argument);
}

TEST(
    MarketMicrostructureEngineTest,
    ThrowsForInfinitePriceImpactInput)
{
    EXPECT_THROW(
        {
            const auto result =
                MarketMicrostructureEngine::priceImpact(
                    100.0,
                    std::numeric_limits<double>::infinity());

            (void)result;
        },
        std::invalid_argument);
}

TEST(
    MarketMicrostructureEngineTest,
    CalculatesMicroprice)
{
    // bid 100.0 @ 10, ask 101.0 @ 30 -> heavy ask volume pushes microprice to 100.25
    const double pMicro =
        MarketMicrostructureEngine::microprice(
            100.0,
            101.0,
            10.0,
            30.0);

    EXPECT_NEAR(pMicro, 100.25, 1e-12);
}

TEST(
    MarketMicrostructureEngineTest,
    CalculatesMicropriceBalancedVolume)
{
    // Equal volumes -> microprice equals midPrice
    const double pMicro =
        MarketMicrostructureEngine::microprice(
            100.0,
            102.0,
            25.0,
            25.0);

    EXPECT_DOUBLE_EQ(pMicro, 101.0);
}

TEST(
    MarketMicrostructureEngineTest,
    MicropriceThrowsOnZeroTotalVolume)
{
    EXPECT_THROW(
        {
            const auto result =
                MarketMicrostructureEngine::microprice(
                    100.0,
                    101.0,
                    0.0,
                    0.0);

            (void)result;
        },
        std::invalid_argument);
}

TEST(
    MarketMicrostructureEngineTest,
    MicropriceThrowsOnNegativeVolume)
{
    EXPECT_THROW(
        {
            const auto result =
                MarketMicrostructureEngine::microprice(
                    100.0,
                    101.0,
                    -5.0,
                    10.0);

            (void)result;
        },
        std::invalid_argument);
}

TEST(
    MarketMicrostructureEngineTest,
    CalculatesMultiLevelDepthImbalance)
{
    const std::vector<double> bids{10.0, 20.0, 30.0}; // total 60
    const std::vector<double> asks{5.0, 10.0, 15.0};  // total 30

    const double imbalance =
        MarketMicrostructureEngine::multiLevelDepthImbalance(bids, asks);

    EXPECT_NEAR(imbalance, 30.0 / 90.0, 1e-12);
}

TEST(
    MarketMicrostructureEngineTest,
    MultiLevelDepthImbalanceSymmetricZero)
{
    const std::vector<double> bids{15.0, 25.0};
    const std::vector<double> asks{15.0, 25.0};

    const double imbalance =
        MarketMicrostructureEngine::multiLevelDepthImbalance(bids, asks);

    EXPECT_DOUBLE_EQ(imbalance, 0.0);
}

TEST(
    MarketMicrostructureEngineTest,
    MultiLevelDepthImbalanceThrowsOnMismatchedSize)
{
    const std::vector<double> bids{10.0, 20.0};
    const std::vector<double> asks{10.0};

    EXPECT_THROW(
        {
            const auto result =
                MarketMicrostructureEngine::multiLevelDepthImbalance(bids, asks);

            (void)result;
        },
        std::invalid_argument);
}

TEST(
    MarketMicrostructureEngineTest,
    MultiLevelDepthImbalanceThrowsOnEmptyInput)
{
    const std::vector<double> empty{};

    EXPECT_THROW(
        {
            const auto result =
                MarketMicrostructureEngine::multiLevelDepthImbalance(empty, empty);

            (void)result;
        },
        std::invalid_argument);
}

TEST(
    MarketMicrostructureEngineTest,
    MultiLevelDepthImbalanceThrowsOnZeroTotalVolume)
{
    const std::vector<double> bids{0.0, 0.0};
    const std::vector<double> asks{0.0, 0.0};

    EXPECT_THROW(
        {
            const auto result =
                MarketMicrostructureEngine::multiLevelDepthImbalance(bids, asks);

            (void)result;
        },
        std::invalid_argument);
}

TEST(
    MarketMicrostructureEngineTest,
    CalculatesEffectiveSpread)
{
    const double effSpread =
        MarketMicrostructureEngine::effectiveSpread(100.25, 100.0);

    EXPECT_DOUBLE_EQ(effSpread, 0.50);
}

TEST(
    MarketMicrostructureEngineTest,
    CalculatesRelativeEffectiveSpread)
{
    const double relSpread =
        MarketMicrostructureEngine::relativeEffectiveSpread(100.25, 100.0);

    EXPECT_DOUBLE_EQ(relSpread, 0.50 / 100.0);
}

TEST(
    MarketMicrostructureEngineTest,
    EffectiveSpreadThrowsOnNonPositivePrices)
{
    EXPECT_THROW(
        {
            const auto result =
                MarketMicrostructureEngine::effectiveSpread(0.0, 100.0);

            (void)result;
        },
        std::invalid_argument);

    EXPECT_THROW(
        {
            const auto result =
                MarketMicrostructureEngine::effectiveSpread(100.0, -1.0);

            (void)result;
        },
        std::invalid_argument);
}
