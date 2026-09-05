#pragma once

#include <cstddef>
#include <vector>

namespace quantpulse::domain::indicators
{
    class IndicatorEngine
    {
    public:
        [[nodiscard]]
        static double simpleMovingAverage(
            const std::vector<double> &prices,
            std::size_t period);

        [[nodiscard]]
        static double exponentialMovingAverage(
            const std::vector<double> &prices,
            std::size_t period);

        [[nodiscard]]
        static double relativeStrengthIndex(
            const std::vector<double> &prices,
            std::size_t period);

        [[nodiscard]]
        static double momentum(
            const std::vector<double> &prices,
            std::size_t period);
    };
}