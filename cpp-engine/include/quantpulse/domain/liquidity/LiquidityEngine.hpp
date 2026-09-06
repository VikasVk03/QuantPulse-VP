#pragma once

#include <vector>

namespace quantpulse::domain::liquidity
{

    struct LiquidityLevel
    {
        double price = 0.0;
        double quantity = 0.0;
    };

    struct LiquiditySnapshot
    {
        double bestBid = 0.0;
        double bestAsk = 0.0;

        std::vector<LiquidityLevel> bids;
        std::vector<LiquidityLevel> asks;
    };

    struct LiquidityConfig
    {
        double referenceDepth = 100.0;
        double referenceRelativeSpread = 0.0010;

        double depthWeight = 0.70;
        double spreadWeight = 0.30;
    };

    struct LiquidityMetrics
    {
        double bidDepth = 0.0;
        double askDepth = 0.0;
        double totalDepth = 0.0;

        double depthImbalance = 0.0;

        double spread = 0.0;
        double relativeSpread = 0.0;

        double liquidityScore = 0.0;
    };

    class LiquidityEngine
    {
    public:
        static LiquidityMetrics evaluate(
            const LiquiditySnapshot &snapshot,
            const LiquidityConfig &config = {});
    };

} // namespace quantpulse::domain::liquidity