#include "quantpulse/domain/liquidity/LiquidityEngine.hpp"

#include <algorithm>
#include <cmath>
#include <stdexcept>

namespace quantpulse::domain::liquidity
{

    namespace
    {

        void validateLevel(const LiquidityLevel &level)
        {
            if (!std::isfinite(level.price) ||
                !std::isfinite(level.quantity))
            {
                throw std::invalid_argument(
                    "Liquidity level values must be finite");
            }

            if (level.price <= 0.0)
            {
                throw std::invalid_argument(
                    "Liquidity level price must be positive");
            }

            if (level.quantity < 0.0)
            {
                throw std::invalid_argument(
                    "Liquidity level quantity must be non-negative");
            }
        }

        void validateSnapshot(const LiquiditySnapshot &snapshot)
        {
            if (!std::isfinite(snapshot.bestBid) ||
                !std::isfinite(snapshot.bestAsk))
            {
                throw std::invalid_argument(
                    "Best bid and ask must be finite");
            }

            if (snapshot.bestBid <= 0.0 ||
                snapshot.bestAsk <= 0.0)
            {
                throw std::invalid_argument(
                    "Best bid and ask must be positive");
            }

            if (snapshot.bestAsk < snapshot.bestBid)
            {
                throw std::invalid_argument(
                    "Best ask must be greater than or equal to best bid");
            }

            for (const auto &level : snapshot.bids)
            {
                validateLevel(level);
            }

            for (const auto &level : snapshot.asks)
            {
                validateLevel(level);
            }
        }

        void validateConfig(const LiquidityConfig &config)
        {
            if (!std::isfinite(config.referenceDepth) ||
                config.referenceDepth <= 0.0)
            {
                throw std::invalid_argument(
                    "Reference depth must be positive and finite");
            }

            if (!std::isfinite(config.referenceRelativeSpread) ||
                config.referenceRelativeSpread <= 0.0)
            {
                throw std::invalid_argument(
                    "Reference relative spread must be positive and finite");
            }

            if (!std::isfinite(config.depthWeight) ||
                !std::isfinite(config.spreadWeight) ||
                config.depthWeight < 0.0 ||
                config.spreadWeight < 0.0)
            {
                throw std::invalid_argument(
                    "Liquidity weights must be non-negative and finite");
            }

            const double weightSum =
                config.depthWeight + config.spreadWeight;

            if (weightSum <= 0.0)
            {
                throw std::invalid_argument(
                    "At least one liquidity weight must be positive");
            }
        }

        double sumDepth(const std::vector<LiquidityLevel> &levels)
        {
            double depth = 0.0;

            for (const auto &level : levels)
            {
                depth += level.quantity;
            }

            return depth;
        }

        double calculateDepthScore(
            double totalDepth,
            double referenceDepth)
        {
            const double normalized =
                totalDepth / referenceDepth;

            return std::clamp(normalized * 100.0, 0.0, 100.0);
        }

        double calculateSpreadScore(
            double relativeSpread,
            double referenceRelativeSpread)
        {
            if (relativeSpread <= referenceRelativeSpread)
            {
                return 100.0;
            }

            const double normalized =
                referenceRelativeSpread / relativeSpread;

            return std::clamp(normalized * 100.0, 0.0, 100.0);
        }

    } // namespace

    LiquidityMetrics LiquidityEngine::evaluate(
        const LiquiditySnapshot &snapshot,
        const LiquidityConfig &config)
    {
        validateSnapshot(snapshot);
        validateConfig(config);

        const double bidDepth = sumDepth(snapshot.bids);
        const double askDepth = sumDepth(snapshot.asks);
        const double totalDepth = bidDepth + askDepth;

        double depthImbalance = 0.0;

        if (totalDepth > 0.0)
        {
            depthImbalance =
                (bidDepth - askDepth) / totalDepth;
        }

        const double spread =
            snapshot.bestAsk - snapshot.bestBid;

        const double midPrice =
            (snapshot.bestBid + snapshot.bestAsk) / 2.0;

        const double relativeSpread =
            spread / midPrice;

        const double depthScore =
            calculateDepthScore(
                totalDepth,
                config.referenceDepth);

        const double spreadScore =
            calculateSpreadScore(
                relativeSpread,
                config.referenceRelativeSpread);

        const double weightSum =
            config.depthWeight + config.spreadWeight;

        const double liquidityScore =
            ((depthScore * config.depthWeight) +
             (spreadScore * config.spreadWeight)) /
            weightSum;

        return LiquidityMetrics{
            .bidDepth = bidDepth,
            .askDepth = askDepth,
            .totalDepth = totalDepth,
            .depthImbalance = depthImbalance,
            .spread = spread,
            .relativeSpread = relativeSpread,
            .liquidityScore = liquidityScore};
    }

} // namespace quantpulse::domain::liquidity