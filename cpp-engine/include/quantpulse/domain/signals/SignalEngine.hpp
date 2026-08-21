#pragma once

#include "quantpulse/domain/features/FeatureEngine.hpp"

namespace quantpulse::domain::signals
{

    struct SignalWeights
    {
        double momentum = 0.30;
        double risk = 0.30;
        double microstructure = 0.40;
    };

    struct Signal
    {
        double momentumScore;
        double riskScore;
        double microstructureScore;
        double overallScore;
    };

    class SignalEngine
    {
    public:
        /**
         * @brief Generate a multi-factor trading signal.
         *
         * The signal combines:
         *  - return momentum,
         *  - risk-adjusted performance,
         *  - market-microstructure conditions.
         *
         * Scores are bounded to [-1, 1].
         *
         * @param features Quantitative feature vector.
         * @param weights Relative weights of each signal component.
         *
         * @return Composite quantitative signal.
         *
         * @throw std::invalid_argument if weights are invalid.
         */
        [[nodiscard]]
        static Signal generate(
            const features::FeatureVector &features,
            const SignalWeights &weights = {});
    };

}