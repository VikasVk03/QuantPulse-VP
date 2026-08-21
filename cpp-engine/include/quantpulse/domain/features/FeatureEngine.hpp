#pragma once

#include <vector>

namespace quantpulse::domain::features
{

    struct FeatureVector
    {
        double cumulativeReturn;
        double volatility;
        double sharpeRatio;
        double sortinoRatio;
        double maximumDrawdown;

        double vwapDeviation;
        double relativeSpread;
        double orderImbalance;
        double tradeImbalance;
        double priceImpact;
    };

    class FeatureEngine
    {
    public:
        /**
         * @brief Generate quantitative features from market observations.
         *
         * @param prices Historical price observations.
         * @param volumes Historical trading volumes.
         * @param bidPrice Current best bid price.
         * @param askPrice Current best ask price.
         * @param bidVolume Current bid-side volume.
         * @param askVolume Current ask-side volume.
         * @param tradeBuyVolume Recent aggressive buy volume.
         * @param tradeSellVolume Recent aggressive sell volume.
         *
         * @return Feature vector used by downstream signal models.
         */
        [[nodiscard]]
        static FeatureVector generate(
            const std::vector<double> &prices,
            const std::vector<double> &volumes,
            double bidPrice,
            double askPrice,
            double bidVolume,
            double askVolume,
            double tradeBuyVolume,
            double tradeSellVolume);
    };
}
