#include "quantpulse/domain/liquidity/LiquidityEngine.hpp"

#include <gtest/gtest.h>

#include <cmath>
#include <limits>
#include <stdexcept>

namespace quantpulse::domain::liquidity
{

    TEST(LiquidityEngineTest, CalculatesDepthCorrectly)
    {
        const LiquiditySnapshot snapshot{
            .bestBid = 100.0,
            .bestAsk = 101.0,
            .bids = {
                {100.0, 10.0},
                {99.0, 20.0}},
            .asks = {{101.0, 15.0}, {102.0, 5.0}}};

        const auto result = LiquidityEngine::evaluate(snapshot);

        EXPECT_DOUBLE_EQ(result.bidDepth, 30.0);
        EXPECT_DOUBLE_EQ(result.askDepth, 20.0);
        EXPECT_DOUBLE_EQ(result.totalDepth, 50.0);
    }

    TEST(LiquidityEngineTest, CalculatesDepthImbalanceCorrectly)
    {
        const LiquiditySnapshot snapshot{
            .bestBid = 100.0,
            .bestAsk = 101.0,
            .bids = {
                {100.0, 30.0}},
            .asks = {{101.0, 10.0}}};

        const auto result = LiquidityEngine::evaluate(snapshot);

        EXPECT_DOUBLE_EQ(
            result.depthImbalance,
            0.5);
    }

    TEST(LiquidityEngineTest, CalculatesSpreadCorrectly)
    {
        const LiquiditySnapshot snapshot{
            .bestBid = 100.0,
            .bestAsk = 101.0,
            .bids = {},
            .asks = {}};

        const auto result = LiquidityEngine::evaluate(snapshot);

        EXPECT_DOUBLE_EQ(result.spread, 1.0);
        EXPECT_DOUBLE_EQ(
            result.relativeSpread,
            1.0 / 100.5);
    }

    TEST(LiquidityEngineTest, BalancedBookHasZeroDepthImbalance)
    {
        const LiquiditySnapshot snapshot{
            .bestBid = 100.0,
            .bestAsk = 101.0,
            .bids = {
                {100.0, 20.0}},
            .asks = {{101.0, 20.0}}};

        const auto result = LiquidityEngine::evaluate(snapshot);

        EXPECT_DOUBLE_EQ(result.depthImbalance, 0.0);
    }

    TEST(LiquidityEngineTest, EmptyDepthProducesZeroDepthImbalance)
    {
        const LiquiditySnapshot snapshot{
            .bestBid = 100.0,
            .bestAsk = 101.0,
            .bids = {},
            .asks = {}};

        const auto result = LiquidityEngine::evaluate(snapshot);

        EXPECT_DOUBLE_EQ(result.bidDepth, 0.0);
        EXPECT_DOUBLE_EQ(result.askDepth, 0.0);
        EXPECT_DOUBLE_EQ(result.totalDepth, 0.0);
        EXPECT_DOUBLE_EQ(result.depthImbalance, 0.0);
    }

    TEST(LiquidityEngineTest, HighDepthAndTightSpreadProduceHighLiquidityScore)
    {
        const LiquiditySnapshot snapshot{
            .bestBid = 100.0,
            .bestAsk = 100.05,
            .bids = {
                {100.0, 50.0},
                {99.9, 50.0}},
            .asks = {{100.05, 50.0}, {100.1, 50.0}}};

        const LiquidityConfig config{
            .referenceDepth = 100.0,
            .referenceRelativeSpread = 0.0010,
            .depthWeight = 0.70,
            .spreadWeight = 0.30};

        const auto result =
            LiquidityEngine::evaluate(snapshot, config);

        EXPECT_GT(result.liquidityScore, 90.0);
        EXPECT_LE(result.liquidityScore, 100.0);
    }

    TEST(LiquidityEngineTest, LowDepthAndWideSpreadProduceLowerLiquidityScore)
    {
        const LiquiditySnapshot snapshot{
            .bestBid = 100.0,
            .bestAsk = 102.0,
            .bids = {
                {100.0, 10.0}},
            .asks = {{102.0, 10.0}}};

        const LiquidityConfig config{
            .referenceDepth = 100.0,
            .referenceRelativeSpread = 0.0010,
            .depthWeight = 0.70,
            .spreadWeight = 0.30};

        const auto result =
            LiquidityEngine::evaluate(snapshot, config);

        EXPECT_LT(result.liquidityScore, 20.0);
    }

    TEST(LiquidityEngineTest, RejectsInvalidBestBid)
    {
        const LiquiditySnapshot snapshot{
            .bestBid = 0.0,
            .bestAsk = 101.0,
            .bids = {},
            .asks = {}};

        EXPECT_THROW(
            LiquidityEngine::evaluate(snapshot),
            std::invalid_argument);
    }

    TEST(LiquidityEngineTest, RejectsCrossedBook)
    {
        const LiquiditySnapshot snapshot{
            .bestBid = 102.0,
            .bestAsk = 101.0,
            .bids = {},
            .asks = {}};

        EXPECT_THROW(
            LiquidityEngine::evaluate(snapshot),
            std::invalid_argument);
    }

    TEST(LiquidityEngineTest, RejectsNegativeQuantity)
    {
        const LiquiditySnapshot snapshot{
            .bestBid = 100.0,
            .bestAsk = 101.0,
            .bids = {
                {100.0, -1.0}},
            .asks = {}};

        EXPECT_THROW(
            LiquidityEngine::evaluate(snapshot),
            std::invalid_argument);
    }

    TEST(LiquidityEngineTest, RejectsNonFiniteValues)
    {
        const LiquiditySnapshot snapshot{
            .bestBid = 100.0,
            .bestAsk = 101.0,
            .bids = {
                {100.0,
                 std::numeric_limits<double>::quiet_NaN()}},
            .asks = {}};

        EXPECT_THROW(
            LiquidityEngine::evaluate(snapshot),
            std::invalid_argument);
    }

    TEST(LiquidityEngineTest, RejectsInvalidReferenceDepth)
    {
        const LiquiditySnapshot snapshot{
            .bestBid = 100.0,
            .bestAsk = 101.0,
            .bids = {},
            .asks = {}};

        LiquidityConfig config;
        config.referenceDepth = 0.0;

        EXPECT_THROW(
            LiquidityEngine::evaluate(snapshot, config),
            std::invalid_argument);
    }

    TEST(LiquidityEngineTest, RejectsInvalidWeights)
    {
        const LiquiditySnapshot snapshot{
            .bestBid = 100.0,
            .bestAsk = 101.0,
            .bids = {},
            .asks = {}};

        LiquidityConfig config;
        config.depthWeight = 0.0;
        config.spreadWeight = 0.0;

        EXPECT_THROW(
            LiquidityEngine::evaluate(snapshot, config),
            std::invalid_argument);
    }

} // namespace quantpulse::domain::liquidity