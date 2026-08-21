#include "quantpulse/domain/features/FeatureEngine.hpp"

#include <gtest/gtest.h>

#include <cmath>
#include <stdexcept>
#include <vector>

using quantpulse::domain::features::FeatureEngine;

TEST(
    FeatureEngineTest,
    GeneratesFeatureVector)
{
    const std::vector<double> prices{
        100.0,
        101.0,
        99.0,
        102.0,
        104.0};

    const std::vector<double> volumes{
        100.0,
        150.0,
        120.0,
        180.0,
        200.0};

    const auto features =
        FeatureEngine::generate(
            prices,
            volumes,
            103.0,
            104.0,
            150.0,
            100.0,
            180.0,
            120.0);

    EXPECT_TRUE(
        std::isfinite(features.cumulativeReturn));

    EXPECT_TRUE(
        std::isfinite(features.volatility));

    EXPECT_TRUE(
        std::isfinite(features.sharpeRatio));

    EXPECT_TRUE(
        std::isfinite(features.sortinoRatio));

    EXPECT_TRUE(
        std::isfinite(features.maximumDrawdown));

    EXPECT_TRUE(
        std::isfinite(features.vwapDeviation));

    EXPECT_TRUE(
        std::isfinite(features.relativeSpread));

    EXPECT_TRUE(
        std::isfinite(features.orderImbalance));

    EXPECT_TRUE(
        std::isfinite(features.tradeImbalance));

    EXPECT_TRUE(
        std::isfinite(features.priceImpact));
}

TEST(
    FeatureEngineTest,
    ThrowsForEmptyPrices)
{
    const std::vector<double> prices{};

    const std::vector<double> volumes{};

    EXPECT_THROW(
        FeatureEngine::generate(
            prices,
            volumes,
            100.0,
            101.0,
            100.0,
            100.0,
            100.0,
            100.0),
        std::invalid_argument);
}

TEST(
    FeatureEngineTest,
    ThrowsForMismatchedPricesAndVolumes)
{
    const std::vector<double> prices{
        100.0,
        101.0,
        102.0};

    const std::vector<double> volumes{
        100.0,
        200.0};

    EXPECT_THROW(
        FeatureEngine::generate(
            prices,
            volumes,
            100.0,
            101.0,
            100.0,
            100.0,
            100.0,
            100.0),
        std::invalid_argument);
}