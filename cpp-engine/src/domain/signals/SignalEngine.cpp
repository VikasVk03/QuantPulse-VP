#include "quantpulse/domain/signals/SignalEngine.hpp"

#include <algorithm>
#include <cmath>
#include <stdexcept>

namespace quantpulse::domain::signals
{

    namespace
    {

        double clampScore(double value)
        {
            return std::clamp(value, -1.0, 1.0);
        }

        void validateWeights(
            const SignalWeights &weights)
        {
            if (!std::isfinite(weights.momentum) ||
                !std::isfinite(weights.risk) ||
                !std::isfinite(weights.microstructure))
            {
                throw std::invalid_argument(
                    "Signal weights must be finite.");
            }

            if (weights.momentum < 0.0 ||
                weights.risk < 0.0 ||
                weights.microstructure < 0.0)
            {
                throw std::invalid_argument(
                    "Signal weights must be non-negative.");
            }

            const double total =
                weights.momentum +
                weights.risk +
                weights.microstructure;

            if (total <= 0.0)
            {
                throw std::invalid_argument(
                    "At least one signal weight must be positive.");
            }
        }

        double normalizeWeight(
            double weight,
            double total)
        {
            return weight / total;
        }

    }

    Signal SignalEngine::generate(
        const features::FeatureVector &features,
        const SignalWeights &weights)
    {
        validateWeights(weights);

        const double weightTotal =
            weights.momentum +
            weights.risk +
            weights.microstructure;

        /*
         * --------------------------------------------------------
         * Momentum
         * --------------------------------------------------------
         *
         * Positive cumulative return -> positive signal.
         * Negative cumulative return -> negative signal.
         *
         * We combine return momentum with VWAP positioning.
         */
        const double momentumScore =
            clampScore(
                0.70 * features.cumulativeReturn +
                0.30 * features.vwapDeviation);

        /*
         * --------------------------------------------------------
         * Risk-adjusted performance
         * --------------------------------------------------------
         *
         * Sharpe and Sortino reward attractive risk-adjusted
         * returns.
         *
         * Volatility and drawdown act as penalties.
         */
        const double riskScore =
            clampScore(
                0.40 * features.sharpeRatio +
                0.30 * features.sortinoRatio -
                0.15 * features.volatility +
                0.15 * features.maximumDrawdown);

        /*
         * maximumDrawdown is normally negative, therefore adding it
         * naturally penalizes stocks experiencing larger drawdowns.
         */

        /*
         * --------------------------------------------------------
         * Microstructure
         * --------------------------------------------------------
         *
         * Positive order/trade imbalance suggests buying pressure.
         *
         * Positive VWAP deviation is mildly positive for momentum,
         * while wider spreads and larger price impact reduce
         * execution quality.
         */
        const double microstructureScore =
            clampScore(
                0.30 * features.orderImbalance +
                0.30 * features.tradeImbalance +
                0.20 * features.vwapDeviation -
                0.10 * features.relativeSpread -
                0.10 * features.priceImpact);

        /*
         * --------------------------------------------------------
         * Composite signal
         * --------------------------------------------------------
         */
        const double normalizedMomentumWeight =
            normalizeWeight(
                weights.momentum,
                weightTotal);

        const double normalizedRiskWeight =
            normalizeWeight(
                weights.risk,
                weightTotal);

        const double normalizedMicrostructureWeight =
            normalizeWeight(
                weights.microstructure,
                weightTotal);

        const double overallScore =
            normalizedMomentumWeight * momentumScore +
            normalizedRiskWeight * riskScore +
            normalizedMicrostructureWeight *
                microstructureScore;

        return Signal{
            momentumScore,
            riskScore,
            microstructureScore,
            clampScore(overallScore)};
    }

}