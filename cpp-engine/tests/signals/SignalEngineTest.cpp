#include "quantpulse/domain/signals/SignalEngine.hpp"

#include <gtest/gtest.h>

#include <cmath>
#include <stdexcept>

using quantpulse::domain::features::FeatureVector;
using quantpulse::domain::signals::Signal;
using quantpulse::domain::signals::SignalEngine;
using quantpulse::domain::signals::SignalWeights;

namespace
{

    FeatureVector makeNeutralFeatures()
    {
        return FeatureVector{
            0.0,  // cumulativeReturn
            0.10, // volatility
            0.0,  // sharpeRatio
            0.0,  // sortinoRatio
            0.0,  // maximumDrawdown
            0.0,  // vwapDeviation
            0.01, // relativeSpread
            0.0,  // orderImbalance
            0.0,  // tradeImbalance
            0.01  // priceImpact
        };
    }

}

TEST(
    SignalEngineTest,
    GeneratesFiniteSignal)
{
    const auto features =
        makeNeutralFeatures();

    const auto signal =
        SignalEngine::generate(features);

    EXPECT_TRUE(
        std::isfinite(signal.momentumScore));

    EXPECT_TRUE(
        std::isfinite(signal.riskScore));

    EXPECT_TRUE(
        std::isfinite(signal.microstructureScore));

    EXPECT_TRUE(
        std::isfinite(signal.overallScore));
}

TEST(
    SignalEngineTest,
    PositiveMomentumProducesPositiveMomentumScore)
{
    auto features =
        makeNeutralFeatures();

    features.cumulativeReturn = 0.20;
    features.vwapDeviation = 0.05;

    const auto signal =
        SignalEngine::generate(features);

    EXPECT_GT(
        signal.momentumScore,
        0.0);
}

TEST(
    SignalEngineTest,
    NegativeMomentumProducesNegativeMomentumScore)
{
    auto features =
        makeNeutralFeatures();

    features.cumulativeReturn = -0.20;
    features.vwapDeviation = -0.05;

    const auto signal =
        SignalEngine::generate(features);

    EXPECT_LT(
        signal.momentumScore,
        0.0);
}

TEST(
    SignalEngineTest,
    PositiveOrderFlowImprovesMicrostructureScore)
{
    auto features =
        makeNeutralFeatures();

    features.orderImbalance = 0.8;
    features.tradeImbalance = 0.8;

    const auto signal =
        SignalEngine::generate(features);

    EXPECT_GT(
        signal.microstructureScore,
        0.0);
}

TEST(
    SignalEngineTest,
    ScoresAreBounded)
{
    auto features =
        makeNeutralFeatures();

    features.cumulativeReturn = 100.0;
    features.sharpeRatio = 100.0;
    features.sortinoRatio = 100.0;
    features.orderImbalance = 1.0;
    features.tradeImbalance = 1.0;

    const auto signal =
        SignalEngine::generate(features);

    EXPECT_GE(signal.momentumScore, -1.0);
    EXPECT_LE(signal.momentumScore, 1.0);

    EXPECT_GE(signal.riskScore, -1.0);
    EXPECT_LE(signal.riskScore, 1.0);

    EXPECT_GE(signal.microstructureScore, -1.0);
    EXPECT_LE(signal.microstructureScore, 1.0);

    EXPECT_GE(signal.overallScore, -1.0);
    EXPECT_LE(signal.overallScore, 1.0);
}

TEST(
    SignalEngineTest,
    RejectsNegativeWeights)
{
    const auto features =
        makeNeutralFeatures();

    SignalWeights weights{
        -0.1,
        0.5,
        0.6};

    EXPECT_THROW(
        SignalEngine::generate(
            features,
            weights),
        std::invalid_argument);
}

TEST(
    SignalEngineTest,
    RejectsZeroTotalWeight)
{
    const auto features =
        makeNeutralFeatures();

    SignalWeights weights{
        0.0,
        0.0,
        0.0};

    EXPECT_THROW(
        SignalEngine::generate(
            features,
            weights),
        std::invalid_argument);
}

TEST(
    SignalEngineTest,
    SupportsCustomWeights)
{
    const auto features =
        makeNeutralFeatures();

    SignalWeights weights{
        1.0,
        0.0,
        0.0};

    auto modifiedFeatures =
        features;

    modifiedFeatures.cumulativeReturn =
        0.20;

    const auto signal =
        SignalEngine::generate(
            modifiedFeatures,
            weights);

    EXPECT_NEAR(
        signal.overallScore,
        signal.momentumScore,
        1e-12);
}